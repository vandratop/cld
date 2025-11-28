import React, { useState, useEffect } from 'react';
import type { Day, CustomEvent, CustomHijriEvent } from '../types';
import { CloseIcon, InfoIcon, PinIcon } from './Icons';
import { translateToIndonesian } from '../utils';

const FASTING_INFO_DETAILS: { [key: string]: string } = {
    "Puasa Ramadhan": "Puasa wajib selama sebulan penuh, pilar ketiga Rukun Islam.",
    "Puasa Arafah": "Menghapus dosa setahun yang lalu dan setahun yang akan datang.",
    "Puasa Tasu'a": "Dianjurkan untuk menyertai puasa Asyura sebagai pembeda dari Yahudi.",
    "Puasa Asyura": "Menghapus dosa setahun yang lalu.",
    "Puasa Syawal": "Pahala seperti berpuasa setahun penuh jika diikuti setelah Ramadhan.",
    "Puasa Ayyamul Bidh": "Puasa pertengahan bulan (13, 14, 15), seperti puasa sepanjang masa.",
    "Puasa Senin & Kamis": "Hari di mana amal diperlihatkan kepada Allah.",
    "Puasa Awal Dzulhijjah": "Amalan di hari-hari ini sangat dicintai Allah."
};

interface DateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    day: Day;
    events: CustomEvent[];
    onAddEvent: (event: Omit<CustomEvent, 'id'>) => void;
    onDeleteEvent: (id: string) => void;
    onUpdateEvent: (event: CustomEvent) => void;
    customHijriEvents: CustomHijriEvent[];
    onAddHijriEvent: (event: Omit<CustomHijriEvent, 'id'>) => void;
    onUpdateHijriEvent: (event: CustomHijriEvent) => void;
    onDeleteHijriEvent: (id: string) => void;
    fastingInfo: { isFasting: boolean, type: string };
    onOpenInfo: (key: string) => void;
    nationalHoliday?: string;
    hijriHoliday?: string;
    infoTypeKey: string | null;
}

