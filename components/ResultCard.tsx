
import React from 'react';
import { ConversionResult, HIJRI_MONTHS } from '../types';
import { Calendar, Info, BookOpen } from 'lucide-react';

interface ResultCardProps {
  inputDate: { day: number; month: number; year: number } | null;
  result: ConversionResult | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ inputDate, result }) => {
  if (!result || !inputDate) return null;

  const monthName = HIJRI_MONTHS.find(m => m.value === inputDate.month)?.label;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Main Result */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold-400 opacity-20 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-emerald-100 mb-1 font-serif text-lg">Tanggal Hijriah</p>
                <h3 className="text-3xl font-bold font-serif">{inputDate.day} {monthName} {inputDate.year} H</h3>
            </div>
            
            <div className="hidden md:block">
                <ArrowRightIcon className="w-8 h-8 text-emerald-200 opacity-50" />
            </div>

            <div className="text-center md:text-right">
                <p className="text-emerald-100 mb-1 font-sans text-lg">Tanggal Masehi</p>
                <h3 className="text-4xl font-bold text-white tracking-tight">{result.gregorianDate}</h3>
                <p className="text-emerald-200 mt-1 font-medium">{result.dayOfWeek}</p>
            </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Significance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-emerald-700">
            <Info className="w-5 h-5" />
            <h4 className="font-bold text-lg">Wawasan Tanggal</h4>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            {result.significance}
          </p>
        </div>

        {/* Historical Events */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gold-600">
            <BookOpen className="w-5 h-5" />
            <h4 className="font-bold text-lg">Peristiwa Terkait</h4>
          </div>
          {result.historicalEvents && result.historicalEvents.length > 0 ? (
            <ul className="space-y-3">
              {result.historicalEvents.map((event, idx) => (
                <li key={idx} className="flex gap-3 text-sm md:text-base text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <span className="text-gold-500 font-bold">•</span>
                  <span>{event}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">Tidak ada catatan peristiwa khusus yang ditemukan untuk tanggal ini.</p>
          )}
        </div>

      </div>
    </div>
  );
};

// Simple Arrow Icon for the component
function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    )
}

export default ResultCard;
