import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  User, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  Calendar, 
  Clock,
  Shield, 
  Hash, 
  Grid,
  Zap,
  CreditCard
} from 'lucide-react';
import { DecryptedPasswordEntry, CategoryFlowType } from '../types';
import { getCategoryVisual, getCategoryFlow } from '../lib/categoryUtils';
import { resolveServiceAutoFill } from '../lib/autofillUtils';
import { triggerHaptic } from '../lib/haptics';
import { AtmCardItemCard } from './AtmCardItemCard';
import { OAuthItemCard } from './OAuthItemCard';
import { ApiKeyItemCard } from './ApiKeyItemCard';

interface PasswordCardProps {
  entry: DecryptedPasswordEntry;
  onEdit: (entry: DecryptedPasswordEntry) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onToggleFavorite?: (id: string, currentFavorite: boolean) => void;
  onRecordAccess?: (id: string) => void;
  onAutoFill?: (entry: DecryptedPasswordEntry) => void;
  autofillEnabled?: boolean;
  isLocked: boolean;
  index?: number;
  searchQuery?: string;
  categoryFlows?: Record<string, CategoryFlowType>;
}

const highlightMatch = (text?: string, query?: string) => {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <span
            key={i}
            className="bg-amber-400/35 text-amber-200 font-black px-1 py-0.5 rounded border-b-2 border-amber-400 shadow-sm"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

const formatLastUsed = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const timeMs = d.getTime();
    if (isNaN(timeMs)) return null;

    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - timeMs) / 1000));

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return null;
  }
};

const getSafeColorDot = (colorName?: string) => {
  switch (colorName) {
    case 'Matte Black': return 'bg-slate-900 border-slate-600';
    case 'Gunmetal Steel': return 'bg-slate-600 border-slate-400';
    case 'Crimson Red': return 'bg-red-800 border-red-500';
    case 'Navy Blue': return 'bg-blue-900 border-blue-500';
    case 'Brass Gold': return 'bg-amber-600 border-amber-400';
    case 'Alpine Silver': return 'bg-slate-300 border-white';
    case 'Emerald Green': return 'bg-emerald-700 border-emerald-400';
    case 'Rose Gold': return 'bg-rose-600 border-rose-300';
    case 'Midnight Purple': return 'bg-purple-900 border-purple-400';
    case 'Copper Bronze': return 'bg-orange-900 border-orange-500';
    case 'Charcoal Grey': return 'bg-slate-800 border-slate-500';
    case 'Arctic White': return 'bg-slate-100 border-slate-300';
    default: return 'bg-amber-500 border-amber-300';
  }
};

