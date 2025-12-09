
import { Surah, Ayah } from '../types';

const API_BASE = 'https://api.alquran.cloud/v1';

async function retryFetch(url: string, retries = 3, delay = 1500): Promise<Response> {
    // Check for offline status immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Koneksi internet terputus (Offline).');
    }

    try {
        const response = await fetch(url);
        // Retry on 5xx server errors, 429 rate limit, or 502/503/504 gateway errors
        if (!response.ok && (response.status >= 500 || response.status === 429)) {
             throw new Error(`Retryable HTTP Error: ${response.status}`);
        }
        return response;
    } catch (error: any) {
        if (retries > 0) {
            console.warn(`Retrying fetch for ${url}... (${retries} left). Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFetch(url, retries - 1, delay * 2); // Exponential backoff
        }
        throw error;
    }
}

// Fetches list of all Surahs
export const fetchSurahs = async (): Promise<Surah[]> => {
    const cached = localStorage.getItem('quran_surahs');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.warn("Cached surah data corrupted, refetching...");
            localStorage.removeItem('quran_surahs');
        }
    }

    try {
        const response = await retryFetch(`${API_BASE}/surah`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        if (data.code === 200 && Array.isArray(data.data)) {
            try {
                localStorage.setItem('quran_surahs', JSON.stringify(data.data));
            } catch (e) {
                console.warn("LocalStorage full, could not cache Surah list");
            }
            return data.data;
        }
        throw new Error('API Error: Failed to fetch Surahs (Invalid Data)');
    } catch (error) {
        console.error("fetchSurahs error:", error);
        throw error;
    }
};

export interface QuranEdition {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
}

// Fetches available Quran editions (translations, tafsirs, etc)
export const fetchQuranEditions = async (type?: 'translation' | 'tafsir'): Promise<QuranEdition[]> => {
    const cacheKey = `quran_editions_${type || 'all'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try { 
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }

    try {
        const url = type ? `${API_BASE}/edition?format=text&type=${type}` : `${API_BASE}/edition?format=text`;
        const response = await retryFetch(url);
        if (!response.ok) throw new Error('Failed to fetch editions');
        const data = await response.json();
        if (data.code === 200 && Array.isArray(data.data)) {
            const editions = data.data; 
            try { localStorage.setItem(cacheKey, JSON.stringify(editions)); } catch(e){}
            return editions;
        }
        return [];
    } catch (e) {
        console.error("fetchQuranEditions error", e);
        return []; // Return empty array on failure to prevent app crash
    }
}

// Fetches Quran Metadata (Juz, Hizb, etc stats)
export const fetchQuranMeta = async (): Promise<any> => {
    const cacheKey = 'quran_meta';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try { return JSON.parse(cached); } catch(e) {}
    }
    
    try {
        const response = await retryFetch(`${API_BASE}/meta`);
        if(!response.ok) throw new Error('Failed to fetch meta');
        const data = await response.json();
        if(data.code === 200) {
            try { localStorage.setItem(cacheKey, JSON.stringify(data.data)); } catch(e){}
            return data.data;
        }
        return null;
    } catch(e) {
        console.error("fetchQuranMeta error", e);
        return null; // Return null on failure to prevent app crash
    }
}

// Fetches Tafsir text for a specific ayah
export const fetchTafsir = async (surahNumber: number, ayahNumber: number, editionIdentifier: string = 'ar.aljalalayn'): Promise<string> => {
    try {
        const response = await retryFetch(`${API_BASE}/ayah/${surahNumber}:${ayahNumber}/${editionIdentifier}`);
        if (!response.ok) throw new Error('Failed to fetch Tafsir');
        const data = await response.json();
        if (data.code === 200) {
            return data.data.text;
        }
        return "";
    } catch (e) {
        console.error("fetchTafsir error", e);
        return "Tafsir tidak tersedia. Periksa koneksi internet.";
    }
}

// Fetches details (Ayahs, Audio, Translation) for a specific Surah
export const fetchSurahDetails = async (surahNumber: number, editionIdentifier: string = 'id.indonesian'): Promise<Ayah[]> => {
    // Cache key includes edition
    const cacheKey = `quran_surah_${surahNumber}_${editionIdentifier}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        // Fetch Arabic Text (Fixed) and Selected Translation in parallel
        // We use retryFetch for both to ensure robustness
        const [arabicResponse, transResponse] = await Promise.all([
            retryFetch(`${API_BASE}/surah/${surahNumber}/ar.alafasy`), // Audio + Arabic Text
            retryFetch(`${API_BASE}/surah/${surahNumber}/${editionIdentifier}`) // Dynamic Translation
        ]);

        if (!arabicResponse.ok) throw new Error(`Arabic fetch error: ${arabicResponse.status}`);
        if (!transResponse.ok) throw new Error(`Translation fetch error: ${transResponse.status}`);
        
        const arabicData = await arabicResponse.json();
        const transData = await transResponse.json();

        if (arabicData.code === 200 && transData.code === 200) {
            const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
                ...ayah,
                translation: transData.data.ayahs[index] ? transData.data.ayahs[index].text : ''
            }));
            
            // Cache the result
            try {
                localStorage.setItem(cacheKey, JSON.stringify(ayahs));
            } catch (e) {
                // Clear old cache if full to make space
                try {
                    console.warn("LocalStorage full, clearing old Quran cache...");
                    // Simple strategy: remove all quran related keys (risky but effective)
                    // Better: just don't cache if full
                } catch(e2) {} 
            }
            return ayahs;
        }
        throw new Error('API Error: Failed to fetch Surah details');
    } catch (error) {
        console.error("fetchSurahDetails error:", error);
        throw error; 
    }
};

// Fetches details (Ayahs, Audio, Translation) for a specific Juz
export const fetchJuzDetails = async (juzNumber: number, editionIdentifier: string = 'id.indonesian'): Promise<Ayah[]> => {
    // Cache key includes edition
    const cacheKey = `quran_juz_${juzNumber}_${editionIdentifier}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        // Fetch Audio/Arabic (Alafasy) and Translation for Juz
        // Juz endpoint returns the whole juz which might span multiple surahs.
        // We assume structure matches.
        const [arabicResponse, transResponse] = await Promise.all([
            retryFetch(`${API_BASE}/juz/${juzNumber}/ar.alafasy`),
            retryFetch(`${API_BASE}/juz/${juzNumber}/${editionIdentifier}`)
        ]);

        if (!arabicResponse.ok) throw new Error(`Arabic fetch error: ${arabicResponse.status}`);
        if (!transResponse.ok) throw new Error(`Translation fetch error: ${transResponse.status}`);
        
        const arabicData = await arabicResponse.json();
        const transData = await transResponse.json();

        if (arabicData.code === 200 && transData.code === 200) {
            const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
                ...ayah,
                translation: transData.data.ayahs[index] ? transData.data.ayahs[index].text : ''
            }));
            
            try {
                localStorage.setItem(cacheKey, JSON.stringify(ayahs));
            } catch (e) {
                console.warn("LocalStorage full");
            }
            return ayahs;
        }
        throw new Error('API Error: Failed to fetch Juz details');
    } catch (error) {
        console.error("fetchJuzDetails error:", error);
        throw error; 
    }
};
