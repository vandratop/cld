
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Location, PrayerTimes } from '../types';
import { streamChat, getGroundedResponse, getComplexResponse } from '../services/geminiService';
import { BotIcon, SendIcon, CloseIcon, SearchIcon, MapIcon, SparklesIcon, ShareIcon, VolumeUpIcon, VolumeOffIcon, SettingsIcon, PaletteIcon, MicIcon } from './Icons';

type ChatMode = 'chat' | 'search' | 'maps' | 'complex';

const predefinedPrompts = [
    'Lokasi Masjid terdekat',
    'Doa setelah shalat',
    'Keutamaan puasa Senin Kamis',
    'Sejarah Tahun Baru Hijriah',
    'Tafsir dan Lafaz QS 1:5'
];

interface ChatBotProps {
    location: Location;
    prayerTimes: PrayerTimes | null;
    sahurPopupText: string | null;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialMessage: string | null;
    onOpenVoiceAssistant?: () => void;
}

const sanitizeResponse = (text: string): string => {
    if (!text) return '';
    let sanitizedText = text;
    sanitizedText = sanitizedText.replace(/\bSWT\.?\b/gi, "Subhanahu wa Ta’ala ﷻ");
    sanitizedText = sanitizedText.replace(/\bSAW\.?\b/gi, "Shallallahu ‘Alaihi wa Sallam ﷺ");
    sanitizedText = sanitizedText.replace(/\bAS\.?\b/gi, "Alaihis Salam");
    sanitizedText = sanitizedText.replace(/\bRA\.?\b/gi, "radhiyallahu ‘anhu");
    return sanitizedText;
};

const AVATARS = [
    { id: 'default', url: 'https://raw.githubusercontent.com/vandratop/Yuk/3ca087bbe1dfa3822dc66f60ba3f8c2cdf0772b0/AI-HIJR_Chatbot.gif', name: 'Default' },
    { id: 'robot', url: 'https://raw.githubusercontent.com/vandratop/Yuk/a23684b00bae730abaf5ec3837aacea3f83a9f22/AI-Chatbot_rbt.png', name: 'Robot' },
    { id: 'art', url: 'https://raw.githubusercontent.com/vandratop/Yuk/a23684b00bae730abaf5ec3837aacea3f83a9f22/Yellow_star.png', name: 'Art' },
];

const BUBBLE_STYLES = [
    { id: 'bubble-default', name: 'Default' },
    { id: 'bubble-rounded', name: 'Sangat Bulat' },
    { id: 'bubble-sharp', name: 'Kotak' },
];

const BG_COLORS = [
    { id: 'default', value: `rgba(var(--chatbot-bg-rgb), var(--chatbot-bg-opacity))` },
    { id: 'deep-blue', value: 'rgba(10, 25, 47, 0.95)' },
    { id: 'soft-green', value: 'rgba(20, 38, 35, 0.95)' },
    { id: 'dark-grey', value: 'rgba(30, 30, 30, 0.95)' },
];

interface ChatSettings {
    avatarId: string;
    bubbleStyleId: string;
    bgColorId: string;
}

const defaultChatSettings: ChatSettings = {
    avatarId: 'default',
    bubbleStyleId: 'bubble-default',
    bgColorId: 'default',
};

