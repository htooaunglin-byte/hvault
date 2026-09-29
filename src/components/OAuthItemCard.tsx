import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Star, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Calendar,
  Clock,
  Globe, 
  ChevronDown, 
  ChevronUp,
  Workflow
} from 'lucide-react';
import { DecryptedPasswordEntry } from '../types';
import { OAuthLogo } from './OAuthLogo';
import { triggerHaptic } from '../lib/haptics';
import { getCategoryVisual } from '../lib/categoryUtils';

interface OAuthItemCardProps {
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

export const OAuthItemCard: React.FC<OAuthItemCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRecordAccess,
  searchQuery = '',
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [showDeveloperSnippets, setShowDeveloperSnippets] = useState(false);
  const [copiedType, setCopiedType] = useState<'id' | 'secret' | 'redirect' | 'basicAuth' | 'curl' | null>(null);

  const appName = entry.serviceName || 'OAuth 2.0 App';
  const clientId = entry.clientId || entry.username || '';
  const clientSecret = entry.decryptedPassword || '';
  const redirectUri = entry.oauthRedirectUri || '';
  const scopes = (entry.oauthScopes || '').trim().split(/[\s,]+/).filter(Boolean);
  const grantType = entry.oauthGrantType || 'Authorization Code';
  const provider = entry.oauthProvider || entry.serviceName;
  const tokenUrl = entry.oauthTokenUrl || 'https://oauth2.example.com/token';

  const visual = useMemo(() => getCategoryVisual(entry.category), [entry.category]);
  const lastUsedDisplay = useMemo(() => formatLastUsed(entry.lastAccessedAt), [entry.lastAccessedAt]);

  const copyToClipboard = (text: string, type: 'id' | 'secret' | 'redirect' | 'basicAuth' | 'curl') => {
    if (!text) return;
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onRecordAccess) onRecordAccess(entry.id);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const getBasicAuthHeader = () => {
    try {
      const encoded = btoa(`${clientId}:${clientSecret}`);
      return `Basic ${encoded}`;
    } catch {
      return `Basic ${clientId}:${clientSecret}`;
    }
  };

