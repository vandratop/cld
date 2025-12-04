
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Location, ChatMessage } from "../types";

let ai: GoogleGenAI | null = null;
const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// Helper for exponential backoff retry
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        const isRetryable = error.status === 503 || error.status === 504 || error.status === 500 || 
                            error.message?.includes('unavailable') || error.message?.includes('Overloaded') ||
                            error.message?.includes('fetch failed');
        
        if (retries > 0 && isRetryable) {
            console.warn(`Operation failed, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryOperation(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function* streamChat(history: ChatMessage[], message: string): AsyncGenerator<string> {
    const chatModel = 'gemini-2.5-flash';
    const ai = getAi();
    
    const systemInstruction = history.find(m => m.role === 'system')?.text;
    const chatHistory = history.filter(m => m.role === 'user' || m.role === 'model');

    const chat = ai.chats.create({
      model: chatModel,
      history: chatHistory.map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }],
      })),
      ...(systemInstruction && {
          config: {
              systemInstruction: systemInstruction,
          }
      })
    });

    try {
        const result = await chat.sendMessageStream({ message });
        for await (const chunk of result) {
            yield chunk.text || "";
        }
    } catch (e: any) {
        console.error("Stream chat error:", e);
        if (e.status === 429 || e.message?.includes('429')) {
            yield "Maaf, saya sedang mencapai batas penggunaan harian. Silakan coba lagi nanti atau gunakan mode lain.";
        } else if (e.status === 503 || e.message?.includes('unavailable')) {
            yield "Maaf, layanan AI sedang sibuk/tidak tersedia saat ini. Mohon tunggu sebentar dan coba lagi.";
        } else {
            throw e;
        }
    }
}


export const getGroundedResponse = async (
    prompt: string, 
    type: 'search' | 'maps', 
    location?: Location
): Promise<{ text: string, grounding: { uri: string, title: string }[] }> => {
    const model = 'gemini-2.5-flash';
    const ai = getAi();
    
    const tools: any[] = [];
    if (type === 'search') {
        tools.push({ googleSearch: {} });
    } else if (type === 'maps') {
        tools.push({ googleMaps: {} });
    }

    const toolConfig = location ? {
        toolConfig: {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                }
            }
        }
    } : {};
    
    try {
        const response: GenerateContentResponse = await retryOperation(() => ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { tools },
            ...toolConfig,
        }));
        
        const text = response.text || "";
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        let grounding: { uri: string, title: string }[] = [];
        if (groundingMetadata?.groundingChunks) {
            grounding = groundingMetadata.groundingChunks.map((chunk: any) => ({
                uri: chunk.web?.uri || chunk.maps?.uri,
                title: chunk.web?.title || chunk.maps?.title
            })).filter(g => g.uri && g.title);
        }
        
        return { text, grounding };
    } catch (e: any) {
        console.error("Grounded response error:", e);
        if (e.status === 429 || e.message?.includes('429')) {
             return { text: "Maaf, batas penggunaan pencarian telah tercapai. Silakan coba lagi nanti.", grounding: [] };
        }
        if (e.status === 503 || e.message?.includes('unavailable')) {
             return { text: "Maaf, layanan pencarian sedang tidak tersedia. Silakan coba lagi nanti.", grounding: [] };
        }
        throw e;
    }
};

export const getComplexResponse = async (prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash'; // Downgrade to flash to save quota
    const ai = getAi();
    
    try {
        const response: GenerateContentResponse = await retryOperation(() => ai.models.generateContent({
            model: 'gemini-2.5-pro', 
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 1024 }
            }
        }));
        
        return response.text || "";
    } catch (e: any) {
        console.error("Complex response error:", e);
        if (e.status === 429 || e.message?.includes('429')) {
            return "Maaf, layanan AI sedang sibuk atau mencapai batas penggunaan. Mohon coba lagi nanti.";
        }
        if (e.status === 503 || e.message?.includes('unavailable')) {
            return "Maaf, layanan AI sedang tidak tersedia (Overloaded). Mohon coba lagi nanti.";
        }
        throw e;
    }
};

export const getDailyFact = async (): Promise<string> => {
    // Switch to flash for efficiency
    const model = 'gemini-2.5-flash';
    const ai = getAi();
    const prompt = "Berikan satu fakta Islam yang singkat, menarik, dan mudah dipahami dalam bahasa Indonesia. Fokus pada sejarah, sains dalam Al-Quran, atau etimologi. Jangan sertakan judul atau pembukaan seperti 'Tentu,'. Langsung ke faktanya.";
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        return response.text || "Fakta menarik tidak tersedia saat ini.";
    } catch (error: any) {
        console.warn("Gemini API Error in getDailyFact (likely quota or unavailable):", error);
        // Fallback facts if API fails (e.g. quota exceeded)
        const fallbackFacts = [
            "Universitas Al-Qarawiyyin di Fez, Maroko, diakui sebagai universitas tertua di dunia yang masih beroperasi, didirikan oleh Fatima al-Fihri pada tahun 859 M.",
            "Kata 'Aljabar' berasal dari judul buku matematikawan Muslim Persia, Al-Khwarizmi, yaitu 'Kitab al-Jabr wal-Muqabala'.",
            "Ibnu Sina (Avicenna) menulis 'Qanun Kedokteran' (The Canon of Medicine) yang menjadi buku rujukan medis standar di universitas-universitas Eropa selama berabad-abad.",
            "Kopi pertama kali ditemukan dan dipopulerkan oleh para sufi di Yaman pada abad ke-15 untuk membantu mereka tetap terjaga saat beribadah (dzikir) di malam hari.",
            "Laksamana Cheng Ho adalah seorang penjelajah Muslim Tiongkok yang memimpin armada besar dalam tujuh pelayaran diplomatik ke berbagai penjuru dunia pada abad ke-15.",
            "Ismail Al-Jazari (1136-1206) dikenal sebagai 'Bapak Robotika' karena penemuannya dalam bidang mekanik dan automata, termasuk jam gajah yang terkenal.",
            "Rumah Sakit pertama dengan bangsal khusus dan pusat pengajaran didirikan di Kairo, Mesir (Rumah Sakit Ahmad ibn Tulun) pada abad ke-9.",
            "Kamera obscura, prinsip dasar kamera modern, pertama kali dijelaskan secara rinci oleh ilmuwan Muslim Ibnu al-Haytham dalam Kitab al-Manazir.",
            "Sistem angka modern yang kita gunakan saat ini (0-9) diperkenalkan ke Eropa oleh matematikawan Muslim, yang mengadaptasinya dari India.",
            "Konsep karantina medis pertama kali diperkenalkan oleh Ibnu Sina untuk mencegah penyebaran penyakit menular."
        ];
        // Return a random fallback fact
        return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
    }
};
