import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a phone number for WhatsApp redirects.
 * Smart logic for Somali numbers (starting with 6, 0, or 252) and international numbers.
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  
  // If it already has a plus, assume it's correctly formatted international
  if (phone.trim().startsWith("+")) {
    return phone.trim();
  }

  let clean = phone.replace(/\D/g, ""); // Remove non-digits
  
  if (clean.startsWith("0")) {
    // Local Somali 061... -> 25261...
    clean = "252" + clean.substring(1);
  } else if (clean.startsWith("6") && clean.length <= 10) {
    // Local Somali 61... -> 25261...
    clean = "252" + clean;
  } else if (clean.startsWith("252")) {
    // Already has country code 252...
    // do nothing, it's correct
  }
  
  return `+${clean}`;
}
