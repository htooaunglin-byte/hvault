import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HVaultLogo } from './HVaultLogo';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  Fingerprint, 
  Check, 
  Smartphone,
  Laptop,
  ExternalLink,
  Sparkles,
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';
import { PasswordEntry } from '../types';
import { decryptPassword } from '../lib/crypto';
import { 
  hasSavedBiometrics, 
  authenticateWithBiometrics, 
  registerBiometricCredential,
  removeBiometricCredential,
  getPlatformBiometricLabel,
  checkHardwarePlatformAvailable,
  isRunningInIframe
} from '../lib/webauthn';
import { triggerHaptic } from '../lib/haptics';

interface MasterPassphraseModalProps {
  isOpen: boolean;
  onSetPassphrase: (passphrase: string) => void;
  userEmail?: string | null;
  existingEntries?: PasswordEntry[];
}

export const MasterPassphraseModal: React.FC<MasterPassphraseModalProps> = ({
  isOpen,
  onSetPassphrase,
  userEmail,
  existingEntries = [],
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState('');
  const [isIframeBlockedError, setIsIframeBlockedError] = useState(false);
  const [needsClickGesture, setNeedsClickGesture] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [hasBiometricEnvelope, setHasBiometricEnvelope] = useState(false);
  const [isHardwareAvailable, setIsHardwareAvailable] = useState(true);
  const [linkOnSubmit, setLinkOnSubmit] = useState(true);

  const passphraseRef = useRef(passphrase);
  passphraseRef.current = passphrase;

  const existingEntriesRef = useRef(existingEntries);
  existingEntriesRef.current = existingEntries;

  const prevIsOpenRef = useRef(false);
  const hasAutoTriggeredRef = useRef(false);

  const userId = userEmail || 'hvault-default-user';
  const platformLabel = getPlatformBiometricLabel();
  const inIframe = isRunningInIframe();

  // Test verify passphrase against existing encrypted entries
  const verifyPassphraseAgainstEntries = useCallback(async (keyToTest: string): Promise<boolean> => {
    const entries = existingEntriesRef.current;
    const validEntries = entries.filter(
      (entry) => entry.encryptedPassword && entry.iv && entry.salt
    );

    if (validEntries.length === 0) {
      return true;
    }

    let verifiedCount = 0;
    const testEntries = validEntries.slice(0, 3);
    for (const testEntry of testEntries) {
      try {
        await decryptPassword(
          {
            encryptedPassword: testEntry.encryptedPassword,
            iv: testEntry.iv,
            salt: testEntry.salt,
          },
          keyToTest
        );
        verifiedCount++;
      } catch {
        // Failed this item
      }
    }

    return verifiedCount > 0;
  }, []);

  // 1. WebAuthn Biometric / Fingerprint Unlock Flow
  const handleBiometricUnlock = useCallback(async (isAuto = false) => {
    setError('');
    setIsIframeBlockedError(false);
    setNeedsClickGesture(false);
    setSuccessInfo('');

    if (!isAuto) {
      triggerHaptic('selection');
    }

    const currentTypedPassphrase = passphraseRef.current;

    // Check if biometric credential is saved on this device
    const credExists = hasSavedBiometrics(userId);
    if (!credExists) {
      if (currentTypedPassphrase && currentTypedPassphrase.length >= 4) {
        // User has a passphrase typed! Register directly with hardware
        setIsBiometricAuthenticating(true);
        try {
          const isValid = await verifyPassphraseAgainstEntries(currentTypedPassphrase);
          if (!isValid) {
            setError('The entered Master Passphrase does not match your encrypted vault. Please verify your passphrase.');
            setIsBiometricAuthenticating(false);
            return;
          }

          const regResult = await registerBiometricCredential(userId, currentTypedPassphrase);
          if (regResult.success) {
            setHasBiometricEnvelope(true);
            setSuccessInfo(`Success! ${platformLabel.name} linked. Unlocking vault...`);
            setTimeout(() => {
              onSetPassphrase(currentTypedPassphrase);
            }, 400);
          } else {
            setError(regResult.error || 'Biometric enrollment failed.');
            if (regResult.isIframeBlocked) {
              setIsIframeBlockedError(true);
            }
          }
        } catch (err: any) {
          setError(err?.message || 'Biometric setup failed.');
        } finally {
          setIsBiometricAuthenticating(false);
        }
        return;
      } else {
        if (!isAuto) {
          setError(
            `To link your ${platformLabel.name} on this Lenovo laptop: Enter your Master Passphrase below and click "Link & Unlock with ${platformLabel.name}".`
          );
        }
        return;
      }
    }

    setIsBiometricAuthenticating(true);
    try {
      const authResult = await authenticateWithBiometrics(userId);
      
      if (!authResult.success || !authResult.passphrase) {
        if (authResult.isIframeBlocked) {
          setIsIframeBlockedError(true);
          setError(authResult.error || 'Browser Security: Fingerprint sensor is restricted inside embedded iframe preview.');
        } else if (authResult.requiresUserGesture) {
          // Browser requires user gesture (click/tap) before opening Windows Hello dialog
          setNeedsClickGesture(true);
        } else {
          if (!isAuto) {
            setError(authResult.error || 'Biometric authentication was cancelled or failed.');
          }
        }
        setIsBiometricAuthenticating(false);
        return;
      }

      // Verify retrieved passphrase
      const isValid = await verifyPassphraseAgainstEntries(authResult.passphrase);
      if (!isValid) {
        setError('Stored biometric key is out of sync with current vault. Please enter passphrase manually to reset.');
        removeBiometricCredential(userId);
        setHasBiometricEnvelope(false);
        setIsBiometricAuthenticating(false);
        return;
      }

      setSuccessInfo(`${platformLabel.name} verified! Unlocking...`);
      setTimeout(() => {
        onSetPassphrase(authResult.passphrase!);
      }, 200);
    } catch (err: any) {
      console.error('Biometric unlock error:', err);
      if (!isAuto) {
        setError(err?.message || 'Biometric unlock failed.');
      }
    } finally {
      setIsBiometricAuthenticating(false);
    }
  }, [userId, platformLabel.name, onSetPassphrase, verifyPassphraseAgainstEntries]);

  // Check hardware support and trigger auto-prompt on modal opening transition
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPassphrase('');
      setError('');
      setIsIframeBlockedError(false);
      setNeedsClickGesture(false);
      setSuccessInfo('');
      setShowPassphrase(false);
      setIsVerifying(false);
      setIsBiometricAuthenticating(false);
      hasAutoTriggeredRef.current = false;

      // Check hardware platform availability
      checkHardwarePlatformAvailable().then((avail) => {
        setIsHardwareAvailable(avail);
      });

      const hasCred = hasSavedBiometrics(userId);
      setHasBiometricEnvelope(hasCred);

      // If credential exists, attempt auto-prompt
      if (hasCred) {
        hasAutoTriggeredRef.current = true;
        // Small delay to allow modal render
        const timer = setTimeout(() => {
          handleBiometricUnlock(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, userId, handleBiometricUnlock]);

  // One-click anywhere trigger fallback if browser requires user gesture
  useEffect(() => {
    if (!isOpen || !hasBiometricEnvelope) return;

    const handleGlobalClickToTrigger = (e: MouseEvent | TouchEvent) => {
      // Don't intercept if clicking password input or unlink button
      const target = e.target as HTMLElement | null;
      if (target?.closest('input') || target?.closest('form') || target?.closest('button[data-no-bio="true"]')) {
        return;
      }
      if (!isBiometricAuthenticating && !isVerifying) {
        handleBiometricUnlock(false);
      }
    };

    window.addEventListener('pointerdown', handleGlobalClickToTrigger, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleGlobalClickToTrigger);
    };
  }, [isOpen, hasBiometricEnvelope, isBiometricAuthenticating, isVerifying, handleBiometricUnlock]);

  // 2. Passphrase Form Submit Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsIframeBlockedError(false);
    setSuccessInfo('');

    if (!passphrase || passphrase.length < 4) {
      setError('Master Passphrase must be at least 4 characters long.');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyPassphraseAgainstEntries(passphrase);
      if (!isValid) {
        setError(
          'Incorrect Master Passphrase. The entered key cannot decrypt your existing vault entries. Please check for typos and try again.'
        );
        setIsVerifying(false);
        return;
      }

      // If user opted to link fingerprint and it's not yet linked, try enrolling
      if (linkOnSubmit && !hasBiometricEnvelope) {
        try {
          await registerBiometricCredential(userId, passphrase);
        } catch {
          // Non-blocking
        }
      }

      onSetPassphrase(passphrase);
      setPassphrase('');
    } catch (err: any) {
      setError(err?.message || 'Master Passphrase verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="master-passphrase-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/85 backdrop-blur-md"
        >
          <motion.div
            key="master-passphrase-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-md bg-[#0D1425] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
          >
            {/* Header with hVault Logo & Live Hardware Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HVaultLogo size="md" className="w-11 h-11" />
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Unlock hVault</h2>
                  <p className="text-xs font-bold text-white/50">{userEmail || 'Zero-Knowledge Encryption'}</p>
                </div>
              </div>

              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  hasBiometricEnvelope 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950/40'
                    : isHardwareAvailable
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
                title={hasBiometricEnvelope ? `Active: ${platformLabel.name}` : `Hardware Ready: ${platformLabel.name}`}
              >
                <Fingerprint className={`w-3.5 h-3.5 ${hasBiometricEnvelope ? 'text-emerald-400' : 'text-sky-400'}`} />
                <span>{hasBiometricEnvelope ? 'Fingerprint Active' : 'Sensor Ready'}</span>
              </div>
            </div>

            {/* IFRAME PREVIEW CALLOUT (If browser restricts hardware sensors inside iframe) */}
            {inIframe && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <p className="text-[11px] leading-snug">
                    <strong>Preview Mode:</strong> Browsers restrict biometric hardware sensors inside embedded frames. Open in standalone tab for instant 1-touch Windows Hello access.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="py-1.5 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Standalone Tab</span>
                  </button>
                </div>
              </div>
            )}

            {/* VISUAL BIOMETRIC RADAR SCANNER PROMPT */}
            {hasBiometricEnvelope ? (
              <motion.div 
                onClick={() => handleBiometricUnlock(false)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-b from-emerald-950/30 via-[#0C1B2E]/60 to-[#0A1324] border border-emerald-500/30 cursor-pointer shadow-lg shadow-emerald-950/30 transition-all select-none group"
              >
                {/* Pulsing radar ripples */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1.8],
                      opacity: [0.35, 0.15, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    className="absolute w-24 h-24 rounded-full border border-emerald-400/40"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1.5],
                      opacity: [0.4, 0.2, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      delay: 0.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    className="absolute w-20 h-20 rounded-full border border-emerald-300/30"
                  />
                </div>

                <div className="relative z-10 flex items-center gap-3.5">
                  {/* Glowing fingerprint icon with vertical laser scanline */}
                  <div className="relative w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    <Fingerprint className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                    {/* Laser scan animation bar */}
                    <motion.div
                      animate={{
                        y: [-24, 24, -24],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_8px_#34d399]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>{platformLabel.name} Ready</span>
                    </div>
                    <p className="text-[11px] text-white/70 font-medium leading-snug mt-0.5">
                      {isBiometricAuthenticating ? (
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                          <span>Touch your Lenovo fingerprint sensor now...</span>
                        </span>
                      ) : needsClickGesture ? (
                        <span className="text-sky-300 font-bold">
                          Click anywhere on screen to trigger Windows Hello prompt.
                        </span>
                      ) : (
                        <span>Touch your fingerprint sensor or click here to scan Windows Hello.</span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-[9px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-300" />
                      <span>Instant</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Hardware detected but not yet linked prompt */
              <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-b from-sky-950/30 via-[#0B1A2E]/40 to-[#0A1324] border border-sky-500/25 shadow-md space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                    <Laptop className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                      {platformLabel.name} Detected on Laptop
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                      1-Step Setup
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                  Enter your Master Passphrase once below and click <strong>"Link & Unlock"</strong> to pair your Lenovo ThinkPad fingerprint reader for 1-touch unlock.
                </p>
              </motion.div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 space-y-2">
                <p className="leading-relaxed">{error}</p>
                {isIframeBlockedError && (
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-white rounded-lg font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-[11px] cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Standalone Tab to Scan</span>
                  </button>
                )}
              </div>
            )}

            {/* Success Notification */}
            {successInfo && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleBiometricUnlock(false)}
                disabled={isBiometricAuthenticating || isVerifying}
                className={`w-full py-3.5 px-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg select-none touch-manipulation active:scale-95 disabled:opacity-50 ${
                  hasBiometricEnvelope
                    ? 'bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 hover:from-emerald-500 hover:via-sky-500 hover:to-indigo-500 text-white border-emerald-400/40 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-400/40 shadow-sky-950/40'
                }`}
              >
                {isBiometricAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Scanning Lenovo Fingerprint Sensor...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 text-sky-200 shrink-0 animate-pulse" />
                    <span>
                      {hasBiometricEnvelope 
                        ? `Touch Fingerprint Sensor to Unlock`
                        : `Link & Unlock with ${platformLabel.name}`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1 text-[10px] text-white/45 font-medium">
                <span className="flex items-center gap-1.5">
                  {platformLabel.isLaptopOrDesktop ? (
                    <Laptop className="w-3 h-3 text-sky-400" />
                  ) : (
                    <Smartphone className="w-3 h-3 text-sky-400" />
                  )}
                  <span>{platformLabel.isLaptopOrDesktop ? 'Lenovo ThinkPad / Windows Hello' : 'Mobile Biometrics'}</span>
                </span>
                {hasBiometricEnvelope ? (
                  <button
                    type="button"
                    data-no-bio="true"
                    onClick={() => {
                      triggerHaptic('warning');
                      removeBiometricCredential(userId);
                      setHasBiometricEnvelope(false);
                      setSuccessInfo('Fingerprint credential cleared from this device.');
                    }}
                    className="hover:text-red-400 transition-colors cursor-pointer underline"
                  >
                    Unlink Device
                  </button>
                ) : (
                  <span className="text-white/40">Enter passphrase below to pair</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-wider text-white/40">
                Or Unlock with Master Passphrase
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Manual Passphrase Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
                  Master Passphrase
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    name="hvault-master-passphrase-key"
                    id="hvault-master-passphrase-key"
                    autoComplete="new-password"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter Master Passphrase"
                    autoFocus={!hasBiometricEnvelope}
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white cursor-pointer"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!hasBiometricEnvelope && (
                <label className="flex items-center gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 cursor-pointer hover:bg-white/10 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={linkOnSubmit}
                    onChange={(e) => setLinkOnSubmit(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-[#070B14] border-white/20"
                  />
                  <span className="text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-sky-400" />
                    <span>Also link fingerprint on this Lenovo laptop for 1-touch unlock</span>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={isVerifying || isBiometricAuthenticating}
                className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800/60 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer select-none touch-manipulation active:scale-95"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Passphrase...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock with Passphrase</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