export const DateDetailModal: React.FC<DateDetailModalProps> = ({ 
    isOpen, onClose, day, events, onAddEvent, onDeleteEvent, onUpdateEvent, 
    customHijriEvents, onAddHijriEvent, onUpdateHijriEvent, onDeleteHijriEvent, 
    fastingInfo, onOpenInfo, nationalHoliday, hijriHoliday, infoTypeKey 
}) => {
    const [newEventText, setNewEventText] = useState('');
    const [activeTab, setActiveTab] = useState<'masehi' | 'hijri'>('masehi');
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    // Hijri event state
    const [newHijriEventName, setNewHijriEventName] = useState('');
    const [newHijriEventDesc, setNewHijriEventDesc] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [editingHijriEventId, setEditingHijriEventId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSaveEvent = () => {
        if (!newEventText.trim()) return;
        const gregorianDate = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2,'0')}-${day.gregorian.day.padStart(2,'0')}`;
        onAddEvent({
            gregorianDate,
            text: newEventText,
            reminder: 'on_day'
        });
        setNewEventText('');
    };

    const handleSaveEdit = (id: string) => {
        if (!editText.trim()) return;
        const eventToUpdate = events.find(e => e.id === id);
        if (eventToUpdate) {
            onUpdateEvent({ ...eventToUpdate, text: editText });
            setEditingEventId(null);
            setEditText('');
        }
    };

    const startEditing = (event: CustomEvent) => {
        setEditingEventId(event.id);
        setEditText(event.text);
    };

    const handleSaveHijriEvent = () => {
        if (!newHijriEventName.trim()) return;
        onAddHijriEvent({
            hijriDay: parseInt(day.hijri.day),
            hijriMonth: day.hijri.month.number,
            hijriYear: parseInt(day.hijri.year),
            isRecurring,
            name: newHijriEventName,
            description: newHijriEventDesc,
            reminder: 'on_day'
        });
        setNewHijriEventName('');
        setNewHijriEventDesc('');
        setIsRecurring(false);
    };

    const startEditingHijri = (event: CustomHijriEvent) => {
        setEditingHijriEventId(event.id);
        setNewHijriEventName(event.name);
        setNewHijriEventDesc(event.description);
        setIsRecurring(event.isRecurring);
    };

    const handleSaveEditHijri = (id: string) => {
        if (!newHijriEventName.trim()) return;
        const eventToUpdate = customHijriEvents.find(e => e.id === id);
        if (eventToUpdate) {
            onUpdateHijriEvent({
                ...eventToUpdate,
                name: newHijriEventName,
                description: newHijriEventDesc,
                isRecurring
            });
            setEditingHijriEventId(null);
            setNewHijriEventName('');
            setNewHijriEventDesc('');
            setIsRecurring(false);
        }
    }

    const gregorianDateFull = `${day.gregorian.weekday.en}, ${day.gregorian.day} ${translateToIndonesian(day.gregorian.month.en, 'gregorian')} ${day.gregorian.year}`;
    const hijriDateFull = `${day.hijri.weekday.en}, ${day.hijri.day} ${translateToIndonesian(day.hijri.month.en, 'hijri')} ${day.hijri.year} H`;

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center pt-20 sm:pt-32 z-50 fade-in" onClick={onClose}>
            <div className="main-container cyber-border rounded-lg p-6 w-full max-w-md relative mb-8 overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--text-color-secondary)]">{hijriDateFull}</h3>
                    <p className="text-lg text-[var(--text-color)]">{gregorianDateFull}</p>
                </div>

                {/* Holiday & Fasting Info Badges */}
                <div className="space-y-2 mb-4">
                    {nationalHoliday && (
                        <div className="p-2 bg-red-900/40 border border-red-500 rounded text-sm text-center">
                            <span className="font-bold text-red-400">Libur Nasional:</span> {nationalHoliday}
                        </div>
                    )}
                    {hijriHoliday && (
                        <div className="p-2 bg-purple-900/40 border border-purple-500 rounded text-sm text-center">
                             <span className="font-bold text-purple-400">Hari Besar Islam:</span> {hijriHoliday}
                        </div>
                    )}
                    {fastingInfo.isFasting && (
                        <div className="p-2 bg-cyan-900/40 border border-cyan-500 rounded text-sm flex flex-col items-center">
                            <span className="font-bold text-cyan-400 mb-1">{fastingInfo.type}</span>
                            <p className="text-xs text-gray-300 text-center">{FASTING_INFO_DETAILS[fastingInfo.type]}</p>
                            {infoTypeKey && (
                                <button onClick={() => onOpenInfo(infoTypeKey)} className="mt-2 text-xs flex items-center space-x-1 text-cyan-300 hover:underline">
                                    <InfoIcon className="w-4 h-4" /> <span>Baca Selengkapnya</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs for Events */}
                <div className="flex border-b border-[var(--border-color)]/30 mb-4">
                    <button 
                        className={`flex-1 py-2 text-sm font-bold ${activeTab === 'masehi' ? 'text-[var(--text-color-secondary)] border-b-2 border-[var(--text-color-secondary)]' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('masehi')}
                    >
                        Catatan Masehi
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-bold ${activeTab === 'hijri' ? 'text-[var(--text-color-secondary)] border-b-2 border-[var(--text-color-secondary)]' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('hijri')}
                    >
                        Catatan Hijriah
                    </button>
                </div>

                <div className="min-h-[200px]">
                    {activeTab === 'masehi' ? (
                        <>
                            <div className="mb-4">
                                <ul className="space-y-2">
                                    {events.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Tidak ada catatan.</p>}
                                    {events.map(event => (
                                        <li key={event.id} className="bg-black/20 p-2 rounded border border-[var(--border-color)]/20 flex justify-between items-center group">
                                            {editingEventId === event.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={editText} 
                                                        onChange={e => setEditText(e.target.value)} 
                                                        className="flex-1 bg-gray-700 rounded px-2 text-sm"
                                                    />
                                                    <button onClick={() => handleSaveEdit(event.id)} className="text-green-400 text-xs">Simpan</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm">{event.text}</span>
                                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditing(event)} className="text-blue-400 text-xs">Edit</button>
                                                        <button onClick={() => onDeleteEvent(event.id)} className="text-red-400 text-xs">Hapus</button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newEventText} 
                                    onChange={e => setNewEventText(e.target.value)} 
                                    placeholder="Tambah catatan..." 
                                    className="flex-1 bg-gray-800 border border-[var(--border-color)]/30 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                                <button onClick={handleSaveEvent} className="bg-cyan-600 px-4 py-2 rounded text-sm font-bold hover:bg-cyan-500 neon-button">
                                    +
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="mb-4">
                                <ul className="space-y-2">
                                    {customHijriEvents.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Tidak ada catatan Hijriah.</p>}
                                    {customHijriEvents.map(event => (
                                        <li key={event.id} className="bg-black/20 p-2 rounded border border-[var(--border-color)]/20 relative group">
                                            {editingHijriEventId === event.id ? (
                                                <div className="space-y-2">
                                                    <input 
                                                        type="text" 
                                                        value={newHijriEventName} 
                                                        onChange={e => setNewHijriEventName(e.target.value)} 
                                                        className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                                                        placeholder="Judul"
                                                    />
                                                    <textarea 
                                                        value={newHijriEventDesc} 
                                                        onChange={e => setNewHijriEventDesc(e.target.value)} 
                                                        className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                                                        placeholder="Deskripsi"
                                                    />
                                                    <label className="flex items-center space-x-2 text-xs">
                                                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                                                        <span>Ulangi setiap tahun</span>
                                                    </label>
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingHijriEventId(null)} className="text-gray-400 text-xs">Batal</button>
                                                        <button onClick={() => handleSaveEditHijri(event.id)} className="text-green-400 text-xs">Simpan</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-sm">{event.name}</p>
                                                            <p className="text-xs text-gray-400">{event.description}</p>
                                                            {event.isRecurring && <span className="text-[10px] bg-blue-900 px-1 rounded text-blue-300">Tahunan</span>}
                                                        </div>
                                                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => startEditingHijri(event)} className="text-blue-400 text-xs">Edit</button>
                                                            <button onClick={() => onDeleteHijriEvent(event.id)} className="text-red-400 text-xs">Hapus</button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-2 border-t border-[var(--border-color)]/20 pt-2">
                                <input 
                                    type="text" 
                                    value={newHijriEventName} 
                                    onChange={e => setNewHijriEventName(e.target.value)} 
                                    placeholder="Judul Catatan..." 
                                    className="w-full bg-gray-800 border border-[var(--border-color)]/30 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                                <textarea
                                    value={newHijriEventDesc}
                                    onChange={e => setNewHijriEventDesc(e.target.value)}
                                    placeholder="Deskripsi..."
                                    className="w-full bg-gray-800 border border-[var(--border-color)]/30 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 h-16 resize-none"
                                />
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center space-x-2 text-xs cursor-pointer">
                                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"/>
                                        <span>Ulangi Setiap Tahun</span>
                                    </label>
                                    <button onClick={handleSaveHijriEvent} className="bg-cyan-600 px-4 py-2 rounded text-sm font-bold hover:bg-cyan-500 neon-button">
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
