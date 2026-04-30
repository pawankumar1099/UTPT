import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

export function timeAgo(input) {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];
  for (const i of intervals) {
    const v = Math.floor(seconds / i.secs);
    if (v >= 1) return `${v} ${i.label}${v > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
