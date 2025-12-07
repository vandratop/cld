
import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetails, fetchQuranEditions, fetchQuranMeta, fetchTafsir, QuranEdition } from '../services/quranService';
import { Surah, Ayah } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, VolumeUpIcon, CloseIcon, ShareIcon, TafsirIcon, MetadataIcon } from './Icons';

// Helper for html2canvas
declare const html2canvas: any;

interface QuranPlayerProps {
    onBack: () => void;
}

export const QuranPlayer: React.FC<QuranPlayerProps> = ({ onBack }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    
    // Translation & Edition State
    const [editions, setEditions] = useState<QuranEdition[]>([]);
    const [selectedEdition, setSelectedEdition] = useState('id.indonesian');
    const [metaData, setMetaData] = useState<any>(null);
    const [showMetaModal, setShowMetaModal] = useState(false);
    
    // Tafsir & Interaction
    const [activeTafsirAyah, setActiveTafsirAyah] = useState<{ numberInSurah: number, text: string } | null>(null);
    
    const ayahsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setInitialLoading(true);
        setError(null);
        try {
            const [surahData, editionData, meta] = await Promise.all([
                fetchSurahs(),
                fetchQuranEditions('translation'),
                fetchQuranMeta()
            ]);
            
            if (surahData.length === 0) throw new Error("Gagal memuat data surah.");
            setSurahs(surahData);
            setEditions(editionData);
            setMetaData(meta);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data Al-Qur'an. Periksa koneksi internet Anda.");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSurahSelect = async (surah: Surah) => {
        if (selectedSurah?.number === surah.number) return;
        setSelectedSurah(surah);
        setLoading(true);
        setError(null);
        setAyahs([]);
        setActiveTafsirAyah(null);
        
        try {
            const data = await fetchSurahDetails(surah.number, selectedEdition);
            setAyahs(data);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat ayat. Silakan coba lagi.");
        } finally {
            setLoading(false);
            setSearchQuery('');
        }
    };

    const handleEditionChange = async (newEdition: string) => {
        setSelectedEdition(newEdition);
        if (selectedSurah) {
            setLoading(true);
            try {
                const data = await fetchSurahDetails(selectedSurah.number, newEdition);
                setAyahs(data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePlayAudio = (ayah: Ayah) => {
        if (currentAudio) currentAudio.pause();
        const audio = new Audio(ayah.audio);
        audio.playbackRate = playbackSpeed;
        audio.onended = () => setPlayingAyah(null);
        audio.play().catch(e => console.error("Audio play error:", e));
        setCurrentAudio(audio);
        setPlayingAyah(ayah.numberInSurah);
    };

    const handleTTS = (text: string) => {
        if (currentAudio) currentAudio.pause();
        setPlayingAyah(null);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedEdition.includes('id') ? 'id-ID' : (selectedEdition.includes('en') ? 'en-US' : 'ar-SA');
        utterance.rate = playbackSpeed;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const handleShowTafsir = async (ayah: Ayah) => {
        if (!selectedSurah) return;
        try {
            // Fetch Tafsir Al-Jalalayn
            const tafsirText = await fetchTafsir(selectedSurah.number, ayah.numberInSurah);
            setActiveTafsirAyah({ numberInSurah: ayah.numberInSurah, text: tafsirText });
        } catch(e) {
            alert("Gagal memuat tafsir.");
        }
    };

    const handleShareAyah = async (ayah: Ayah, mode: 'text' | 'image') => {
        if (!selectedSurah) return;
        
        const ayahText = ayah.text;
        const transText = ayah.translation || "";
        const shareTitle = `QS ${selectedSurah.englishName} : ${ayah.numberInSurah}`;
        const watermark = "\n\nTe_eR Inovative";

        if (mode === 'text') {
            const textToShare = `${ayahText}\n\n${transText}\n(${shareTitle})${watermark}`;
            try {
                if (navigator.share) {
                    await navigator.share({ title: shareTitle, text: textToShare });
                } else {
                    await navigator.clipboard.writeText(textToShare);
                    alert("Teks ayat disalin!");
                }
            } catch (e) {}
        } else {
            // Image Share Logic
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '600px';
            tempDiv.style.background = '#002b25';
            tempDiv.style.padding = '40px';
            tempDiv.style.color = 'white';
            tempDiv.style.fontFamily = 'Amiri, sans-serif';
            tempDiv.innerHTML = `
                <div style="border: 2px solid #00ffdf; border-radius: 20px; padding: 30px; text-align: center;">
                    <h2 style="color: #00ffdf; margin-bottom: 20px;">${shareTitle}</h2>
                    <p style="font-size: 32px; line-height: 2; margin-bottom: 30px; direction: rtl;">${ayahText}</p>
                    <p style="font-size: 18px; color: #e0e0e0; font-family: sans-serif; line-height: 1.6;">${transText}</p>
                    <div style="margin-top: 40px; font-size: 14px; color: gray; opacity: 0.5; font-family: sans-serif;">Te_eR Inovative</div>
                </div>
            `;
            document.body.appendChild(tempDiv);
            
            try {
                const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: '#002b25' });
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                if (blob && navigator.share) {
                    const file = new File([blob], 'ayat.jpg', { type: 'image/jpeg' });
                    await navigator.share({ files: [file], title: shareTitle });
                } else if(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ayat-${selectedSurah.number}-${ayah.numberInSurah}.jpg`;
                    a.click();
                }
            } catch(e) {
                console.error(e);
            } finally {
                document.body.removeChild(tempDiv);
            }
        }
    };

    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setPlayingAyah(null);
        }
        window.speechSynthesis.cancel();
    };

    const filteredAyahs = searchQuery && selectedSurah
        ? ayahs.filter(a => a.translation?.toLowerCase().includes(searchQuery.toLowerCase())) 
        : ayahs;

    const filteredSurahs = surahs.filter(s => 
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.includes(searchQuery) ||
        String(s.number).includes(searchQuery)
    );

    // Filter important editions first (Indonesian, English)
    const sortedEditions = [...editions].sort((a, b) => {
        if (a.language === 'id' && b.language !== 'id') return -1;
        if (a.language === 'en' && b.language !== 'en' && b.language !== 'id') return -1;
        return 0;
    });

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#002b25] text-white font-jannah animate-fade-in h-[100dvh]">
            <div className="p-4 border-b border-[#00ffdf]/30 flex justify-between items-center bg-[#00594C] shadow-md shrink-0 z-20">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20 flex items-center gap-2 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                    <span className="hidden sm:inline text-sm font-bold">Kembali</span>
                </button>
                <h2 className="text-xl font-bold font-amiri tracking-wider">Al-Qur'an Digital</h2>
                <div className="w-8"></div> 
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                
                {showMetaModal && metaData && (
                    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 fade-in" onClick={() => setShowMetaModal(false)}>
                        <div className="bg-[#00352e] p-6 rounded-xl border border-[#00ffdf] max-w-sm w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-[#00ffdf]">Meta Data Al-Qur'an</h3>
                                <button onClick={() => setShowMetaModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-black/30 p-3 rounded">Surahs: {metaData.surahs?.count}</div>
                                <div className="bg-black/30 p-3 rounded">Ayahs: {metaData.ayahs?.count}</div>
                                <div className="bg-black/30 p-3 rounded">Juzs: {metaData.juzs?.count}</div>
                                <div className="bg-black/30 p-3 rounded">Hizbs: {metaData.hizbs?.count}</div>
                                <div className="bg-black/30 p-3 rounded">Sajdas: {metaData.sajdas?.count}</div>
                                <div className="bg-black/30 p-3 rounded">Rukus: {metaData.rukus?.count}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`
                    w-full md:w-1/3 lg:w-1/4 border-r border-[#00ffdf]/20 flex flex-col bg-[#002b25] transition-transform duration-300 absolute inset-0 md:relative z-10
                    ${selectedSurah ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                `}>
                    <div className="p-4 border-b border-[#00ffdf]/20 bg-[#00352e] space-y-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Cari Surah..." 
                                value={!selectedSurah ? searchQuery : ''} 
                                onChange={(e) => !selectedSurah && setSearchQuery(e.target.value)}
                                className="w-full bg-black/30 border border-[#00ffdf]/30 rounded-full py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#00ffdf] text-white"
                                disabled={!!selectedSurah && window.innerWidth < 768} 
                            />
                            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        </div>
                        
                        {!selectedSurah && (
                            <div className="flex gap-2">
                                <select 
                                    value={selectedEdition} 
                                    onChange={(e) => handleEditionChange(e.target.value)}
                                    className="flex-1 bg-black/30 border border-[#00ffdf]/30 rounded px-2 py-2 text-xs text-white outline-none truncate"
                                >
                                    {sortedEditions.map(ed => (
                                        <option key={ed.identifier} value={ed.identifier} className="text-black">
                                            {ed.language.toUpperCase()} - {ed.name}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={() => setShowMetaModal(true)} className="p-2 bg-black/30 border border-[#00ffdf]/30 rounded hover:bg-[#00ffdf]/10" title="Metadata">
                                    <MetadataIcon className="w-5 h-5 text-[#00ffdf]" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {initialLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>)}
                            </div>
                        ) : (
                            filteredSurahs.map(surah => (
                                <button 
                                    key={surah.number}
                                    onClick={() => handleSurahSelect(surah)}
                                    className={`w-full text-left p-4 border-b border-[#00ffdf]/10 hover:bg-[#00ffdf]/10 transition-colors group ${selectedSurah?.number === surah.number ? 'bg-[#00ffdf]/20 border-l-4 border-l-[#00ffdf]' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-md ${selectedSurah?.number === surah.number ? 'border-[#00ffdf] bg-[#00ffdf] text-[#002b25]' : 'border-[#00ffdf]/50 bg-black/30 text-[#00ffdf]'}`}>
                                                {surah.number}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${selectedSurah?.number === surah.number ? 'text-[#00ffdf]' : 'text-gray-200'}`}>{surah.englishName}</p>
                                                <p className="text-xs text-gray-400">{surah.englishNameTranslation}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-amiri text-xl text-[#00ffdf] mb-1">{surah.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{surah.numberOfAyahs} Ayat</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className={`
                    w-full md:w-2/3 lg:w-3/4 flex flex-col bg-[#00352e] absolute inset-0 md:relative z-10 transition-transform duration-300
                    ${selectedSurah ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}>
                    {selectedSurah ? (
                        <>
                            <div className="p-3 border-b border-[#00ffdf]/20 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#004d40] shadow-sm shrink-0">
                                <div className="flex items-center w-full sm:w-auto gap-3">
                                    <button onClick={() => setSelectedSurah(null)} className="md:hidden p-2 bg-black/20 rounded-full text-[#00ffdf]">
                                        <ChevronLeftIcon className="w-5 h-5"/>
                                    </button>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-tight text-white">{selectedSurah.englishName}</h3>
                                        <p className="text-xs text-[#00ffdf] font-amiri">{selectedSurah.name} • {selectedSurah.numberOfAyahs} Ayat</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-48">
                                        <input 
                                            type="text" 
                                            placeholder="Cari terjemahan..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-black/30 border border-[#00ffdf]/30 rounded-full py-1.5 px-3 pl-8 text-xs focus:outline-none focus:border-[#00ffdf] text-white"
                                        />
                                        <SearchIcon className="w-3 h-3 absolute left-2.5 top-2 text-gray-400" />
                                    </div>
                                    <select 
                                        value={playbackSpeed} 
                                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                        className="bg-black/30 border border-[#00ffdf]/30 rounded px-2 py-1.5 text-xs text-white outline-none"
                                    >
                                        <option value="1.0">1.0x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-[#00352e] to-[#002b25]" ref={ayahsContainerRef}>
                                {loading ? (
                                    <div className="flex flex-col justify-center items-center h-full space-y-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffdf]"></div>
                                        <p className="text-sm text-[#00ffdf] animate-pulse">Memuat Ayat...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center pt-20">
                                        <p className="text-red-400 mb-4">{error}</p>
                                        <button onClick={() => handleSurahSelect(selectedSurah)} className="px-4 py-2 bg-[#00ffdf] text-[#002b25] rounded font-bold">Muat Ulang</button>
                                    </div>
                                ) : (
                                    <>
                                        {selectedSurah.number !== 9 && (
                                            <div className="text-center py-8 font-amiri text-3xl sm:text-4xl text-[#00ffdf] bg-[#002b25]/50 rounded-2xl border border-[#00ffdf]/20 mb-6 shadow-inner select-none">
                                                بِسْمِ ٱللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                                            </div>
                                        )}
                                        
                                        {filteredAyahs.map((ayah, index) => {
                                            let displayText = ayah.text;
                                            if (ayah.numberInSurah === 1 && selectedSurah.number !== 1 && selectedSurah.number !== 9) {
                                                displayText = displayText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '').replace(/^بِسْمِ ٱللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ\s*/, '');
                                            }
                                            const isPlaying = playingAyah === ayah.numberInSurah;

                                            return (
                                                <div 
                                                    key={ayah.number} 
                                                    id={`ayah-${index}`} 
                                                    className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 relative ${isPlaying ? 'border-[#00ffdf] bg-[#00ffdf]/5 transform scale-[1.01]' : 'border-gray-700/50 bg-black/20 hover:border-gray-600'}`}
                                                >
                                                    {/* Top Right Action Buttons */}
                                                    <div className="absolute top-4 right-4 flex space-x-2">
                                                        <button 
                                                            onClick={() => handleShareAyah(ayah, 'text')}
                                                            className="p-1.5 rounded-full bg-black/30 text-gray-400 hover:text-[#00ffdf] hover:bg-black/50 transition-colors"
                                                            title="Share Text/Image"
                                                        >
                                                            <ShareIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-start mb-6 pr-10">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${isPlaying ? 'bg-[#00ffdf] border-white text-[#002b25]' : 'bg-[#00594C] border-[#00ffdf]/30 text-white'}`}>
                                                            {ayah.numberInSurah}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleShowTafsir(ayah)} 
                                                                className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" 
                                                                title="Baca Tafsir (AR)"
                                                            >
                                                                <TafsirIcon className="w-5 h-5"/>
                                                            </button>
                                                            <button 
                                                                onClick={() => handlePlayAudio(ayah)} 
                                                                className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-[#00ffdf] text-[#002b25]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                            >
                                                                <VolumeUpIcon className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleTTS(ayah.translation || '')} 
                                                                className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" 
                                                            >
                                                                <span className="text-[10px] font-bold px-1">{selectedEdition.includes('id') ? 'ID' : 'TR'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-right font-amiri text-3xl sm:text-4xl md:text-5xl leading-[2.2] sm:leading-[2.5] mb-8 text-white drop-shadow-md px-2" dir="rtl">
                                                        {displayText}
                                                    </p>
                                                    
                                                    <div className="border-t border-white/10 pt-4">
                                                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed italic text-justify">
                                                            "{ayah.translation}"
                                                        </p>
                                                    </div>

                                                    {/* Tafsir Block */}
                                                    {activeTafsirAyah?.numberInSurah === ayah.numberInSurah && (
                                                        <div className="mt-4 p-4 bg-black/40 rounded-lg border border-[#00ffdf]/30 text-right animate-fade-in-up">
                                                            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                                                                <button onClick={() => setActiveTafsirAyah(null)} className="text-xs text-red-400">Tutup</button>
                                                                <span className="text-xs font-bold text-[#00ffdf]">Tafsir Al-Jalalayn (AR)</span>
                                                            </div>
                                                            <p className="font-amiri text-lg text-gray-200 leading-relaxed" dir="rtl">{activeTafsirAyah.text}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 opacity-60 p-8 space-y-4">
                            <div className="w-32 h-32 rounded-full bg-black/20 flex items-center justify-center border-4 border-[#00ffdf]/20">
                                <span className="text-6xl">📖</span>
                            </div>
                            <h3 className="text-2xl font-bold font-amiri text-[#00ffdf]">Al-Qur'an Digital</h3>
                            <p className="text-center max-w-xs">Silakan pilih Surah dari daftar di sebelah kiri untuk mulai membaca.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
