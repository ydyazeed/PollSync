/**
 * Normalize an access code by removing spaces and converting to uppercase
 * Handles user input like "AB 12-34" or "ab1234" and converts to "AB12-34"
 */
export function normalizeCode(code: string): string {
  // Remove all spaces and convert to uppercase
  const cleaned = code.replace(/\s/g, '').toUpperCase();
  
  // If it doesn't have a dash, add one in the right place (after 4 chars)
  if (!cleaned.includes('-') && cleaned.length === 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  return cleaned;
}


