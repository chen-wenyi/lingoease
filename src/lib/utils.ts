import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export function getProviderFromApiKey(
  apiKey: string
): 'google' | 'openai' | '' {
  if (apiKey.startsWith('AIza')) {
    return 'google';
  } else if (apiKey.startsWith('sk-')) {
    return 'openai';
  } else {
    return '';
  }
}
