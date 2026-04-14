import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generatePONumber(lastNumber: number = 0) {
  const next = lastNumber + 1;
  return `PO-${new Date().getFullYear()}-${next.toString().padStart(5, '0')}`;
}
