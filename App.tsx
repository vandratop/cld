
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Location, CalendarData, Day, CountdownTarget, NextPrayer, PrayerTimes, PrayerName, CustomEvent, HijriDate, UserSettings, Theme, AlarmSettings, FilterSettings, CustomHijriEvent, SunnahFastingNotifications, AdhanAlarms, CalendarFormat, AlarmSound } from './types';
import { fetchCalendarData, getNextCountdownTarget, fetchLocationAndPrayerTimes, convertGToH, fetchHijriHolidays, convertHijriToGregorian, getSpecificCountdownTarget } from './services/calendarService';
import { getNationalHolidays } from './services/holidayService';
import { getDailyFact } from './services/geminiService';
import { translateToIndonesian } from './utils';
import { CalendarGrid } from './components/CalendarGrid';
import { YearlyView } from './components/YearlyView';
import { DailyView } from './components/DailyView';
import { CountdownTimer } from './components/CountdownTimer';
import { ChatBot } from './components/ChatBot';
import { Settings } from './components/Settings';
import { ShareModal } from './components/ShareModal';
import { HeaderInfo } from './components/HeaderInfo';
import { DateDetailModal } from './components/DateDetailModal';
import { SettingsIcon, ChevronLeftIcon, ChevronRightIcon, AlarmIcon, CloseIcon, MenuIcon, QiblaIcon, RamadanModeIcon, PinIcon, SearchIcon, PaletteIcon, SparklesIcon, ReadingModeIcon, ContactIcon, VolumeUpIcon, MapIcon, MicIcon } from './components/Icons';
import { DropdownMenu } from './components/DropdownMenu';
import { InfoModal, InfoListItem } from './components/InfoModal';
import { ContactUsModal } from './components/ContactUsModal';
import { QiblaCompass } from './components/QiblaCompass';
import { VoiceAssistant } from './components/VoiceAssistant';
import { PUASA_SUB_PAGES, HARI_RAYA_SUB_PAGES, INFO_DETAILS, FAQ_CONTENT } from './infoContent';
import { WEEKDAY_MAP, COUNTRIES, PRAYER_METHODS } from './constants';
import { CountdownEvent } from './types';


type CalendarView = 'monthly' | 'weekly' | 'yearly' | 'daily';

// Alarm Text Configuration
const ALARM_MESSAGES = {
    tahajud: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Qiyamullail untuk hari ini. Semoga Anda dalam keadaan Sehat Walafiat. Syukron.",
    sahur: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Sahur untuk hari ini. Semoga Anda dalam keadaan Sehat Walafiat. Syukron.",
    dhuha: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu Shalat Dhuha untuk hari ini. Semoga Anda dalam keadaan Sehat Walafiat. Syukron.",
    jumat: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu shalat Jum'at akan segera tiba, mari persiapkan diri di awal waktu. Semoga Anda dalam keadaan Sehat Walafiat. Syukron.",
    tidur: "Waktunya istirahat. Semoga besok menjadi hari yang lebih baik.",
    shalat5Waktu: "Assalamualaikum warahmatullahi wabarakatuh, AI-HIJR reminder waktu shalat [PRAYER_NAME] (Subuh, Dzuhur, Ashar, Magrib, Isya, berdasarkan real-time setingan device lokasi user atau setingan melalui menu Lokasi & Jadwal Shalat) akan segera tiba, mari persiapkan diri di awal waktu. Dan sempurnakan shalat wajib dengan shalat Sunnah rawatib. Semoga Anda dalam keadaan Sehat Walafiat. Syukron."
};

const getTranslatedMessage = (text: string, prayerName?: string) => {
    let message = text;
    if (prayerName) {
        message = message.replace('[PRAYER_NAME]', prayerName);
    }

    const userLang = navigator.language || 'id-ID';
    if (userLang.startsWith('id')) {
        return message; // Default is Indonesian
    }

    // Simple mapping for demo/basic translation to English if device is not ID
    if (message.includes("Qiyamullail")) return "Peace be upon you. AI-HIJR reminder for Qiyamullail (Night Prayer). Hope you are in good health. Thank you.";
    if (message.includes("Sahur")) return "Peace be upon you. AI-HIJR reminder for Suhoor time today. Hope you are in good health. Thank you.";
    if (message.includes("Dhuha")) return "Peace be upon you. AI-HIJR reminder for Dhuha Prayer today. Hope you are in good health. Thank you.";
    if (message.includes("Jum'at")) return "Peace be upon you. AI-HIJR reminder that Friday Prayer is approaching. Let's prepare early. Hope you are in good health. Thank you.";
    if (message.includes("waktu shalat")) return `Peace be upon you. AI-HIJR reminder that ${prayerName || 'Prayer'} time is approaching. Let's prepare early. Hope you are in good health. Thank you.`;
    
    return message;
};

const WelcomeScreen: React.FC<{onDismiss: () => void}> = ({onDismiss}) => {
    const [message, setMessage] = useState('');
    const [hijriDate, setHijriDate] = useState('');
    const [gregorianDate, setGregorianDate] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const hours = now.getHours();

            if (hours < 4) setMessage('Selamat Dini Hari');
            else if (hours < 11) setMessage('Selamat Pagi');
            else if (hours < 15) setMessage('Selamat Siang');
            else if (hours < 19) setMessage('Selamat Sore');
            else setMessage('Selamat Malam');

            setGregorianDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

            convertGToH(now).then(hDate => {
                const translatedMonth = translateToIndonesian(hDate.month.en, 'hijri');
                setHijriDate(`${hDate.day} ${translatedMonth} ${hDate.year} H`);
            });
        };

        updateDateTime();
        const timerId = setInterval(updateDateTime, 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    const handleStart = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.warn("Microphone permission denied or ignored");
        }
        onDismiss();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center fade-in p-4 text-center"
            style={{
                backgroundImage: `url('https://raw.githubusercontent.com/vandratop/Yuk/3ca087bbe1dfa3822dc66f60ba3f8c2cdf0772b0/DoaKu_back_mtrx.png')`,
                backgroundColor: 'rgba(0, 43, 37, 0.5)',
                backgroundBlendMode: 'overlay',
                backgroundSize: 'cover'
            }}
        >
            <div className="flex-grow flex flex-col items-center justify-center">
                <h1 
                    className="font-amiri text-4xl sm:text-5xl md:text-6xl text-white"
                    style={{ textShadow: '0 0 8px #fff, 0 0 15px #fff, 0 0 25px #00ffdf', animation: 'zoom-in-out-welcome 4s ease-in-out infinite' }}
                >
                    ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ
                </h1>
                <p 
                    className="font-amiri text-2xl sm:text-3xl text-white mt-4 typewriter-text"
                    style={{ textShadow: '0 0 5px #fff, 0 0 10px #fff' }}
                >
                    أَهْلًا وَسَهْلًا
                </p>
                <button 
                    onClick={handleStart}
                    className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold shadow-lg neon-button flex items-center gap-2"
                >
                    <MicIcon className="w-5 h-5" /> Mulai & Izinkan Mikrofon
                </button>
            </div>
            <footer className="w-full p-4 text-white text-sm bg-black/50 rounded-lg cyber-border">
                <p>{message}</p>
                <p>{gregorianDate} / {hijriDate}</p>
            </footer>
        </div>
    );
};


