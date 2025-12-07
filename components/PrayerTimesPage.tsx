
import React from 'react';
import { ChevronLeftIcon } from './Icons';
import { PrayerTimes, NextPrayer, UserSettings, AdhanAlarms, CountdownTarget, CountdownEvent, PrayerName } from '../types';

// These were internal components in App.tsx, moved here or passed as children?
// For simplicity, I will assume the components (PrayerInfo, WeatherWidget, CurrentTimeClock) 
// are passed as children or imported. Given the structure, passing the rendered components from App is tricky.
// Better to move the actual components here or import them if they were exported.
// Since they were defined inside App.tsx in the provided code, I will need to redefine them or ask to export them.
// The previous prompt had them inside App.tsx. I will assume I need to move them here. 
// BUT, `PrayerInfo` and `WeatherWidget` were large. To avoid duplication, I will assume they are exported from App or I will recreate the wrapper logic.

// In a real refactor, `PrayerInfo`, `WeatherWidget`, `CurrentTimeClock` should be separate files.
// For this XML response, I will implement the *Page Structure* and accept `children` to render the actual content
// to minimize code duplication in this response, OR I will assume the user accepts moving the logic here.

// Strategy: The prompt implies moving the "menu" (UI elements) to this sub-page.
// I will create a container that accepts the necessary props to render these elements.

interface PrayerTimesPageProps {
    onBack: () => void;
    children: React.ReactNode; // This will receive the fragment containing <CurrentTimeClock/>, <WeatherWidget/>, <PrayerInfo/>
}

export const PrayerTimesPage: React.FC<PrayerTimesPageProps> = ({ onBack, children }) => {
    return (
        <div className="p-4 text-white min-h-screen">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-full"><ChevronLeftIcon /></button>
                <h2 className="text-xl font-bold">Jadwal Shalat & Cuaca</h2>
            </div>
            <div className="animate-fade-in-up">
                {children}
            </div>
        </div>
    );
};
