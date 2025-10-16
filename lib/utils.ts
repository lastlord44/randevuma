import { DAYS_OF_WEEK_TR, MONTHS_TR, TIMEZONE, LOCALE } from './constants';

// Tarih formatlama yardımcı fonksiyonları
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_TR[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getDayName(date: Date): string {
  return DAYS_OF_WEEK_TR[date.getDay()];
}

// Fiyat formatlama
export function formatPrice(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// CSS sınıf birleştirme
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Slug oluşturma (Türkçe karakter desteği ile)
export function slugify(text: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
  };
  
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
