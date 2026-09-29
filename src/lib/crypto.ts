import { PasswordStrengthResult } from '../types';

// Helper utilities for Base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM key from a master passphrase using PBKDF2 with SHA-256
 */
async function deriveKey(masterPassphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a password string on the client side using AES-256-GCM.
 * Plaintext password NEVER leaves the client.
 */
export async function encryptPassword(
  plaintext: string,
  masterPassphrase: string
): Promise<{ encryptedPassword: string; iv: string; salt: string }> {
  if (!masterPassphrase) {
    throw new Error('Master passphrase is required for client-side encryption.');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate random salt (16 bytes) and IV (12 bytes for AES-GCM)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(masterPassphrase, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    encryptedPassword: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
}

/**
 * Decrypts an encrypted password string on the client side using AES-256-GCM.
 */
export async function decryptPassword(
  encryptedData: { encryptedPassword: string; iv: string; salt: string },
  masterPassphrase: string
): Promise<string> {
  if (!masterPassphrase) {
    throw new Error('Master passphrase required for decryption.');
  }

  if (!encryptedData || !encryptedData.encryptedPassword || !encryptedData.iv || !encryptedData.salt) {
    throw new Error('Missing or incomplete cipher parameters.');
  }

  try {
    const encryptedBuffer = base64ToArrayBuffer(encryptedData.encryptedPassword);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const salt = base64ToArrayBuffer(encryptedData.salt);

    const key = await deriveKey(masterPassphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Invalid master passphrase or corrupted cipher data.');
  }
}

/**
 * Evaluates password strength and return score, label, color, and actionable feedback
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-red-500',
      feedback: ['Enter a password'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else feedback.push('Make it at least 12 characters long');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Use both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special symbols (e.g. !@#$%^&*)');
  }

  // Normalize score max to 4
  const finalScore = Math.min(4, Math.max(1, Math.floor(score * 0.8)));

  const map = [
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-emerald-500' },
    { label: 'Strong', color: 'bg-blue-600' },
  ];

  return {
    score: finalScore,
    label: map[finalScore].label,
    color: map[finalScore].color,
    feedback,
  };
}

/**
 * Generates a random secure password with customizable options
 */
export function generateSecurePassword(
  length: number = 16,
  options: { uppercase?: boolean; lowercase?: boolean; numbers?: boolean; symbols?: boolean } = {}
): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let charSet = '';
  if (lowercase) charSet += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) charSet += '0123456789';
  if (symbols) charSet += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charSet) charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charSet[randomValues[i] % charSet.length];
  }

  return result;
}
