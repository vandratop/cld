
import React, { RefObject, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { CloseIcon, PinIcon, PrintIcon, QRCodeIcon, ShareIcon } from './Icons';
import type { CalendarData, Day, PrayerTimes, NextPrayer, CustomEvent, UserSettings, MonthlyPrayerDay, CountdownTarget } from '../types';
import { CountdownEvent } from '../types';
import { HeaderInfo } from './HeaderInfo';
import { CalendarGrid } from './CalendarGrid';
import { YearlyView } from './YearlyView';
import { DailyView } from './DailyView';
import { fetchMonthlyPrayerCalendar, getSpecificCountdownTarget } from '../services/calendarService';
import { translateToIndonesian } from '../utils';

declare const html2canvas: any;
declare const QRCode: any;

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetRef: RefObject<HTMLDivElement>;
    calendarData: CalendarData | null;
    yearlyCalendarData: (CalendarData | null)[];
    viewDate: Date;
    today: Day | null;
    prayerTimes: PrayerTimes | null;
    nextPrayer: NextPrayer;
    locationName: string | null;
    customEvents: CustomEvent[];
    nationalHolidays: { [date: string]: string };
    userSettings: UserSettings;
}

type ShareMode = 
    | { type: 'monthlyCalendar' }
    | { type: 'dailyCalendar' }
    | { type: 'yearlyCalendar' }
    | { type: 'dailyPrayer' }
    | { type: 'monthlyPrayer' }
    | { type: 'countdown', event: CountdownEvent };

// --- Reusable Components for Shareable Views ---

