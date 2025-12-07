
import React, { useState, useEffect } from 'react';
import type { Day, CustomEvent, CustomHijriEvent } from '../types';
import { CloseIcon, InfoIcon, ShareIcon, PinIcon } from './Icons';
import { translateToIndonesian } from '../utils';

const FASTING_INFO_DETAILS: { [key: string]: string } = {
    "Puasa Ramadhan": "Puasa wajib selama sebulan penuh, pilar ketiga Rukun Islam.",
    "Puasa Arafah": "Menghapus dosa setahun yang lalu dan setahun yang akan datang.",
    "Puasa Tasu'a": "Dianjurkan untuk menyertai puasa Asyura sebagai pembeda.",
    "Puasa Asyura": "Menghapus dosa setahun yang lalu.",
    "Puasa Syawal": "Berpuasa 6 hari di bulan Syawal setara dengan pahala puasa setahun penuh.",
    "Puasa Ayyamul Bidh": "Seperti berpuasa sepanjang tahun jika dilakukan setiap bulan.",
    "Puasa Senin & Kamis": "Hari diangkatnya amalan, mengikuti sunnah Rasulullah ﷺ.",
    "Puasa Sunnah Lainnya (Syawal, Arafah, dll.)": "Puasa sunnah dengan keutamaan besar di hari-hari istimewa."
};

interface DateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    day: Day;
    events: CustomEvent[];
    onAddEvent: (event: Omit<CustomEvent, 'id'>) => void;
    onDeleteEvent: (eventId: string) => void;
    onUpdateEvent: (event: CustomEvent) => void;
    customHijriEvents: CustomHijriEvent[];
    onAddHijriEvent: (event: Omit<CustomHijriEvent, 'id'>) => void;
    onDeleteHijriEvent: (eventId: string) => void;
    onUpdateHijriEvent: (event: CustomHijriEvent) => void;
    fastingInfo: { isFasting: boolean, type: string };
    onOpenInfo: (infoKey: string) => void;
    nationalHoliday?: string;
    hijriHoliday?: string;
    infoTypeKey: string | null;
}

