import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePhoneNumber(phoneNumber: string | undefined | null): string {
  if (!phoneNumber) {
    return "";
  }
  // Removes common separators, keeps digits and +
  return phoneNumber.replace(/[\s()-]/g, "");
}
