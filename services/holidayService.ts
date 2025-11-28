// A service to fetch national holidays from an API.
const API_BASE_URL = 'https://date.nager.at/api/v3';

// The Nager.Date API returns an array of this type
interface NagerDateHoliday {
    date: string; // "YYYY-MM-DD"
    localName: string;
    name: string;
    countryCode: string;
}

/**
 * Fetches national holidays for a given country and year from Nager.Date API.
 * @param country - The ISO 3166-1 alpha-2 country code (e.g., 'ID', 'US').
 * @param year - The year to fetch holidays for.
 * @returns A promise that resolves to a dictionary of holidays.
 */
export const getNationalHolidays = async (country: string, year: number): Promise<{ [date: string]: string }> => {
    if (!country || !year) {
        return {};
    }

    const response = await fetch(`${API_BASE_URL}/PublicHolidays/${year}/${country}`);
    
    if (!response.ok) {
        if (response.status === 404) {
             console.warn(`Holiday data not available for country code: ${country}`);
             return {}; // Not an error, just no data.
        }
        // For other errors (500, 401, etc.), throw an error to be handled by the caller.
        throw new Error(`Gagal memuat hari libur nasional. Kode: ${response.status}`);
    }
    
    const holidays: NagerDateHoliday[] = await response.json();
    
    if (!Array.isArray(holidays)) {
        throw new Error('Gagal memuat hari libur: Format data tidak valid.');
    }

    const holidayMap: { [date: string]: string } = {};
    holidays.forEach(holiday => {
        holidayMap[holiday.date] = holiday.localName; // Using localName for better translation
    });

    return holidayMap;
};