export const DateDetailModal: React.FC<DateDetailModalProps> = ({ 
    isOpen, onClose, day, 
    events, onAddEvent, onDeleteEvent, onUpdateEvent, 
    customHijriEvents, onAddHijriEvent, onUpdateHijriEvent, onDeleteHijriEvent,
    fastingInfo, onOpenInfo, nationalHoliday, hijriHoliday, infoTypeKey
}) => {
    const [newEventText, setNewEventText] = useState('');
    const [newReminderOption, setNewReminderOption] = useState<'none' | 'on_day' | '1_day_before'>('none');
    const [newReminderTime, setNewReminderTime] = useState('08:00');
    const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null);

    const [newHijriEventName, setNewHijriEventName] = useState('');
    const [newHijriEventDesc, setNewHijriEventDesc] = useState('');
    const [newHijriEventIsRecurring, setNewHijriEventIsRecurring] = useState(true);
    const [newHijriReminderOption, setNewHijriReminderOption] = useState<'none' | 'on_day' | '1_day_before'>('none');
    const [newHijriReminderTime, setNewHijriReminderTime] = useState('08:00');
    const [editingHijriEvent, setEditingHijriEvent] = useState<CustomHijriEvent | null>(null);

    if (!isOpen) return null;

    // Special logic for 13 Dzulhijjah
    const is13Dzulhijjah = parseInt(day.hijri.day) === 13 && day.hijri.month.number === 12;
    const displayFastingType = is13Dzulhijjah ? "Hari Tasyrik disunnahkan tidak berpuasa" : fastingInfo.type;
    const displayInfoKey = is13Dzulhijjah ? 'hari-raya-idul-adha' : infoTypeKey;
    const displayIsFasting = is13Dzulhijjah ? true : fastingInfo.isFasting; 

    // Specific Holiday Logic for Tooltip Links
    const hijriDay = parseInt(day.hijri.day);
    const hijriMonth = day.hijri.month.number;
    let specificHolidayInfo = null;
    let specificHolidayKey = null;

    if (hijriMonth === 1 && hijriDay === 1) {
        specificHolidayInfo = "Tahun Baru Hijriah";
        specificHolidayKey = "hari-raya-tahun-baru";
    } else if (hijriMonth === 10 && (hijriDay === 1 || hijriDay === 2)) {
        specificHolidayInfo = "Idul Fitri";
        specificHolidayKey = "hari-raya-idul-fitri";
    } else if (hijriMonth === 12 && hijriDay === 10) {
        specificHolidayInfo = "Idul Adha";
        specificHolidayKey = "hari-raya-idul-adha";
    }

    const gregorianDate = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2,'0')}-${day.gregorian.day.padStart(2,'0')}`;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventText.trim()) return;
        onAddEvent({
            gregorianDate: gregorianDate,
            text: newEventText,
            reminder: newReminderOption,
            reminderTime: newReminderTime
        });
        setNewEventText('');
        setNewReminderOption('none');
        setNewReminderTime('08:00');
    };
    
    const handleStartEdit = (event: CustomEvent) => {
        setEditingEvent(JSON.parse(JSON.stringify(event)));
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
    };

    const handleSaveEdit = () => {
        if (!editingEvent || !editingEvent.text.trim()) {
            handleCancelEdit();
            return;
        };
        onUpdateEvent(editingEvent);
        handleCancelEdit();
    };

    const handleHijriSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHijriEventName.trim()) return;
        onAddHijriEvent({
            hijriDay: parseInt(day.hijri.day),
            hijriMonth: day.hijri.month.number,
            hijriYear: parseInt(day.hijri.year),
            isRecurring: newHijriEventIsRecurring,
            name: newHijriEventName,
            description: newHijriEventDesc,
            reminder: newHijriReminderOption,
            reminderTime: newHijriReminderTime
        });
        setNewHijriEventName('');
        setNewHijriEventDesc('');
        setNewHijriEventIsRecurring(true);
        setNewHijriReminderOption('none');
        setNewHijriReminderTime('08:00');
    };

    const handleStartHijriEdit = (event: CustomHijriEvent) => {
        setEditingHijriEvent(JSON.parse(JSON.stringify(event)));
    };

    const handleCancelHijriEdit = () => {
        setEditingHijriEvent(null);
    };

    const handleSaveHijriEdit = () => {
        if (!editingHijriEvent || !editingHijriEvent.name.trim()) {
            handleCancelHijriEdit();
            return;
        }
        onUpdateHijriEvent(editingHijriEvent);
        handleCancelHijriEdit();
    };

    const handleInfoClick = (key?: string) => {
        const targetKey = key || displayInfoKey;
        if (targetKey) {
            onOpenInfo(targetKey);
        }
    }

    const handleShareModal = async () => {
        const hijriDateStr = `${day.hijri.day} ${translateToIndonesian(day.hijri.month.en, 'hijri')} ${day.hijri.year} H`;
        const gregorianDateStr = `${day.gregorian.day} ${translateToIndonesian(day.gregorian.month.en, 'gregorian')} ${day.gregorian.year}`;
        
        let shareText = `Tanggal: ${gregorianDateStr} / ${hijriDateStr}\n`;
        if (nationalHoliday) {
            shareText += `Info: ${nationalHoliday}\n`;
        }
        if (hijriHoliday) {
            shareText += `Info: ${hijriHoliday}\n`;
        }
        if (displayIsFasting) {
            shareText += `Info: ${displayFastingType}\n`;
        }
        if (events.length > 0) {
            shareText += `\nCatatan (Masehi):\n`;
            events.forEach(e => shareText += `- ${e.text}\n`);
        }
        if (customHijriEvents.length > 0) {
            shareText += `\nCatatan (Hijriah):\n`;
            customHijriEvents.forEach(e => shareText += `- ${e.name}${e.isRecurring ? ' (Setiap Tahun)' : ''}\n`);
        }
        shareText += '\nYuk Mari berbagi kebaikan. Dibagikan dari Digital Kalender Hijiriah | https://hijria.netlify.app';

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Detail Tanggal ${gregorianDateStr}`,
                    text: shareText,
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert("Detail tanggal disalin ke clipboard!");
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    };
    
    const handleShareEvent = async (event: CustomEvent | CustomHijriEvent) => {
        const hijriDateStr = `${day.hijri.day} ${translateToIndonesian(day.hijri.month.en, 'hijri')} ${day.hijri.year} H`;
        const gregorianDateStr = `${day.gregorian.day} ${translateToIndonesian(day.gregorian.month.en, 'gregorian')} ${day.gregorian.year}`;
        const eventName = 'text' in event ? event.text : event.name;
        const shareText = `Pengingat Acara:\n- ${eventName}\n\nTanggal: ${gregorianDateStr} / ${hijriDateStr}\n\nYuk Mari berbagi kebaikan. Dibagikan dari Digital Kalender Hijiriah | https://hijria.netlify.app`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Acara: ${eventName}`,
                    text: shareText,
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert("Detail acara disalin ke clipboard!");
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing event:', error);
            }
        }
    };

    // Determine text color based on theme class on body
    const bodyClass = document.body.className;
    const isLightTheme = bodyClass.includes('light') || 
                         bodyClass.includes('theme-yellow') || 
                         bodyClass.includes('theme-pink') || 
                         bodyClass.includes('theme-blue') ||
                         bodyClass.includes('theme-brown') ||
                         bodyClass.includes('theme-purple') ||
                         bodyClass.includes('theme-kiswah');
                         
    const textColorClass = isLightTheme ? 'text-gray-900' : 'text-white';
    const subTextColorClass = isLightTheme ? 'text-gray-700' : 'opacity-80';
    const accentColorClass = isLightTheme ? 'text-[#00796B]' : 'text-cyan-400';
    const infoBgClass = isLightTheme ? 'bg-white/80 border-gray-300 shadow-sm' : 'bg-black/20 border-[var(--border-color)]/20';

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-28 sm:pt-36 z-50 fade-in overflow-y-auto" onClick={onClose}>
            <div className={`main-container cyber-border rounded-lg p-6 w-full max-w-sm max-h-[90vh] flex flex-col mb-8 relative ${textColorClass}`} onClick={(e) => e.stopPropagation()}>
                
                {/* Share Icon at top left */}
                <div className="absolute top-2 left-2 flex items-center space-x-1 z-10">
                    <button onClick={handleShareModal} className={`p-2 rounded-full hover:bg-black/10 ${isLightTheme ? 'bg-gray-200 text-gray-800' : 'bg-black/20 text-cyan-400'}`} title="Bagikan Info Tanggal"><ShareIcon className="w-5 h-5" /></button>
                </div>

                <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
                    <button onClick={onClose} className="p-2 bg-black/20 rounded-full hover:bg-red-900/40 text-red-500"><CloseIcon /></button>
                </div>

                <h3 className="font-bold text-lg mb-1 neon-text text-center mt-2">
                    {`${day.gregorian.day} ${translateToIndonesian(day.gregorian.month.en, 'gregorian')} ${day.gregorian.year}`}
                </h3>
                 <p className={`text-sm text-center mb-4 ${subTextColorClass}`}>
                     {`${day.hijri.day} ${translateToIndonesian(day.hijri.month.en, 'hijri')} ${day.hijri.year} H`}
                 </p>
                
                 <div className="overflow-y-auto pr-2 flex-grow">
                    {/* Specific Holiday Info Block (Muharram, Syawal, Dzulhijjah) */}
                    {specificHolidayInfo && specificHolidayKey && (
                        <div className={`mb-4 space-y-2 p-3 rounded-lg border ${infoBgClass} bg-red-900/10 border-red-500/30`}>
                            <div className="text-[#FF3131] font-bold flex items-center justify-center text-sm text-center">
                                {specificHolidayInfo}
                            </div>
                            <button 
                                onClick={() => handleInfoClick(specificHolidayKey)} 
                                className={`text-xs hover:underline flex items-center justify-center mx-auto mt-2 px-3 py-1 rounded-full ${isLightTheme ? 'bg-gray-200 text-gray-800' : 'bg-black/20 text-cyan-400'}`}
                            >
                                <InfoIcon className="w-4 h-4 mr-1"/> Informasi Selengkapnya
                            </button>
                        </div>
                    )}

                    { (displayIsFasting || nationalHoliday || hijriHoliday) && !specificHolidayInfo && (
                        <div className={`mb-4 space-y-2 p-3 rounded-lg border ${infoBgClass}`}>
                            {nationalHoliday && <div className="text-[#FF3131] font-bold flex items-center justify-center text-sm text-center"><PinIcon className="w-4 h-4 mr-1 flex-shrink-0"/> {nationalHoliday}</div>}
                            {hijriHoliday && <div className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center text-sm text-center"><span className="mr-2 text-base">☪️</span> {hijriHoliday}</div>}
                            {displayIsFasting && (
                                <div className={`text-center ${accentColorClass}`}>
                                    <p className="font-bold text-sm">{displayFastingType}</p>
                                    {FASTING_INFO_DETAILS[displayFastingType] && <p className={`text-xs font-normal mt-1 ${subTextColorClass}`}>{FASTING_INFO_DETAILS[displayFastingType]}</p>}
                                </div>
                            )}
                             {displayInfoKey && <button onClick={() => handleInfoClick()} className={`text-xs hover:underline flex items-center justify-center mx-auto mt-2 px-3 py-1 rounded-full ${isLightTheme ? 'bg-gray-200 text-gray-800' : 'bg-black/20 text-cyan-400'}`}>
                                <InfoIcon className="w-4 h-4 mr-1"/> Selengkapnya
                            </button>}
                        </div>
                    )}

                    <h4 className="font-bold text-sm mb-2 border-t border-[var(--border-color)]/20 pt-3">Catatan Masehi (Acara tetap):</h4>
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-2 mb-3">
                        {events.length > 0 ? events.map(event => (
                            <div key={event.id} className="bg-black/10 border border-[var(--border-color)]/10 p-2 rounded flex justify-between items-start text-sm group transition-all duration-300 hover:bg-black/20">
                                {editingEvent && editingEvent.id === event.id ? (
                                    <div className="w-full space-y-2">
                                        <input 
                                            type="text" 
                                            value={editingEvent.text} 
                                            onChange={(e) => setEditingEvent({...editingEvent, text: e.target.value})}
                                            className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={handleSaveEdit} className="text-xs text-green-400">Simpan</button>
                                            <button onClick={handleCancelEdit} className="text-xs text-red-400">Batal</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex-1 mr-2 break-words">{event.text}</span>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleShareEvent(event)} className="text-cyan-400" title="Bagikan"><ShareIcon className="w-3 h-3"/></button>
                                            <button onClick={() => handleStartEdit(event)} className="text-blue-400" title="Edit">✎</button>
                                            <button onClick={() => onDeleteEvent(event.id)} className="text-red-400" title="Hapus">✕</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )) : (
                            <p className="text-xs text-gray-500 italic">Belum ada catatan.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="flex flex-col gap-2">
                             <input 
                                type="text" 
                                value={newEventText} 
                                onChange={(e) => setNewEventText(e.target.value)} 
                                placeholder="Tambah catatan baru..." 
                                className="flex-1 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-color)] text-white placeholder-gray-400"
                            />
                            <div className="flex items-center space-x-2">
                                <select 
                                    value={newReminderOption} 
                                    onChange={(e) => setNewReminderOption(e.target.value as any)}
                                    className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                                >
                                    <option value="none">Tanpa Pengingat</option>
                                    <option value="on_day">Saat Acara</option>
                                    <option value="1_day_before">1 Hari Sebelumnya</option>
                                </select>
                                {newReminderOption !== 'none' && (
                                     <input 
                                        type="time" 
                                        value={newReminderTime}
                                        onChange={(e) => setNewReminderTime(e.target.value)}
                                        className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-1 py-1 text-xs text-white"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                )}
                                <button type="submit" disabled={!newEventText.trim()} className="bg-cyan-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 neon-button">
                                    +
                                </button>
                            </div>
                        </div>
                    </form>

                     <h4 className="font-bold text-sm mb-2 border-t border-[var(--border-color)]/20 pt-3">Catatan Hijriah (Berulang/Tahunan):</h4>
                     <div className="space-y-2 max-h-24 overflow-y-auto pr-2 mb-3">
                        {customHijriEvents.length > 0 ? customHijriEvents.map(event => (
                            <div key={event.id} className="bg-black/10 border border-[var(--border-color)]/10 p-2 rounded flex justify-between items-start text-sm group transition-all duration-300 hover:bg-black/20">
                                {editingHijriEvent && editingHijriEvent.id === event.id ? (
                                    <div className="w-full space-y-2">
                                        <input 
                                            type="text" 
                                            value={editingHijriEvent.name} 
                                            onChange={(e) => setEditingHijriEvent({...editingHijriEvent, name: e.target.value})}
                                            className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={handleSaveHijriEdit} className="text-xs text-green-400">Simpan</button>
                                            <button onClick={handleCancelHijriEdit} className="text-xs text-red-400">Batal</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 mr-2">
                                            <p className="font-bold">{event.name}</p>
                                            {event.description && <p className="text-xs opacity-70">{event.description}</p>}
                                            {event.isRecurring && <span className="text-[10px] bg-purple-900/50 px-1 rounded text-purple-200">Tahunan</span>}
                                        </div>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => handleShareEvent(event)} className="text-cyan-400" title="Bagikan"><ShareIcon className="w-3 h-3"/></button>
                                            <button onClick={() => handleStartHijriEdit(event)} className="text-blue-400" title="Edit">✎</button>
                                            <button onClick={() => onDeleteHijriEvent(event.id)} className="text-red-400" title="Hapus">✕</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )) : (
                             <p className="text-xs text-gray-500 italic">Belum ada catatan Hijriah.</p>
                        )}
                     </div>

                     <form onSubmit={handleHijriSubmit}>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                value={newHijriEventName} 
                                onChange={(e) => setNewHijriEventName(e.target.value)} 
                                placeholder="Judul acara Hijriah..." 
                                className="flex-1 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-color)] text-white placeholder-gray-400"
                            />
                            <input 
                                type="text" 
                                value={newHijriEventDesc} 
                                onChange={(e) => setNewHijriEventDesc(e.target.value)} 
                                placeholder="Deskripsi (opsional)..." 
                                className="flex-1 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--border-color)] text-white placeholder-gray-400"
                            />
                            <div className="flex items-center space-x-2 text-xs">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="checkbox" checked={newHijriEventIsRecurring} onChange={(e) => setNewHijriEventIsRecurring(e.target.checked)} />
                                    <span>Ulangi Tiap Tahun</span>
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <select 
                                    value={newHijriReminderOption} 
                                    onChange={(e) => setNewHijriReminderOption(e.target.value as any)}
                                    className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                                >
                                    <option value="none">Tanpa Pengingat</option>
                                    <option value="on_day">Saat Acara</option>
                                    <option value="1_day_before">1 Hari Sebelumnya</option>
                                </select>
                                {newHijriReminderOption !== 'none' && (
                                     <input 
                                        type="time" 
                                        value={newHijriReminderTime}
                                        onChange={(e) => setNewHijriReminderTime(e.target.value)}
                                        className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-1 py-1 text-xs text-white"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                )}
                                <button type="submit" disabled={!newHijriEventName.trim()} className="bg-purple-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 neon-button">
                                    +
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
