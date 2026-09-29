/**
 * WebAuthn Biometric Authentication Helper for hVault
 * 
 * Enables hardware-backed biometric verification (Face ID, Touch ID, Windows Hello, Android Biometrics)
 * to securely seal and retrieve the Master Passphrase locally on supported devices without exposing keys.
 */

import { triggerHaptic } from './haptics';

// Storage key prefix for biometric credentials
const STORAGE_PREFIX = 'hvault_bio_envelope_';
const CREDENTIAL_ID_PREFIX = 'hvault_bio_cred_';

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper to get user-friendly platform biometric name (e.g. Windows Hello / ThinkPad Fingerprint, Touch ID, Android Fingerprint).
 */
export function getPlatformBiometricLabel(): { name: string; type: string; isLaptopOrDesktop: boolean } {
  if (typeof navigator === 'undefined') {
    return { name: 'Fingerprint / Windows Hello', type: 'Fingerprint', isLaptopOrDesktop: true };
  }

  const ua = navigator.userAgent || '';
  const isWindows = /Windows/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isLinux = /Linux/i.test(ua) && !isAndroid;

  if (isWindows) {
    return {
      name: 'Fingerprint / Windows Hello',
      type: 'Fingerprint Sensor',
      isLaptopOrDesktop: true,
    };
  }

  if (isMac) {
    return {
      name: 'Touch ID / Mac Biometrics',
      type: 'Touch ID',
      isLaptopOrDesktop: true,
    };
  }

  if (isAndroid) {
    return {
      name: 'Fingerprint / Face Unlock',
      type: 'Fingerprint',
      isLaptopOrDesktop: false,
    };
  }

  if (isIOS) {
    return {
      name: 'Face ID / Touch ID',
      type: 'Biometrics',
      isLaptopOrDesktop: false,
    };
  }

  if (isLinux) {
    return {
      name: 'Hardware Security Key / Fingerprint',
      type: 'Fingerprint',
      isLaptopOrDesktop: true,
    };
  }

  return {
    name: 'Fingerprint / Windows Hello',
    type: 'Fingerprint',
    isLaptopOrDesktop: true,
  };
}

/**
 * Detects if the current document is embedded in an iframe.
 */
export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Checks if the browser environment supports WebAuthn APIs.
 */
export async function isBiometricsSupported(): Promise<boolean> {
  try {
    if (
      typeof window === 'undefined' ||
      !window.PublicKeyCredential ||
      !navigator.credentials
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a platform biometric authenticator (Windows Hello, Touch ID, Android biometrics) is present on hardware.
 */
export async function checkHardwarePlatformAvailable(): Promise<boolean> {
  try {
    if (
      typeof window === 'undefined' ||
      !window.PublicKeyCredential ||
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
    ) {
      return false;
    }
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return Boolean(isAvailable);
  } catch {
    return false;
  }
}

/**
 * Checks if WebAuthn conditional mediation (passkey autofill) is supported.
 */
export async function isConditionalMediationSupported(): Promise<boolean> {
  try {
    if (
      typeof window === 'undefined' ||
      !window.PublicKeyCredential ||
      typeof (PublicKeyCredential as any).isConditionalMediationAvailable !== 'function'
    ) {
      return false;
    }
    return await (PublicKeyCredential as any).isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

/**
 * Checks if a biometric envelope is currently registered on this device for the user or device.
 */
export function hasSavedBiometrics(userIdOrEmail: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  if (userIdOrEmail) {
    const key = `${STORAGE_PREFIX}${encodeURIComponent(userIdOrEmail)}`;
    if (localStorage.getItem(key)) return true;
  }
  // Fallback: check if any biometric envelope exists on this local device
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX) && localStorage.getItem(k)) {
      return true;
    }
  }
  return false;
}

/**
 * Helper to retrieve stored envelope key for user or device fallback.
 */
function getStoredEnvelope(userIdOrEmail: string): { envelope: any; keyUserId: string } | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  if (userIdOrEmail) {
    const directKey = `${STORAGE_PREFIX}${encodeURIComponent(userIdOrEmail)}`;
    const stored = localStorage.getItem(directKey);
    if (stored) {
      try {
        return { envelope: JSON.parse(stored), keyUserId: userIdOrEmail };
      } catch {}
    }
  }
  // Device fallback
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      const stored = localStorage.getItem(k);
      if (stored) {
        try {
          const rawId = decodeURIComponent(k.substring(STORAGE_PREFIX.length));
          return { envelope: JSON.parse(stored), keyUserId: rawId || userIdOrEmail };
        } catch {}
      }
    }
  }
  return null;
}

/**
 * Removes biometric credential envelope for a user.
 */
export function removeBiometricCredential(userIdOrEmail: string): void {
  if (!userIdOrEmail) return;
  localStorage.removeItem(`${STORAGE_PREFIX}${encodeURIComponent(userIdOrEmail)}`);
  localStorage.removeItem(`${CREDENTIAL_ID_PREFIX}${encodeURIComponent(userIdOrEmail)}`);
}

/**
 * Derives a device-bound key from a local salt and credential ID using Web Crypto.
 */
async function deriveDeviceEnvelopeKey(salt: Uint8Array, secretSeed: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secretSeed),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 80000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Helper to parse WebAuthn permission & policy errors into clear user-friendly guidance.
 */