const MatrixBackground: React.FC<{theme: Theme}> = ({ theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        const characters = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789';
        const fontSize = 12;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            const bodyStyle = getComputedStyle(document.body);
            const bgColor = bodyStyle.getPropertyValue('--bg-color') || '#002b25';
            const secondaryColor = bodyStyle.getPropertyValue('--text-color-secondary') || '#00FFDF';

            ctx.fillStyle = `${bgColor}1A`; // Slower fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = secondaryColor;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animationFrameId = window.requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [theme]); // Rerun effect when theme changes

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" style={{ opacity: 0.25 }} />;
};

const DateConverter: React.FC = () => {
    const [gregorianDate, setGregorianDate] = useState('');
    const [hijriResult, setHijriResult] = useState<HijriDate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConvert = async () => {
        if (!gregorianDate) return;
        setIsLoading(true);
        setError('');
        setHijriResult(null);
        try {
            const dateObj = new Date(gregorianDate);
            const adjustedDate = new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset()*60000))
            const result = await convertGToH(adjustedDate);
            setHijriResult(result);
        } catch (err) {
            setError('Gagal mengonversi tanggal.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]/20 px-2">
            <h4 className="font-bold mb-2 text-center text-lg text-[var(--text-color-secondary)]">Konversi Masehi ke Hijriah</h4>
            <div className="flex flex-col space-y-2">
                <input 
                    type="date"
                    value={gregorianDate}
                    onChange={e => setGregorianDate(e.target.value)}
                    className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 w-full text-center text-white"
                    style={{ colorScheme: document.body.classList.contains('light') ? 'light' : 'dark' }}
                />
                <button 
                    onClick={handleConvert}
                    disabled={isLoading || !gregorianDate}
                    className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50 neon-button"
                >
                    {isLoading ? 'Mengonversi...' : 'Konversi'}
                </button>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {hijriResult && (
                    <div className="text-center bg-black/20 p-2 rounded cyber-border">
                        <p className="font-bold text-lg">{hijriResult.date}</p>
                        <p className="text-sm">{`${translateToIndonesian(hijriResult.weekday.en, 'weekday')}, ${hijriResult.day} ${translateToIndonesian(hijriResult.month.en, 'hijri')} ${hijriResult.year} H`}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getFastingInfo = (day: Day): { isFasting: boolean, type: string, typeKey: keyof SunnahFastingNotifications | 'ramadan' | null } => {
    const hijri = day.hijri;
    const gregorian = day.gregorian;
    const hijriDay = parseInt(hijri.day, 10);
    const hijriMonth = hijri.month.number;

    if (hijriMonth === 9) return { isFasting: true, type: "Puasa Ramadhan", typeKey: 'ramadan' };
    if (hijriMonth === 12 && hijriDay === 9) return { isFasting: true, type: "Puasa Arafah", typeKey: 'arafah' };
    if (hijriMonth === 1 && hijriDay === 9) return { isFasting: true, type: "Puasa Tasu'a", typeKey: 'asyura' };
    if (hijriMonth === 1 && (hijriDay === 10 || hijriDay === 11)) return { isFasting: true, type: "Puasa Asyura", typeKey: 'asyura' };
    if (hijriMonth === 10 && hijriDay >= 3 && hijriDay <= 8) return { isFasting: true, type: "Puasa Syawal", typeKey: 'syawal' };
    if (hijriDay >= 13 && hijriDay <= 15) return { isFasting: true, type: "Puasa Ayyamul Bidh", typeKey: 'ayyamulBidh' };
    
    if (hijriMonth === 12 && (hijriDay >= 1 && hijriDay <= 8)) return { isFasting: true, type: "Puasa Awal Dzulhijjah", typeKey: null };
    if (hijriMonth === 8 && (hijriDay >= 1 && hijriDay <= 12)) return { isFasting: true, type: "Puasa Sunnah Sya'ban", typeKey: null };


    const isTashreeq = hijriMonth === 12 && (hijriDay >= 11 && hijriDay <= 13);
    if (['Monday', 'Thursday'].includes(gregorian.weekday.en) && !isTashreeq) return { isFasting: true, type: "Puasa Senin & Kamis", typeKey: 'seninKamis' };
    
    return { isFasting: false, type: "", typeKey: null };
};


type InfoModalContent = {
    title: string;
    content: React.ReactNode;
    isList?: boolean;
    parentKey?: string;
} | null;

const RamadanContainer: React.FC = () => (
    <div className="ramadan-container">
        <RamadanModeIcon className="w-12 h-12" />
    </div>
);

const ActiveAlarmPopup: React.FC<{ alarm: { name: string; text: string }; onDismiss: () => void }> = ({ alarm, onDismiss }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 fade-in p-4">
            <div className="main-container cyber-border rounded-lg p-6 w-full max-w-xs relative text-center bounce-in">
                <h3 className="font-bold text-2xl mb-4 neon-text capitalize">AI-HIJR ALARM</h3>
                <p className="text-lg mb-6 font-bold text-[var(--text-color-secondary)]">{alarm.text}</p>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-900/50 flex items-center justify-center animate-pulse">
                    <span className="text-3xl">🔊</span>
                </div>
                <button
                    onClick={onDismiss}
                    className="w-full p-2 bg-gradient-to-r from-[#00FFDF] to-[#0065AD] text-white font-bold rounded-md neon-button"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

const padZero = (num: number) => num.toString().padStart(2, '0');

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <div className="countdown-box font-clock text-3xl sm:text-4xl neon-text-white rounded-lg px-1 sm:px-2 py-1 w-16 sm:w-20 text-center cyber-border">{padZero(value)}</div>
        <div className="text-xs uppercase mt-1">{label}</div>
    </div>
);

const CurrentTimeClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    
    return (
        <div className="my-4">
            <p className="text-xs text-center mb-2">waktu saat ini :</p>
            <div className="flex justify-center space-x-2 sm:space-x-4">
                <TimeBox value={time.getHours()} label="Jam" />
                <TimeBox value={time.getMinutes()} label="Menit" />
                <TimeBox value={time.getSeconds()} label="Detik" />
            </div>
        </div>
    );
};

const PrayerTimeDisplay: React.FC<{ 
    time: string; 
    name: string; 
    isNext?: boolean;
    alarmOn: boolean;
    onToggleAlarm: () => void;
    onPlaySound: () => void;
}> = ({ time, name, isNext = false, alarmOn, onToggleAlarm, onPlaySound }) => (
    <div className={`flex justify-between items-center p-2 rounded-md cyber-border transition-all ${isNext ? 'bg-cyan-500/50 animate-pulse' : 'bg-black/20'}`}>
        <span className="text-sm sm:text-base uppercase font-bold text-[var(--text-color-secondary)]">{name}</span>
        <div className="flex items-center space-x-2">
            <span className="font-clock text-lg sm:text-xl">{time}</span>
            <button onClick={onPlaySound} title="Dengarkan Adzan"><VolumeUpIcon className="w-5 h-5"/></button>
            <button 
                onClick={onToggleAlarm}
                className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${alarmOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
                title={alarmOn ? 'Matikan Alarm Adzan' : 'Aktifkan Alarm Adzan'}
            >
                <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${alarmOn ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </div>
    </div>
);

// Memoized to prevent closing on clock update
const AdhanSoundSelector = React.memo(({ selectedAdhan, onAdhanChange, onPlayAdhan }: { selectedAdhan: string, onAdhanChange: (val: string) => void, onPlayAdhan: () => void }) => (
    <div className="mt-3 px-4 max-w-xs mx-auto text-sm">
        <label htmlFor="adhan-sound" className="block text-xs mb-1 text-center">Pilihan Suara Adzan</label>
        <div className="flex items-center space-x-2">
            <select 
                id="adhan-sound"
                value={selectedAdhan}
                onChange={(e) => onAdhanChange(e.target.value)}
                className="flex-grow bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                onMouseDown={e => e.stopPropagation()}
            >
                <option value="adhan1">Adzan 1</option>
                <option value="adhan2">Adzan 2</option>
                <option value="mishary">Mishary Rashid Alafasy</option>
                <option value="mustafa">Mustafa Özcan</option>
            </select>
            <button onClick={onPlayAdhan} className="p-2 bg-gray-700 border border-[var(--border-color)]/30 rounded-md" title="Dengarkan Pilihan Adzan">
                <VolumeUpIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
));

// Memoized to prevent closing on clock update
const LocationSettings = React.memo(({ settings, onSettingsChange }: { settings: UserSettings, onSettingsChange: (s: UserSettings) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.name === 'prayerMethod') {
             onSettingsChange({
                ...settings,
                prayerMethod: parseInt(e.target.value, 10)
            });
        } else {
            onSettingsChange({
                ...settings,
                manualLocation: {
                    ...settings.manualLocation,
                    [e.target.name]: e.target.value
                }
            });
        }
    };

    return (
        <div className="mt-4 px-4 border-t border-[var(--border-color)]/20 pt-3">
             <h4 className="font-bold text-sm flex items-center space-x-2 mb-2 justify-center"><MapIcon className="w-4 h-4"/> <span>Lokasi & Jadwal Shalat</span></h4>
             <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                    <input type="text" name="city" placeholder="Kota" value={settings.manualLocation.city} onChange={handleChange} className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-white text-center" onMouseDown={e => e.stopPropagation()}/>
                </div>
                 <div>
                    <input type="text" name="country" placeholder="Negara" value={settings.manualLocation.country} onChange={handleChange} className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-white text-center" onMouseDown={e => e.stopPropagation()}/>
                </div>
                <div>
                    <select name="prayerMethod" value={settings.prayerMethod} onChange={handleChange} className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-white" onMouseDown={e => e.stopPropagation()}>
                        {PRAYER_METHODS.map(method => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                    </select>
                </div>
             </div>
        </div>
    );
});

const PrayerInfo: React.FC<{ 
    prayerTimes: PrayerTimes | null, 
    nextPrayer: NextPrayer, 
    locationName: string | null,
    error: string | null,
    onRetry: () => void,
    adhanAlarms: AdhanAlarms,
    onToggleAdhanAlarm: (prayerName: PrayerName) => void,
    onPlayAdhan: () => void,
    selectedAdhan: string,
    onAdhanChange: (sound: string) => void;
    userSettings: UserSettings;
    onSettingsChange: (s: UserSettings) => void;
}> = ({ prayerTimes, nextPrayer, locationName, error, onRetry, adhanAlarms, onToggleAdhanAlarm, onPlayAdhan, selectedAdhan, onAdhanChange, userSettings, onSettingsChange }) => {
    if (error) {
        return (
            <div className="mt-6 text-center text-yellow-300 bg-black/50 p-3 rounded-lg my-2 mx-4 text-sm flex flex-col items-center space-y-2">
                <span>{error}</span>
                <button onClick={onRetry} className="px-4 py-1 text-xs bg-cyan-600 rounded-md neon-button">
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!prayerTimes) return null;
    
    const prayerNames: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return (
        <div className="mt-6">
            <p className="text-sm mb-2 text-center font-bold uppercase tracking-wider">Jadwal Shalat</p>
            {/* Updated Grid Layout for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 px-4 mx-auto">
                {prayerNames.map(name => (
                     <PrayerTimeDisplay 
                        key={name}
                        time={prayerTimes[name]} 
                        name={name === 'Sunrise' ? 'Syuruk' : (name === 'Fajr' ? 'Subuh' : name)}
                        isNext={nextPrayer.name === name}
                        alarmOn={adhanAlarms[name]?.isOn ?? false}
                        onToggleAlarm={() => onToggleAdhanAlarm(name)}
                        onPlaySound={onPlayAdhan}
                     />
                ))}
            </div>
            {nextPrayer.name && (
                <div className="mt-4 text-center">
                     <p className="text-[10px] next-prayer-text">
                        {`Sisa waktu menuju jadwal shalat terdekat ${nextPrayer.name === 'Sunrise' ? 'Syuruk' : (nextPrayer.name === 'Sunset' ? 'Maghrib' : nextPrayer.name)} [${nextPrayer.countdown}]`}
                    </p>
                </div>
            )}
            {locationName && (
                 <div className="mt-1 text-center">
                    <p className="text-[7px] text-white/80 dark:text-white/80 light:text-green-900">Lokasi terdeteksi: {locationName}</p>
                </div>
            )}
            
            <LocationSettings settings={userSettings} onSettingsChange={onSettingsChange} />
            <AdhanSoundSelector selectedAdhan={selectedAdhan} onAdhanChange={onAdhanChange} onPlayAdhan={onPlayAdhan} />
        </div>
    );
}

const DailyFact: React.FC<{fact: string | null}> = ({ fact }) => {
    if (!fact) return (
        <div className="my-4 p-3 cyber-border rounded-lg text-center text-sm text-[var(--text-color-muted)] animate-pulse">
            Memuat fakta menarik...
        </div>
    );

    if (fact.startsWith("Gagal memuat")) {
        return (
            <div className="my-4 p-3 cyber-border rounded-lg text-center text-sm text-yellow-400">
                {fact}
            </div>
        );
    }

    return (
        <div className="my-4 p-3 cyber-border rounded-lg">
            <h4 className="font-bold text-sm mb-2 text-[var(--text-color-secondary)] flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Fakta Hari Ini
            </h4>
            <p className="text-sm text-justify">{fact}</p>
        </div>
    );
};

const WeatherWidget: React.FC<{ locationName: string | null }> = ({ locationName }) => {
    const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="orange" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="gray" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
    const RainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="lightblue" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zm4-3v6m4-6v6m4-3v3" /></svg>;
    
    const getWeatherIcon = (weatherCodeStr: string) => {
        const code = parseInt(weatherCodeStr, 10);
        if (code === 113) return <SunIcon />;
        if (code >= 263 && code <= 359) return <RainIcon />;
        return <CloudIcon />;
    };

    interface WeatherData { temp_C: string; weatherDesc: { value: string }[]; weatherCode: string; }
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!locationName) return;
        const fetchWeather = async () => {
            try {
                const cityPart = locationName.split(',')[0];
                if (!cityPart || cityPart.trim() === '' || cityPart.toLowerCase() === 'undefined') {
                    setError(null); // Clear error if no valid city to fetch
                    setWeather(null);
                    return;
                }
                const response = await fetch(`https://wttr.in/${encodeURIComponent(cityPart)}?format=j1`);
                if (!response.ok) throw new Error('Cuaca tidak tersedia.');
                const data = await response.json();
                if (data && data.current_condition && data.current_condition[0]) {
                     setWeather(data.current_condition[0]);
                     setError(null);
                } else {
                     throw new Error('Format data cuaca tidak valid.');
                }
            } catch (err) {
                // Suppressed detailed error for user experience
                console.warn("Weather fetch warning:", err); 
                setError('Gagal memuat cuaca.');
                setWeather(null);
            }
        };
        fetchWeather();
    }, [locationName]);

    if (error) return <div className="text-center text-xs text-yellow-400 mt-2 p-2">{error}</div>;
    if (!weather) return <div className="text-center text-xs text-gray-400 mt-2 p-2">Memuat data cuaca...</div>; // Removed animate-pulse
    
    return (
        <div className="mt-4 p-2 text-center border-t border-[var(--border-color)]/20">
             <h4 className="text-sm mb-2">Cuaca Saat Ini</h4>
            <div className="flex items-center justify-center space-x-4">
                <div className="w-10 h-10">{getWeatherIcon(weather.weatherCode)}</div>
                <div>
                    <p className="text-4xl font-bold font-clock weather-temp-neon">{weather.temp_C}°C</p>
                    <p className="text-xs">{weather.weatherDesc[0].value}</p>
                </div>
            </div>
        </div>
    );
};


const QUICK_THEMES: Theme[] = ['auto', 'light', 'dark', 'theme-ramadan'];

// Memoized to prevent re-renders on clock tick
const HolidayCountrySelector = React.memo(({ settings, onSettingsChange }: { settings: UserSettings, onSettingsChange: (s: UserSettings) => void }) => (
    <div className="mt-4 px-2" onMouseDown={e => e.stopPropagation()}>
        <h4 className="font-bold flex items-center space-x-2 mb-2"><MapIcon className="w-5 h-5"/> <span>Lokasi Hari Libur Nasional</span></h4>
        <div className="space-y-2 text-sm">
            <p className='text-xs text-gray-400'>Pilih negara untuk menampilkan hari libur nasional di kalender.</p>
             <div>
                <label htmlFor="holidayCountry" className="sr-only">Negara</label>
                <select 
                    name="holidayCountry" 
                    id="holidayCountry" 
                    value={settings.holidayCountry} 
                    onChange={e => onSettingsChange({...settings, holidayCountry: e.target.value})} 
                    className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white"
                    onMouseDown={(e) => e.stopPropagation()} // Fix: Stop immediate closing on click
                >
                   {COUNTRIES.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
                </select>
            </div>
            {/* Google Maps Embed */}
            <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border-color)]/30 h-40">
                <iframe
                    title="Country Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${COUNTRIES.find(c => c.code === settings.holidayCountry)?.name || 'Indonesia'}&t=&z=4&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
            </div>
        </div>
    </div>
));

const App: React.FC = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    const [location, setLocation] = useState<Location | null>(null);
    const [errors, setErrors] = useState({
        calendar: null as string | null,
        prayer: null as string | null,
        holidays: null as string | null,
    });
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [yearlyCalendarData, setYearlyCalendarData] = useState<(CalendarData | null)[]>([]);
    const [viewDate, setViewDate] = useState(new Date());
    const [today, setToday] = useState<Day | null>(null);
    const [countdownTarget, setCountdownTarget] = useState<CountdownTarget | null>(null);
    const [selectedCountdownEvent, setSelectedCountdownEvent] = useState<CountdownEvent>(CountdownEvent.RAMADAN);
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isQiblaModalOpen, setIsQiblaModalOpen] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState<InfoModalContent>(null);
    const [theme, setTheme] = useState<Theme>('auto');
    const [zoom, setZoom] = useState(1.0); // Default zoom 100%
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [locationName, setLocationName] = useState<string | null>(null);
    const [nextPrayer, setNextPrayer] = useState<NextPrayer>({ name: null, time: null, countdown: '' });
    const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() => {
        try {
            const saved = localStorage.getItem('hijriCalendarEvents');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [customHijriEvents, setCustomHijriEvents] = useState<CustomHijriEvent[]>(() => {
        try {
            const saved = localStorage.getItem('hijriCalendarHijriEvents');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Day | null>(null);
    const [selectedDayFastingInfo, setSelectedDayFastingInfo] = useState<{isFasting: boolean, type: string}>({isFasting: false, type: ""});
    const [selectedDayInfoKey, setSelectedDayInfoKey] = useState<string | null>(null);
    const [alarms, setAlarms] = useState<AlarmSettings>({
        tidur: { isOn: false, time: '22:05' },
        tahajud: { isOn: false, time: '02:34' },
        sahur: { isOn: false, time: '03:33' },
        dhuha: { isOn: false, time: '09:45' },
        jumat: { isOn: false, time: '11:15' },
        shalat5Waktu: { isOn: false, time: '' }, // time is not used for 5-waktu toggle
    });
    const [activeAlarm, setActiveAlarm] = useState<{ name: keyof AlarmSettings; text: string } | null>(null);
    const [calendarAnimationClass, setCalendarAnimationClass] = useState('fade-in');
    const [userSettings, setUserSettings] = useState<UserSettings>({
        manualLocation: { city: '', country: '' },
        prayerMethod: 20,
        holidayCountry: 'ID',
        sunnahFastingNotifications: {
            seninKamis: { isOn: false, time: '17:00' },
            ayyamulBidh: { isOn: false, time: '17:00' },
            arafah: { isOn: false, time: '17:00' },
            asyura: { isOn: false, time: '17:00' },
            syawal: { isOn: false, time: '17:00' },
        }
    });
    const [calendarView, setCalendarView] = useState<CalendarView>('monthly');
    const [calendarFormat, setCalendarFormat] = useState<CalendarFormat>('hijri-masehi');
    const [currentWeekDays, setCurrentWeekDays] = useState<Day[]>([]);
    const [nationalHolidays, setNationalHolidays] = useState<{ [date: string]: string }>({});
    const [hijriHolidays, setHijriHolidays] = useState<Map<string, string>>(new Map());
    const [alarmSound, setAlarmSound] = useState<AlarmSound>('default');
    const [filters, setFilters] = useState<FilterSettings>({
        showCustomEvents: true,
        showNationalHolidays: true,
        showCustomHijriEvents: true,
    });
    const [dailyFact, setDailyFact] = useState<string | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<({ day: Day, reason: string })[] | null>(null);
    const [isChatBotOpen, setIsChatBotOpen] = useState(false);
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
    const [chatBotInitialMessage, setChatBotInitialMessage] = useState<string | null>(null);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [adhanAlarms, setAdhanAlarms] = useState<AdhanAlarms>({});
    const [selectedAdhan, setSelectedAdhan] = useState('adhan1');
    const synth = window.speechSynthesis;
    
    const isInitialLoad = useRef(true);
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const alarmCheckIntervalRef = useRef<number | null>(null);
    const notificationTimeouts = useRef(new Map<string, number>());
    const audioCtx = useRef<AudioContext | null>(null);
    const alarmAudio1 = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/e4e4a8572bc82f134d2e62e24331d5d915edc3a4/Bismillahirrahmanirrahim%20%E2%80%94%20Muhammad%20Thaha%20Al%20Junaid.mp3?raw=true'));
    const alarmAudio2 = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/e4e4a8572bc82f134d2e62e24331d5d915edc3a4/Bismillahirrahmanirrahim_MuflihSafitra.mp3?raw=true'));
    
    const adhanAudio1Ref = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/36c37f1fb8a2b39e4c6cbe391c83ee24c1f531ad/adhan-1.mp3?raw=true'));
    const adhanAudio2Ref = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/36c37f1fb8a2b39e4c6cbe391c83ee24c1f531ad/Adhan-02.mp3?raw=true'));
    const adhanMisharyRef = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/36c37f1fb8a2b39e4c6cbe391c83ee24c1f531ad/Adhan-Mishary-Rashid-Alafasy.mp3?raw=true'));
    const adhanMustafaRef = useRef(new Audio('https://raw.githubusercontent.com/vandratop/Yuk/36c37f1fb8a2b39e4c6cbe391c83ee24c1f531ad/Adhan-Mustafa-%C3%96zcan.mp3?raw=true'));
    const triggeredAdhanToday = useRef<{[key in PrayerName]?: boolean}>({});
    
    const adhanAudios = useRef<Record<string, HTMLAudioElement>>({
        'adhan1': adhanAudio1Ref.current,
        'adhan2': adhanAudio2Ref.current,
        'mishary': adhanMisharyRef.current,
        'mustafa': adhanMustafaRef.current,
    });

    const playClickSound = () => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        if (!audioCtx.current) {
            try {
                audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
                return;
            }
        }
        if (audioCtx.current && audioCtx.current.state === 'suspended') {
            audioCtx.current.resume();
        }
        if (audioCtx.current) {
            const oscillator = audioCtx.current.createOscillator();
            const gainNode = audioCtx.current.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.current.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.current.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.current.currentTime + 0.2);
            oscillator.start(audioCtx.current.currentTime);
            oscillator.stop(audioCtx.current.currentTime + 0.2);
        }
    };
    
    const speak = (text: string) => {
        if (!text || !synth) return;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        synth.speak(utterance);
    };

    const playAlarmSound = (soundToPlay: AlarmSound, ttsText?: string) => {
        const sounds = {
            'thaha': alarmAudio1.current,
            'muflih': alarmAudio2.current,
        };

        const soundToToggle = sounds[soundToPlay as keyof typeof sounds];
        Object.values(sounds).forEach(audio => {
            if (audio !== soundToToggle) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        if (soundToPlay === 'default') {
            playClickSound();
            if (ttsText) speak(ttsText);
            return;
        }

        if (soundToToggle) {
            if (!soundToToggle.paused) {
                soundToToggle.pause();
                soundToToggle.currentTime = 0;
                soundToToggle.onended = null;
            } else {
                soundToToggle.play().catch(e => console.error("Error playing sound:", e));
                if (ttsText) {
                    soundToToggle.onended = () => {
                        speak(ttsText);
                        soundToToggle.onended = null; // clean up
                    };
                }
            }
        }
    };

    const playAdhan = useCallback(() => {
        const audio = adhanAudios.current[selectedAdhan];
        if (audio) {
            const stopAllAdhans = () => {
                Object.values(adhanAudios.current).forEach((a: HTMLAudioElement) => {
                    a.pause();
                    a.currentTime = 0;
                });
            };
    
            if (audio.paused) {
                stopAllAdhans();
                audio.play().catch(e => console.error("Error playing Adhan sound:", e));
            } else {
                stopAllAdhans();
            }
        }
    }, [selectedAdhan]);

    const playAdhanAlarm = useCallback(() => {
        const audio = adhanAudios.current[selectedAdhan];
        if (audio) {
            Object.values(adhanAudios.current).forEach((a: HTMLAudioElement) => {
                a.pause();
                a.currentTime = 0;
            });
            audio.play().catch(e => console.error("Error playing Adhan alarm:", e));
        }
    }, [selectedAdhan]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            // Auto close welcome screen if no interaction, but mic permission won't be granted automatically
            // We can keep it open or rely on the user clicking
        }, 8000); 

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const isRamadan = today?.hijri.month.number === 9;
        const applyTheme = () => {
             if (isRamadan) {
                document.body.className = 'theme-ramadan';
                return;
            }
            if (theme.startsWith('theme-')) {
                 document.body.className = theme;
            } else if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.className = prefersDark ? '' : 'light';
            } else {
                document.body.className = theme === 'light' ? 'light' : '';
            }
        };
        applyTheme();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyTheme);
        try { localStorage.setItem('hijriCalendarTheme', theme); }
        catch(e) { console.error("Could not save theme to localStorage", e); }
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [theme, today]);
    
    useEffect(() => {
        try { localStorage.setItem('hijriCalendarZoom', zoom.toString()); }
        catch (e) { console.error("Could not save zoom level", e); }
    }, [zoom]);

    useEffect(() => {
        try { localStorage.setItem('hijriCalendarView', calendarView); }
        catch (e) { console.error("Could not save calendar view", e); }
    }, [calendarView]);

    useEffect(() => {
        try { localStorage.setItem('hijriCalendarAlarmSound', alarmSound); }
        catch (e) { console.error("Could not save alarm sound", e); }
    }, [alarmSound]);

    useEffect(() => {
        (document.body.style as any).zoom = `${zoom}`;
        return () => { (document.body.style as any).zoom = '1'; };
    }, [zoom]);

    // Notification and Alarm Logic
    useEffect(() => {
        // Load settings from local storage
        try {
            const savedSettings = localStorage.getItem('hijriCalendarUserSettings');
            if (savedSettings) setUserSettings(JSON.parse(savedSettings));
            
            const savedAlarms = localStorage.getItem('hijriCalendarAlarms');
            if (savedAlarms) setAlarms(JSON.parse(savedAlarms));

            const savedAdhanAlarms = localStorage.getItem('hijriAdhanAlarms');
            if (savedAdhanAlarms) setAdhanAlarms(JSON.parse(savedAdhanAlarms));

            const savedAdhanSound = localStorage.getItem('hijriAdhanSound');
            if (savedAdhanSound) setSelectedAdhan(savedAdhanSound);
        } catch (error) {
            console.error("Error loading settings from local storage", error);
        }

        const checkAlarms = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeStr = `${padZero(currentHour)}:${padZero(currentMinute)}`;

            // Standard Alarms
            Object.entries(alarms).forEach(([key, setting]) => {
                if (key === 'shalat5Waktu') return; 
                
                const s = setting as { isOn: boolean, time: string };
                if (s.isOn && s.time === currentTimeStr) {
                    const lastTriggered = notificationTimeouts.current.get(key);
                    if (!lastTriggered || (Date.now() - lastTriggered > 60000)) {
                        const messageText = ALARM_MESSAGES[key as keyof typeof ALARM_MESSAGES] || `Waktunya ${key}`;
                        const translatedText = getTranslatedMessage(messageText);
                        
                        setActiveAlarm({ name: key as keyof AlarmSettings, text: translatedText });
                        playAlarmSound(alarmSound, translatedText);
                        notificationTimeouts.current.set(key, Date.now());
                    }
                }
            });

            // Shalat 5-Waktu Alarm (10 minutes before)
            if (alarms.shalat5Waktu.isOn && prayerTimes) {
                const prayersToCheck: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                prayersToCheck.forEach(prayer => {
                    const pTime = prayerTimes[prayer];
                    if (pTime) {
                        const [pHour, pMinute] = pTime.split(':').map(Number);
                        const prayerDate = new Date();
                        prayerDate.setHours(pHour, pMinute, 0, 0);
                        
                        // Check 10 minutes before
                        const checkDate = new Date(prayerDate.getTime() - 10 * 60000);
                        if (checkDate.getHours() === currentHour && checkDate.getMinutes() === currentMinute) {
                             const lastTriggeredKey = `5waktu-${prayer}`;
                             const lastTriggered = notificationTimeouts.current.get(lastTriggeredKey);
                             
                             if (!lastTriggered || (Date.now() - lastTriggered > 60000)) {
                                const prayerNameMap: Record<string, string> = { 'Fajr': 'Subuh', 'Dhuhr': 'Dzuhur', 'Asr': 'Ashar', 'Maghrib': 'Maghrib', 'Isha': 'Isya' };
                                const pName = prayerNameMap[prayer];
                                const rawMessage = ALARM_MESSAGES.shalat5Waktu;
                                const translatedText = getTranslatedMessage(rawMessage, pName);

                                setActiveAlarm({ name: 'shalat5Waktu', text: translatedText });
                                playAlarmSound(alarmSound, translatedText);
                                notificationTimeouts.current.set(lastTriggeredKey, Date.now());
                             }
                        }
                    }
                });
            }

            // Adhan Alarms
            if (prayerTimes) {
                (Object.keys(adhanAlarms) as PrayerName[]).forEach(prayer => {
                    if (adhanAlarms[prayer]?.isOn) {
                        const time = prayerTimes[prayer];
                        if (time === currentTimeStr) {
                             if (!triggeredAdhanToday.current[prayer]) {
                                playAdhanAlarm();
                                triggeredAdhanToday.current[prayer] = true;
                                
                                // Reset flag after 60 seconds
                                setTimeout(() => {
                                    triggeredAdhanToday.current[prayer] = undefined;
                                }, 60000);
                             }
                        }
                    }
                });
            }
        };

        const intervalId = setInterval(checkAlarms, 1000);
        return () => clearInterval(intervalId);
    }, [alarms, prayerTimes, alarmSound, adhanAlarms, selectedAdhan]); // Dependencies

    const handleUpdateSettings = useCallback((newSettings: UserSettings) => {
        setUserSettings(newSettings);
        try { localStorage.setItem('hijriCalendarUserSettings', JSON.stringify(newSettings)); }
        catch(e) { console.error("Could not save settings to localStorage", e); }
    }, []);

    const handleFilterChange = (newFilters: Partial<FilterSettings>) => {
        setFilters(prev => {
            const updatedFilters = { ...prev, ...newFilters };
            try {
                localStorage.setItem('hijriCalendarFilters', JSON.stringify(updatedFilters));
            } catch (e) {
                console.error("Could not save filters to localStorage", e);
            }
            return updatedFilters;
        });
    };

    // ... [Alarm Interval Effect remains unchanged] ...

    const handleToggleAlarm = (alarmName: string, isOn: boolean) => {
        playClickSound();
        const newAlarms = { ...alarms, [alarmName]: { ...alarms[alarmName as keyof AlarmSettings], isOn } };
        setAlarms(newAlarms);
        try {
            localStorage.setItem('hijriCalendarAlarms', JSON.stringify(newAlarms));
        } catch (e) {
            console.error("Could not save alarm setting to localStorage", e);
        }
    };
    
    const handleAlarmTimeChange = (alarmName: string, time: string) => {
        const newAlarms = { ...alarms, [alarmName]: { ...alarms[alarmName as keyof AlarmSettings], time } };
        setAlarms(newAlarms);
        try {
            localStorage.setItem('hijriCalendarAlarms', JSON.stringify(newAlarms));
        } catch (e) {
            console.error("Could not save alarm time setting to localStorage", e);
        }
    };

    const handleAddEvent = (newEvent: Omit<CustomEvent, 'id'>) => {
        const event: CustomEvent = { ...newEvent, id: Date.now().toString() };
        setCustomEvents(prev => {
            const updated = [...prev, event];
            try { localStorage.setItem('hijriCalendarEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save events", e); }
            return updated;
        });
    };

    const handleDeleteEvent = (eventId: string) => {
        setCustomEvents(prev => {
            const updated = prev.filter(e => e.id !== eventId);
            try { localStorage.setItem('hijriCalendarEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save events", e); }
            return updated;
        });
    };

    const handleUpdateEvent = (updatedEvent: CustomEvent) => {
        setCustomEvents(prev => {
            const updated = prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
            try { localStorage.setItem('hijriCalendarEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save events", e); }
            return updated;
        });
    };

    const handleAddHijriEvent = (newEvent: Omit<CustomHijriEvent, 'id'>) => {
        const event: CustomHijriEvent = { ...newEvent, id: Date.now().toString() };
        setCustomHijriEvents(prev => {
            const updated = [...prev, event];
            try { localStorage.setItem('hijriCalendarHijriEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save hijri events", e); }
            return updated;
        });
    };

    const handleDeleteHijriEvent = (eventId: string) => {
        setCustomHijriEvents(prev => {
            const updated = prev.filter(e => e.id !== eventId);
            try { localStorage.setItem('hijriCalendarHijriEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save hijri events", e); }
            return updated;
        });
    };

    const handleUpdateHijriEvent = (updatedEvent: CustomHijriEvent) => {
        setCustomHijriEvents(prev => {
            const updated = prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
            try { localStorage.setItem('hijriCalendarHijriEvents', JSON.stringify(updated)); } catch(e) { console.error("Could not save hijri events", e); }
            return updated;
        });
    };

     const handleToggleAdhanAlarm = (prayerName: PrayerName) => {
        playClickSound();
        const newAlarms = {
            ...adhanAlarms,
            [prayerName]: { isOn: !adhanAlarms[prayerName]?.isOn }
        };
        setAdhanAlarms(newAlarms);
        try {
            localStorage.setItem('hijriAdhanAlarms', JSON.stringify(newAlarms));
        } catch(e) { console.error("Could not save adhan alarm", e) }
    };
    
     const handleAdhanChange = useCallback((sound: string) => {
        setSelectedAdhan(sound);
        try {
            localStorage.setItem('hijriAdhanSound', sound);
        } catch(e) { console.error("Could not save adhan sound", e) }
    }, []);
    
    // ... [Event Handlers remain unchanged] ...

    
    const fetchAndSetData = useCallback(async () => {
        const data = await fetchCalendarData(viewDate.getFullYear(), viewDate.getMonth() + 1);
        setCalendarData(data);

        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            const now = new Date();
            const currentDay = data.days.find(d => 
                parseInt(d.gregorian.day) === now.getDate() &&
                d.gregorian.month.number === (now.getMonth() + 1) &&
                parseInt(d.gregorian.year) === now.getFullYear()
            );

            if (currentDay) {
                 setToday(currentDay);
            }
        }
    }, [viewDate]);

    const loadCalendarData = useCallback(async () => {
        setLoading(true);
        setErrors(e => ({ ...e, calendar: null }));
        try {
            if (calendarView === 'yearly') {
                const year = viewDate.getFullYear();
                const firstValidMonth = yearlyCalendarData.find(d => d);
                const isDataAlreadyLoaded = yearlyCalendarData.length === 12 && firstValidMonth && firstValidMonth.days[0].gregorian.year === String(year);

                if (isDataAlreadyLoaded) {
                    setLoading(false);
                    return;
                }
                
                const newYearlyData = [];
                for (let i = 0; i < 12; i++) {
                    try {
                        const monthData = await fetchCalendarData(year, i + 1);
                        newYearlyData.push(monthData);
                    } catch (monthError) {
                        console.error(`Failed to load month ${i + 1}`, monthError);
                        newYearlyData.push(null);
                    }
                }
                setYearlyCalendarData(newYearlyData);

                if (isInitialLoad.current && newYearlyData[new Date().getMonth()]) {
                    const currentMonthData = newYearlyData[new Date().getMonth()];
                    const now = new Date();
                    const currentDay = currentMonthData?.days.find(d => parseInt(d.gregorian.day) === now.getDate());
                    if (currentDay) setToday(currentDay);
                    isInitialLoad.current = false;
                }
            } else {
                await fetchAndSetData();
            }
        } catch (err) {
            setErrors(e => ({ ...e, calendar: 'Gagal memuat data kalender. Periksa koneksi internet Anda.' }));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [viewDate, calendarView, fetchAndSetData, yearlyCalendarData]);
    
    useEffect(() => {
        loadCalendarData();
    }, [loadCalendarData]);


    useEffect(() => {
        if (calendarData && calendarData.days.length > 0) {
            const date = viewDate.getDate();
            const month = viewDate.getMonth() + 1;
            const dayInView = calendarData.days.find(d => 
                parseInt(d.gregorian.day) === date && d.gregorian.month.number === month
            );
            
            if (dayInView) {
                const dayIndex = calendarData.days.indexOf(dayInView);
                const dayOfWeek = WEEKDAY_MAP[dayInView.gregorian.weekday.en];
                const weekStartIndex = dayIndex - dayOfWeek;
                const weekEndIndex = weekStartIndex + 7;
                setCurrentWeekDays(calendarData.days.slice(Math.max(0, weekStartIndex), weekEndIndex));
            } else {
                 setCurrentWeekDays([]);
            }
        }
    }, [viewDate, calendarData]);


    const fetchPrayerData = useCallback(async () => {
        setErrors(e => ({...e, prayer: null}));
        
        const fetchWithManual = async () => {
            try {
                const { timings, location } = await fetchLocationAndPrayerTimes(0, 0, userSettings);
                setPrayerTimes(timings);
                setLocationName(location);
            } catch (err) {
                 console.warn("Failed to get prayer times with manual location:", err);
                 setErrors(e => ({...e, prayer: 'Gagal memuat jadwal shalat. Pastikan nama kota & negara benar.'}));
            }
        };
        
        const fetchWithDefault = async () => {
            console.warn('Using default location (Jakarta).');
            const defaultSettings = { ...userSettings, manualLocation: { city: 'Jakarta', country: 'Indonesia' }, prayerMethod: 20 };
            setLocation({ latitude: -6.2088, longitude: 106.8456 });

            try {
                const { timings, location: locName } = await fetchLocationAndPrayerTimes(0, 0, defaultSettings);
                setPrayerTimes(timings);
                setLocationName(locName);
                setErrors(e => ({...e, prayer: "Akses lokasi gagal. Menampilkan waktu untuk Jakarta."}));
            } catch (err) {
                 console.warn("Failed to get prayer times with default location:", err);
                 setErrors(e => ({...e, prayer: "Gagal memuat jadwal shalat. Periksa koneksi Anda."}));
            }
        };

        if (userSettings.manualLocation.city && userSettings.manualLocation.country) {
            await fetchWithManual();
        } else {
             navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    try {
                        const { timings, location } = await fetchLocationAndPrayerTimes(latitude, longitude, userSettings);
                        setPrayerTimes(timings);
                        setLocationName(location);
                    } catch (err) {
                         console.warn("Failed to get prayer times:", err);
                         setErrors(e => ({...e, prayer: 'Gagal memuat jadwal shalat untuk lokasi Anda.'}));
                    }
                },
                async () => {
                    console.warn('Geolocation permission denied. Trying with manual settings or default.');
                    if (userSettings.manualLocation.city && userSettings.manualLocation.country) {
                         await fetchWithManual();
                    } else {
                        await fetchWithDefault();
                    }
                },
                { enableHighAccuracy: true }
            );
        }
    }, [userSettings]);

    const fetchHolidaysData = useCallback(async () => {
        const country = userSettings.holidayCountry || 'ID';
        const year = viewDate.getFullYear();
        setErrors(e => ({ ...e, holidays: null }));
        try {
            const holidays = await getNationalHolidays(country, year);
            setNationalHolidays(holidays);
        } catch (err) {
            console.error("Could not fetch national holidays", err);
            setNationalHolidays({});
        }
        
        if (calendarData) {
            const hijriYear = parseInt(calendarData.hijriYear);
            if (!isNaN(hijriYear)) {
                try {
                    const holidays = await fetchHijriHolidays(hijriYear);
                    setHijriHolidays(holidays);
                } catch(e) {
                    console.error("Could not fetch hijri holidays", e);
                }
            }
        }
    }, [userSettings.holidayCountry, viewDate, calendarData]);

    useEffect(() => {
        fetchPrayerData();
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [fetchPrayerData]);

     useEffect(() => {
        fetchHolidaysData();
        getDailyFact().then(setDailyFact).catch(err => {
            console.error("Failed to fetch daily fact:", err);
            setDailyFact("Gagal memuat fakta hari ini.");
        });
    }, [fetchHolidaysData]);
    
    // ... [Prayer Calculation Effect remains unchanged] ...

    const handleNavigation = useCallback((offset: number) => {
        playClickSound();
        if (calendarView === 'yearly') {
            setCalendarAnimationClass('fade-in');
            setViewDate(prevDate => {
                const newDate = new Date(prevDate);
                newDate.setFullYear(newDate.getFullYear() + offset);
                return newDate;
            });
            return;
        }
        if (calendarView === 'daily') {
            setCalendarAnimationClass('fade-in');
            setViewDate(prevDate => {
                const newDate = new Date(prevDate);
                newDate.setDate(newDate.getDate() + offset);
                return newDate;
            });
            return;
        }
        
        const isMonthly = calendarView === 'monthly';
        const isForward = offset > 0;
        const outAnimation = isMonthly ? (isForward ? 'slide-out-left' : 'slide-out-right') : 'fade-out';
        const inAnimation = isMonthly ? (isForward ? 'slide-in-right' : 'slide-in-left') : 'fade-in';
        const animationDuration = isMonthly ? 300 : 200;
        setCalendarAnimationClass(outAnimation);
        setTimeout(() => {
            setViewDate(prevDate => {
                const newDate = new Date(prevDate);
                if (isMonthly) newDate.setMonth(newDate.getMonth() + offset);
                else newDate.setDate(newDate.getDate() + (offset * 7));
                return newDate;
            });
            setCalendarAnimationClass(inAnimation);
        }, animationDuration);
    }, [calendarView]);

    const handleDateJump = useCallback((date: Date) => {
        playClickSound();
        if (calendarView === 'yearly') setViewDate(date);
        else { setCalendarAnimationClass('fade-in'); setViewDate(date); }
    }, [calendarView]);

    // ... [Touch Gesture Effect remains unchanged] ...

    const handleDayClick = (day: Day, infoKey: string | null) => {
        playClickSound();
        setSelectedDay(day);
        
        const is13Dzulhijjah = parseInt(day.hijri.day) === 13 && day.hijri.month.number === 12;
        if (is13Dzulhijjah) {
            setSelectedDayFastingInfo({ isFasting: false, type: "Hari Tasyrik disunnahkan tidak berpuasa" });
            setSelectedDayInfoKey('hari-raya-idul-adha');
        } else {
            setSelectedDayFastingInfo(getFastingInfo(day));
            setSelectedDayInfoKey(infoKey);
        }
        
        setIsDetailModalOpen(true);
    };

    // ... [Info Modal Handlers remain unchanged] ...
    
    const handleMenuClick = (action: string) => {
        playClickSound();
        setIsMenuOpen(false);
        // ... [Switch case logic from original App.tsx] ...
        switch(action) {
            case 'share': setIsShareModalOpen(true); break;
            case 'contact-us': setIsContactModalOpen(true); break;
            case 'info-puasa': handleOpenInfo('puasa'); break;
            case 'info-hari-raya': handleOpenInfo('hari-raya'); break;
            case 'cara-penggunaan': handleOpenInfo('cara-penggunaan'); break;
            case 'ketentuan': handleOpenInfo('ketentuan'); break;
            case 'faq': handleOpenInfo('faq'); break;
        }
    };
    
    const handleOpenInfo = (infoKey: string) => {
        playClickSound();
        const setListContent = (title: string, items: {key: string, title: string}[]) => {
             setInfoModalContent({ 
                title: title, 
                isList: true, 
                content: items.map(page => (<InfoListItem key={page.key} onClick={() => handleOpenInfo(page.key)}>{page.title}</InfoListItem>)) 
            });
        }

        if (infoKey === 'puasa') {
            setListContent('Informasi Puasa', PUASA_SUB_PAGES);
        } else if (infoKey === 'hari-raya') {
            setListContent('Informasi Hari Raya', HARI_RAYA_SUB_PAGES);
        } else if (infoKey === 'faq') {
            setListContent('FAQ (Tanya Jawab)', FAQ_CONTENT);
        } else {
             const detail = INFO_DETAILS[infoKey];
             if (detail) {
                 const isSubPage = PUASA_SUB_PAGES.some(p => p.key === infoKey) || HARI_RAYA_SUB_PAGES.some(p => p.key === infoKey) || FAQ_CONTENT.some(p => p.key === infoKey);
                 const parentKey = PUASA_SUB_PAGES.some(p => p.key === infoKey) ? 'puasa' : (HARI_RAYA_SUB_PAGES.some(p => p.key === infoKey) ? 'hari-raya' : (FAQ_CONTENT.some(p => p.key === infoKey) ? 'faq' : undefined));
                 
                 setInfoModalContent({ 
                     title: detail.title, 
                     content: detail.content, 
                     isList: false,
                     parentKey: isSubPage ? parentKey : undefined
                 });
             }
        }
    };

    const Legend: React.FC<{ isPrintable?: boolean }> = ({ isPrintable = false }) => {
        const holidaysInView: string[] = [];
        if (calendarData && filters.showNationalHolidays) {
            calendarData.days.forEach(day => {
                const dateKey = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2,'0')}-${day.gregorian.day.padStart(2,'0')}`;
                const holidayName = nationalHolidays[dateKey];
                if (holidayName && !holidaysInView.includes(holidayName)) holidaysInView.push(holidayName);
            });
        }

        return (
            <div className={`text-xs space-y-2 mt-4 font-jannah px-2 ${isPrintable ? 'text-black' : ''}`}>
                <h3 className="font-bold text-sm">Keterangan:</h3>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#FF3131] mr-2"></div><button disabled={isPrintable} onClick={() => !isPrintable && handleOpenInfo('hari-raya')} className={!isPrintable ? "hover:underline" : ""}>Hari Raya dan Hari Libur Nasional</button></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#009688] mr-2"></div><button disabled={isPrintable} onClick={() => !isPrintable && handleOpenInfo('puasa')} className={!isPrintable ? "hover:underline" : ""}>Puasa Ramadhan</button></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#0D00FF] mr-2"></div><button disabled={isPrintable} onClick={() => !isPrintable && handleOpenInfo('puasa')} className={!isPrintable ? "hover:underline" : ""}>Puasa Sunnah Ayyamul Bidh ( setiap 13, 14, 15 Hijriah)</button></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#21DEC4] mr-2"></div><button disabled={isPrintable} onClick={() => !isPrintable && handleOpenInfo('puasa')} className={!isPrintable ? "hover:underline" : ""}>Puasa Sunnah Senin - Kamis</button></div>
                <div className="flex items-center"><div className="w-3 h-3 bg-[#1FCB0A] mr-2"></div><button disabled={isPrintable} onClick={() => !isPrintable && handleOpenInfo('puasa')} className={!isPrintable ? "hover:underline" : ""}>Puasa Sunnah Lainnya (Syawal, Arafah, Asyura, Tasua,  Sya'ban)</button></div>
                <p className="text-[10px] italic mt-2">
                    Untuk Penentuan jadwal Puasa Ramadhan, Hari Raya Idul Fitri dan Idul Adha berdasarkan sidang isbath dari Pemerintah, kemungkinan akan ada perbedaan penentuan tanggal antara di kalender Masehi dan Kalender Hijriah.
                </p>
                
                {filters.showNationalHolidays && holidaysInView.length > 0 && (
                    <div className="mt-2 p-2 border border-red-400/30 rounded bg-red-900/10">
                        <p className="font-bold text-[10px] text-red-400 mb-1 flex items-center"><PinIcon className="w-3 h-3 mr-1" /> Informasi nama-nama hari Libur Nasional:</p>
                        <ul className="list-disc pl-4 text-[10px] text-[var(--text-color-muted)]">
                            {holidaysInView.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    };
    
    const CalendarSkeletonLoader: React.FC = () => (
        <div className="p-2">
            <div className="flex justify-between items-center my-4 px-2 animate-pulse">
                <div className="h-10 w-20 bg-[var(--border-color)]/20 rounded-md"></div>
                <div className="h-8 w-40 bg-[var(--border-color)]/20 rounded-md"></div>
                <div className="h-10 w-20 bg-[var(--border-color)]/20 rounded-md"></div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-jannah animate-pulse">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={`sk-h-${i}`} className="h-8 bg-[var(--border-color)]/20 rounded-md"></div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={`sk-d-${i}`} className="aspect-square bg-[var(--border-color)]/10 rounded-md"></div>
                ))}
            </div>
        </div>
    );

    const filteredCustomEvents = filters.showCustomEvents ? customEvents : [];
    const filteredNationalHolidays = filters.showNationalHolidays ? nationalHolidays : {};
    const filteredCustomHijriEvents = filters.showCustomHijriEvents ? customHijriEvents : [];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) { setSearchResults(null); return; }
        const query = searchQuery.trim().toLowerCase();
        const results: ({ day: Day, reason: string })[] = [];
        const allDaysToSearch = calendarView === 'yearly' ? yearlyCalendarData.flatMap(monthData => monthData?.days || []) : (calendarData?.days || []);
        for (const day of allDaysToSearch) {
            const reasons: string[] = [];
            const gregorianDateString = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2, '0')}-${day.gregorian.day.padStart(2, '0')}`;
            if(filters.showNationalHolidays) { const nationalHoliday = nationalHolidays[gregorianDateString]; if (nationalHoliday && nationalHoliday.toLowerCase().includes(query)) reasons.push(nationalHoliday); }
            const hijriHoliday = hijriHolidays.get(day.hijri.date); if (hijriHoliday && hijriHoliday.toLowerCase().includes(query)) reasons.push(hijriHoliday);
            if(filters.showCustomEvents) { const customEventForDay = customEvents.filter(e => e.gregorianDate === gregorianDateString); customEventForDay.forEach(event => { if(event.text.toLowerCase().includes(query)) reasons.push(`Catatan: ${event.text}`); }); }
            if(filters.showCustomHijriEvents) { const customHijriEventForDay = customHijriEvents.filter(e => e.hijriDay === parseInt(day.hijri.day) && e.hijriMonth === day.hijri.month.number && (e.isRecurring || e.hijriYear === parseInt(day.hijri.year))); customHijriEventForDay.forEach(event => { if (event.name.toLowerCase().includes(query)) reasons.push(`Catatan: ${event.name}`); }); }
            const fastingInfo = getFastingInfo(day); if (fastingInfo.isFasting && fastingInfo.type.toLowerCase().includes(query)) reasons.push(fastingInfo.type);
            if (reasons.length > 0) results.push({ day, reason: reasons.join(', ') });
        }
        setSearchResults(results);
    };

    const SearchResultsModal: React.FC<{ results: ({ day: Day, reason: string })[]; onClose: () => void; onJumpToDate: (date: Date) => void; }> = ({ results, onClose, onJumpToDate }) => (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-28 sm:pt-36 z-50 fade-in" onClick={onClose}>
            <div className="main-container cyber-border rounded-lg p-6 w-full max-w-sm relative mb-8 bounce-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
                <h3 className="font-bold text-lg mb-4 neon-text text-center">Hasil Pencarian</h3>
                {results.length > 0 ? (
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {results.map(({ day, reason }, index) => {
                            const date = new Date(parseInt(day.gregorian.year), day.gregorian.month.number - 1, parseInt(day.gregorian.day));
                            return (
                                <li key={index} onClick={() => onJumpToDate(date)} className="p-2 bg-black/20 rounded-md cursor-pointer hover:bg-[var(--border-color)]/20 transition-colors">
                                    <p className="font-bold text-sm">{date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="text-xs text-gray-300">{reason}</p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (<p className="text-center text-gray-400">Tidak ada hasil yang ditemukan.</p>)}
            </div>
        </div>
    );

    const retryCalendar = () => { playClickSound(); loadCalendarData(); };
    const retryPrayer = () => { playClickSound(); fetchPrayerData(); };
    const retryHolidays = () => { playClickSound(); fetchHolidaysData(); };

    const renderContent = () => {
        if (loading && calendarView !== 'yearly' && !calendarData) { return <CalendarSkeletonLoader />; }
        if (!today) { if (!loading && errors.calendar) return null; return <CalendarSkeletonLoader />; }
        
        const getCalendarTitle = () => {
            if (calendarView === 'yearly') {
                return <span className="text-2xl font-bold">{viewDate.getFullYear()}</span>;
            }
            if (calendarView === 'daily') {
                const dayInView = calendarData?.days.find(d => 
                    parseInt(d.gregorian.day) === viewDate.getDate() &&
                    d.gregorian.month.number === (viewDate.getMonth() + 1)
                ) || today;
                
                if (!dayInView) return null;

                const hijriDateStr = `${dayInView.hijri.day} ${translateToIndonesian(dayInView.hijri.month.en, 'hijri')} ${dayInView.hijri.year} H`;
                const gregorianDateStr = `${dayInView.gregorian.day} ${translateToIndonesian(dayInView.gregorian.month.en, 'gregorian')} ${dayInView.gregorian.year}`;

                return (
                    <>
                        <span className="text-lg text-[var(--header-hijri-text-color)]">{hijriDateStr}</span>
                        <p className="text-xl font-bold text-[var(--header-gregorian-text-color)]">{gregorianDateStr}</p>
                    </>
                );
            }
            if (calendarView === 'weekly' && currentWeekDays.length > 0) {
                const startDay = currentWeekDays[0];
                const endDay = currentWeekDays[currentWeekDays.length - 1];
                const startMonth = translateToIndonesian(startDay.gregorian.month.en, 'gregorian');
                const endMonth = translateToIndonesian(endDay.gregorian.month.en, 'gregorian');
                const hijriStart = startDay.hijri;
                const hijriEnd = endDay.hijri;
                
                const hijriTitle = hijriStart.month.en !== hijriEnd.month.en 
                    ? `${translateToIndonesian(hijriStart.month.en, 'hijri')} - ${translateToIndonesian(hijriEnd.month.en, 'hijri')} ${hijriEnd.year} H`
                    : `${translateToIndonesian(hijriStart.month.en, 'hijri')} ${hijriStart.year} H`;

                const gregorianTitle = startMonth === endMonth
                    ? `${startDay.gregorian.day} - ${endDay.gregorian.day} ${startMonth} ${endDay.gregorian.year}`
                    : `${startDay.gregorian.day} ${startMonth} - ${endDay.gregorian.day} ${endMonth} ${endDay.gregorian.year}`;

                return (
                    <>
                        <span className="text-lg text-[var(--header-hijri-text-color)]">{hijriTitle}</span>
                        <p className="text-xl font-bold text-[var(--header-gregorian-text-color)]">{gregorianTitle}</p>
                    </>
                );
            }
            if (calendarData) {
                const startHijri = calendarData.days[0].hijri;
                const endHijri = calendarData.days[calendarData.days.length - 1].hijri;
                
                const hijriTitle = startHijri.month.en !== endHijri.month.en 
                    ? `${translateToIndonesian(startHijri.month.en, 'hijri')} - ${translateToIndonesian(endHijri.month.en, 'hijri')} ${endHijri.year} H`
                    : `${translateToIndonesian(startHijri.month.en, 'hijri')} ${startHijri.year} H`;

                 return (
                     <>
                        <span className="text-lg text-[var(--header-hijri-text-color)]">{hijriTitle}</span>
                        <p className="text-2xl font-bold text-[var(--header-gregorian-text-color)]">{translateToIndonesian(calendarData.gregorianMonthName, 'gregorian')} {calendarData.days[0].gregorian.year}</p>
                     </>
                );
            }
            return 'Loading...';
        };
        const isRamadan = today?.hijri.month.number === 9;

        const currentDayData = calendarView === 'daily' && calendarData 
            ? calendarData.days.find(d => parseInt(d.gregorian.day) === viewDate.getDate()) 
            : null;

        return (
            <>
                <HeaderInfo today={today} />
                 {isRamadan && (
                    <div className="marquee-ramadan text-sm my-2">
                        <span>Marhaban ya Ramadhan... Selamat menunaikan ibadah puasa. Semoga bulan yang suci ini membawa berkah dan ampunan untuk kita semua.</span>
                    </div>
                )}
                
                <div id="calendar-view" className={calendarAnimationClass}>
                    {/* Filter Tampilan */}
                    {!isReadingMode && ['monthly', 'weekly', 'daily'].includes(calendarView) && (
                        <div className="flex flex-wrap justify-center gap-3 text-xs my-2 px-2 text-gray-300">
                            <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={filters.showCustomEvents} onChange={(e) => handleFilterChange({ showCustomEvents: e.target.checked })}/><span>Catatan Masehi</span></label>
                            <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={filters.showCustomHijriEvents} onChange={(e) => handleFilterChange({ showCustomHijriEvents: e.target.checked })}/><span>Catatan Hijriah</span></label>
                            <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={filters.showNationalHolidays} onChange={(e) => handleFilterChange({ showNationalHolidays: e.target.checked })}/><span>Libur Nasional</span></label>
                        </div>
                    )}

                    <div className="flex justify-between items-center px-2 my-2 flex-wrap gap-2">
                         <div className="flex items-center space-x-2 flex-wrap">
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-400">format :</span>
                                <select value={calendarFormat} onChange={(e) => setCalendarFormat(e.target.value as CalendarFormat)} className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white">
                                    <option value="hijri-masehi">Hijriah & Masehi</option>
                                    <option value="hijri">Hijriah</option>
                                    <option value="masehi">Masehi</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-400">tampilan :</span>
                                <select value={calendarView} onChange={(e) => setCalendarView(e.target.value as CalendarView)} className="bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white">
                                    <option value="daily">Harian</option>
                                    <option value="weekly">Mingguan</option>
                                    <option value="monthly">Bulanan</option>
                                    <option value="yearly">Tahunan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center my-2 px-2 ${isReadingMode ? 'justify-center' : 'justify-between'}`}>
                        {!isReadingMode && (
                            <button onClick={() => handleNavigation(-1)} className="p-2 bg-gradient-to-r from-[#00FFDF] to-[#0065AD] text-white font-bold rounded-md neon-button flex items-center justify-center w-10 h-10 sm:w-12 sm:h-10">
                                <ChevronLeftIcon />
                            </button>
                        )}
                        <div className="text-center font-jannah flex flex-col items-center">
                           {getCalendarTitle()}
                        </div>
                         {!isReadingMode && (
                            <button onClick={() => handleNavigation(1)} className="p-2 bg-gradient-to-r from-[#00FFDF] to-[#0065AD] text-white font-bold rounded-md neon-button flex items-center justify-center w-10 h-10 sm:w-12 sm:h-10">
                                <ChevronRightIcon />
                            </button>
                        )}
                    </div>

                    {calendarView === 'yearly' ? (
                        <YearlyView 
                            yearData={yearlyCalendarData}
                            todayHijriDate={today.hijri.date}
                            customEvents={filteredCustomEvents}
                            customHijriEvents={filteredCustomHijriEvents}
                            nationalHolidays={filteredNationalHolidays}
                            onMonthClick={(monthDate) => {
                                setViewDate(monthDate);
                                setCalendarView('monthly');
                            }}
                            isLoading={loading}
                        />
                    ) : calendarView === 'daily' && currentDayData ? (
                        <DailyView 
                            day={currentDayData} 
                            format={calendarFormat} 
                            onDayClick={handleDayClick}
                            customEvents={filteredCustomEvents}
                            customHijriEvents={filteredCustomHijriEvents}
                            nationalHolidays={filteredNationalHolidays}
                            hijriHolidays={hijriHolidays}
                        />
                    ) : (
                        calendarData && (
                            <CalendarGrid 
                                days={calendarView === 'monthly' ? calendarData.days : currentWeekDays}
                                view={calendarView === 'weekly' ? 'weekly' : 'monthly'}
                                todayHijriDate={today.hijri.date} 
                                onDayClick={handleDayClick} 
                                customEvents={filteredCustomEvents}
                                customHijriEvents={filteredCustomHijriEvents}
                                nationalHolidays={filteredNationalHolidays}
                                hijriHolidays={hijriHolidays}
                                calendarFormat={calendarFormat}
                            />
                        )
                    )}

                    {errors.holidays && !isReadingMode && (
                        <div className="text-center text-yellow-400 text-xs p-2 bg-black/30 rounded-md my-2 mx-2">
                            {errors.holidays}
                            <button onClick={retryHolidays} className="ml-2 underline font-bold">Coba Lagi</button>
                        </div>
                    )}
                    {['monthly', 'weekly'].includes(calendarView) && (
                        <>
                            <Legend />
                            <HolidayCountrySelector settings={userSettings} onSettingsChange={handleUpdateSettings} />
                        </>
                    )}
                    {!isReadingMode && (
                        <>
                            <div className="border-t border-[var(--border-color)]/20 my-4"></div>
                            <CurrentTimeClock />
                            <WeatherWidget locationName={locationName} />
                            <PrayerInfo 
                                prayerTimes={prayerTimes} 
                                nextPrayer={nextPrayer} 
                                locationName={locationName} 
                                error={errors.prayer} 
                                onRetry={retryPrayer}
                                adhanAlarms={adhanAlarms}
                                onToggleAdhanAlarm={handleToggleAdhanAlarm}
                                onPlayAdhan={playAdhan}
                                selectedAdhan={selectedAdhan}
                                onAdhanChange={handleAdhanChange}
                                userSettings={userSettings}
                                onSettingsChange={handleUpdateSettings}
                            />
                            <div className="my-6">
                                <DateConverter />
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }
    
    if (showWelcome) {
        return <WelcomeScreen onDismiss={() => setShowWelcome(false)} />;
    }

    return (
        <>
            <MatrixBackground theme={theme} />
            {activeAlarm && <ActiveAlarmPopup alarm={activeAlarm} onDismiss={() => setActiveAlarm(null)} />}
            {theme === 'theme-ramadan' && <RamadanContainer />}
            <div className="min-h-screen bg-transparent p-2 sm:p-4 font-jannah fade-in">
                <div ref={mainContainerRef} className="main-container relative w-full md:max-w-3xl lg:max-w-4xl mx-auto backdrop-blur-sm cyber-border p-2 sm:p-4 rounded-lg transition-all duration-300">
                     {searchResults && <SearchResultsModal results={searchResults} onClose={() => setSearchResults(null)} onJumpToDate={(date) => { handleDateJump(date); setSearchResults(null); }} />}
                    <Settings 
                        isOpen={isSettingsOpen && !isReadingMode} 
                        onClose={() => setIsSettingsOpen(false)}
                        theme={theme}
                        onThemeChange={setTheme}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        settings={userSettings}
                        onSettingsChange={handleUpdateSettings}
                        onDateJump={handleDateJump}
                        isReadingMode={isReadingMode}
                        onReadingModeChange={setIsReadingMode}
                        alarms={alarms}
                        onToggleAlarm={handleToggleAlarm}
                        onAlarmTimeChange={handleAlarmTimeChange}
                        alarmSound={alarmSound}
                        onAlarmSoundChange={setAlarmSound}
                        playAlarmSound={playAlarmSound}
                    />
                    <ShareModal 
                        isOpen={isShareModalOpen && !isReadingMode} 
                        onClose={() => setIsShareModalOpen(false)} 
                        targetRef={mainContainerRef} 
                        calendarData={calendarData}
                        yearlyCalendarData={yearlyCalendarData}
                        viewDate={viewDate}
                        today={today}
                        prayerTimes={prayerTimes}
                        nextPrayer={nextPrayer}
                        locationName={locationName}
                        customEvents={filteredCustomEvents}
                        nationalHolidays={filteredNationalHolidays}
                        userSettings={userSettings}
                    />
                    <ContactUsModal isOpen={isContactModalOpen && !isReadingMode} onClose={() => setIsContactModalOpen(false)} />
                    {infoModalContent && <InfoModal title={infoModalContent.title} content={infoModalContent.content} isList={infoModalContent.isList} onClose={() => setInfoModalContent(null)} onBack={infoModalContent.parentKey ? handleOpenInfo.bind(null, infoModalContent.parentKey) : undefined} />}
                    {selectedDay && <DateDetailModal 
                        isOpen={isDetailModalOpen} 
                        onClose={() => setIsDetailModalOpen(false)} 
                        day={selectedDay}
                        events={customEvents.filter(e => e.gregorianDate === `${selectedDay.gregorian.year}-${String(selectedDay.gregorian.month.number).padStart(2,'0')}-${selectedDay.gregorian.day.padStart(2,'0')}`)}
                        onAddEvent={handleAddEvent}
                        onDeleteEvent={handleDeleteEvent}
                        onUpdateEvent={handleUpdateEvent}
                        customHijriEvents={customHijriEvents.filter(e => 
                            e.hijriDay === parseInt(selectedDay.hijri.day) &&
                            e.hijriMonth === selectedDay.hijri.month.number &&
                            (e.isRecurring || e.hijriYear === parseInt(selectedDay.hijri.year))
                        )}
                        onAddHijriEvent={handleAddHijriEvent}
                        onUpdateHijriEvent={handleUpdateHijriEvent}
                        onDeleteHijriEvent={handleDeleteHijriEvent}
                        fastingInfo={selectedDayFastingInfo}
                        onOpenInfo={handleOpenInfo}
                        nationalHoliday={filteredNationalHolidays[`${selectedDay.gregorian.year}-${String(selectedDay.gregorian.month.number).padStart(2,'0')}-${selectedDay.gregorian.day.padStart(2,'0')}`]}
                        hijriHoliday={hijriHolidays.get(selectedDay.hijri.date)}
                        infoTypeKey={selectedDayInfoKey}
                    />}
                    {location && <QiblaCompass isOpen={isQiblaModalOpen && !isReadingMode} onClose={() => setIsQiblaModalOpen(false)} location={location} />}
                    
                    {!isReadingMode && (
                        <>
                            <header className="flex justify-between items-center mb-4 relative">
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => { playClickSound(); setIsSettingsOpen(prev => !prev); }} className="p-2"><SettingsIcon /></button>
                                    <button onClick={() => { playClickSound(); setIsQiblaModalOpen(prev => !prev); }} className="p-2 text-2xl">
                                        <span>🕋</span>
                                    </button>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-center">Kalender Hijriah</h1>
                                <div className="flex items-center space-x-1">
                                <button onClick={() => setIsSearchVisible(v => !v)} className="p-2"><SearchIcon /></button>
                                <button onClick={() => { playClickSound(); setIsMenuOpen(prev => !prev); }} className="p-2"><MenuIcon /></button>
                                <DropdownMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onAction={handleMenuClick}/>
                                </div>
                            </header>

                            <div className={`header-search-container ${isSearchVisible ? 'visible' : ''}`}>
                                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 pb-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari acara, hari libur, puasa..."
                                        className="flex-1 bg-gray-800 border border-[var(--border-color)]/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-color)]"
                                    />
                                    <button type="submit" className="bg-cyan-600 text-white p-2 rounded-lg neon-button">
                                        <SearchIcon className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                            
                            <div className="marquee text-sm my-2">
                            <span>Untuk mendapatkan hasil perhitungan tanggal Hijriah dan jadwal shalat yang akurat, pastikan settingan lokasi di device sudah di aktifkan (status on). Untuk informasi selengkapnya klik masing-masing icon di bagian atas</span>
                            </div>
                        </>
                    )}
                    
                    <main className="mb-4">
                         {errors.calendar ? (
                            <div className="text-center text-yellow-300 bg-black/50 p-4 rounded-lg my-4 flex flex-col items-center space-y-3">
                                <h4 className="font-bold text-lg">Gagal Memuat Kalender</h4>
                                <span>{errors.calendar}</span>
                                <button onClick={retryCalendar} className="px-4 py-2 text-sm bg-cyan-600 rounded-md neon-button">
                                    Coba Lagi
                                </button>
                            </div>
                         ) : (
                            renderContent()
                         )}
                    </main>

                    {!isReadingMode && (
                        <>
                            {countdownTarget && <CountdownTimer target={countdownTarget} selectedEvent={selectedCountdownEvent} onEventChange={setSelectedCountdownEvent} />}
                            <div className="px-2 sm:px-0">
                                <DailyFact fact={dailyFact} />
                            </div>

                            <footer className="text-center text-xs mt-6 space-y-4">
                                <div>
                                    <a href="https://sociabuzz.com/syukrankatsiron/tribe" target="_blank" rel="noopener noreferrer" 
                                        className="inline-block px-8 py-3 rounded-lg font-bold text-white transition-transform transform hover:scale-105" 
                                        style={{ backgroundColor: '#7be300', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                                        Support us 🙏
                                    </a>
                                </div>
                                <div>
                                    <a href="https://ko-fi.com/syukran/tip" target="_blank" rel="noopener noreferrer" 
                                    className="inline-block">
                                    <img src="https://raw.githubusercontent.com/vandratop/Yuk/872daa6f963613ba58fc4ff71f886beed94ff15d/support_me_on_kofi_beige.png" alt="Buy Me a Ko-fi" className="h-10"/>
                                    </a>
                                </div>
                                <div className="mt-4">
                                    <a href="mailto:hijr.time@gmail.com" 
                                        className="inline-flex items-center justify-center space-x-2 text-base text-[var(--text-color-light)] hover:text-[var(--text-color-secondary)]">
                                        <ContactIcon className="w-5 h-5" />
                                        <span>Hubungi Kami</span>
                                    </a>
                                </div>
                                <p className="animate-pulse">by Te_eR Inovative @ {new Date().getFullYear()}</p>
                            </footer>
                        </>
                    )}
                </div>
            </div>
            {isReadingMode && (
                 <button
                    onClick={() => { playClickSound(); setIsReadingMode(false); }}
                    className="fixed bottom-4 right-4 z-30 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg neon-button-exit animate-pulse"
                    aria-label="Exit Reading Mode"
                >
                    <CloseIcon />
                    <span>Keluar</span>
                </button>
            )}
            {!isReadingMode && location && <ChatBot location={location} prayerTimes={prayerTimes} sahurPopupText={activeAlarm?.name === 'sahur' ? activeAlarm.text : null} isOpen={isChatBotOpen} setIsOpen={setIsChatBotOpen} initialMessage={chatBotInitialMessage} onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)} />}
            <VoiceAssistant isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} />
             {!isChatBotOpen && !isReadingMode && (
                <div className="chatbot-cta-container">
                    <button
                        onClick={() => { playClickSound(); setIsChatBotOpen(true); }}
                        className="chatbot-icon-button"
                        aria-label="Open Chat"
                    >
                        <img src="https://raw.githubusercontent.com/vandratop/Yuk/3ca087bbe1dfa3822dc66f60ba3f8c2cdf0772b0/AI-HIJR_Chatbot.gif" alt="AI Hijr Assistant" />
                    </button>
                    <p className="chatbot-cta-text">Yuk, Tanya AI-HIJR</p>
                </div>
            )}
        </>
    );
};

export default App;
