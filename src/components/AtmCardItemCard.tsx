import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CreditCard, 
  Wifi, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Star, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Hash, 
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { DecryptedPasswordEntry } from '../types';
import { getCardColorStyle, CardColorOption, getCategoryVisual } from '../lib/categoryUtils';
import { triggerHaptic } from '../lib/haptics';

interface AtmCardItemCardProps {
  entry: DecryptedPasswordEntry;
  onEdit: (entry: DecryptedPasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onRecordAccess?: (id: string) => void;
  searchQuery?: string;
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

export const AtmCardItemCard: React.FC<AtmCardItemCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRecordAccess,
  searchQuery = '',
}) => {
  const [showPin, setShowPin] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copiedType, setCopiedType] = useState<'pin' | 'number' | 'holder' | 'account' | null>(null);

  const cardStyle: CardColorOption = getCardColorStyle(entry.cardColor);
  const bankName = entry.bankName || entry.serviceName || 'ATM Card';
  const cardType = entry.cardType || '';
  const cardProvider = entry.cardProvider || '';
  const pin = entry.decryptedPassword || '';
  const cardNumber = entry.cardNumber || '';
  const cardHolder = entry.cardHolder || entry.username || 'Cardholder';
  const cardExpiry = entry.cardExpiry || '';
  const cardCvv = entry.cardCvv || '';

  // Resolves the effective card/account number
  const effectiveNumber = (cardNumber || (entry.username && /^\d+[\s\d]*$/.test(entry.username) ? entry.username : '')).trim();

  const visual = useMemo(() => getCategoryVisual(entry.category), [entry.category]);
  const lastUsedDisplay = useMemo(() => formatLastUsed(entry.lastAccessedAt), [entry.lastAccessedAt]);

  const subtitleParts = [cardType, cardProvider].filter(Boolean);
  const subtitleText = subtitleParts.length > 0 ? subtitleParts.join(' • ') : 'ATM / Payment Card';

  const copyToClipboard = (text: string, type: 'pin' | 'number' | 'holder' | 'account', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text) return;
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onRecordAccess) onRecordAccess(entry.id);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleToggleCardNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('selection');
    const nextShow = !showCardNumber;
    setShowCardNumber(nextShow);
    if (nextShow && onRecordAccess) {
      onRecordAccess(entry.id);
    }
  };

  const displayMaskedNumber = () => {
    if (showCardNumber) {
      if (!effectiveNumber) return 'NO CARD NUMBER';
      return effectiveNumber;
    }

    if (!effectiveNumber) return '•••• •••• •••• ••••';
    
    const digitsOnly = effectiveNumber.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      return `•••• •••• •••• ${digitsOnly.slice(-4)}`;
    }
    return '•••• •••• •••• ••••';
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('selection');
    if (onRecordAccess) onRecordAccess(entry.id);
    onEdit(entry);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('warning');
    onDelete(entry.id);
  };

  return (
    <div
      className={`bg-[#0D1425] border rounded-2xl p-5 transition-all duration-200 ease-out shadow-xl group flex flex-col justify-between space-y-4 relative hover:scale-[1.015] hover:-translate-y-1 active:scale-[0.985] active:brightness-105 ${
        entry.isFavorite 
          ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:shadow-[0_14px_30px_rgba(16,185,129,0.15)] hover:border-emerald-400/60 bg-gradient-to-b from-[#11192e] to-[#0D1425]' 
          : 'border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/50'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-950/40 relative">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            {entry.isFavorite && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black shadow-sm">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-white text-base tracking-tight truncate group-hover:text-emerald-400 transition-colors uppercase flex items-center gap-1.5">
              <span>{highlightMatch(bankName, searchQuery)}</span>
            </h3>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap min-h-[22px]">
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded shrink-0 ${visual.badgeClass}`}>
                {entry.category || 'ATM Cards'}
              </span>
              <span className="text-[9px] text-white/60 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded truncate font-bold uppercase tracking-wider">
                {subtitleText}
              </span>
              {entry.isFavorite && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> FAV
                </span>
              )}
              {entry.lastAccessedAt && lastUsedDisplay ? (
                <span 
                  title={`Last accessed: ${new Date(entry.lastAccessedAt).toLocaleString()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-100 shrink-0 whitespace-nowrap select-none"
                >
                  <Clock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span>Used {lastUsedDisplay}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Favorite Button in Top Right */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onToggleFavorite(entry.id, entry.isFavorite);
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
        </div>
      </div>

      {/* Mini Card Graphic Mockup */}
      <div 
        className={`rounded-xl p-3 border shadow-md relative overflow-hidden text-white flex flex-col justify-between h-30 ${cardStyle.bgGradient} ${cardStyle.borderClass}`}
      >
        <div className="flex items-center justify-between text-xs opacity-90">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold tracking-wider text-[11px] truncate uppercase">
              {bankName}
            </span>
          </div>
          <Wifi className="w-3.5 h-3.5 rotate-90 opacity-70 shrink-0" />
        </div>

        {/* Number Row above Cardholder */}
        <div className="my-auto flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-black tracking-widest drop-shadow select-all truncate">
            {displayMaskedNumber()}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleCardNumber}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/90 transition-colors cursor-pointer active:scale-90 select-none"
              title={showCardNumber ? "Mask card number" : "Reveal card number"}
            >
              {showCardNumber ? <EyeOff className="w-3.5 h-3.5 text-emerald-300" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            {effectiveNumber && (
              <button
                type="button"
                onClick={(e) => copyToClipboard(effectiveNumber, 'number', e)}
                className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/90 transition-colors cursor-pointer active:scale-90 select-none"
                title="Copy card number"
              >
                {copiedType === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Cardholder & Expiry Row */}
        <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider opacity-90 gap-2">
          <div className="truncate flex-1 min-w-0">
            <p className="text-[8px] opacity-70">CARDHOLDER</p>
            <p className="truncate font-semibold select-all">{highlightMatch(cardHolder, searchQuery)}</p>
          </div>
          {cardExpiry && (
            <div className="text-right font-mono shrink-0">
              <p className="text-[8px] opacity-70">EXPIRES</p>
              <p>{cardExpiry}</p>
            </div>
          )}
        </div>
      </div>

      {/* Encrypted PIN Box */}
      <div className="bg-[#0A0F1D] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <Hash className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">ATM Secure PIN</p>
            <p className="font-mono text-xs font-bold text-emerald-400 tracking-widest select-all">
              {showPin ? (pin || 'No PIN') : (pin ? '••••' : 'None')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('selection');
              const nextPin = !showPin;
              setShowPin(nextPin);
              if (nextPin && onRecordAccess) onRecordAccess(entry.id);
            }}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer active:scale-90 select-none"
            title={showPin ? "Hide PIN" : "Reveal PIN"}
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5 text-emerald-300" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => copyToClipboard(pin, 'pin', e)}
            className={`py-1.5 px-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border select-none ${
              copiedType === 'pin'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm active:scale-90'
            }`}
            title="Copy encrypted ATM PIN"
          >
            {copiedType === 'pin' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            <span>{copiedType === 'pin' ? 'COPIED' : 'COPY PIN'}</span>
          </button>
        </div>
      </div>

      {/* CVV & Online Banking Username / Account ID Preview */}
      {(cardCvv || (entry.username && entry.username !== cardHolder && entry.username !== cardNumber) || entry.notes) && (
        <div className="space-y-1.5 px-1 text-xs">
          {entry.username && entry.username !== cardHolder && entry.username !== cardNumber && (
            <div className="flex items-center justify-between text-white/70 bg-[#0A0F1D] px-2.5 py-1.5 rounded-lg border border-white/5">
              <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-400" /> Username / ID:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-white tracking-wide">
                  {highlightMatch(entry.username, searchQuery)}
                </span>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(entry.username, 'account', e)}
                  className="text-white/40 hover:text-emerald-300 p-0.5"
                  title="Copy Username"
                >
                  {copiedType === 'account' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {cardCvv && (
            <div className="flex items-center justify-between text-white/60 bg-[#0A0F1D] px-2.5 py-1 rounded-lg border border-white/5">
              <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Security CVV:</span>
              <span className="font-mono font-bold text-white tracking-widest">
                {showPin ? cardCvv : '•••'}
              </span>
            </div>
          )}

          {entry.notes && (
            <p className="text-white/40 text-xs italic line-clamp-1">
              "{highlightMatch(entry.notes, searchQuery)}"
            </p>
          )}
        </div>
      )}

      {/* Card Footer Actions (Exact match with password cards) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-white/40 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted
          </span>
          {entry.createdAt && formatDate(entry.createdAt) && (
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-medium shrink-0 group-hover:text-white/70 transition-colors">
              <Calendar className="w-3 h-3 text-emerald-400/70" />
              <span>Created {formatDate(entry.createdAt)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleEditClick}
            className="p-1.5 text-white/50 hover:text-emerald-400 hover:bg-white/5 active:bg-emerald-500/10 active:text-emerald-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px] active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Edit ATM Card"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Delete ATM Card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