const ChatSettingsPanel: React.FC<{
    settings: ChatSettings;
    onSettingsChange: (newSettings: ChatSettings) => void;
    onClose: () => void;
}> = ({ settings, onSettingsChange, onClose }) => (
    <div className="absolute top-0 left-0 w-full h-full bg-[rgba(var(--chatbot-bg-rgb),0.98)] z-50 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Personalisasi Chat</h3>
             <button onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="overflow-y-auto space-y-4 pr-2">
            <div>
                <h4 className="font-bold text-sm mb-2">Avatar AI</h4>
                <div className="flex space-x-2">
                    {AVATARS.map(avatar => (
                        <button key={avatar.id} onClick={() => onSettingsChange({ ...settings, avatarId: avatar.id })} className={`p-1 rounded-full border-2 ${settings.avatarId === avatar.id ? 'border-[var(--text-color-secondary)]' : 'border-transparent'}`}>
                            <img src={avatar.url} alt={avatar.name} className="w-12 h-12 rounded-full bg-black/20" />
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-bold text-sm mb-2">Gaya Balon Obrolan</h4>
                 <div className="flex flex-col space-y-2 text-sm">
                    {BUBBLE_STYLES.map(style => (
                        <label key={style.id} className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="bubble-style" value={style.id} checked={settings.bubbleStyleId === style.id} onChange={() => onSettingsChange({ ...settings, bubbleStyleId: style.id })} />
                            <span>{style.name}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-bold text-sm mb-2">Warna Latar</h4>
                 <div className="flex space-x-2">
                     {BG_COLORS.map(color => (
                        <button key={color.id} onClick={() => onSettingsChange({ ...settings, bgColorId: color.id })} className={`w-10 h-10 rounded-full border-2 ${settings.bgColorId === color.id ? 'border-[var(--text-color-secondary)]' : 'border-gray-500'}`} style={{ backgroundColor: color.value }}></button>
                     ))}
                </div>
            </div>
        </div>
    </div>
);


export const ChatBot: React.FC<ChatBotProps> = ({ location, prayerTimes, sahurPopupText, isOpen, setIsOpen, initialMessage, onOpenVoiceAssistant }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const storedHistory = localStorage.getItem('hijriChatHistory');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (e) {
            console.error("Failed to load chat history from localStorage", e);
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('complex');
    const [isTtsEnabled, setIsTtsEnabled] = useState(true); // Default ON
    const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
    const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
        try {
            const stored = localStorage.getItem('hijriChatSettings');
            return stored ? JSON.parse(stored) : defaultChatSettings;
        } catch {
            return defaultChatSettings;
        }
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevSahurPopupText = useRef<string | null>(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        try {
            if (messages.length > 0) {
                localStorage.setItem('hijriChatHistory', JSON.stringify(messages));
            }
        } catch (e) {
            console.error("Failed to save chat history to localStorage", e);
        }
    }, [messages]);
    
    useEffect(() => {
        try {
            localStorage.setItem('hijriChatSettings', JSON.stringify(chatSettings));
        } catch (e) {
             console.error("Failed to save chat settings to localStorage", e);
        }
    }, [chatSettings]);


    useEffect(() => {
        if (isOpen && sahurPopupText && sahurPopupText !== prevSahurPopupText.current) {
            const sahurMessage: ChatMessage = {
                id: `sahur-${Date.now()}`,
                role: 'system', 
                text: sahurPopupText
            };
            setMessages(prev => [...prev, sahurMessage]);
            prevSahurPopupText.current = sahurPopupText;
        }
    }, [sahurPopupText, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            synth.cancel();
        }
    }, [isOpen, synth]);

    useEffect(() => {
        if (initialMessage) {
            handleSend(initialMessage);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMessage]);

    const speak = (text: string) => {
        if (!isTtsEnabled || !text || !synth) return;
        synth.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        synth.speak(utterance);
    };


    const handleSend = async (messageOverride?: string) => {
        const currentInput = messageOverride || input;
        if (!currentInput.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: currentInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: '', grounding: [] };
        
        const currentDate = new Date().toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
        let finalInput = currentInput;
        
        const prayerKeywords = ['shalat', 'sholat', 'prayer', 'waktu', 'jadwal', 'subuh', 'syuruk', 'sunrise', 'dzuhur', 'ashar', 'maghrib', 'isya', 'imsak'];
        const isPrayerQuery = prayerKeywords.some(k => currentInput.toLowerCase().includes(k));
        
        if (isPrayerQuery && prayerTimes) {
            const prayerTimesList = [
                prayerTimes.Imsak && `Imsak: ${prayerTimes.Imsak}`,
                prayerTimes.Fajr && `Subuh: ${prayerTimes.Fajr}`,
                prayerTimes.Sunrise && `Syuruk: ${prayerTimes.Sunrise}`,
                prayerTimes.Dhuhr && `Dzuhur: ${prayerTimes.Dhuhr}`,
                prayerTimes.Asr && `Ashar: ${prayerTimes.Asr}`,
                prayerTimes.Maghrib && `Maghrib: ${prayerTimes.Maghrib}`,
                prayerTimes.Isha && `Isya: ${prayerTimes.Isha}`,
            ].filter(Boolean).join(', ');

            finalInput = `My location has these prayer times for today: ${prayerTimesList}. Now, please answer my question: "${currentInput}"`;
        }
        
        const disclaimer = "\n\nJawaban yang diberikan oleh AI Assistant bertujuan untuk memberikan informasi dan tidak boleh dianggap sebagai fatwa atau nasihat hukum keagamaan. Untuk masalah Fiqih, silakan berkonsultasi dengan ulama atau ahli agama yang terpercaya.";

        try {
            let responseText = '';
            if (mode === 'search') {
                // Search mode prompt: Ask for citations
                const searchPrompt = `Current date is ${currentDate}. Perform a Google Search to answer: ${finalInput}. Provide detailed citations from trusted Islamic websites or encyclopedias. Include source links.`;
                const { text, grounding } = await getGroundedResponse(searchPrompt, 'search', location);
                responseText = text;
                modelMessage.text = sanitizeResponse(text) + disclaimer;
                modelMessage.grounding = grounding;
                setMessages(prev => [...prev, modelMessage]);
            } else if (mode === 'maps') {
                // Maps mode prompt: Ask for places
                const mapPrompt = `Current date is ${currentDate}. Using Google Maps, find: ${finalInput}. Provide details about the place.`;
                const { text, grounding } = await getGroundedResponse(mapPrompt, 'maps', location);
                responseText = text;
                modelMessage.text = sanitizeResponse(text) + disclaimer;
                modelMessage.grounding = grounding;
                setMessages(prev => [...prev, modelMessage]);
            } else if (mode === 'complex') {
                const text = await getComplexResponse(`Current date is ${currentDate}. My question: ${finalInput}`);
                responseText = text;
                modelMessage.text = sanitizeResponse(text) + disclaimer;
                setMessages(prev => [...prev, modelMessage]);
            } else { // 'chat' mode
                setMessages(prev => [...prev, modelMessage]);
                const systemPrompt: ChatMessage = { 
                    id: 'system-prompt', 
                    role: 'system', 
                    text: `You are an AI assistant for a Hijri calendar app. Today is ${currentDate}. All of your time-related responses MUST be based on this date. Your primary function is to provide helpful and respectful information on Islamic topics. You must adhere to the following strict rules at all times, without exception:

**RULE 1: NEVER USE ABBREVIATED ISLAMIC HONORIFICS.**
This is a critical and non-negotiable instruction. Using full, respectful titles is mandatory.
- For Allah: NEVER write "SWT". ALWAYS write "Allah Subhanahu wa Ta’ala" or "Allah ﷻ".
- For Prophet Muhammad: NEVER write "SAW". ALWAYS write "Nabi Muhammad Shallallahu ‘Alaihi wa Sallam" or "Nabi Muhammad ﷺ".
- For other Prophets: NEVER write "AS". ALWAYS write "Alaihis Salam".
- For the Sahabah (Companions): NEVER write "RA". ALWAYS write "radhiyallahu ‘anhu" (for male), "radhiyallahu ‘anha" (for female), or "radhiyallahu ‘anhum" (for plural).
This rule is absolute. Always double-check your response before outputting to ensure no abbreviations like "SWT", "SAW", "AS", or "RA" are present.

**RULE 2: PROVIDE DETAILED, INFORMATIVE ANSWERS ON ISLAMIC TOPICS.**
- When asked about Islamic holidays (e.g., Idul Fitri, Idul Adha, Hijri New Year), provide detailed explanations including their history, significance, and common practices.
- When asked about types of fasting (e.g., Puasa Daud, Senin Kamis, Ayyamul Bidh, Syawal, Arafah, Asyura, Sya'ban), give comprehensive answers that explain their virtues and procedures.
- When asked for a 'doa' (prayer), provide the Arabic text, transliteration, and translation.
- **Crucially, whenever possible, include a relevant Hadith or Quranic verse to support your explanation, and you MUST cite its source (e.g., HR. Bukhari, QS. Al-Baqarah: 183).**

Maintain a concise, respectful, and helpful tone.`
                };
                const history = [systemPrompt, ...messages, userMessage];
                let fullText = '';
                for await (const chunk of streamChat(history, finalInput)) {
                   fullText += chunk;
                   setMessages(prev => prev.map(m => m.id === modelMessage.id ? { ...m, text: sanitizeResponse(fullText) } : m));
                }
                responseText = fullText;
                setMessages(prev => prev.map(m => m.id === modelMessage.id ? { ...m, text: sanitizeResponse(fullText) + disclaimer } : m));
            }
             speak(sanitizeResponse(responseText));
        } catch (error) {
            console.error('Gemini API error:', error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' };
            setMessages(prev => [...prev.filter(m => m.id !== modelMessage.id), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (prompt: string) => {
        handleSend(prompt);
    };
    
    const getModeInfo = () => {
        switch(mode) {
            case 'search': return { text: "Search Mode", color: "text-blue-400" };
            case 'maps': return { text: "Maps Mode", color: "text-green-400" };
            case 'complex': return { text: "Complex Mode", color: "text-purple-400" };
            default: return { text: "Chat Mode", color: "text-cyan-400" };
        }
    };

    const handleShare = async () => {
        const conversationText = messages
            .filter(msg => msg.role !== 'system')
            .map(msg => `${msg.role === 'user' ? 'You' : 'AI Assistant'}: ${msg.text}`)
            .join('\n\n');

        if (!conversationText) {
            alert("Tidak ada percakapan untuk dibagikan.");
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Percakapan dengan Hijri AI Assistant',
                    text: conversationText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(conversationText).then(() => {
                alert('Percakapan disalin ke clipboard!');
            }, () => {
                alert('Gagal menyalin. Silakan salin secara manual.');
            });
        }
    };


    if (!isOpen) {
        return null; 
    }
    
    const selectedAvatar = AVATARS.find(a => a.id === chatSettings.avatarId) || AVATARS[0];
    const selectedBgColor = BG_COLORS.find(c => c.id === chatSettings.bgColorId) || BG_COLORS[0];


    return (
        <div className="chatbot-container fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:max-w-md w-full h-full sm:h-[70vh] flex flex-col backdrop-blur-md cyber-border rounded-lg z-30 fade-in" style={{ backgroundColor: selectedBgColor.value }}>
            {isChatSettingsOpen && <ChatSettingsPanel settings={chatSettings} onSettingsChange={setChatSettings} onClose={() => setIsChatSettingsOpen(false)} />}
            <header className="flex items-center justify-between p-3 border-b border-[var(--border-color)]/30">
                <div className="flex items-center space-x-2">
                     <img src={selectedAvatar.url} alt="AI Avatar" className="w-8 h-8 rounded-full bg-black/30" />
                    <div>
                        <h2 className="font-bold">Hijri AI Assistant</h2>
                        <p className={`text-xs ${getModeInfo().color}`}>{getModeInfo().text}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                     <button onClick={() => setIsChatSettingsOpen(true)} className="p-1" title="Personalisasi"><PaletteIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsTtsEnabled(prev => !prev)} className="p-1" title={isTtsEnabled ? "Matikan Suara" : "Aktifkan Suara"}>
                        {isTtsEnabled ? <VolumeUpIcon className="w-5 h-5"/> : <VolumeOffIcon className="w-5 h-5"/>}
                    </button>
                    <button onClick={handleShare} className="p-1" title="Bagikan Percakapan">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1" aria-label="Close Chat"><CloseIcon /></button>
                </div>
            </header>
            <div className="p-2 text-xs text-center text-white font-bold bg-black/20 border-b border-[var(--border-color)]/30">
                Jawaban yang diberikan oleh AI Assistant bertujuan untuk memberikan informasi dan tidak boleh dianggap sebagai fatwa. Informasi yang diberikan AI Assistant kemungkinan tidak akurat atau keliru.
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => {
                    if (msg.role === 'system' && msg.id !== 'system-prompt') { 
                        return (
                             <div key={msg.id} className="flex justify-center">
                                <div className="p-3 rounded-lg sahur-bubble">
                                    <p>{msg.text}</p>
                                </div>
                             </div>
                        )
                    }
                    if (msg.role !== 'system') { 
                        return (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm p-3 ${chatSettings.bubbleStyleId} ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.grounding && msg.grounding.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-[var(--border-color)]/50">
                                        <p className="text-xs text-cyan-300 mb-1">Sumber / Peta:</p>
                                        <ul className="space-y-2 text-xs">
                                            {msg.grounding.map(g => (
                                                <li key={g.uri}>
                                                    {g.uri && g.uri.includes('google.com/maps') ? (
                                                        <a href={g.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-black/20 p-2 rounded-md hover:bg-black/40 transition-colors group">
                                                            <MapIcon className="w-4 h-4 text-green-400 flex-shrink-0 group-hover:text-green-300" />
                                                            <span className="text-green-400 font-bold break-all group-hover:text-green-300">{g.title}</span>
                                                        </a>
                                                    ) : (
                                                        <a href={g.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:underline text-cyan-400">
                                                            <SearchIcon className="w-3 h-3 flex-shrink-0"/>
                                                            <span className="break-all">{g.title}</span>
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                </div>
                            </div>
                        );
                    }
                    return null; 
                })}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className={`p-3 rounded-lg model-bubble animate-pulse ${chatSettings.bubbleStyleId}`}>...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
             <div className="p-3 border-t border-[var(--border-color)]/30">
                 <div className="flex items-center space-x-2 mb-2">
                     <button onClick={() => setMode('chat')} className={`p-2 rounded-full ${mode === 'chat' ? 'bg-cyan-500' : 'bg-gray-500'}`} title="Chat Mode"><BotIcon className="w-4 h-4" /></button>
                     <button onClick={() => setMode('complex')} className={`p-2 rounded-full ${mode === 'complex' ? 'bg-purple-500' : 'bg-gray-500'}`} title="Complex Mode"><SparklesIcon className="w-4 h-4" /></button>
                     <button onClick={() => setMode('search')} className={`p-2 rounded-full ${mode === 'search' ? 'bg-blue-500' : 'bg-gray-500'}`} title="Search Mode"><SearchIcon className="w-4 h-4" /></button>
                     <button onClick={() => setMode('maps')} className={`p-2 rounded-full ${mode === 'maps' ? 'bg-green-500' : 'bg-gray-500'}`} title="Maps Mode"><MapIcon className="w-4 h-4" /></button>
                     <button onClick={onOpenVoiceAssistant} className="p-2 rounded-full bg-red-500 hover:bg-red-400 ml-auto animate-pulse" title="Live Voice Conversation">
                        <MicIcon className="w-4 h-4 text-white" />
                     </button>
                 </div>
                 <div className="mb-3">
                    <div className="flex flex-wrap justify-center gap-2">
                        {predefinedPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                className="bg-gray-600/50 hover:bg-cyan-700 text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything..."
                        className="flex-1 bg-gray-800 border border-[var(--border-color)]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="bg-cyan-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};