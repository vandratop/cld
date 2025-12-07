
import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetails } from '../services/quranService';
import { Surah, Ayah } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, VolumeUpIcon, CloseIcon } from './Icons';

interface QuranPlayerProps {
    onBack: () => void;
}

export const QuranPlayer: React.FC<QuranPlayerProps> = ({ onBack }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingAyah, setPlayingAyah] = useState<number | null>(null); // Ayah number
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    
    const ayahsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadSurahs = async () => {
            setLoading(true);
            const data = await fetchSurahs();
            setSurahs(data);
            setLoading(false);
        };
        loadSurahs();
    }, []);

    const handleSurahSelect = async (surah: Surah) => {
        setSelectedSurah(surah);
        setLoading(true);
        const data = await fetchSurahDetails(surah.number);
        setAyahs(data);
        setLoading(false);
        // Reset search when changing surah
        setSearchQuery('');
    };

    const handlePlayAudio = (ayah: Ayah) => {
        if (currentAudio) {
            currentAudio.pause();
        }
        
        const audio = new Audio(ayah.audio);
        audio.playbackRate = playbackSpeed;
        audio.onended = () => setPlayingAyah(null);
        audio.play();
        
        setCurrentAudio(audio);
        setPlayingAyah(ayah.numberInSurah);
    };

    const handleTTS = (text: string) => {
        if (currentAudio) currentAudio.pause();
        setPlayingAyah(null);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = playbackSpeed;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setPlayingAyah(null);
        }
        window.speechSynthesis.cancel();
    };

    const scrollToAyah = (index: number) => {
        const element = document.getElementById(`ayah-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Filtered ayahs based on search
    const filteredAyahs = searchQuery 
        ? ayahs.filter(a => a.translation?.toLowerCase().includes(searchQuery.toLowerCase())) 
        : ayahs;

    // Filter surahs for sidebar
    const filteredSurahs = surahs.filter(s => 
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.includes(searchQuery)
    );

    return (
        <div className="h-full flex flex-col bg-[#002b25] text-white">
            {/* Header */}
            <div className="p-4 border-b border-[#00ffdf]/30 flex justify-between items-center bg-[#00594C]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold font-amiri">Al-Qur'an Digital</h2>
                <div className="w-8"></div> 
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Surah List) - Hidden on mobile if Surah selected */}
                <div className={`w-full md:w-1/3 border-r border-[#00ffdf]/20 flex flex-col bg-[#002b25] ${selectedSurah ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-3 border-b border-[#00ffdf]/20">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Cari Surah..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/30 border border-[#00ffdf]/30 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:border-[#00ffdf]"
                            />
                            <SearchIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredSurahs.map(surah => (
                            <button 
                                key={surah.number}
                                onClick={() => handleSurahSelect(surah)}
                                className={`w-full text-left p-4 border-b border-[#00ffdf]/10 hover:bg-[#00ffdf]/10 transition-colors ${selectedSurah?.number === surah.number ? 'bg-[#00ffdf]/20' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full border border-[#00ffdf] flex items-center justify-center text-xs font-bold bg-black/30">{surah.number}</span>
                                            <div>
                                                <p className="font-bold text-sm">{surah.englishName}</p>
                                                <p className="text-xs text-gray-400">{surah.englishNameTranslation}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-amiri text-lg text-[#00ffdf]">{surah.name}</p>
                                        <p className="text-[10px] text-gray-400">{surah.numberOfAyahs} Ayat</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content (Ayahs) */}
                <div className={`w-full md:w-2/3 flex flex-col bg-[#00352e] ${!selectedSurah ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                    {selectedSurah ? (
                        <>
                            {/* Surah Header / Search */}
                            <div className="p-3 border-b border-[#00ffdf]/20 flex flex-col md:flex-row justify-between items-center gap-2 bg-[#004d40]">
                                <button onClick={() => setSelectedSurah(null)} className="md:hidden self-start flex items-center text-xs text-[#00ffdf] mb-2">
                                    <ChevronLeftIcon className="w-4 h-4 mr-1"/> Daftar Surah
                                </button>
                                <div className="text-center md:text-left">
                                    <h3 className="font-bold text-lg">{selectedSurah.englishName} <span className="font-amiri text-[#00ffdf] ml-2">{selectedSurah.name}</span></h3>
                                    <p className="text-xs opacity-70">{selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} Ayat</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cari Ayat (Terjemahan)..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/30 border border-[#00ffdf]/30 rounded-full py-1 px-3 text-xs focus:outline-none w-48"
                                    />
                                    <select 
                                        value={playbackSpeed} 
                                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                        className="bg-black/30 border border-[#00ffdf]/30 rounded px-2 py-1 text-xs"
                                    >
                                        <option value="0.75">0.75x</option>
                                        <option value="1.0">1.0x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                    </select>
                                </div>
                            </div>

                            {/* Ayah List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={ayahsContainerRef}>
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffdf]"></div>
                                    </div>
                                ) : (
                                    <>
                                        {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                            <div className="text-center py-4 font-amiri text-2xl text-[#00ffdf]">
                                                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                            </div>
                                        )}
                                        {filteredAyahs.map((ayah, index) => (
                                            <div key={ayah.number} id={`ayah-${index}`} className={`p-4 rounded-xl border ${playingAyah === ayah.numberInSurah ? 'border-[#00ffdf] bg-[#00ffdf]/10' : 'border-gray-700 bg-black/20'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-8 h-8 rounded-full bg-[#00594C] flex items-center justify-center text-sm font-bold border border-[#00ffdf]/50">
                                                        {ayah.numberInSurah}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handlePlayAudio(ayah)} className={`p-2 rounded-full hover:bg-white/10 ${playingAyah === ayah.numberInSurah ? 'text-[#00ffdf] animate-pulse' : 'text-gray-400'}`}>
                                                            <VolumeUpIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleTTS(ayah.translation || '')} className="p-2 rounded-full hover:bg-white/10 text-gray-400" title="Baca Terjemahan">
                                                            <span className="text-xs font-bold">TTS</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-right font-amiri text-3xl leading-[2.5] mb-6" dir="rtl">{ayah.text}</p>
                                                <p className="text-sm text-gray-300 leading-relaxed italic">{ayah.translation}</p>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Sticky Navigation Controls */}
                            <div className="p-3 bg-[#00594C] border-t border-[#00ffdf]/20 flex justify-between items-center">
                                <button onClick={() => scrollToAyah(0)} className="px-3 py-1 bg-black/30 rounded text-xs hover:bg-black/50">
                                    Awal Surah
                                </button>
                                <button onClick={stopAudio} className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-500">
                                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                                </button>
                                <button onClick={() => scrollToAyah(filteredAyahs.length - 1)} className="px-3 py-1 bg-black/30 rounded text-xs hover:bg-black/50">
                                    Akhir Surah
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-400 opacity-50">
                            <p className="text-6xl mb-4">📖</p>
                            <p>Pilih Surah untuk mulai membaca</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
