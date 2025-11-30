import { declOfNum } from './functions';

const defaultTimezone = 'Europe/Moscow';

export function dateToCurrentTimezone(date: Date, tz: string = defaultTimezone): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: tz }));
}

export function dateFromUnixtimeToCurrentTimezone(time: number, tz: string = defaultTimezone): Date {
    return dateToCurrentTimezone(new Date(time * 1000), tz);
}

export function dateToString(date: Date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const value = `${d < 10 ? `0${d}` : d}.${m < 10 ? `0${m}` : m}.${date.getFullYear()}`;
    return value;
}

export function formatTimeFromSecondsWithRounding(seconds: number) {
    if (seconds < 60) {
        return `${seconds} ${declOfNum(seconds, ['секунда', 'секунды', 'секунд'])}`;
    } else if (seconds < 3600) {
        const minutes = Math.round(seconds / 60);
        return `${minutes} ${declOfNum(minutes, ['минута', 'минуты', 'минут'])}`;
    } else if (seconds < 86400) {
        const hours = Math.round(seconds / 3600);
        return `${hours} ${declOfNum(hours, ['час', 'часа', 'часов'])}`;
    } else {
        const days = Math.round(seconds / 86400);
        return `${days} ${declOfNum(days, ['день', 'дня', 'дней'])}`;
    }
}
