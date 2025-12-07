
import React, { useState } from 'react';
import type { UserSettings, Theme, FilterSettings, SunnahFastingNotifications, SunnahFastingSetting, AlarmSettings, AlarmSound } from '../types';
import { PRAYER_METHODS } from '../constants';
import { SunIcon, MoonIcon, ZoomInIcon, ZoomOutIcon, CloseIcon, LanguageIcon, PaletteIcon, MapIcon, RamadanModeIcon, ReadingModeIcon, AlarmIcon, VolumeUpIcon } from './Icons';
import { convertHijriToGregorian } from '../services/calendarService';

const DateJumper: React.FC<{ onDateJump: (date: Date) => void }> = ({ onDateJump }) => {
    const [gregorianDate, setGregorianDate] = useState('');
    const [hijri, setHijri] = useState({ day: '', month: '', year: '' });
    const [error, setError] = useState('');

    const handleGregorianJump = () => {
        if (gregorianDate) {
            const date = new Date(gregorianDate);
            const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
            onDateJump(adjustedDate);
            setGregorianDate('');
        }
    };
    
    const handleHijriJump = async () => {
        const { day, month, year } = hijri;
        if (day && month && year) {
            setError('');
            try {
                const gregorian = await convertHijriToGregorian(parseInt(day), parseInt(month), parseInt(year));
                onDateJump(gregorian);
                setHijri({ day: '', month: '', year: '' });
            } catch (e) {
                setError('Tanggal Hijriah tidak valid.');
            }
        } else {
            setError('Harap isi semua kolom Hijriah.');
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]/20 px-2">
            <h4 className="font-bold text-sm mb-2 text-center text-[var(--text-color-secondary)]">Lompat ke tanggal</h4>
            <div className="space-y-2 text-sm">
                <div>
                    <label className="block text-xs mb-1">Masehi</label>
                    <div className="flex space-x-2">
                        <input type="date" value={gregorianDate} onChange={e => setGregorianDate(e.target.value)} className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white" style={{ colorScheme: 'dark' }}/>
                        <button onClick={handleGregorianJump} className="bg-cyan-600 px-3 rounded text-xs neon-button">Go</button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs mb-1">Hijriah (H/B/T)</label>
                     <div className="flex space-x-2">
                        <input type="number" placeholder="HH" value={hijri.day} onChange={e => setHijri(h => ({...h, day: e.target.value}))} className="w-1/3 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"/>
                        <input type="number" placeholder="BB" value={hijri.month} onChange={e => setHijri(h => ({...h, month: e.target.value}))} className="w-1/3 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"/>
                        <input type="number" placeholder="TTTT" value={hijri.year} onChange={e => setHijri(h => ({...h, year: e.target.value}))} className="w-1/3 bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"/>
                        <button onClick={handleHijriJump} className="bg-cyan-600 px-3 rounded text-xs neon-button">Go</button>
                    </div>
                     {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>
            </div>
        </div>
    );
};

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    settings: UserSettings;
    onSettingsChange: (settings: UserSettings) => void;
    onDateJump: (date: Date) => void;
    isReadingMode: boolean;
    onReadingModeChange: (isOn: boolean) => void;
    alarms: AlarmSettings;
    onToggleAlarm: (alarmName: string, isOn: boolean) => void;
    onAlarmTimeChange: (alarmName: string, time: string) => void;
    alarmSound: AlarmSound;
    onAlarmSoundChange: (sound: AlarmSound) => void;
    playAlarmSound: (sound: AlarmSound) => void;
}

const THEMES: { id: Theme; name: string; colors: { bg: string; text: string; accent: string } }[] = [
    { id: 'auto', name: 'Otomatis', colors: { bg: 'linear-gradient(to bottom right, #E0F2F1 50%, #002b25 50%)', text: '#004D40', accent: '#00796B' } },
    { id: 'dark', name: 'Gelap', colors: { bg: '#002b25', text: '#ffffff', accent: '#00ffdf' } },
    { id: 'light', name: 'Cerah', colors: { bg: '#E0F2F1', text: '#004D40', accent: '#00796B' } },
    { id: 'theme-ramadan', name: 'Ramadhan', colors: { bg: '#013220', text: '#F0E68C', accent: '#FFD700' } },
    { id: 'theme-hijriah-dark', name: 'Hijriah', colors: { bg: '#1a1a1a', text: '#e0cda9', accent: '#d4af37' } },
    { id: 'theme-masjid-dark', name: 'Masjid', colors: { bg: '#071952', text: '#e0f2f1', accent: '#97feed' } },
    { id: 'theme-gray-dark', name: 'Abu Gelap', colors: { bg: '#212121', text: '#E0E0E0', accent: '#00E5FF' } },
    { id: 'theme-lapis-dark', name: 'Lapis', colors: { bg: '#0D47A1', text: '#E3F2FD', accent: '#FFD700' } },
    { id: 'theme-emerald-dark', name: 'Zamrud', colors: { bg: '#004d40', text: '#E0F2F1', accent: '#B0BEC5' } },
    { id: 'theme-kiswah-light', name: 'Kiswah', colors: { bg: '#FDFDFD', text: '#212121', accent: '#DAA520' } },
    { id: 'theme-yellow-light', name: 'Kuning', colors: { bg: '#FFFDE7', text: '#5D4037', accent: '#FBC02D' } },
    { id: 'theme-blue-light', name: 'Biru', colors: { bg: '#E3F2FD', text: '#0D47A1', accent: '#1976D2' } },
    { id: 'theme-brown-light', name: 'Coklat', colors: { bg: '#EFEBE9', text: '#4E342E', accent: '#6D4C41' } },
    { id: 'theme-pink-light', name: 'Merah Jambu', colors: { bg: '#FCE4EC', text: '#880E4F', accent: '#D81B60' } },
    { id: 'theme-purple-light', name: 'Ungu', colors: { bg: '#F3E5F5', text: '#4A148C', accent: '#8E24AA' } },
];


