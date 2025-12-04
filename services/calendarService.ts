
import type { CalendarData, Day, CountdownTarget, HijriDate, PrayerTimes, UserSettings, HijriApiHoliday, MonthlyPrayerDay } from '../types';
import { CountdownEvent } from '../types';
import { ALADHAN_API_BASE_URL } from '../constants';

// Retry helper
async function retryFetch(url: string, retries = 3, delay = 1000): Promise<Response> {
    try {
        const response = await fetch(url);
        if (response.status === 503 || response.status === 504 || response.status === 500 || response.status === 502) {
             throw new Error(`Service Unavailable: ${response.status}`);
        }
        return response;
    } catch (error: any) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFetch(url, retries - 1, delay * 2);
        }
        throw error;
    }
}

// Fetches the full calendar for a given month and year
export const fetchCalendarData = async (year: number, month: number): Promise<CalendarData> => {
    // New endpoint that doesn't require location
    try {
        const response = await retryFetch(`${ALADHAN_API_BASE_URL}/gToHCalendar/${month}/${year}?calendarMethod=HJCoSA`);
        if (!response.ok) {
            throw new Error('Failed to fetch calendar data from Al-Adhan API');
        }
        const data = await response.json();
        const days: Day[] = data.data;

        if (!days || days.length === 0) {
            throw new Error('API returned no calendar data for the selected month.');
        }

        return {
            days,
            hijriMonthName: days[15]?.hijri.month.en || 'Unknown',
            hijriYear: days[15]?.hijri.year || 'YYYY',
            gregorianMonthName: days[15]?.gregorian.month.en || 'Unknown',
        };
    } catch (e) {
        throw e;
    }
};

// Fetches prayer times and optionally location name
export const fetchLocationAndPrayerTimes = async (latitude: number, longitude: number, settings?: UserSettings): Promise<{ timings: PrayerTimes; location: string }> => {
    let url: string;
    let locationName: string;
    const today = new Date();
    const dateString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    if (settings && settings.manualLocation.city && settings.manualLocation.country) {
        const city = settings.manualLocation.city;
        const country = settings.manualLocation.country;
        const method = settings.prayerMethod || 20;
        url = `${ALADHAN_API_BASE_URL}/timingsByCity/${dateString}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
        locationName = `${city}, ${country}`;
    } else {
        const method = settings?.prayerMethod || 3;
        url = `${ALADHAN_API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
        // Fetch location name separately and non-critically
        try {
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                const city = geoData.city || geoData.locality || '';
                const country = geoData.countryName || '';
                locationName = (city && country) ? `${city}, ${country}` : (city || country || '');
            } else {
                locationName = '';
            }
        } catch (e) {
            console.warn("Could not fetch location name:", e);
            locationName = '';
        }
    }

    const prayerResponse = await retryFetch(url);
    if (!prayerResponse.ok) {
        throw new Error(`Failed to fetch prayer times. Status: ${prayerResponse.status}`);
    }
    const prayerData = await prayerResponse.json();
    if (prayerData.code !== 200 || !prayerData.data.timings) {
        throw new Error('API returned success but no timings data.');
    }
    
    return {
        timings: prayerData.data.timings,
        location: locationName
    };
};


// New function to convert Gregorian to Hijri
export const convertGToH = async (date: Date): Promise<HijriDate> => {
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const response = await retryFetch(`${ALADHAN_API_BASE_URL}/gToH/${dateString}`);
    if (!response.ok) throw new Error('Failed to convert date');
    const data = await response.json();
    return data.data.hijri;
};


// Converts a Hijri date to a Gregorian date using the API
export async function convertHijriToGregorian(day: number, month: number, year: number): Promise<Date> {
    const date = `${day}-${month}-${year}`;
    const response = await retryFetch(`${ALADHAN_API_BASE_URL}/hToG/${date}?calendarMethod=HJCoSA`);
    if (!response.ok) {
        throw new Error('Failed to convert Hijri to Gregorian date.');
    }
    const data = await response.json();
    // API returns date in DD-MM-YYYY format
    const [gDay, gMonth, gYear] = data.data.gregorian.date.split('-').map(Number);
    return new Date(gYear, gMonth - 1, gDay);
}

// Fetches official Islamic holidays for a Hijri year
export const fetchHijriHolidays = async (year: number): Promise<Map<string, string>> => {
    const response = await retryFetch(`${ALADHAN_API_BASE_URL}/islamicHolidaysByHijriYear/${year}?calendarMethod=HJCoSA`);
    if (!response.ok) {
        throw new Error('Failed to fetch Hijri holidays');
    }
    const data = await response.json();
    if (data.code !== 200 || !Array.isArray(data.data)) {
        throw new Error('Invalid data format for Hijri holidays');
    }
    const holidays: HijriApiHoliday[] = data.data;
    const holidayMap = new Map<string, string>();
    holidays.forEach(holiday => {
        holidayMap.set(holiday.date, holiday.name);
    });
    return holidayMap;
};