const PasswordCardComponent: React.FC<PasswordCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
  onRecordAccess,
  onAutoFill,
  autofillEnabled = true,
  isLocked,
  searchQuery = '',
  categoryFlows,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  const flow = getCategoryFlow(entry.category, categoryFlows);
  const isSafe = flow === 'safes' || entry.category === 'Safes';
  const isAtmCard = flow === 'atm_card' || Boolean(entry.bankName || entry.cardNumber || entry.cardProvider);
  const isOAuth = flow === 'oauth' || Boolean(entry.clientId || entry.oauthGrantType || entry.oauthScopes || entry.oauthProvider);
  const isApiKey = flow === 'api_key' || Boolean(entry.keyName || entry.keyHeaderPrefix || entry.keyEnvironment);

  if (isApiKey) {
    return (
      <ApiKeyItemCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite || (() => {})}
        onRecordAccess={onRecordAccess}
        searchQuery={searchQuery}
      />
    );
  }

  if (isAtmCard) {
    return (
      <AtmCardItemCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite || (() => {})}
        onRecordAccess={onRecordAccess}
        searchQuery={searchQuery}
      />
    );
  }

  if (isOAuth) {
    return (
      <OAuthItemCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite || (() => {})}
        onRecordAccess={onRecordAccess}
        searchQuery={searchQuery}
      />
    );
  }

  const handleCopyUsername = () => {
    triggerHaptic('light');
    onCopy(entry.username, isSafe ? 'Safe Location/ID' : 'Username');
    setCopiedField('username');
    onRecordAccess?.(entry.id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyPassword = () => {
    triggerHaptic('light');
    if (!entry.decryptedPassword) {
      onCopy('', isSafe ? 'Combination Code' : 'Password');
      return;
    }
    onCopy(entry.decryptedPassword, isSafe ? 'Combination Code' : 'Password');
    setCopiedField('password');
    onRecordAccess?.(entry.id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTogglePassword = () => {
    triggerHaptic('selection');
    const nextShow = !showPassword;
    setShowPassword(nextShow);
    if (nextShow) {
      onRecordAccess?.(entry.id);
    }
  };

  const handleEditClick = () => {
    triggerHaptic('selection');
    onRecordAccess?.(entry.id);
    onEdit(entry);
  };

  const handleWebsiteClick = () => {
    triggerHaptic('light');
    onRecordAccess?.(entry.id);
  };

  const visual = useMemo(() => getCategoryVisual(entry.category), [entry.category]);
  const lastUsedDisplay = useMemo(() => formatLastUsed(entry.lastAccessedAt), [entry.lastAccessedAt]);
  const autoFillInfo = useMemo(() => resolveServiceAutoFill(entry.serviceName, entry.websiteUrl), [entry.serviceName, entry.websiteUrl]);

  return (
    <div 
      className={`bg-[#0D1425] border rounded-2xl p-5 transition-all duration-200 ease-out shadow-xl group flex flex-col justify-between space-y-4 relative hover:scale-[1.015] hover:-translate-y-1 active:scale-[0.985] active:brightness-105 ${
        entry.isFavorite 
          ? 'border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.08)] hover:shadow-[0_14px_30px_rgba(251,191,36,0.15)] hover:border-amber-400/60 bg-gradient-to-b from-[#11192e] to-[#0D1425]' 
          : isSafe
            ? 'border-amber-500/20 hover:border-amber-400/50 hover:shadow-[0_14px_30px_rgba(251,191,36,0.12)]'
            : 'border-white/10 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-950/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 relative ${
            isSafe 
              ? 'bg-amber-500/10 border border-amber-400/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
              : 'bg-sky-500/10 border border-sky-400/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
          }`}>
            {isSafe ? <Shield className="w-6 h-6 text-amber-400" /> : entry.serviceName.charAt(0).toUpperCase()}
            {entry.isFavorite && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black">
                ★
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-white text-base tracking-tight truncate group-hover:text-sky-400 transition-colors uppercase flex items-center gap-1.5">
              <span>{highlightMatch(entry.serviceName, searchQuery)}</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap min-h-[22px]">
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded shrink-0 ${visual.badgeClass}`}>
                {isSafe ? '🔒 SAFE' : entry.category}
              </span>
              {entry.isFavorite && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> FAV
                </span>
              )}
              {/* Last Used micro-badge beside category */}
              {entry.lastAccessedAt && lastUsedDisplay ? (
                <span 
                  title={`Last accessed: ${new Date(entry.lastAccessedAt).toLocaleString()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border bg-sky-500/10 text-sky-300 border-sky-500/30 group-hover:border-sky-400 group-hover:bg-sky-500/20 group-hover:text-sky-100 group-hover:shadow-[0_0_8px_rgba(56,189,248,0.2)] shrink-0 whitespace-nowrap select-none"
                >
                  <Clock className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                  <span>Used {lastUsedDisplay}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Controls in Header (Favorite + External Link) */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                onToggleFavorite(entry.id, !!entry.isFavorite);
              }}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-90 active:brightness-125 select-none touch-manipulation ${
                entry.isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/20 hover:bg-amber-500/30'
                  : 'text-white/30 border-transparent hover:text-amber-400 hover:bg-white/5 hover:border-white/10'
              }`}
              title={entry.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
            >
              <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}

          {entry.websiteUrl && (
            <a
              href={entry.websiteUrl.startsWith('http') ? entry.websiteUrl : `https://${entry.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                handleWebsiteClick();
              }}
              className="p-1.5 sm:p-2 text-white/40 hover:text-sky-400 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
              title="Open Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Safe Specific Properties (Size & Color Badges) */}
      {isSafe && (entry.safeSize || entry.safeColor) && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          {entry.safeSize && (
            <span className="px-2 py-1 bg-[#0A0F1D] border border-amber-500/20 text-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Grid className="w-3 h-3 text-amber-400" />
              <span>{entry.safeSize} Size</span>
            </span>
          )}
          {entry.safeColor && (
            <span className="px-2 py-1 bg-[#0A0F1D] border border-amber-500/20 text-amber-200 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full border ${getSafeColorDot(entry.safeColor)}`} />
              <span>{entry.safeColor}</span>
            </span>
          )}
        </div>
      )}

      {/* Fields */}
      <div className={`space-y-3 bg-[#0A0F1D] p-3.5 rounded-xl border text-xs ${
        isSafe ? 'border-amber-500/20' : 'border-white/10'
      }`}>
        
        {/* Username / Account Field (hidden for Safes unless custom location provided) */}
        {(!isSafe || (entry.username && entry.username !== 'Safe Box' && entry.username !== 'Physical Safe')) && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-white/50 min-w-0 flex-1">
                {isSafe ? (
                  <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                )}
                <span className="truncate text-white/90 font-bold tracking-wide">
                  {highlightMatch(entry.username, searchQuery)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyUsername();
                }}
                className={`p-1.5 rounded-lg transition-all duration-150 shrink-0 flex items-center gap-1 cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation ${
                  copiedField === 'username'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-105'
                    : 'text-white/40 hover:text-sky-400 hover:bg-white/5 border border-transparent active:bg-white/10'
                }`}
                title={isSafe ? "Copy Location" : "Copy Username"}
              >
                {copiedField === 'username' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce-once" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider transition-all duration-200">
                      Copied!
                    </span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="border-t border-white/10" />
          </>
        )}

        {/* Password / Safe PIN */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white/50 min-w-0 flex-1">
            {isSafe ? (
              <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 shrink-0 text-sky-400" />
            )}
            
            {isLocked ? (
              <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : entry.decryptError ? (
              <span 
                className="text-red-400 font-black text-xs uppercase tracking-wider flex items-center gap-1 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md"
                title="Decryption failed with current Master Passphrase. Click 'Re-enter Master Passphrase' above to unlock with your correct key."
              >
                <AlertTriangle className="w-3 h-3 text-red-400" /> Key Mismatch
              </span>
            ) : (
              <span className={`font-mono text-white tracking-widest text-sm truncate font-bold select-all ${
                isSafe ? 'text-amber-300 font-extrabold tracking-widest' : ''
              }`}>
                {showPassword 
                  ? isSafe && entry.decryptedPassword
                    ? entry.decryptedPassword.split('').join(' ') 
                    : (entry.decryptedPassword ?? '')
                  : isSafe
                    ? '• • • • • •'
                    : '••••••••••••••••'}
              </span>
            )}
          </div>

          {!isLocked && !entry.decryptError && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePassword();
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation ${
                  showPassword 
                    ? 'text-sky-400 bg-sky-500/15 border border-sky-500/30' 
                    : 'text-white/40 hover:text-sky-400 hover:bg-white/5 border border-transparent'
                }`}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPassword();
                }}
                className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1 active:scale-90 active:brightness-125 select-none touch-manipulation ${
                  copiedField === 'password'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-105'
                    : 'text-white/40 hover:text-sky-400 hover:bg-white/5 border border-transparent active:bg-white/10'
                }`}
                title={isSafe ? "Copy Combination Code" : "Copy Password"}
              >
                {copiedField === 'password' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider transition-all duration-200">
                      Copied!
                    </span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1-Click AutoFill & Launch Button (when enabled for web services) */}
      {autofillEnabled && !isSafe && !isLocked && !entry.decryptError && entry.autofillEnabled !== false && autoFillInfo.targetUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('medium');
            onRecordAccess?.(entry.id);
            onAutoFill?.(entry);
          }}
          title={`1-Click Launch & AutoFill for ${autoFillInfo.displayName}`}
          className="w-full py-2 px-3 bg-gradient-to-r from-sky-500/15 via-sky-600/20 to-blue-600/15 hover:from-sky-500/30 hover:via-sky-600/35 hover:to-blue-600/30 border border-sky-500/35 hover:border-sky-400 text-sky-200 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer shadow-sm group/autofill select-none active:scale-[0.96] active:brightness-125 touch-manipulation"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded-lg bg-sky-500/25 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-sm shrink-0">
              <Zap className="w-3 h-3 fill-sky-300 group-hover/autofill:scale-110 transition-transform" />
            </div>
            <span className="truncate text-[11px]">AutoFill {autoFillInfo.displayName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-sky-300 font-bold shrink-0">
            <span>Launch</span>
            <ExternalLink className="w-3 h-3 text-sky-400 group-hover/autofill:translate-x-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* Notes preview if available */}
      {entry.notes && (
        <p className="text-xs text-white/40 italic line-clamp-1 px-1">
          "{highlightMatch(entry.notes, searchQuery)}"
        </p>
      )}

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-white/40 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted
          </span>
          {entry.createdAt && formatDate(entry.createdAt) && (
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-medium shrink-0 group-hover:text-white/70 transition-colors">
              <Calendar className="w-3 h-3 text-sky-400/70" />
              <span>Created {formatDate(entry.createdAt)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
            className="p-1.5 text-white/50 hover:text-sky-400 hover:bg-white/5 active:bg-sky-500/10 active:text-sky-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px] active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Edit Entry"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('warning');
              onDelete(entry.id);
            }}
            className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PasswordCard = React.memo(PasswordCardComponent);

