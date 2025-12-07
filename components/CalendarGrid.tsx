
import React from 'react';
import type { Day, CustomEvent, CustomHijriEvent, CalendarFormat } from '../types';
import { WEEKDAY_MAP } from '../constants';
import { PinIcon, BookmarkIcon } from './Icons';

interface CalendarGridProps {
    days: Day[];
    view: 'monthly' | 'weekly';
    todayHijriDate: string;
    isPrintable?: boolean;
    onDayClick: (day: Day, infoKey: string | null) => void;
    customEvents: CustomEvent[];
    customHijriEvents: CustomHijriEvent[];
    nationalHolidays: { [date: string]: string };
    hijriHolidays: Map<string, string>;
    calendarFormat?: CalendarFormat;
}

export const getDayHighlightAndInfo = (day: Day, nationalHolidays: { [date: string]: string } = {}): { style: React.CSSProperties, title?: string, infoKey: string | null, indicator: 'islamic' | 'national' | null, collision: boolean } => {
    const { hijri, gregorian } = day;
    const hijriDay = parseInt(hijri.day, 10);
    const hijriMonth = hijri.month.number;
    
    const gregorianDateString = `${gregorian.year}-${String(gregorian.month.number).padStart(2, '0')}-${gregorian.day.padStart(2, '0')}`;
    const nationalHolidayName = nationalHolidays[gregorianDateString];

    let style: React.CSSProperties = { backgroundColor: 'transparent' };
    let title: string | undefined = undefined;
    let infoKey: string | null = null;
    let indicator: 'islamic' | 'national' | null = null;
    let collision = false; // To trigger red circle

    // 0. National Holidays (Red #FF3131) - High Priority Base
    if (nationalHolidayName) {
        title = nationalHolidayName;
        style.backgroundColor = '#FF3131'; 
        indicator = null; // Removed icon as per request
    }

    // 1. Major Islamic Holidays (Red #FF3131)
    if ((hijriMonth === 1 && hijriDay === 1)) {
        title = nationalHolidayName || "Tahun Baru Hijriah"; style.backgroundColor = '#FF3131'; infoKey = 'hari-raya-tahun-baru'; indicator = null; 
    } else if ((hijriMonth === 10 && (hijriDay === 1 || hijriDay === 2))) {
        title = nationalHolidayName || "Idul Fitri"; style.backgroundColor = '#FF3131'; infoKey = 'hari-raya-idul-fitri'; indicator = null; 
    } else if ((hijriMonth === 12 && hijriDay === 10)) {
        title = nationalHolidayName || "Idul Adha"; style.backgroundColor = '#FF3131'; infoKey = 'hari-raya-idul-adha'; indicator = null; 
    }
    // 2. Ramadan (Teal #009688)
    else if (hijriMonth === 9) { 
        if (nationalHolidayName) collision = true;
        title = "Puasa Ramadhan"; style.backgroundColor = '#009688'; infoKey = 'puasa-ramadhan';
    }
    // 3. Ayyamul Bidh (Blue #0D00FF) - EXCLUDING 13 Dzulhijjah
    else if (hijriDay >= 13 && hijriDay <= 15) { 
        // Exception for 13 Dzulhijjah (Tasyrik)
        if (hijriMonth === 12 && hijriDay === 13) {
             // Tasyrik logic handled in App.tsx / DateDetailModal usually, but we ensure no blue highlight here
             style.backgroundColor = 'transparent';
             if (nationalHolidayName) style.backgroundColor = '#FF3131'; // Revert to red if holiday
        } else {
            if (nationalHolidayName) collision = true;
            title = "Puasa Sunnah Ayyamul Bidh"; style.backgroundColor = '#0D00FF'; infoKey = 'puasa-ayyamul-bidh';
        }
    }
    // 4. Other Specific Sunnah Fasts (Green #1FCB0A)
    else if (hijriMonth === 12 && hijriDay === 9) { 
        if (nationalHolidayName) collision = true;
        title = "Puasa Arafah"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-arafah';
    }
    else if (hijriMonth === 1 && hijriDay === 9) { 
        if (nationalHolidayName) collision = true;
        title = "Puasa Tasu'a"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-tasua';
    }
    else if (hijriMonth === 1 && hijriDay === 10) {
        if (nationalHolidayName) collision = true;
        title = "Puasa Asyura"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-asyura';
    }
    else if (hijriMonth === 10 && hijriDay >= 2 && hijriDay <= 7) {
        if (nationalHolidayName) collision = true;
        title = "Puasa Syawal"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-syawal';
    }
    else if (hijriMonth === 12 && hijriDay >= 1 && hijriDay <= 8) { 
        if (nationalHolidayName) collision = true;
        title = "Puasa Awal Dzulhijjah"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-awal-dzulhijjah';
    }
     else if (hijriMonth === 8 && hijriDay >= 1 && hijriDay <= 12) {
        if (nationalHolidayName) collision = true;
        title = "Puasa Sunnah Sya'ban"; style.backgroundColor = '#1FCB0A'; infoKey = 'puasa-syaban';
    }
    // 5. Monday-Thursday (Light Teal #21DEC4) - Lowest priority
    else if (['Monday', 'Thursday'].includes(gregorian.weekday.en) && style.backgroundColor === 'transparent') {
        const isTashreeq = hijriMonth === 12 && (hijriDay >= 11 && hijriDay <= 13);
        // Also check collision if national holiday was set earlier but overwritten by transparent logic (unlikely in this flow but safe)
        if (nationalHolidayName) {
             collision = true;
             style.backgroundColor = '#21DEC4'; 
             title = "Puasa Senin-Kamis";
             infoKey = 'puasa-senin-kamis';
        } else if(!isTashreeq) {
           title = "Puasa Senin-Kamis"; style.backgroundColor = '#21DEC4'; infoKey = 'puasa-senin-kamis';
        }
    }

    if (style.backgroundColor !== 'transparent') {
        style.color = '#FFFFFF';
    }

    return { style, title, infoKey, indicator, collision };
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({ days, view, todayHijriDate, isPrintable = false, onDayClick, customEvents, customHijriEvents, nationalHolidays, hijriHolidays, calendarFormat = 'hijri-masehi' }) => {
    const weekDays = ['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    const bodyClasses = document.body.className;
    const isSpecialLightTheme = 
        bodyClasses.includes('theme-kiswah-light') ||
        bodyClasses.includes('theme-yellow-light') ||
        bodyClasses.includes('theme-blue-light') ||
        bodyClasses.includes('theme-pink-light') ||
        bodyClasses.includes('theme-brown-light') ||
        bodyClasses.includes('theme-purple-light');

    const firstDayOfMonthOffset = (view === 'monthly' && days.length > 0) ? (WEEKDAY_MAP[days[0].gregorian.weekday.en] ?? 0) : 0;

    const headerClassName = isPrintable 
        ? "p-2 text-xs font-bold bg-gray-200" 
        : "calendar-header p-2 text-xs font-bold rounded-t-md";

    return (
        <div className="grid grid-cols-7 gap-1 text-center font-jannah">
            {weekDays.map(day => (
                <div key={day} className={headerClassName}>{day}</div>
            ))}
            
            {view === 'monthly' && Array.from({ length: firstDayOfMonthOffset }).map((_, i) => (
                <div key={`empty-${i}`} className={isPrintable ? "border border-gray-300 aspect-square" : "border border-[var(--border-color)]/20 aspect-square"}></div>
            ))}

            {days.map(day => {
                const { style, title, indicator, infoKey, collision } = getDayHighlightAndInfo(day, nationalHolidays);
                const isToday = day.hijri.date === todayHijriDate && !isPrintable;
                
                let dayClassName = '';
                if (isToday) {
                    dayClassName = 'today-cell animated-today';
                }

                const gregorianDateString = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2, '0')}-${day.gregorian.day.padStart(2, '0')}`;
                const eventForDay = customEvents.find(e => e.gregorianDate === gregorianDateString);
                const hijriEventForDay = customHijriEvents.find(e => 
                    e.hijriDay === parseInt(day.hijri.day, 10) &&
                    e.hijriMonth === day.hijri.month.number &&
                    (e.isRecurring || e.hijriYear === parseInt(day.hijri.year, 10))
                );
                const nationalHoliday = nationalHolidays[gregorianDateString];
                const hijriHoliday = hijriHolidays.get(day.hijri.date);

                const finalStyle = { ...style };
                if (isPrintable) {
                   finalStyle.border = '1px solid #ccc';
                   if (style.backgroundColor === 'transparent' && !nationalHoliday && !hijriHoliday) {
                       finalStyle.color = '#000000';
                   }
                }
                
                const isHighlighted = style.backgroundColor !== 'transparent';
                const gregorianDayColorClass = isHighlighted
                    ? 'text-white/80'
                    : isSpecialLightTheme
                    ? 'text-gray-700'
                    : document.body.classList.contains('light')
                    ? 'text-gray-500'
                    : 'text-white/80';

                const borderClass = isPrintable ? '' : 'border border-[var(--border-color)]/20 rounded-md';
                const baseClasses = `relative flex items-center justify-center font-bold aspect-square transition-all duration-300 ${borderClass}`;
                const combinedClassName = `${baseClasses} ${dayClassName} ${!isPrintable ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-[var(--text-color-secondary)] hover:shadow-[0_0_15px_var(--border-color)]' : ''}`;
                
                // Display Logic based on Format
                const showHijri = calendarFormat === 'hijri-masehi' || calendarFormat === 'hijri';
                const showGregorian = calendarFormat === 'hijri-masehi' || calendarFormat === 'masehi';
                
                // Increased font size for Gregorian dates (Masehi)
                const gregorianSizeClass = (calendarFormat === 'masehi') ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl';
                const hijriSizeClass = (calendarFormat === 'hijri') ? 'text-2xl sm:text-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'text-[10px] sm:text-xs top-1 right-1';

                return (
                    <div
                        key={day.hijri.date}
                        style={finalStyle}
                        className={combinedClassName}
                        onClick={() => !isPrintable && onDayClick(day, infoKey)}
                        title={!isPrintable ? (nationalHoliday || hijriHoliday || title) : undefined}
                    >
                        {indicator === 'islamic' && <PinIcon className="absolute top-1 left-1 w-3 h-3 text-white" />}
                        {indicator === 'national' && <PinIcon className="absolute top-1 left-1 w-3 h-3 text-white" />}
                        
                        {hijriHoliday && !indicator && <span className="absolute top-0.5 left-1 text-sm" title={hijriHoliday}>☪️</span>}
                        
                        {/* Hijri Date */}
                        {showHijri && (
                            <div className={`absolute font-bold flex flex-col items-end ${hijriSizeClass}`}>
                                {isToday 
                                    ? <span className="today-hijri-day-number">{parseInt(day.hijri.day, 10)}</span> 
                                    : <span>{parseInt(day.hijri.day, 10)}</span>
                                }
                            </div>
                        )}

                        {/* Gregorian Date */}
                        {showGregorian && (
                            <div className={`relative ${gregorianSizeClass} font-bold ${gregorianDayColorClass}`}>
                                {parseInt(day.gregorian.day, 10)}
                                {collision && (
                                    <div className="absolute inset-0 rounded-full border-2 border-[#FF3131] pointer-events-none scale-150"></div>
                                )}
                            </div>
                        )}

                        {eventForDay && (
                            <span className="absolute bottom-1 left-1" title={eventForDay.text}>
                                <BookmarkIcon />
                            </span>
                        )}
                        {hijriEventForDay && (
                            <span 
                                className="absolute bottom-1 right-1 w-2 h-2 bg-purple-400 rounded-full"
                                title={hijriEventForDay.name}
                            ></span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
