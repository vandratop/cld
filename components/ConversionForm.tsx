
import React, { useState } from 'react';
import { HIJRI_MONTHS } from '../types';
import { Loader2, ArrowRightLeft, CalendarCheck } from 'lucide-react';
import { convertGToH, convertHijriToGregorian } from '../services/calendarService';

interface ConversionFormProps {
  onConvert: (date: { day: number; month: number; year: number }) => void; // This prop is used when converting Hijri -> Masehi results
  isLoading: boolean;
}

const ConversionForm: React.FC<ConversionFormProps> = ({ onConvert, isLoading }) => {
  const [mode, setMode] = useState<'m_to_h' | 'h_to_m'>('m_to_h'); // Default Masehi to Hijri
  
  // Hijri Inputs
  const [hDay, setHDay] = useState<number>(1);
  const [hMonth, setHMonth] = useState<number>(9);
  const [hYear, setHYear] = useState<number>(1445);

  // Masehi Inputs
  const [mDate, setMDate] = useState<string>('');
  
  // Result for local M -> H conversion
  const [localResult, setLocalResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalResult(null);

    if (mode === 'h_to_m') {
        onConvert({ day: hDay, month: hMonth, year: hYear });
    } else {
        // Masehi to Hijri Logic
        if (!mDate) return;
        const dateObj = new Date(mDate);
        try {
            const hDate = await convertGToH(dateObj);
            setLocalResult(`${hDate.day} ${hDate.month.en} ${hDate.year} H`);
        } catch (e) {
            console.error(e);
            setLocalResult("Gagal mengonversi tanggal.");
        }
    }
  };

  const toggleMode = () => {
      setMode(prev => prev === 'm_to_h' ? 'h_to_m' : 'm_to_h');
      setLocalResult(null);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-emerald-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <CalendarCheck size={24} />
            </div>
            <div>
            <h2 className="text-xl font-bold text-gray-800">
                {mode === 'm_to_h' ? "Konversi Masehi ke Hijriah" : "Konversi Hijriah ke Masehi"}
            </h2>
            <p className="text-xs text-gray-500">
                {mode === 'm_to_h' ? "Masukkan tanggal Masehi" : "Masukkan tanggal Hijriah"}
            </p>
            </div>
        </div>
        <button onClick={toggleMode} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" title="Tukar Mode">
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'h_to_m' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                <input
                type="number"
                min="1"
                max="30"
                value={hDay}
                onChange={(e) => setHDay(parseInt(e.target.value))}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-black"
                required
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Bulan</label>
                <div className="relative">
                <select
                    value={hMonth}
                    onChange={(e) => setHMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white text-black"
                >
                    {HIJRI_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.value}. {m.label}
                    </option>
                    ))}
                </select>
                </div>
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Tahun (H)</label>
                <input
                type="number"
                min="1"
                max="2000"
                value={hYear}
                onChange={(e) => setHYear(parseInt(e.target.value))}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-black"
                required
                />
            </div>
            </div>
        ) : (
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Tanggal Masehi</label>
                <input 
                    type="date" 
                    value={mDate} 
                    onChange={(e) => setMDate(e.target.value)} 
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-black"
                    required
                />
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft />
              <span>Konversi</span>
            </>
          )}
        </button>
      </form>
      
      {localResult && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <p className="text-sm text-emerald-600 mb-1">Hasil Konversi Hijriah</p>
              <h3 className="text-2xl font-bold text-emerald-800">{localResult}</h3>
          </div>
      )}
    </div>
  );
};

export default ConversionForm;