const Legend: React.FC<{ isPrintable?: boolean }> = ({ isPrintable = false }) => (
    <div className={`text-xs space-y-2 mt-4 font-jannah px-2 ${isPrintable ? 'text-black' : ''}`}>
        <h3 className="font-bold text-sm">Keterangan:</h3>
        <div className="flex items-center"><div className="w-3 h-3 bg-[#FF3131] mr-2"></div><span>Hari Raya (Tahun Baru, Idul Fitri, Idul Adha) dan Hari Libur Nasional</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-[#009688] mr-2"></div><span>Puasa Ramadhan</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-[#0D00FF] mr-2"></div><span>Puasa Sunnah Ayyamul Bidh</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-[#21DEC4] mr-2"></div><span>Puasa Sunnah Senin - Kamis</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-[#1FCB0A] mr-2"></div><span>Puasa Sunnah Lainnya (Syawal, Arafah, dll.)</span></div>
        <p className="text-[10px] italic mt-2">
            Untuk Penentuan jadwal Puasa Ramadhan, Hari Raya Idul Fitri dan Idul Adha berdasarkan sidang isbath dari Pemerintah, kemungkinan akan ada perbedaan penentuan tanggal antara di kalender Masehi dan Kalender Hijriah.
        </p>
    </div>
);

const ShareableDailyPrayer: React.FC<Pick<ShareModalProps, 'today' | 'prayerTimes' | 'nextPrayer' | 'locationName'>> = ({ today, prayerTimes, nextPrayer, locationName }) => {
    if (!today || !prayerTimes) return <div className="text-center p-4">Data tidak tersedia.</div>;

    const prayerNames: (keyof PrayerTimes)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return (
        <div className="p-4 flex flex-col font-jannah text-white">
            <HeaderInfo today={today} />
            <div className="mt-4">
                <p className="text-center text-lg font-bold">Jadwal Shalat</p>
                <div className="mt-2 flex flex-col gap-2">
                    {prayerNames.map(name => (
                        <div key={name} className="flex justify-between items-center p-3 rounded-md cyber-border bg-[rgba(var(--container-bg-rgb),0.5)]">
                            <span className="text-lg uppercase font-bold text-[var(--text-color-secondary)]">{name === 'Sunrise' ? 'Syuruk' : name}</span>
                            <span className="font-clock text-2xl">{prayerTimes[name]}</span>
                        </div>
                    ))}
                </div>
                {nextPrayer.name && (
                    <p className="text-center text-sm text-[var(--text-color-muted)] mt-4 animate-pulse">
                        {`Sisa waktu menuju jadwal shalat terdekat ${nextPrayer.name === 'Sunrise' ? 'Syuruk' : nextPrayer.name} [${nextPrayer.countdown}]`}
                    </p>
                )}
                {locationName && (
                    <p className="text-center text-xs text-white/80 mt-1">Lokasi terdeteksi: {locationName}</p>
                )}
            </div>
        </div>
    );
};

const ShareableMonthlyPrayer: React.FC<{ data: MonthlyPrayerDay[], locationName: string, viewDate: Date }> = ({ data, locationName, viewDate }) => {
    const monthName = translateToIndonesian(data[0].date.gregorian.month.en, 'gregorian');
    const year = data[0].date.gregorian.year;

    return (
        <div className="p-4 font-jannah text-white">
            <h3 className="text-2xl font-bold text-center text-[var(--text-color-secondary)]">Jadwal Shalat Bulanan</h3>
            <p className="text-center text-lg">{`${monthName} ${year}`}</p>
            <p className="text-center text-sm mb-4">{locationName}</p>
            <table className="w-full text-center text-xs text-black bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                    <tr>
                        {['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(h => (
                            <th key={h} className="p-2 border border-gray-300">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(day => (
                        <tr key={day.date.readable} className="border-b border-gray-300">
                            <td className="p-2 border border-gray-300">{day.date.gregorian.day}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Fajr?.split(' ')[0]}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Sunrise?.split(' ')[0]}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Dhuhr?.split(' ')[0]}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Asr?.split(' ')[0]}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Maghrib?.split(' ')[0]}</td>
                            <td className="p-2 font-clock border border-gray-300">{day.timings.Isha?.split(' ')[0]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const useCountdown = (targetDate: Date | null) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const calculate = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };
        const timer = setInterval(calculate, 1000);
        calculate();
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};

const padZero = (num: number) => num.toString().padStart(2, '0');

const ShareableCountdown: React.FC<{ today: Day, target: CountdownTarget | null }> = ({ today, target }) => {
    const timeLeft = useCountdown(target?.date || null);
    if (!target) return <div className="text-center p-4">Memuat data hitung mundur...</div>;

    const MARQUEE_TEXTS: { [key in CountdownEvent]?: string } = {
        [CountdownEvent.RAMADAN]: "persiapkan diri, iman dan ketakwaan menyambut bulan Suci Ramadhan",
        [CountdownEvent.EID_AL_FITR]: "Menyambut hari kemenangan, sucikan hati di Hari Raya Idul Fitri",
        [CountdownEvent.EID_AL_ADHA]: "Meneladani pengorbanan Nabi Ibrahim Alaihis Salam di Hari Raya Idul Adha",
        [CountdownEvent.HIJRI_NEW_YEAR]: "Membuka lembaran baru dengan semangat hijrah di Tahun Baru Hijriah",
    };

    return (
        <div className="p-4 font-jannah text-white">
            <HeaderInfo today={today} />
            <div className="mt-4">
                <p className="text-center text-sm">Menuju: <span className="font-bold">{target.event}</span></p>
                <p className="text-center text-lg font-bold text-yellow-300 h-8 my-2">{MARQUEE_TEXTS[target.event]}</p>
                <div className="flex justify-around my-4">
                    <div className="flex flex-col items-center">
                        <div className="countdown-box font-clock text-4xl neon-text-white rounded-lg px-2 py-1 w-20 text-center cyber-border">{padZero(timeLeft.days)}</div>
                        <div className="text-xs uppercase mt-1">Hari</div>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="countdown-box font-clock text-4xl neon-text-white rounded-lg px-2 py-1 w-20 text-center cyber-border">{padZero(timeLeft.hours)}</div>
                        <div className="text-xs uppercase mt-1">Jam</div>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="countdown-box font-clock text-4xl neon-text-white rounded-lg px-2 py-1 w-20 text-center cyber-border">{padZero(timeLeft.minutes)}</div>
                        <div className="text-xs uppercase mt-1">Menit</div>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="countdown-box font-clock text-4xl neon-text-white rounded-lg px-2 py-1 w-20 text-center cyber-border">{padZero(timeLeft.seconds)}</div>
                        <div className="text-xs uppercase mt-1">Detik</div>
                    </div>
                </div>
                 <p className="text-center text-xs text-[var(--text-color-muted)] mt-4 animate-pulse">Perkiraan waktu menuju {target.event}</p>
            </div>
        </div>
    );
};

const ShareableComponent: React.FC<Omit<ShareModalProps, 'isOpen'|'onClose'|'targetRef'> & { 
    shareMode: ShareMode,
    monthlyPrayerData: MonthlyPrayerDay[] | null;
    shareCountdownTarget: CountdownTarget | null;
}> = (props) => {
    const { shareMode, monthlyPrayerData, shareCountdownTarget } = props;
    if (!props.today) return null;

    let content: React.ReactNode = null;
    let containerWidth = '480px';
    
    // Explicit background to ensure capture works correctly without transparency
    const containerStyle: React.CSSProperties = {
         width: containerWidth, 
         backgroundColor: '#002b25', // Default dark for capture safety
         color: '#ffffff',
         fontFamily: "'Exo 2', sans-serif",
         position: 'relative',
         padding: '20px'
    };

    switch (shareMode.type) {
        case 'monthlyCalendar':
            if (props.calendarData) {
                containerWidth = '480px';
                containerStyle.width = containerWidth;
                content = <>
                    {<HeaderInfo today={props.today} />}
                    <CalendarGrid 
                        days={props.calendarData.days} view="monthly" todayHijriDate={props.today.hijri.date} onDayClick={() => {}} customEvents={props.customEvents} customHijriEvents={[]}
                        nationalHolidays={props.nationalHolidays} isPrintable={true} hijriHolidays={new Map()} />
                    <Legend isPrintable={true} />
                </>;
            }
            break;
        case 'dailyCalendar':
             if (props.calendarData) {
                 // find today in data
                 const todayInCal = props.calendarData.days.find(d => d.gregorian.date === props.today!.gregorian.date) || props.today;
                 containerWidth = '400px';
                 containerStyle.width = containerWidth;
                 content = (
                     <DailyView 
                         day={todayInCal}
                         format="hijri-masehi"
                         onDayClick={() => {}}
                         customEvents={props.customEvents}
                         customHijriEvents={[]}
                         nationalHolidays={props.nationalHolidays}
                         hijriHolidays={new Map()}
                     />
                 );
             }
             break;
        case 'yearlyCalendar':
            containerWidth = '800px';
            containerStyle.width = containerWidth;
            // Override styles for larger fonts in Yearly view share
            content = <>
                <h2 className="text-4xl font-bold text-center my-4 text-[#00ffdf]">{props.viewDate.getFullYear()}</h2>
                <div className="text-xl"> {/* wrapper to bump up font size inside grid */}
                    <YearlyView yearData={props.yearlyCalendarData} todayHijriDate={props.today.hijri.date} customEvents={props.customEvents} customHijriEvents={[]}
                        nationalHolidays={props.nationalHolidays} onMonthClick={() => {}} isLoading={false} isPrintable={true} />
                </div>
                <Legend isPrintable={true} />
            </>;
            break;
        case 'dailyPrayer':
            containerWidth = '400px';
            containerStyle.width = containerWidth;
            content = <ShareableDailyPrayer {...props} />;
            break;
        case 'monthlyPrayer':
            if (monthlyPrayerData) {
                containerWidth = '800px';
                containerStyle.width = containerWidth;
                content = <ShareableMonthlyPrayer data={monthlyPrayerData} locationName={props.locationName || ''} viewDate={props.viewDate} />;
            }
            break;
        case 'countdown':
            containerWidth = '420px';
            containerStyle.width = containerWidth;
            content = <ShareableCountdown today={props.today} target={shareCountdownTarget} />;
            break;
    }

    return (
        <div style={containerStyle}>
            <div className="main-container cyber-border p-4 rounded-lg" style={{ backgroundColor: `rgba(0, 89, 76, 1)`, boxShadow: 'none' }}>
               {content}
               <p className="text-center text-xs mt-4 text-[#00ffdf]">by Te_eR Inovative @ {new Date().getFullYear()} | Digital Kalender Hijriah</p>
            </div>
        </div>
    );
};


export const ShareModal: React.FC<ShareModalProps> = (props) => {
    const { isOpen, onClose, viewDate, locationName, userSettings, today } = props;
    const [isProcessing, setIsProcessing] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [shareMode, setShareMode] = useState<ShareMode>({ type: 'monthlyCalendar' });
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const [monthlyPrayerData, setMonthlyPrayerData] = useState<MonthlyPrayerDay[] | null>(null);
    const [isMonthlyPrayerLoading, setIsMonthlyPrayerLoading] = useState(false);
    const [shareCountdownTarget, setShareCountdownTarget] = useState<CountdownTarget | null>(null);
    const [isCountdownLoading, setIsCountdownLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen && shareMode.type === 'monthlyPrayer' && !monthlyPrayerData) {
            const fetch = async () => {
                if (!locationName) {
                    alert('Lokasi tidak terdeteksi. Silakan atur lokasi manual di pengaturan.');
                    return;
                }
                setIsMonthlyPrayerLoading(true);
                try {
                    const locationParts = locationName.split(', ');
                    const city = locationParts[0];
                    const country = locationParts[1] || 'Indonesia'; // Fallback
                    const data = await fetchMonthlyPrayerCalendar(viewDate.getFullYear(), viewDate.getMonth() + 1, city, country, userSettings.prayerMethod);
                    setMonthlyPrayerData(data);
                } catch (e) {
                    console.error(e);
                    alert('Gagal memuat jadwal shalat bulanan.');
                } finally {
                    setIsMonthlyPrayerLoading(false);
                }
            };
            fetch();
        }
        if (isOpen && shareMode.type === 'countdown' && !shareCountdownTarget) {
            const fetch = async () => {
                if(!today) return;
                setIsCountdownLoading(true);
                try {
                    const target = await getSpecificCountdownTarget(shareMode.event, today.hijri);
                    setShareCountdownTarget(target);
                } catch (e) {
                     console.error(e);
                     alert('Gagal memuat data hitung mundur.');
                } finally {
                    setIsCountdownLoading(false);
                }
            };
            fetch();
        }
    }, [isOpen, shareMode, monthlyPrayerData, locationName, viewDate, userSettings, shareCountdownTarget, today]);


    const captureAndProcess = async (output: 'share' | 'print') => {
        if (isProcessing) return;

        setIsProcessing(true);
        setGeneratedImage(null);
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.zIndex = '-1';
        // Force a solid background for the container to avoid transparency issues
        tempContainer.style.backgroundColor = '#002b25'; 
        document.body.appendChild(tempContainer);
        
        try {
            const root = createRoot(tempContainer);
            flushSync(() => {
                root.render(<ShareableComponent {...props} shareMode={shareMode} monthlyPrayerData={monthlyPrayerData} shareCountdownTarget={shareCountdownTarget} />);
            });

            await new Promise(resolve => setTimeout(resolve, 800)); // wait for images and fonts

            const canvas = await html2canvas(tempContainer.firstChild as HTMLElement, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#002b25', // Explicitly set background color for the canvas
                logging: false,
                allowTaint: true,
                imageTimeout: 15000,
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

            if (output === 'print') {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write(`<html><head><title>Cetak Kalender ${viewDate.getFullYear()}</title></head><body style="margin:0;"><img src="${dataUrl}" style="width:100%;"></body></html>`);
                printWindow?.document.close();
                setTimeout(() => {
                    printWindow?.print();
                    // printWindow?.close(); // Optional: close automatically
                }, 500);
                resetAndClose();
            } else { // Share (preview)
                setGeneratedImage(dataUrl);
            }
            root.unmount();
            
        } catch (error) {
            console.error('Error processing:', error);
            alert('Gagal memproses gambar. Silakan coba lagi.');
        } finally {
            document.body.removeChild(tempContainer);
            setIsProcessing(false);
        }
    };

    const handleShareNow = async () => {
        if (!generatedImage || isProcessing) return;
        setIsProcessing(true);
        try {
            const blob = await (await fetch(generatedImage)).blob();
            const file = new File([blob], `kalender-hijriyah-${shareMode.type}.jpg`, { type: 'image/jpeg' });
            const shareTitle = `Kalender Hijriyah`;
            const shareText = `Lihat kalender Hijriyah ini!`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    files: [file],
                });
            } else {
                alert('Berbagi file tidak didukung di browser ini. Silakan unduh gambar.');
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
                console.log('Share action was cancelled or not allowed by the user.');
            } else {
                console.error('Error sharing:', error);
                alert('Gagal membagikan gambar.');
            }
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownloadNow = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `kalender-hijriyah-${shareMode.type}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateQrCode = async () => {
        if (typeof QRCode === 'undefined') {
            alert('QR Code library is not loaded yet. Please try again in a moment.');
            return;
        }
        setIsProcessing(true);
        try {
            const url = await QRCode.toDataURL(window.location.href, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.9,
                margin: 1,
                color: {
                    dark: document.body.classList.contains('light') ? '#004D40' : '#00ffdf',
                    light: '#00000000'
                }
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error('Failed to generate QR code', err);
            alert('Gagal membuat kode QR.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (!isOpen) return null;

    const resetAndClose = () => {
        setQrCodeUrl(null);
        setGeneratedImage(null);
        setMonthlyPrayerData(null);
        setShareCountdownTarget(null);
        setShareMode({ type: 'monthlyCalendar' });
        onClose();
    }
    
    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setMonthlyPrayerData(null); // Reset data when mode changes
        setShareCountdownTarget(null);

        if (value.startsWith('countdown_')) {
            const event = value.replace('countdown_', '') as CountdownEvent;
            setShareMode({ type: 'countdown', event });
        } else {
            setShareMode({ type: value as 'monthlyCalendar' | 'dailyCalendar' | 'yearlyCalendar' | 'dailyPrayer' | 'monthlyPrayer' });
        }
    };

    const renderContent = () => {
        if (isProcessing || isMonthlyPrayerLoading || isCountdownLoading) {
             return <div className="text-center my-4 animate-pulse">Mempersiapkan...</div>;
        }

        if (generatedImage) {
            return (
                <>
                    <h3 className="font-bold text-lg mb-2 neon-text text-center">Pratinjau & Bagikan</h3>
                    <div className="my-2 border border-[var(--border-color)]/20 rounded-lg p-1 bg-black/20 max-h-60 overflow-y-auto">
                        <img src={generatedImage} alt="Pratinjau Kalender" className="w-full rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button onClick={handleShareNow} disabled={isProcessing} className="w-full flex justify-center items-center space-x-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md disabled:opacity-50">
                            <ShareIcon className="w-5 h-5"/>
                            <span>{isProcessing ? '...' : 'Bagikan'}</span>
                        </button>
                         <button onClick={handleDownloadNow} className="w-full flex justify-center items-center space-x-2 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md">
                            <span>Unduh</span>
                         </button>
                    </div>
                    <button onClick={() => setGeneratedImage(null)} className="w-full text-center p-2 mt-2 text-sm text-gray-400 hover:text-white">
                        Kembali
                    </button>
                </>
            );
        }

        const currentShareValue = shareMode.type === 'countdown' ? `countdown_${shareMode.event}` : shareMode.type;

        return (
            <div>
                 <h3 className="font-bold text-lg mb-4 neon-text text-center">Bagikan & Cetak</h3>
                
                <div className="my-4 p-3 border border-[var(--border-color)]/20 rounded-lg space-y-3">
                    <h4 className="text-sm font-bold">Pilih Tampilan</h4>
                    <div>
                        <label htmlFor="shareView" className="block text-xs mb-1">Tampilan Kalender</label>
                         <select id="shareView" value={currentShareValue} onChange={handleModeChange} className="w-full bg-gray-700 border border-[var(--border-color)]/30 rounded px-2 py-1 text-xs text-white">
                            <option value="monthlyCalendar">Kalender Bulanan</option>
                            <option value="dailyCalendar">Kalender Harian</option>
                            <option value="yearlyCalendar">Kalender Tahunan</option>
                            <option value="dailyPrayer">Jadwal Shalat Hari Ini</option>
                            <option value="monthlyPrayer">Jadwal Shalat Bulanan</option>
                            <option value={`countdown_${CountdownEvent.RAMADAN}`}>Hitung Mundur: Ramadhan</option>
                            <option value={`countdown_${CountdownEvent.EID_AL_FITR}`}>Hitung Mundur: Idul Fitri</option>
                            <option value={`countdown_${CountdownEvent.EID_AL_ADHA}`}>Hitung Mundur: Idul Adha</option>
                            <option value={`countdown_${CountdownEvent.HIJRI_NEW_YEAR}`}>Hitung Mundur: Thn Baru Hijriah</option>
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => captureAndProcess('share')} className="w-full flex justify-center items-center space-x-2 p-2 bg-gray-600 hover:bg-cyan-500 text-white rounded-md">
                        <ShareIcon className="w-5 h-5"/>
                        <span>Pratinjau</span>
                     </button>
                      <button onClick={() => captureAndProcess('print')} className="w-full flex justify-center items-center space-x-2 p-2 bg-gray-600 hover:bg-cyan-500 text-white rounded-md">
                        <PrintIcon className="w-5 h-5"/>
                        <span>Cetak</span>
                     </button>
                </div>

                 <div className="border-t border-[var(--border-color)]/20 mt-4 pt-4">
                    <button onClick={handleGenerateQrCode} className="w-full flex justify-center items-center space-x-2 p-2 bg-gray-600 hover:bg-cyan-500 text-white rounded-md" disabled={!!qrCodeUrl || isProcessing}>
                       <QRCodeIcon className="w-5 h-5"/>
                       <span>Buat Kode QR</span>
                    </button>
                    {qrCodeUrl && (
                        <div className="mt-4 text-center fade-in">
                            <p className="text-xs mb-2">Pindai atau bagikan Kode QR ini:</p>
                            <div className="bg-white p-2 inline-block rounded-lg">
                                <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-40 h-40" />
                            </div>
                            <a 
                                href={qrCodeUrl} 
                                download="kalender-hijriyah-qr.png" 
                                className="block w-full mt-3 text-sm bg-cyan-600 text-white px-3 py-2 rounded hover:bg-cyan-500 neon-button"
                            >
                                Unduh Kode QR
                            </a>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-28 sm:pt-36 z-50 fade-in overflow-y-auto" onClick={resetAndClose}>
            <div className="main-container cyber-border rounded-lg p-6 w-full max-w-sm relative mb-8" onClick={(e) => e.stopPropagation()}>
                <button onClick={resetAndClose} className="absolute top-2 right-2 p-1"><CloseIcon /></button>
                {renderContent()}
            </div>
        </div>
    );
};
