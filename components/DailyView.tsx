
import React from 'react';
import type { Day, CalendarFormat, CustomEvent, CustomHijriEvent } from '../types';
import { translateToIndonesian } from '../utils';
import { getDayHighlightAndInfo } from './CalendarGrid';
import { PinIcon, BookmarkIcon } from './Icons';

interface DailyViewProps {
    day: Day;
    format: CalendarFormat;
    onDayClick: (day: Day, infoKey: string | null) => void;
    customEvents: CustomEvent[];
    customHijriEvents: CustomHijriEvent[];
    nationalHolidays: { [date: string]: string };
    hijriHolidays: Map<string, string>;
}

export const DailyView: React.FC<DailyViewProps> = ({ 
    day, format, onDayClick, customEvents, customHijriEvents, nationalHolidays, hijriHolidays 
}) => {
    const showHijri = format === 'hijri-masehi' || format === 'hijri';
    const showGregorian = format === 'hijri-masehi' || format === 'masehi';
    const isSingleView = format === 'hijri' || format === 'masehi';

    const { style, title, infoKey, indicator, collision } = getDayHighlightAndInfo(day, nationalHolidays);
    
    const gregorianDateString = `${day.gregorian.year}-${String(day.gregorian.month.number).padStart(2, '0')}-${day.gregorian.day.padStart(2, '0')}`;
    const eventForDay = customEvents.find(e => e.gregorianDate === gregorianDateString);
    const hijriEventForDay = customHijriEvents.find(e => 
        e.hijriDay === parseInt(day.hijri.day, 10) &&
        e.hijriMonth === day.hijri.month.number &&
        (e.isRecurring || e.hijriYear === parseInt(day.hijri.year, 10))
    );
    const hijriHoliday = hijriHolidays.get(day.hijri.date);
    const nationalHolidayName = nationalHolidays[gregorianDateString];

    // Helper to render a specific date section
    const DateSection = ({ 
        dayName, 
        date, 
        monthNum, 
        year, 
        type,
        bgColorStyle
    }: { 
        dayName: string, 
        date: string, 
        monthNum: number, 
        year: string, 
        type: 'gregorian' | 'hijri',
        bgColorStyle: React.CSSProperties
    }) => {
        const isHighlighted = bgColorStyle.backgroundColor !== 'transparent';
        const textColorClass = isHighlighted ? 'text-white' : (type === 'hijri' ? 'text-[var(--header-hijri-text-color)]' : 'text-[var(--text-color)]');
        const monthYearColor = isHighlighted ? 'text-white border-white/30 bg-white/20' : 'text-[var(--text-color)] border-[var(--border-color)]/50 bg-black/20';

        return (
            <div 
                className="flex-1 flex flex-col relative transition-colors duration-300 justify-center py-2 sm:py-4"
                style={bgColorStyle}
            >
                {/* Header Strip */}
                <div className="bg-black/10 backdrop-blur-sm border-y border-white/10 py-1 px-4 text-center mb-2">
                    <span className={`text-xs sm:text-sm font-bold tracking-widest uppercase ${isHighlighted ? 'text-white' : 'text-[var(--text-color-secondary)]'}`}>
                        {dayName}
                    </span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between px-6 flex-1">
                    <div className="flex-1 flex justify-center relative">
                        <span className={`text-6xl sm:text-8xl md:text-9xl font-bold font-clock ${textColorClass} drop-shadow-md leading-none`}>
                            {parseInt(date, 10)}
                        </span>
                        {collision && type === 'gregorian' && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-[#FF3131] pointer-events-none"></div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-2 w-16 sm:w-24">
                        <div className={`border-2 rounded-lg p-1 text-center backdrop-blur-md ${monthYearColor}`}>
                            <span className="block text-[8px] sm:text-[10px] uppercase opacity-80">Bulan</span>
                            <span className="text-lg sm:text-xl font-bold font-clock">{String(monthNum).padStart(2, '0')}</span>
                        </div>
                        <div className={`border-2 rounded-lg p-1 text-center backdrop-blur-md ${monthYearColor}`}>
                            <span className="block text-[8px] sm:text-[10px] uppercase opacity-80">Tahun</span>
                            <span className="text-lg sm:text-xl font-bold font-clock">{year}</span>
                        </div>
                    </div>
                </div>
                
                {/* Indicators */}
                <div className="absolute bottom-1 left-2 flex space-x-1">
                    {indicator === 'islamic' && <PinIcon className="w-4 h-4 text-white" />}
                    {hijriHoliday && !indicator && <span className="text-base" title={hijriHoliday}>☪️</span>}
                    {eventForDay && <BookmarkIcon />}
                    {hijriEventForDay && <span className="w-3 h-3 bg-purple-400 rounded-full border border-white" title={hijriEventForDay.name}></span>}
                </div>
            </div>
        );
    };

    const handleInteraction = () => {
        onDayClick(day, infoKey);
    };

    // Reduced min-height for single view
    const containerMinHeight = isSingleView 
        ? "min-h-[200px] sm:min-h-[250px]" 
        : "min-h-[350px] sm:min-h-[450px]";

    return (
        <div className="w-full max-w-3xl mx-auto mt-2 font-jannah px-2">
            <div 
                className={`cyber-border rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.01] transition-transform flex flex-col ${containerMinHeight}`}
                onClick={handleInteraction}
            >
                <div className="flex flex-col flex-grow">
                    {showGregorian && (
                        <DateSection 
                            dayName={translateToIndonesian(day.gregorian.weekday.en, 'weekday')} 
                            date={day.gregorian.day} 
                            monthNum={day.gregorian.month.number} 
                            year={day.gregorian.year}
                            type="gregorian"
                            bgColorStyle={style}
                        />
                    )}
                    
                    {showHijri && (
                        <DateSection 
                            dayName={translateToIndonesian(day.hijri.weekday.en, 'weekday')}
                            date={day.hijri.day} 
                            monthNum={day.hijri.month.number} 
                            year={day.hijri.year}
                            type="hijri"
                            bgColorStyle={style}
                        />
                    )}
                </div>
            </div>

            {/* Legend for Daily View */}
            <div className="mt-4 px-2 text-xs space-y-2 bg-black/20 p-2 rounded-lg border border-[var(--border-color)]/20">
                <h3 className="font-bold text-sm text-[var(--text-color-secondary)]">Keterangan:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#FF3131] mr-2 rounded-sm"></div><span>Hari Raya & Libur Nasional</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#009688] mr-2 rounded-sm"></div><span>Puasa Ramadhan</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#0D00FF] mr-2 rounded-sm"></div><span>Puasa Sunnah Ayyamul Bidh</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#21DEC4] mr-2 rounded-sm"></div><span>Puasa Sunnah Senin - Kamis</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-[#1FCB0A] mr-2 rounded-sm"></div><span>Puasa Sunnah Lainnya</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 border-2 border-[#FF3131] rounded-full mr-2"></div><span>Collision (Libur Nasional)</span></div>
                </div>
                <div className="border-t border-white/10 pt-2 mt-1">
                    <p className="text-[10px] italic text-[var(--text-color-muted)]">
                        "Untuk Penentuan jadwal Puasa Ramadhan, Hari Raya Idul Fitri dan Idul Adha berdasarkan sidang isbath dari Pemerintah..."
                    </p>
                    {nationalHolidayName && (
                        <div className="mt-2 p-2 border border-red-400/30 rounded bg-red-900/10">
                            <p className="font-bold text-[10px] text-red-400 mb-1 flex items-center">
                                <PinIcon className="w-3 h-3 mr-1"/> Nama Hari Libur Nasional:
                            </p>
                            <p className="text-[10px] text-white pl-4">{nationalHolidayName}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
