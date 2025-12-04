
import React from 'react';
import type { CalendarData, CustomEvent, CustomHijriEvent, Day } from '../types';
import { translateToIndonesian } from '../utils';
import { SPECIAL_DAYS_COLORS } from '../constants';

interface YearlyViewProps {
    yearData: (CalendarData | null)[];
    todayHijriDate: string;
    customEvents: CustomEvent[];
    customHijriEvents: CustomHijriEvent[];
    nationalHolidays: { [date: string]: string };
    onMonthClick: (monthDate: Date) => void;
    isLoading: boolean;
    isPrintable?: boolean;
}

const HOLIDAYS: { [key: string]: string } = {
    '1-1': 'Tahun Baru Hijriyah', '10-1': 'Idul Fitri', '10-2': 'Idul Fitri', '12-10': 'Idul Adha',
};

const getMiniDayColor = (day: Day, todayHijriDate: string, customEvents: CustomEvent[], customHijriEvents: CustomHijriEvent[], nationalHolidays: { [date: string]: string }): { bg: string | null, border: string | null } => {
    const hijri = day.hijri;
    const gregorian = day.gregorian;
    const hijriDay = parseInt(hijri.day, 10);
    const hijriMonth = hijri.month.number;
    
    const gregorianDateString = `${gregorian.year}-${String(gregorian.month.number).padStart(2, '0')}-${gregorian.day.padStart(2, '0')}`;
    const isNationalHoliday = !!nationalHolidays[gregorianDateString];
    const holidayKey = `${hijriMonth}-${hijriDay}`;
    const isIslamicHoliday = !!HOLIDAYS[holidayKey];

    if (isNationalHoliday || isIslamicHoliday) return { bg: SPECIAL_DAYS_COLORS.ISLAMIC_HOLIDAY, border: null }; // Red

    if (hijriMonth === 9) return { bg: SPECIAL_DAYS_COLORS.RAMADAN, border: null };

    if (hijriMonth === 12 && hijriDay === 9) return { bg: SPECIAL_DAYS_COLORS.OTHER_SUNNAH, border: null };
    if (hijriMonth === 1 && hijriDay === 9) return { bg: SPECIAL_DAYS_COLORS.OTHER_SUNNAH, border: null };
    if (hijriMonth === 1 && (hijriDay === 10 || hijriDay === 11)) return { bg: SPECIAL_DAYS_COLORS.OTHER_SUNNAH, border: null };
    if (hijriMonth === 10 && hijriDay >= 3 && hijriDay <= 8) return { bg: SPECIAL_DAYS_COLORS.OTHER_SUNNAH, border: null };
    if (hijriDay >= 13 && hijriDay <= 15) return { bg: SPECIAL_DAYS_COLORS.AYYAMUL_BIDH, border: null };

    const isTashreeq = hijriMonth === 12 && (hijriDay >= 11 && hijriDay <= 13);
    if (['Monday', 'Thursday'].includes(gregorian.weekday.en) && !isTashreeq) return { bg: SPECIAL_DAYS_COLORS.MONDAY_THURSDAY, border: null };
    
    if (hijri.date === todayHijriDate) return { bg: 'var(--today-bg-color)', border: '1px solid var(--today-text-color)' };

    const hasGregorianEvent = customEvents.some(e => e.gregorianDate === gregorianDateString);
    const hasHijriEvent = customHijriEvents.some(e => 
        e.hijriDay === hijriDay &&
        e.hijriMonth === hijriMonth &&
        (e.isRecurring || e.hijriYear === parseInt(hijri.year, 10))
    );

    if (hasGregorianEvent || hasHijriEvent) return { bg: '#FFD700', border: null }; // Gold for custom events

    return { bg: null, border: null };
};

const MiniMonth: React.FC<{ monthData: CalendarData, todayHijriDate: string, customEvents: CustomEvent[], customHijriEvents: CustomHijriEvent[], nationalHolidays: { [date: string]: string }, onMonthClick: (monthDate: Date) => void, isPrintable?: boolean }> = ({ monthData, todayHijriDate, customEvents, customHijriEvents, nationalHolidays, onMonthClick, isPrintable = false }) => {
    const weekDays = ['A', 'S', 'S', 'R', 'K', 'J', 'S']; // Initial
    const firstDay = monthData.days[0];
    const monthDate = new Date(parseInt(firstDay.gregorian.year), firstDay.gregorian.month.number - 1, 1);

    const firstDayOfMonthOffset = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();

    return (
        <div className={`p-1.5 border border-[var(--border-color)]/20 rounded-lg ${!isPrintable ? 'cursor-pointer hover:bg-[var(--border-color)]/10' : ''}`} onClick={() => !isPrintable && onMonthClick(monthDate)}>
            <h4 className="font-bold text-xs text-center mb-1 text-[var(--text-color-secondary)]">{translateToIndonesian(monthData.gregorianMonthName, 'gregorian')}</h4>
            <div className="grid grid-cols-7 gap-px text-center text-[8px]">
                {weekDays.map((day, i) => <div key={`${day}-${i}`} className="font-bold">{day}</div>)}
                {Array.from({ length: firstDayOfMonthOffset }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {monthData.days.map(day => {
                    const { bg, border } = getMiniDayColor(day, todayHijriDate, customEvents, customHijriEvents, nationalHolidays);
                    const isToday = day.hijri.date === todayHijriDate && !isPrintable;
                    
                    return (
                        <div key={day.gregorian.date} className="aspect-square flex items-center justify-center rounded-full" style={{ 
                            backgroundColor: bg || 'transparent',
                            color: bg && bg !== '#FFD700' ? '#fff' : 'inherit',
                            border: border || (isToday ? '1px solid var(--today-text-color)' : 'none'),
                        }}>
                           <span style={{color: isToday && !bg ? 'var(--today-text-color)' : 'inherit'}}> {parseInt(day.gregorian.day, 10)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MiniMonthSkeleton: React.FC = () => (
    <div className="p-1.5 border border-[var(--border-color)]/20 rounded-lg animate-pulse">
        <div className="h-3 bg-[var(--border-color)]/20 rounded-md w-3/4 mx-auto mb-2"></div>
        <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="aspect-square">
                    <div className="w-3/4 h-3/4 bg-[var(--border-color)]/10 rounded-full mx-auto my-auto"></div>
                </div>
            ))}
        </div>
    </div>
);

export const YearlyView: React.FC<YearlyViewProps> = ({ yearData, todayHijriDate, customEvents, customHijriEvents, nationalHolidays, onMonthClick, isLoading, isPrintable = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 12 }).map((_, i) => <MiniMonthSkeleton key={i} />)}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {yearData.map((monthData, index) => (
                monthData ? (
                    <MiniMonth 
                        key={index} 
                        monthData={monthData} 
                        todayHijriDate={todayHijriDate}
                        customEvents={customEvents}
                        customHijriEvents={customHijriEvents}
                        nationalHolidays={nationalHolidays}
                        onMonthClick={onMonthClick}
                        isPrintable={isPrintable}
                    />
                ) : (
                    <div key={index} className="p-2 border border-dashed border-red-500/50 rounded-lg text-center text-xs flex items-center justify-center aspect-square">
                        Gagal memuat data bulan ini.
                    </div>
                )
            ))}
        </div>
    );
};
