import crypto from 'crypto';

export function generateAccessCode(): string {
  // Generate a random 6-character alphanumeric code in format: AB12-34
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format as XX XX-XX
  return `${code.slice(0, 2)}${code.slice(2, 4)}-${code.slice(4, 6)}`;
}

export function hashCode(code: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

export function generateVoterUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


