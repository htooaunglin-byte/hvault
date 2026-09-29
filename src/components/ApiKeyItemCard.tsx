import React, { useState, useMemo } from 'react';
import { 
  Key, 
  KeyRound,
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Star, 
  Edit3, 
  Trash2, 
  Terminal, 
  Code2, 
  ShieldCheck,
  Calendar,
  Clock,
  Globe
} from 'lucide-react';
import { DecryptedPasswordEntry } from '../types';
import { ApiKeyLogo } from './ApiKeyLogo';
import { triggerHaptic } from '../lib/haptics';
import { getCategoryVisual } from '../lib/categoryUtils';

interface ApiKeyItemCardProps {
  entry: DecryptedPasswordEntry;
  onEdit: (entry: DecryptedPasswordEntry) => void;
  onDelete: (id: string, serviceName?: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
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

export const ApiKeyItemCard: React.FC<ApiKeyItemCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRecordAccess,
  searchQuery = '',
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedKeyName, setCopiedKeyName] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const rawKey = entry.decryptedPassword || '';
  const serviceName = entry.serviceName || 'API Key';
  const keyName = entry.keyName || entry.username || 'API Key';
  const env = entry.keyEnvironment || 'Production';
  const prefix = entry.keyHeaderPrefix || 'Bearer';

  const visual = useMemo(() => getCategoryVisual(entry.category), [entry.category]);
  const lastUsedDisplay = useMemo(() => formatLastUsed(entry.lastAccessedAt), [entry.lastAccessedAt]);

  const envColors: Record<string, string> = {
    Production: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    Staging: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Development: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Test: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  };

