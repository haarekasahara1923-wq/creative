import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAffiliateCode = () => {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
  return nanoid();
};

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  plot: 'Plot',
  flat_1bhk: '1 BHK Flat',
  flat_2bhk: '2 BHK Flat',
  flat_3bhk: '3 BHK Flat',
  duplex: 'Duplex',
  row_house: 'Row House',
};

export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  completed: 'Completed',
  running: 'Running',
  upcoming: 'Upcoming',
};