export const Settings: React.FC<SettingsProps> = ({ 
    isOpen, onClose, theme, onThemeChange, zoom, onZoomChange, 
    settings, onSettingsChange, 
    onDateJump, isReadingMode, onReadingModeChange,
    alarms, onToggleAlarm, onAlarmTimeChange, alarmSound, onAlarmSoundChange, playAlarmSound
}) => {
    
    if (!isOpen) return null;

    const handleSunnahNotificationChange = (key: keyof SunnahFastingNotifications, type: 'isOn' | 'time', value: boolean | string) => {
        onSettingsChange({
            ...settings,
            sunnahFastingNotifications: {
                ...settings.sunnahFastingNotifications,
                [key]: {
                    ...settings.sunnahFastingNotifications[key],
                    [type]: value,
                }
            }
        });
    };

    const AlarmControl: React.FC<{label: string, name: keyof AlarmSettings}> = ({ label, name }) => (
        <div className="flex justify-between items-center text-sm" onMouseDown={(e) => e.stopPropagation()}>
            <span>{label}</span>
            <div className="flex items-center space-x-2">
                {name !== 'shalat5Waktu' && (
                    <input 
                        type="time" 
                        value={alarms[name].time}
                        onChange={(e) => onAlarmTimeChange(name, e.target.value)}
                        className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-1 py-0.5 text-xs w-20 text-white"
                        style={{ colorScheme: 'dark' }}
                        disabled={!alarms[name].isOn}
                        onMouseDown={e => e.stopPropagation()}
                    />
                )}
                <button 
                    onClick={() => onToggleAlarm(name, !alarms[name].isOn)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${alarms[name].isOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${alarms[name].isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
    );
    
    // Explicit background to avoid transparency issues
    const isLightTheme = document.body.className.includes('light');
    const bgColor = isLightTheme ? 'bg-white' : 'bg-[#002b25]';
    const textColor = isLightTheme ? 'text-gray-900' : 'text-white';

    return (
        <div className={`absolute top-14 left-1/2 -translate-x-1/2 w-full max-w-xs main-container cyber-border rounded-lg p-4 z-40 bounce-in overflow-y-auto max-h-[calc(100vh-8rem)] ${bgColor} ${textColor}`} onMouseDown={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
            <h3 className="font-bold text-lg mb-4">Pengaturan</h3>
            
            <div id="settings-content" className="space-y-4">
                {/* Zoom Section */}
                <div>
                    <h4 className="font-bold flex items-center space-x-2"><ZoomInIcon className="w-5 h-5"/> <span>Perbesar Layar</span></h4>
                    <div className="flex items-center justify-center space-x-4 mt-2">
                        <button onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} className="p-2 rounded bg-gray-600 settings-button"><ZoomOutIcon className="w-5 h-5" /></button>
                        <span className="font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} className="p-2 rounded bg-gray-600 settings-button"><ZoomInIcon className="w-5 h-5" /></button>
                    </div>
                </div>
                
                {/* Reading Mode Section */}
                <div>
                    <h4 className="font-bold flex items-center space-x-2"><ReadingModeIcon className="w-5 h-5"/> <span>Mode Baca</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Sembunyikan elemen non-kalender untuk fokus pada tanggal.</p>
                    <button 
                        onClick={() => { onReadingModeChange(true); onClose(); }}
                        className="w-full text-sm mt-2 p-2 bg-cyan-800 rounded-md neon-button text-white"
                    >
                        Aktifkan Mode Baca
                    </button>
                </div>

                {/* Theme Section */}
                <div>
                    <h4 className="font-bold flex items-center space-x-2"><PaletteIcon /> <span>Pilihan Tampilan</span></h4>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {THEMES.map(t => (
                            <div key={t.id} className="text-center">
                                <button 
                                    onClick={() => onThemeChange(t.id)} 
                                    title={t.name}
                                    className={`w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all ${theme === t.id ? 'border-[var(--text-color-secondary)] scale-110' : 'border-transparent hover:border-gray-500'}`}
                                    style={{ background: t.colors.bg }}
                                >
                                    <span className="font-bold text-lg" style={{ color: t.colors.text }}>Aa</span>
                                    <div className="w-2 h-6 ml-1 rounded-full" style={{ backgroundColor: t.colors.accent }}></div>
                                </button>
                                <label className="text-xs mt-1 block truncate theme-label">{t.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alarm Section (Moved Inside Settings) */}
                <div className="border-t border-[var(--border-color)]/20 pt-4">
                    <h4 className="font-bold flex items-center space-x-2 mb-2"><AlarmIcon className="w-5 h-5"/> <span>Pengaturan Alarm</span></h4>
                    <div className="space-y-3">
                        <AlarmControl label="Tidur" name="tidur" />
                        <AlarmControl label="Tahajud" name="tahajud" />
                        <AlarmControl label="Sahur" name="sahur" />
                        <AlarmControl label="Dhuha" name="dhuha" />
                        <AlarmControl label="Jum'at" name="jumat" />
                        <AlarmControl label="Dzikir Pagi" name="dzikirPagi" />
                        <AlarmControl label="Dzikir Petang" name="dzikirPetang" />
                        <AlarmControl label="Doa Jum'at" name="doaJumat" />
                        <div className="flex justify-between items-center text-sm">
                            <span>Shalat 5-waktu</span>
                            <button 
                                onClick={() => onToggleAlarm('shalat5Waktu', !alarms.shalat5Waktu.isOn)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${alarms.shalat5Waktu?.isOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${alarms.shalat5Waktu?.isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Alarm Shalat 5-waktu berbunyi 10 menit sebelum waktu shalat.</p>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-bold text-sm mb-2">Suara Alarm</h4>
                        <div className="space-y-2 text-sm">
                            <label className="flex items-center justify-between space-x-2 cursor-pointer">
                                <div>
                                    <input type="radio" name="alarm-sound" value="default" checked={alarmSound === 'default'} onChange={() => onAlarmSoundChange('default')} className="mr-2"/>
                                    <span>Default</span>
                                </div>
                                <button onClick={() => playAlarmSound('default')} className="text-xl">🔊</button>
                            </label>
                            <label className="flex items-center justify-between space-x-2 cursor-pointer">
                                <div>
                                    <input type="radio" name="alarm-sound" value="thaha" checked={alarmSound === 'thaha'} onChange={() => onAlarmSoundChange('thaha')} className="mr-2"/>
                                    <span>Basmalah (1)</span>
                                </div>
                                <button onClick={() => playAlarmSound('thaha')} className="text-xl">🔊</button>
                            </label>
                            <label className="flex items-center justify-between space-x-2 cursor-pointer">
                                <div>
                                    <input type="radio" name="alarm-sound" value="muflih" checked={alarmSound === 'muflih'} onChange={() => onAlarmSoundChange('muflih')} className="mr-2"/>
                                    <span>Basmalah (2)</span>
                                </div>
                                <button onClick={() => playAlarmSound('muflih')} className="text-xl">🔊</button>
                            </label>
                        </div>
                    </div>
                </div>

                 {/* Sunnah Fasting Notifications */}
                <div className="border-t border-[var(--border-color)]/20 pt-4">
                    <h4 className="font-bold text-sm">Notifikasi Puasa Sunnah</h4>
                    <p className="text-xs text-gray-400 mt-1">Dapatkan pengingat 1 hari sebelumnya.</p>
                    <div className="space-y-3 mt-2 text-sm">
                        {Object.keys(settings.sunnahFastingNotifications).map(keyStr => {
                            const key = keyStr as keyof SunnahFastingNotifications;
                            const setting = settings.sunnahFastingNotifications[key];
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            return (
                                <div key={key}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span>{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={setting.isOn}
                                            onChange={(e) => handleSunnahNotificationChange(key, 'isOn', e.target.checked)}
                                        />
                                    </label>
                                    {setting.isOn && (
                                        <div className="pl-4 mt-1">
                                            <input 
                                                type="time" 
                                                value={setting.time}
                                                onChange={(e) => handleSunnahNotificationChange(key, 'time', e.target.value)}
                                                className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-1 py-0.5 text-xs w-24 text-white"
                                                style={{ colorScheme: 'dark' }}
                                                onMouseDown={e => e.stopPropagation()}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <DateJumper onDateJump={onDateJump} />
            </div>
        </div>
    );
};