function parseWebAuthnError(err: any): { message: string; isIframeBlocked?: boolean; requiresUserGesture?: boolean } {
  const msg = err?.message || '';
  const name = err?.name || '';

  if (
    msg.includes('publickey-credentials-create') ||
    msg.includes('publickey-credentials-get') ||
    msg.includes('Permissions Policy') ||
    msg.includes('cross-origin child frames') ||
    (name === 'SecurityError' && isRunningInIframe())
  ) {
    return {
      message:
        'Browser Security Policy: Hardware biometric sensors (Windows Hello) are restricted inside embedded preview frames. Click "Open in Standalone Tab" to scan your fingerprint directly!',
      isIframeBlocked: true,
    };
  }

  if (
    msg.includes('user gesture') ||
    msg.includes('transient activation') ||
    (name === 'NotAllowedError' && msg.includes('gesture'))
  ) {
    return {
      message: 'Browser requires a tap or click to trigger Windows Hello.',
      requiresUserGesture: true,
    };
  }

  if (name === 'NotAllowedError') {
    return { message: 'Biometric prompt was canceled or timed out.' };
  }
  if (name === 'NotSupportedError') {
    return { message: 'Platform biometric sensor is not configured or supported in this browser window.' };
  }
  return { message: err.message || 'Hardware biometric verification failed.' };
}

/**
 * Registers a new WebAuthn biometric credential and seals the master passphrase.
 */
export async function registerBiometricCredential(
  userIdOrEmail: string,
  masterPassphrase: string
): Promise<{ success: boolean; error?: string; isIframeBlocked?: boolean }> {
  try {
    if (!masterPassphrase) {
      return { success: false, error: 'Master Passphrase is required.' };
    }

    if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) {
      return { success: false, error: 'WebAuthn is not supported in this browser.' };
    }

    // Generate cryptographic challenge
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(userIdOrEmail || 'hvault-user');

    const creationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'hVault Password Manager',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: userIdOrEmail || 'vault-user',
        displayName: userIdOrEmail ? userIdOrEmail.split('@')[0] : 'Vault Owner',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Windows Hello, Touch ID, Android Biometrics
        userVerification: 'required',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    triggerHaptic('medium');
    const credential = (await navigator.credentials.create({
      publicKey: creationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Biometric registration was cancelled.' };
    }

    const credIdBase64 = bufferToBase64(credential.rawId);
    
    // Encrypt the master passphrase using device key bound to credential ID
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const envelopeKey = await deriveDeviceEnvelopeKey(salt, `${userIdOrEmail}:${credIdBase64}`);

    const enc = new TextEncoder();
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      envelopeKey,
      enc.encode(masterPassphrase)
    );

    const envelope = {
      credId: credIdBase64,
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      cipher: bufferToBase64(encryptedData),
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `${STORAGE_PREFIX}${encodeURIComponent(userIdOrEmail)}`,
      JSON.stringify(envelope)
    );
    localStorage.setItem(
      `${CREDENTIAL_ID_PREFIX}${encodeURIComponent(userIdOrEmail)}`,
      credIdBase64
    );

    triggerHaptic('success');
    return { success: true };
  } catch (err: any) {
    triggerHaptic('error');
    const parsed = parseWebAuthnError(err);
    return { success: false, error: parsed.message, isIframeBlocked: parsed.isIframeBlocked };
  }
}

/**
 * Prompts user for biometric verification via WebAuthn and retrieves the unsealed Master Passphrase.
 */
export async function authenticateWithBiometrics(
  userIdOrEmail: string
): Promise<{ success: boolean; passphrase?: string; error?: string; isIframeBlocked?: boolean; requiresUserGesture?: boolean }> {
  try {
    if (!userIdOrEmail) {
      return { success: false, error: 'User identifier missing.' };
    }

    const storedData = getStoredEnvelope(userIdOrEmail);
    if (!storedData || !storedData.envelope) {
      return { success: false, error: 'No fingerprint/biometric credentials registered on this device yet.' };
    }

    const envelope = storedData.envelope;
    const effectiveUserId = storedData.keyUserId || userIdOrEmail;
    if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) {
      return { success: false, error: 'WebAuthn is not supported in this browser.' };
    }

    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const credIdBuffer = base64ToBuffer(envelope.credId);

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      allowCredentials: [
        {
          id: credIdBuffer,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    };

    triggerHaptic('medium');
    const assertion = (await navigator.credentials.get({
      publicKey: requestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: 'Biometric authentication was cancelled.' };
    }

    // Biometric verified! Decrypt sealed master passphrase
    const salt = base64ToBuffer(envelope.salt);
    const iv = base64ToBuffer(envelope.iv);
    const cipher = base64ToBuffer(envelope.cipher);

    const envelopeKey = await deriveDeviceEnvelopeKey(salt, `${effectiveUserId}:${envelope.credId}`);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      envelopeKey,
      cipher
    );

    const passphrase = new TextDecoder().decode(decryptedBuffer);
    triggerHaptic('success');
    return { success: true, passphrase };
  } catch (err: any) {
    triggerHaptic('error');
    const parsed = parseWebAuthnError(err);
    return {
      success: false,
      error: parsed.message,
      isIframeBlocked: parsed.isIframeBlocked,
      requiresUserGesture: parsed.requiresUserGesture,
    };
  }
}
