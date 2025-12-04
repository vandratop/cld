
import React, { useState } from 'react';
import { HIJRI_MONTHS } from '../types';
import { Loader2, ArrowRightLeft, CalendarCheck } from 'lucide-react';

interface ConversionFormProps {
  onConvert: (date: { day: number; month: number; year: number }) => void;
  isLoading: boolean;
}

const ConversionForm: React.FC<ConversionFormProps> = ({ onConvert, isLoading }) => {
  const [day, setDay] = useState<number>(1);
  const [month, setMonth] = useState<number>(9); // Default to Ramadhan
  const [year, setYear] = useState<number>(1445);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert({ day, month, year });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-emerald-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
          <CalendarCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Input Tanggal Hijriah</h2>
          <p className="text-sm text-gray-500">Masukkan tanggal yang ingin dikonversi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Day Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">Tanggal (Hari)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value))}
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              required
            />
          </div>

          {/* Month Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">Bulan</label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white"
              >
                {HIJRI_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.value}. {m.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Year Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">Tahun (H)</label>
            <input
              type="number"
              min="1"
              max="2000"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Memproses Konversi...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft />
              <span>Konversi ke Masehi</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ConversionForm;
