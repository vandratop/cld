import React, { useState, useEffect } from 'react';
import type { Day, NextPrayer, PrayerTimes } from '../types';
import { translateToIndonesian } from '../utils';

interface HeaderInfoProps {
    today: Day;
}

export const HeaderInfo: React.FC<HeaderInfoProps> = ({ today }) => {

    return (
        <div className="text-center font-jannah relative py-6 overflow-hidden">
            <img src="https://raw.githubusercontent.com/vandratop/Yuk/04eb6c971bf28bcd42c7ef1f3fd458afe08abce2/DoaKu_back_mtrx.png" alt="Dome background" className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10" />
            <p>Hari ini :</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--header-hijri-text-color)]">
                {`${today.hijri.day} ${translateToIndonesian(today.hijri.month.en, 'hijri')} ${today.hijri.year} H`}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--header-gregorian-text-color)]">
                {`${today.gregorian.day} ${translateToIndonesian(today.gregorian.month.en, 'gregorian')} ${today.gregorian.year}`}
            </p>
        </div>
    );
};