  const getCurlSnippet = () => {
    return `curl -X POST "${tokenUrl}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}"`;
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
          ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(129,140,248,0.08)] hover:shadow-[0_14px_30px_rgba(129,140,248,0.15)] hover:border-indigo-400/60 bg-gradient-to-b from-[#11192e] to-[#0D1425]' 
          : 'border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-950/50'
      }`}
    >
      {/* Top Header: Provider Logo, App Name, Badges, Favorite & Portal Link */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <OAuthLogo provider={provider} size="md" />
            {entry.isFavorite && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black shadow-sm">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-white text-base tracking-tight truncate group-hover:text-indigo-400 transition-colors uppercase flex items-center gap-1.5">
              <span>{highlightMatch(appName, searchQuery)}</span>
            </h3>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap min-h-[22px]">
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded shrink-0 ${visual.badgeClass}`}>
                {entry.category || 'OAuth'}
              </span>
              <span className="text-[9px] font-bold text-indigo-200 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                {grantType}
              </span>
              {entry.isFavorite && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> FAV
                </span>
              )}
              {entry.lastAccessedAt && lastUsedDisplay ? (
                <span 
                  title={`Last accessed: ${new Date(entry.lastAccessedAt).toLocaleString()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border bg-indigo-500/10 text-indigo-300 border-indigo-500/30 group-hover:border-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-100 shrink-0 whitespace-nowrap select-none"
                >
                  <Clock className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
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
              onToggleFavorite(entry.id, Boolean(entry.isFavorite));
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
              className="p-1.5 sm:p-2 text-white/40 hover:text-indigo-300 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
              title="Open Developer Console / Portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Main Credentials Box: Client ID & Client Secret */}
      <div className="bg-[#0A0F1D] border border-indigo-500/20 rounded-xl p-3.5 space-y-3">
        {/* Client ID Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-mono font-bold text-indigo-300/80 tracking-wider flex items-center gap-1 mb-0.5">
              <KeyRound className="w-3 h-3 text-indigo-400" />
              <span>Client ID:</span>
            </span>
            <p className="font-mono text-xs text-white/90 truncate font-bold select-all">
              {highlightMatch(clientId, searchQuery) || <span className="text-white/30 italic">Not set</span>}
            </p>
          </div>
          {clientId && (
            <button
              type="button"
              onClick={() => copyToClipboard(clientId, 'id')}
              className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none active:scale-90 ${
                copiedType === 'id'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
              title="Copy Client ID"
            >
              {copiedType === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono">{copiedType === 'id' ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        <div className="border-t border-white/10" />

        {/* Client Secret Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-mono font-bold text-indigo-300/80 tracking-wider flex items-center gap-1 mb-0.5">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Client Secret:</span>
            </span>
            <p className="font-mono text-xs text-indigo-200 truncate font-bold select-all">
              {showSecret ? (clientSecret || 'None') : (clientSecret ? '••••••••••••••••••••' : 'None')}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {clientSecret && (
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="p-1.5 rounded-lg text-white/40 hover:text-indigo-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90 select-none"
                title={showSecret ? 'Hide Secret' : 'Reveal Secret'}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}

            {clientSecret && (
              <button
                type="button"
                onClick={() => copyToClipboard(clientSecret, 'secret')}
                className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none active:scale-90 ${
                  copiedType === 'secret'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25'
                }`}
                title="Copy Client Secret"
              >
                {copiedType === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">{copiedType === 'secret' ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Redirect URI or Scopes Preview */}
      {(redirectUri || scopes.length > 0) && (
        <div className="space-y-1.5 px-1 text-xs">
          {redirectUri && (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-white/40 font-mono text-[9px] uppercase tracking-wider shrink-0">Redirect:</span>
              <span className="font-mono text-white/70 truncate text-[11px] select-all flex-1 text-right">{redirectUri}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(redirectUri, 'redirect')}
                className="text-white/40 hover:text-indigo-300 p-0.5"
                title="Copy Redirect URI"
              >
                {copiedType === 'redirect' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {scopes.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="text-white/40 text-[9px] font-mono uppercase tracking-wider mr-1">Scopes:</span>
              {scopes.slice(0, 3).map((scope, idx) => (
                <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded">
                  {scope}
                </span>
              ))}
              {scopes.length > 3 && (
                <span className="text-[9px] font-mono text-white/40">+{scopes.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Developer Snippets Accordion */}
      <div className="border border-white/5 bg-[#080D1A] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDeveloperSnippets(!showDeveloperSnippets)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-white/50 hover:text-indigo-300 hover:bg-white/5 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5">
            <Workflow className="w-3 h-3 text-indigo-400" />
            <span>Developer Auth Helpers (cURL, Basic Auth)</span>
          </div>
          {showDeveloperSnippets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showDeveloperSnippets && (
          <div className="p-3 border-t border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/50 font-mono">Basic Auth Header:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(getBasicAuthHeader(), 'basicAuth')}
                className="text-[10px] font-mono text-indigo-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                {copiedType === 'basicAuth' ? <Check className="w-3 h-3 text-emerald-400" /> : <Terminal className="w-3 h-3" />}
                <span>{copiedType === 'basicAuth' ? 'Copied' : 'Copy Basic Header'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/50 font-mono">Token Request:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(getCurlSnippet(), 'curl')}
                className="text-[10px] font-mono text-indigo-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                {copiedType === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                <span>{copiedType === 'curl' ? 'Copied' : 'Copy cURL POST'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes preview if available */}
      {entry.notes && (
        <p className="text-xs text-white/40 italic line-clamp-1 px-1">
          "{highlightMatch(entry.notes, searchQuery)}"
        </p>
      )}

      {/* Card Footer Actions (Exact match with password cards) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-white/40 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Encrypted
          </span>
          {entry.createdAt && formatDate(entry.createdAt) && (
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-medium shrink-0 group-hover:text-white/70 transition-colors">
              <Calendar className="w-3 h-3 text-indigo-400/70" />
              <span>Created {formatDate(entry.createdAt)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleEditClick}
            className="p-1.5 text-white/50 hover:text-indigo-300 hover:bg-white/5 active:bg-indigo-500/10 active:text-indigo-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px] active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Edit OAuth Credentials"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:text-red-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-90 active:brightness-125 select-none touch-manipulation"
            title="Delete OAuth Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
