
import React, { useState, useEffect } from 'react';
import type { CountdownTarget } from '../types';
import { CountdownEvent } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CountdownTimerProps {
    target: CountdownTarget;
    selectedEvent: CountdownEvent;
    onEventChange: (event: CountdownEvent) => void;
}

const padZero = (num: number) => num.toString().padStart(2, '0');

const MARQUEE_TEXTS: { [key in CountdownEvent]?: string } = {
    [CountdownEvent.RAMADAN]: "Mari persiapkan diri, iman dan ketakwaan menyambut bulan Suci Ramadhan",
    [CountdownEvent.EID_AL_FITR]: "Menyambut hari kemenangan, sucikan hati di Hari Raya Idul Fitri",
    [CountdownEvent.EID_AL_ADHA]: "Meneladani pengorbanan Nabi Ibrahim Alaihis Salam di Hari Raya Idul Adha",
    [CountdownEvent.HIJRI_NEW_YEAR]: "Membuka lembaran baru dengan semangat hijrah di Tahun Baru Hijriah",
};

const EVENT_ORDER = [
    CountdownEvent.RAMADAN,
    CountdownEvent.EID_AL_FITR,
    CountdownEvent.EID_AL_ADHA,
    CountdownEvent.HIJRI_NEW_YEAR
];

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ target, selectedEvent, onEventChange }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(target.date) - +new Date();
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

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // initial call

        return () => clearInterval(timer);
    }, [target]);

    const handlePrevEvent = () => {
        const currentIndex = EVENT_ORDER.indexOf(selectedEvent);
        const newIndex = (currentIndex - 1 + EVENT_ORDER.length) % EVENT_ORDER.length;
        onEventChange(EVENT_ORDER[newIndex]);
    };

    const handleNextEvent = () => {
        const currentIndex = EVENT_ORDER.indexOf(selectedEvent);
        const newIndex = (currentIndex + 1) % EVENT_ORDER.length;
        onEventChange(EVENT_ORDER[newIndex]);
    };

    const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="countdown-box font-clock text-3xl sm:text-4xl neon-text-white rounded-lg px-2 py-1 w-16 sm:w-20 text-center cyber-border">{padZero(value)}</div>
            <div className="text-xs uppercase mt-1">{label}</div>
        </div>
    );
    
    const renderTitle = () => {
        const text = MARQUEE_TEXTS[target.event] || `Menuju ${target.event}`;
        return (
             <div className="marquee text-lg font-bold">
                <span>{text}</span>
            </div>
        )
    }

    return (
        <div className="p-4 cyber-border rounded-lg bg-[rgba(var(--container-bg-rgb),0.5)] mt-4">
             <div className="flex justify-between items-center mb-2 px-4">
                <button onClick={handlePrevEvent} className="p-1 hover:text-[var(--text-color-secondary)] transition-colors">
                    <ChevronLeftIcon />
                </button>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-color-secondary)] text-center">
                    Menuju: {selectedEvent}
                </span>
                <button onClick={handleNextEvent} className="p-1 hover:text-[var(--text-color-secondary)] transition-colors">
                    <ChevronRightIcon />
                </button>
            </div>
            <div className="h-8 flex items-center justify-center mb-2">
                {renderTitle()}
            </div>
            <div className="flex justify-around">
                <TimeBox value={timeLeft.days} label="Hari" />
                <TimeBox value={timeLeft.hours} label="Jam" />
                <TimeBox value={timeLeft.minutes} label="Menit" />
                <TimeBox value={timeLeft.seconds} label="Detik" />
            </div>
            <p className="text-center text-xs text-[var(--text-color-muted)] mt-4 animate-pulse">Perkiraan waktu menuju {target.event}</p>
        </div>
    );
};
