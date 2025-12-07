
import React from 'react';
import { AppView } from '../types';
import { MapIcon, SparklesIcon } from './Icons';

interface DashboardProps {
    onChangeView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
    
    const MenuCard = ({ title, icon, onClick, desc, color }: { title: string, icon: React.ReactNode, onClick: () => void, desc: string, color: string }) => (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 bg-black/30 border border-[#00ffdf]/20 rounded-xl hover:bg-[#00ffdf]/10 transition-all active:scale-95 group h-32 w-full"
        >
            <div className={`p-3 rounded-full mb-2 group-hover:scale-110 transition-transform ${color} text-white shadow-lg flex items-center justify-center`}>
                {icon}
            </div>
            <span className="font-bold text-sm text-white">{title}</span>
            <span className="text-[10px] text-gray-400 mt-1">{desc}</span>
        </button>
    );

    return (
        <div className="grid grid-cols-2 gap-4 p-4 mt-4 animate-fade-in-up">
            <MenuCard 
                title="Jadwal Shalat" 
                desc="Waktu shalat akurat"
                icon={<div className="font-clock text-xl">🕒</div>} 
                onClick={() => onChangeView('prayer')}
                color="bg-cyan-600"
            />
            <MenuCard 
                title="Arah Kiblat" 
                desc="Kompas Kiblat"
                icon={<span className="text-2xl">🕋</span>} 
                onClick={() => onChangeView('qibla')}
                color="bg-emerald-600"
            />
            <MenuCard 
                title="Doa & Dzikir" 
                desc="Kumpulan Doa Harian"
                icon={<SparklesIcon className="w-6 h-6"/>} 
                onClick={() => onChangeView('doa')}
                color="bg-purple-600"
            />
            <MenuCard 
                title="Al-Qur'an Digital" 
                desc="Baca & Dengar Ayat"
                icon={<div className="text-xl">📖</div>} 
                onClick={() => onChangeView('quran')}
                color="bg-yellow-600"
            />
        </div>
    );
};
