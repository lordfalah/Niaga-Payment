import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function abbreviationName(name: string): string {
  return name
    .split(" ")
    .map((kata) => kata[0]?.toUpperCase())
    .join("");
}

/**
 * Mengubah string menjadi format "judul kasus" (title case).
 * Contoh: "nama produk" menjadi "Nama Produk".
 * @param {string} str - String yang akan diformat.
 * @returns {string} String yang sudah diformat.
 */
export function toTitleCase(str: string): string {
  if (!str) {
    return "";
  }
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

export const getEnumKeys = <T extends Record<string, string | number>>(
  enumObject: T,
): string[] => {
  return Object.keys(enumObject).filter((key) => isNaN(Number(key)));
};

export function formatToRupiah(number: number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

/**
 * Mengonversi objek Date menjadi string dengan format "Bulan Hari, Tahun".
 * Contoh: September 2, 2025
 * * @param {Date} dateObj - Objek Date yang akan diformat.
 * @returns {string} String tanggal yang diformat.
 */
export function formatDateToMonthDayYear(dateObj: Date) {
  // Pastikan parameter yang diterima adalah instance dari Date.
  if (!(dateObj instanceof Date)) {
    console.error("Parameter harus berupa objek Date.");
    return null;
  }

  // Gunakan format() dengan token 'MMMM d, yyyy'
  // MMMM: nama bulan lengkap (e.g., September)
  // d: tanggal dalam bulan (tanpa nol di depan)
  // yyyy: tahun 4 digit
  return format(dateObj, "MMMM d, yyyy");
}

export function isObjectLike(value: object) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
