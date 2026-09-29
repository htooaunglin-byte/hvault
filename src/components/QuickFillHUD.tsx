import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Clock, 
  ShieldCheck, 
  Key, 
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { HVaultLogo } from './HVaultLogo';
import { DecryptedPasswordEntry } from '../types';
import { resolveServiceAutoFill } from '../lib/autofillUtils';

interface QuickFillHUDProps {
  entry: DecryptedPasswordEntry | null;
  targetUrl?: string;
  serviceName?: string;
  onClose: () => void;
  onCopy?: (text: string, label: string) => void;
  onCopyPassword?: (password: string) => void;
  onCopyUsername?: (username: string) => void;
}

export const QuickFillHUD: React.FC<QuickFillHUDProps> = ({
  entry,
  targetUrl: explicitTargetUrl,
  serviceName: explicitServiceName,
  onClose,
  onCopy,
  onCopyPassword,
  onCopyUsername,
}) => {
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>('password');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!entry) return;
    setTimeLeft(60);
    setCopiedField('password');

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [entry]);

  // Safely trigger onClose when countdown reaches zero in a separate effect
  useEffect(() => {
    if (timeLeft === 0) {
      onClose();
    }
  }, [timeLeft, onClose]);

  if (!entry) return null;

  const autoFillInfo = resolveServiceAutoFill(
    explicitServiceName || entry.serviceName,
    explicitTargetUrl || entry.websiteUrl
  );
  const targetUrl = explicitTargetUrl || autoFillInfo.targetUrl;
  const serviceName = explicitServiceName || autoFillInfo.displayName || entry.serviceName;

  const handleCopyUsername = () => {
    if (!entry.username) return;
    if (onCopyUsername) {
      onCopyUsername(entry.username);
    } else if (onCopy) {
      onCopy(entry.username, 'Username');
    }
    setCopiedField('username');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyPassword = () => {
    if (!entry.decryptedPassword) return;
    if (onCopyPassword) {
      onCopyPassword(entry.decryptedPassword);
    } else if (onCopy) {
      onCopy(entry.decryptedPassword, 'Password');
    }
    setCopiedField('password');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReopenWebsite = () => {
    if (targetUrl) {
      const normalized = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
      window.open(normalized, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm sm:w-full mx-auto bg-[#0D1425]/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-sky-950/40 text-white select-none ring-1 ring-sky-400/20"
      >
        {/* Header with service info and close button */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <HVaultLogo size="custom" className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">
                  {entry.serviceName}
                </h4>
                <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded">
                  AutoFill Ready
                </span>
              </div>
              <p className="text-[10px] text-white/50 truncate flex items-center gap-1">
                <span>Switched to login tab? Ready to paste</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {timeLeft}s
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss QuickFill"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Copy Action Buttons */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            type="button"
            onClick={handleCopyUsername}
            disabled={!entry.username}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
              copiedField === 'username'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate text-[11px]">{entry.username || 'No User'}</span>
            </div>
            {copiedField === 'username' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-white/40 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyPassword}
            disabled={!entry.decryptedPassword}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
              copiedField === 'password'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-sky-600/30 hover:bg-sky-600/40 border-sky-500/40 text-sky-200 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Key className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span className="truncate text-[11px]">
                {copiedField === 'password' ? 'Password Copied!' : 'Copy Password'}
              </span>
            </div>
            {copiedField === 'password' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-sky-300 shrink-0" />
            )}
          </button>
        </div>

        {/* Footer info & re-open button */}
        <div className="flex items-center justify-between pt-2 text-[10px] text-white/50">
          <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Staging Active</span>
          </span>

          {autoFillInfo.targetUrl && (
            <button
              type="button"
              onClick={handleReopenWebsite}
              className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Re-open Login</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