// Determines the next major Islamic event for the countdown
export const getNextCountdownTarget = async (currentHijriDate: HijriDate): Promise<CountdownTarget> => {
    const currentHijriDay = parseInt(currentHijriDate.day, 10);
    const currentHijriMonth = currentHijriDate.month.number;
    const currentHijriYear = parseInt(currentHijriDate.year, 10);

    let targetEvent: CountdownEvent;
    let targetHijriDay: number;
    let targetHijriMonth: number;
    let targetHijriYear = currentHijriYear;

    if (currentHijriMonth < 9 || (currentHijriMonth === 9 && currentHijriDay === 0)) { // Before Ramadan
        targetEvent = CountdownEvent.RAMADAN;
        targetHijriDay = 1;
        targetHijriMonth = 9;
    } else if (currentHijriMonth === 9) { // During Ramadan
        targetEvent = CountdownEvent.EID_AL_FITR;
        targetHijriDay = 1;
        targetHijriMonth = 10;
    } else if (currentHijriMonth < 12 || (currentHijriMonth === 12 && currentHijriDay < 9)) { // After Eid al-Fitr, before Arafah
        targetEvent = CountdownEvent.ARAFAH;
        targetHijriDay = 9;
        targetHijriMonth = 12;
    } else if (currentHijriMonth === 12 && currentHijriDay === 9) { // On Arafah day
        targetEvent = CountdownEvent.EID_AL_ADHA;
        targetHijriDay = 10;
        targetHijriMonth = 12;
    } else if (currentHijriMonth === 12 && currentHijriDay >= 10) { // After Eid al-Adha
        targetEvent = CountdownEvent.HIJRI_NEW_YEAR;
        targetHijriDay = 1;
        targetHijriMonth = 1;
        targetHijriYear = currentHijriYear + 1;
    } else if (currentHijriMonth === 1 && currentHijriDay < 9) { // Before Asyura
        targetEvent = CountdownEvent.ASYURA;
        targetHijriDay = 9;
        targetHijriMonth = 1;
    } else { // After Asyura
        targetEvent = CountdownEvent.RAMADAN;
        targetHijriDay = 1;
        targetHijriMonth = 9;
        targetHijriYear = currentHijriYear + 1;
    }
    
    const targetDate = await convertHijriToGregorian(targetHijriDay, targetHijriMonth, targetHijriYear);
    
    return {
        event: targetEvent,
        date: targetDate,
        hijriDateString: `${targetHijriDay}-${targetHijriMonth}-${targetHijriYear}`
    };
};

export const getSpecificCountdownTarget = async (event: CountdownEvent, currentHijriDate: HijriDate): Promise<CountdownTarget> => {
    const currentDay = parseInt(currentHijriDate.day);
    const currentMonth = currentHijriDate.month.number;
    const currentYear = parseInt(currentHijriDate.year);

    let targetDay: number, targetMonth: number, targetYear = currentYear;

    switch(event) {
        case CountdownEvent.RAMADAN:
            targetDay = 1; targetMonth = 9;
            if (currentMonth > 9 || (currentMonth === 9 && currentDay >= 1)) targetYear++;
            break;
        case CountdownEvent.EID_AL_FITR:
            targetDay = 1; targetMonth = 10;
            if (currentMonth > 10 || (currentMonth === 10 && currentDay >= 1)) targetYear++;
            break;
        case CountdownEvent.EID_AL_ADHA:
            targetDay = 10; targetMonth = 12;
            if (currentMonth > 12 || (currentMonth === 12 && currentDay >= 10)) targetYear++;
            break;
        case CountdownEvent.HIJRI_NEW_YEAR:
            targetDay = 1; targetMonth = 1;
            if (currentMonth > 1 || (currentMonth === 1 && currentDay >= 1)) targetYear++;
            break;
        default: // Fallback for Arafah, Asyura, etc.
             const nextAuto = await getNextCountdownTarget(currentHijriDate);
             targetDay = parseInt(nextAuto.hijriDateString.split('-')[0]);
             targetMonth = parseInt(nextAuto.hijriDateString.split('-')[1]);
             targetYear = parseInt(nextAuto.hijriDateString.split('-')[2]);
             break;
    }

    const targetDate = await convertHijriToGregorian(targetDay, targetMonth, targetYear);
    
    return {
        event: event,
        date: targetDate,
        hijriDateString: `${targetDay}-${targetMonth}-${targetYear}`
    };
};

export const fetchMonthlyPrayerCalendar = async (year: number, month: number, city: string, country: string, method: number): Promise<MonthlyPrayerDay[]> => {
    const url = `${ALADHAN_API_BASE_URL}/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const response = await retryFetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch monthly prayer calendar from Al-Adhan API');
    }
    const data = await response.json();
    if (data.code !== 200 || !Array.isArray(data.data)) {
        throw new Error('API returned invalid data for the monthly prayer calendar.');
    }
    return data.data;
};
