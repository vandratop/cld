
export interface Location {
  latitude: number;
  longitude: number;
}

export interface GregorianDate {
  date: string; // "DD-MM-YYYY"
  format: string;
  day: string; // "DD"
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

export interface HijriDate {
  date: string; // "DD-MM-YYYY"
  format: string;
  day: string; // "DD"
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string; days: number; };
  year: string;
  designation: { abbreviated: string; expanded: string };
  holidays: string[];
}

export interface Day {
  gregorian: GregorianDate;
  hijri: HijriDate;
}

export interface CalendarData {
  days: Day[];
  hijriMonthName: string;
  hijriYear: string;
  gregorianMonthName: string;
}

export enum CountdownEvent {
  RAMADAN = "Ramadhan",
  EID_AL_FITR = "Hari Raya Idul Fitri",
  ARAFAH = "Puasa Sunnah Arafah",
  EID_AL_ADHA = "Hari Raya Idul Adha",
  HIJRI_NEW_YEAR = "Tahun Baru Hijriah",
  ASYURA = "Puasa Tasu'a & Asyura",
}

export interface CountdownTarget {
    event: CountdownEvent;
    date: Date;
    hijriDateString: string; // e.g., "1-9-1446"
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
    grounding?: { uri: string; title: string }[];
}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Sunrise' | 'Sunset';

export interface PrayerTimes {
    [key: string]: string;
}

export interface NextPrayer {
    name: PrayerName | null;
    time: string | null;
    countdown: string;
}

export interface CustomEvent {
    id: string;
    gregorianDate: string; // "YYYY-MM-DD"
    text: string;
    reminder?: 'none' | 'on_day' | '1_day_before';
    reminderTime?: string; // "HH:MM"
}

export interface CustomHijriEvent {
    id: string;
    hijriDay: number;
    hijriMonth: number;

    hijriYear: number;
    isRecurring: boolean;
    name: string;
    description: string;
    reminder?: 'none' | 'on_day' | '1_day_before';
    reminderTime?: string; // "HH:MM"
}

export interface PrayerMethod {
    id: number;
    name: string;
}

export type SunnahFastingSetting = { isOn: boolean; time: string };

export interface SunnahFastingNotifications {
    seninKamis: SunnahFastingSetting;
    ayyamulBidh: SunnahFastingSetting;
    arafah: SunnahFastingSetting;
    asyura: SunnahFastingSetting;
    syawal: SunnahFastingSetting;
}

export interface UserSettings {
    manualLocation: {
        city: string;
        country: string;
    };
    prayerMethod: number;
    holidayCountry: string;
    sunnahFastingNotifications: SunnahFastingNotifications;
}

export type AlarmSetting = { isOn: boolean; time: string };
export type AlarmSettings = {
    sahur: AlarmSetting;
    tahajud: AlarmSetting;
    dhuha: AlarmSetting;
    jumat: AlarmSetting;
    tidur: AlarmSetting;
    shalat5Waktu: { isOn: boolean; time: string }; // Time is generic here, logic handles individual prayers
    dzikirPagi: AlarmSetting;
    dzikirPetang: AlarmSetting;
    doaJumat: AlarmSetting;
};

export type VoiceAlarmSettings = AlarmSettings;

export type AlarmSound = 'default' | 'thaha' | 'muflih';

export type AdhanAlarms = {
    [key in PrayerName]?: { isOn: boolean };
};

export interface FilterSettings {
    showCustomEvents: boolean;
    showNationalHolidays: boolean;
    showCustomHijriEvents: boolean;
}

export type Theme = 'light' | 'dark' | 'auto' | 'theme-yellow-light' | 'theme-blue-light' | 'theme-brown-light' | 'theme-pink-light' | 'theme-ramadan' | 'theme-purple-light' | 'theme-gray-dark' | 'theme-kiswah-light' | 'theme-emerald-dark' | 'theme-lapis-dark' | 'theme-hijriah-dark' | 'theme-masjid-dark';

export interface HijriApiHoliday {
    name: string;
    date: string; // "DD-MM-YYYY"
}

export interface MonthlyPrayerDay {
    timings: PrayerTimes;
    date: {
        readable: string;
        gregorian: GregorianDate;
        hijri: HijriDate;
    };
    meta: any;
}

export type CalendarFormat = 'hijri-masehi' | 'hijri' | 'masehi';

export interface ConversionResult {
  gregorianDate: string;
  dayOfWeek: string;
  significance: string;
  historicalEvents: string[];
}

export const HIJRI_MONTHS = [
    { value: 1, label: 'Muharram' },
    { value: 2, label: 'Safar' },
    { value: 3, label: 'Rabiul Awal' },
    { value: 4, label: 'Rabiul Akhir' },
    { value: 5, label: 'Jumadil Awal' },
    { value: 6, label: 'Jumadil Akhir' },
    { value: 7, label: 'Rajab' },
    { value: 8, label: "Sya'ban" },
    { value: 9, label: 'Ramadhan' },
    { value: 10, label: 'Syawal' },
    { value: 11, label: "Dzulqa'dah" },
    { value: 12, label: 'Dzulhijjah' },
];

export interface VoiceAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    alarms: AlarmSettings;
    onToggleAlarm: (alarmName: string, isOn: boolean) => void;
}

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
    audio: string;
    translation?: string;
}

export interface UserProfile {
    name: string;
    email: string;
    photoUrl?: string;
    isGuest: boolean;
}

export type AppView = 'calendar' | 'prayer' | 'qibla' | 'doa' | 'quran';