  const handleCopyKey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawKey) return;
    triggerHaptic('light');
    await navigator.clipboard.writeText(rawKey);
    setCopiedKey(true);
    if (onRecordAccess) onRecordAccess(entry.id);
    setTimeout(() => setCopiedKey(false), 1800);
  };

  const handleCopyKeyName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!keyName) return;
    triggerHaptic('light');
    navigator.clipboard.writeText(keyName);
    setCopiedKeyName(true);
    setTimeout(() => setCopiedKeyName(false), 1500);
  };

  const handleCopyCurl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawKey) return;
    triggerHaptic('light');
    const header = prefix === 'x-api-key' ? `x-api-key: ${rawKey}` : `Authorization: ${prefix} ${rawKey}`;
    const snippet = `curl -H "${header}" https://api.example.com/v1/resource`;
    await navigator.clipboard.writeText(snippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1800);
  };

  const handleCopyEnv = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawKey) return;
    triggerHaptic('light');
    const cleanServiceName = serviceName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const snippet = `${cleanServiceName}_API_KEY="${rawKey}"`;
    await navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 1800);
  };

  const maskApiKey = (key: string) => {
    if (!key) return '••••••••••••••••';
    if (key.length <= 10) return `${key.slice(0, 3)}••••${key.slice(-2)}`;
    return `${key.slice(0, 6)}••••••••••••••••${key.slice(-4)}`;
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
    onDelete(entry.id, serviceName);
  };

  return (
    <div 
      className={`bg-[#0D1425] border rounded-2xl p-5 transition-all duration-200 ease-out shadow-xl group flex flex-col justify-between space-y-4 relative hover:scale-[1.015] hover:-translate-y-1 active:scale-[0.985] active:brightness-105 ${
        entry.isFavorite 
          ? 'border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.08)] hover:shadow-[0_14px_30px_rgba(251,191,36,0.15)] hover:border-amber-400/60 bg-gradient-to-b from-[#11192e] to-[#0D1425]' 
          : 'border-white/10 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-950/50'
      }`}
    >
      {/* Header: Service Logo, Service Name, Env, Badges, Favorite & Website */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <ApiKeyLogo provider={serviceName} size="md" />
            {entry.isFavorite && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black shadow-sm">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-white text-base tracking-tight truncate group-hover:text-amber-400 transition-colors uppercase flex items-center gap-1.5">
              <span>{highlightMatch(serviceName, searchQuery)}</span>
            </h3>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap min-h-[22px]">
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded shrink-0 ${visual.badgeClass}`}>
                {entry.category || 'API Keys'}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border shrink-0 ${envColors[env] || envColors.Production}`}>
                {env}
              </span>
              {entry.isFavorite && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> FAV
                </span>
              )}
              {entry.lastAccessedAt && lastUsedDisplay ? (
                <span 
                  title={`Last accessed: ${new Date(entry.lastAccessedAt).toLocaleString()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border bg-amber-500/10 text-amber-300 border-amber-500/30 group-hover:border-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-100 shrink-0 whitespace-nowrap select-none"
                >
                  <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span>Used {lastUsedDisplay}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Controls in Top Right: Favorite + External Link */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onToggleFavorite(entry.id, !entry.isFavorite);
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

          {entry.websiteUrl && (
            <a
              href={entry.websiteUrl.startsWith('http') ? entry.websiteUrl : `https://${entry.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                if (onRecordAccess) onRecordAccess(entry.id);
              }}
              className="p-1.5 sm:p-2 text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
              title="Open Developer Console / Portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Dedicated Key Identifier / Alias Card */}
      {keyName && (
        <div className="bg-[#0A0F1D] px-3 py-2 rounded-xl border border-white/5 flex items-center justify-between gap-2 group/keyname hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">
                Key Identifier / Alias
              </span>
              <p className="font-mono font-bold text-xs text-amber-100 truncate select-all tracking-tight">
                {highlightMatch(keyName, searchQuery)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyKeyName}
            className="p-1.5 rounded-lg text-white/40 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90 shrink-0"
            title="Copy Key Name"
          >
            {copiedKeyName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Main Secret Key Box */}
      <div className="bg-[#0A0F1D] border border-amber-500/20 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>API Secret Key</span>
          </span>
          <span className="text-white/40 text-[9px] font-mono px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
            {prefix} Auth
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="font-mono text-xs text-amber-200 truncate select-all font-bold flex-1">
            {showSecret ? rawKey : maskApiKey(rawKey)}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                setShowSecret(!showSecret);
              }}
              className="p-1.5 rounded-lg text-white/40 hover:text-amber-200 hover:bg-white/5 transition-all cursor-pointer active:scale-90 select-none"
              title={showSecret ? 'Hide Key' : 'Reveal Key'}
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5 text-white/50" />}
            </button>

            <button
              type="button"
              onClick={handleCopyKey}
              className={`p-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-90 ${
                copiedKey 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 active:bg-amber-500/35'
              }`}
              title="Copy API Secret Key"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">{copiedKey ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Snippet Quick Helpers */}
      <div className="flex items-center justify-between px-1 text-[11px] gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyEnv}
            className="text-[10px] text-white/50 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors cursor-pointer active:scale-95 select-none"
            title="Copy as .env configuration variable"
          >
            {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Terminal className="w-3 h-3 text-amber-400/80" />}
            <span>{copiedEnv ? '.env Copied' : '.env Snippet'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCurl}
            className="text-[10px] text-white/50 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors cursor-pointer active:scale-95 select-none"
            title="Copy cURL Header command"
          >
            {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3 text-sky-400/80" />}
            <span>{copiedCurl ? 'Header Copied' : 'cURL Header'}</span>
          </button>
        </div>
      </div>

      {/* Notes preview if available */}
      {entry.notes && (
        <p className="text-xs text-white/40 italic line-clamp-1 px-1">
          "{highlightMatch(entry.notes, searchQuery)}"
        </p>
      )}

      {/* Card Footer Actions (Same layout and location as password cards) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-white/40 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted
          </span>
          {entry.createdAt && formatDate(entry.createdAt) && (
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-medium shrink-0 group-hover:text-white/70 transition-colors">
              <Calendar className="w-3 h-3 text-amber-400/70" />
              <span>Created {formatDate(entry.createdAt)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleEditClick}
            className="p-1.5 text-white/50 hover:text-amber-400 hover:bg-white/5 active:bg-amber-500/10 active:text-amber-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px] active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Edit API Key"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Delete API Key"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
