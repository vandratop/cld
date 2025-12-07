
import { Surah, Ayah } from '../types';

const API_BASE = 'https://api.alquran.cloud/v1';

export const fetchSurahs = async (): Promise<Surah[]> => {
    const cached = localStorage.getItem('quran_surahs');
    if (cached) {
        return JSON.parse(cached);
    }

    try {
        const response = await fetch(`${API_BASE}/surah`);
        const data = await response.json();
        if (data.code === 200) {
            localStorage.setItem('quran_surahs', JSON.stringify(data.data));
            return data.data;
        }
        throw new Error('Failed to fetch Surahs');
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<Ayah[]> => {
    const cacheKey = `quran_surah_${surahNumber}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    try {
        // Fetch Arabic Text
        const arabicResponse = await fetch(`${API_BASE}/surah/${surahNumber}/ar.alafasy`); // Audio + Text
        const arabicData = await arabicResponse.json();

        // Fetch Indonesian Translation
        const indoResponse = await fetch(`${API_BASE}/surah/${surahNumber}/id.indonesian`);
        const indoData = await indoResponse.json();

        if (arabicData.code === 200 && indoData.code === 200) {
            const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
                ...ayah,
                translation: indoData.data.ayahs[index].text
            }));
            
            // Cache the result
            try {
                localStorage.setItem(cacheKey, JSON.stringify(ayahs));
            } catch (e) {
                // Handle quota exceeded
                console.warn("Storage quota exceeded, clearing old Quran cache");
                localStorage.clear(); // Drastic, but effective for this demo. Ideally LRU.
            }
            return ayahs;
        }
        throw new Error('Failed to fetch Surah details');
    } catch (error) {
        console.error(error);
        return [];
    }
};
