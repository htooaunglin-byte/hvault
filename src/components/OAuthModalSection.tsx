import React, { useState } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Copy, 
  Check, 
  Workflow, 
  ExternalLink, 
  Globe, 
  Layers, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  Code2,
  Lock,
  Tag
} from 'lucide-react';
import { POPULAR_OAUTH_PROVIDERS, OAuthProviderPreset } from '../lib/categoryUtils';
import { OAuthLogo } from './OAuthLogo';

export interface OAuthFormValues {
  serviceName: string;
  clientId: string;
  clientSecret: string;
  oauthRedirectUri?: string;
  oauthScopes?: string;
  oauthGrantType?: string;
  oauthClientType?: string;
  oauthAuthUrl?: string;
  oauthTokenUrl?: string;
  websiteUrl?: string;
  oauthProvider?: string;
}

interface OAuthModalSectionProps {
  values: OAuthFormValues;
  onChange: (updated: Partial<OAuthFormValues>) => void;
  showSecret: boolean;
  onToggleShowSecret: () => void;
  onGenerateSecret: () => void;
}

const COMMON_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'read:user',
  'repo',
  'identify',
  'bot',
  'chat:write',
  'read_write',
];

const GRANT_TYPES = [
  'Authorization Code (PKCE)',
  'Authorization Code',
  'Client Credentials (M2M)',
  'Device Code Flow',
  'Implicit / SPA (Legacy)',
];

export const OAuthModalSection: React.FC<OAuthModalSectionProps> = ({
  values,
  onChange,
  showSecret,
  onToggleShowSecret,
  onGenerateSecret,
}) => {
  const [showAdvancedEndpoints, setShowAdvancedEndpoints] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleApplyPreset = (preset: OAuthProviderPreset) => {
    onChange({
      serviceName: values.serviceName || preset.name,
      oauthProvider: preset.providerKey,
      oauthScopes: values.oauthScopes || preset.defaultScopes || '',
      oauthGrantType: preset.defaultGrantType || values.oauthGrantType || 'Authorization Code (PKCE)',
      oauthRedirectUri: values.oauthRedirectUri || preset.defaultRedirectUri || '',
      oauthAuthUrl: preset.defaultAuthUrl || '',
      oauthTokenUrl: preset.defaultTokenUrl || '',
      websiteUrl: values.websiteUrl || preset.websiteUrl || '',
    });
  };

  const handleAddScope = (scopeToAdd: string) => {
    const current = (values.oauthScopes || '').trim();
    const existingList = current ? current.split(/[\s,]+/).filter(Boolean) : [];
    if (!existingList.includes(scopeToAdd)) {
      const updated = [...existingList, scopeToAdd].join(' ');
      onChange({ oauthScopes: updated });
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Live OAuth App Card Preview */}
      <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0E1528] to-[#0A0F1D] border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <OAuthLogo provider={values.oauthProvider || values.serviceName} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-indigo-300" />
                  <span>OAuth 2.0 Client</span>
                </span>
                <span className="text-[9px] font-bold text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                  {values.oauthGrantType || 'Authorization Code'}
                </span>
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight truncate mt-1">
                {values.serviceName.trim() || 'New OAuth 2.0 Application'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge</span>
          </div>
        </div>

        {/* Live Preview of Client ID & Masked Secret */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
          <div className="min-w-0">
            <span className="text-[9px] font-sans font-black uppercase tracking-wider text-white/40 block">CLIENT ID</span>
            <span className="text-indigo-200 truncate block font-bold">
              {values.clientId.trim() || '••••••••••••••••'}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-sans font-black uppercase tracking-wider text-white/40 block">CLIENT SECRET</span>
            <span className="text-emerald-300 truncate block font-bold">
              {values.clientSecret ? (showSecret ? values.clientSecret : '••••••••••••••••••••••••') : '••••••••••••••••••••••••'}
            </span>
          </div>
        </div>
      </div>

      {/* 1-Click Provider Presets Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white/50 px-1">
          <span>Quick Provider Template</span>
          <span className="text-indigo-400">Pre-populates endpoints & scopes</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {POPULAR_OAUTH_PROVIDERS.map((preset) => {
            const isSelected = 
              (values.oauthProvider || '').toLowerCase() === preset.providerKey.toLowerCase() ||
              values.serviceName.toLowerCase().includes(preset.providerKey.toLowerCase());

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-950/40'
                    : 'bg-[#0A0F1D] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                <span>{preset.providerKey}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Service / App Name */}
      <div>
        <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
          OAuth Application / Service Name *
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={values.serviceName}
            onChange={(e) => onChange({ serviceName: e.target.value })}
            placeholder="e.g. Google Cloud, GitHub OAuth App, Discord Bot"
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
          />
        </div>
      </div>

      {/* Client ID Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Client ID (Public Identifier) *</span>
          </label>
          {values.clientId && (
            <button
              type="button"
              onClick={() => handleCopy(values.clientId, 'id')}
              className="text-[10px] font-bold text-white/40 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
        <input
          type="text"
          required
          value={values.clientId}
          onChange={(e) => onChange({ clientId: e.target.value })}
          placeholder="e.g. 109283746-xxx.apps.googleusercontent.com or Iv1.7a92b3..."
          className="w-full bg-[#0A0F1D] border border-indigo-500/30 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-200 placeholder:text-white/20 focus:outline-none focus:border-indigo-400/60"
        />
      </div>

      {/* Client Secret Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-emerald-300 uppercase tracking-widest flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Client Secret (AES-256-GCM Encrypted) *</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerateSecret}
              className="text-[10px] font-black text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>Generate Secret</span>
            </button>

            {values.clientSecret && (
              <button
                type="button"
                onClick={() => handleCopy(values.clientSecret, 'secret')}
                className="text-[10px] font-bold text-white/40 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'secret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'secret' ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            required
            value={values.clientSecret}
            onChange={(e) => onChange({ clientSecret: e.target.value })}
            placeholder="Paste or generate confidential Client Secret"
            className="w-full bg-[#0A0F1D] border border-emerald-500/30 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-bold text-emerald-200 placeholder:text-white/20 focus:outline-none focus:border-emerald-400/60"
          />
          <button
            type="button"
            onClick={onToggleShowSecret}
            className="absolute right-3 top-2.5 text-white/40 hover:text-white cursor-pointer"
            title={showSecret ? 'Hide secret' : 'Reveal secret'}
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grant Type & Redirect URI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
            OAuth Grant Type
          </label>
          <select
            value={values.oauthGrantType || 'Authorization Code (PKCE)'}
            onChange={(e) => onChange({ oauthGrantType: e.target.value })}
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-400/50 cursor-pointer"
          >
            {GRANT_TYPES.map((gt) => (
              <option key={gt} value={gt} className="bg-[#0D1425] text-white">
                {gt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
            Callback / Redirect URI
          </label>
          <input
            type="text"
            value={values.oauthRedirectUri || ''}
            onChange={(e) => onChange({ oauthRedirectUri: e.target.value })}
            placeholder="http://localhost:3000/api/auth/callback"
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
          />
        </div>
      </div>

      {/* Scopes with Quick Add Chips */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            OAuth Scopes (Permissions)
          </label>
          <span className="text-[9px] text-white/40">Space or comma separated</span>
        </div>
        <input
          type="text"
          value={values.oauthScopes || ''}
          onChange={(e) => onChange({ oauthScopes: e.target.value })}
          placeholder="e.g. openid email profile offline_access"
          className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
        />

        {/* Quick Scope Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          <span className="text-[9px] font-bold text-white/30 uppercase mr-0.5">Quick Add:</span>
          {COMMON_SCOPES.map((sc) => {
            const hasIt = (values.oauthScopes || '').includes(sc);
            return (
              <button
                key={sc}
                type="button"
                onClick={() => handleAddScope(sc)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer select-none active:scale-95 ${
                  hasIt
                    ? 'bg-indigo-500/25 border border-indigo-400/40 text-indigo-200'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white'
                }`}
              >
                +{sc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Developer Console URL */}
      <div>
        <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
          Developer Console / Dashboard URL
        </label>
        <div className="relative">
          <Globe className="w-4 h-4 text-white/30 absolute left-3 top-3" />
          <input
            type="text"
            value={values.websiteUrl || ''}
            onChange={(e) => onChange({ websiteUrl: e.target.value })}
            placeholder="https://console.cloud.google.com or https://github.com/settings/developers"
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50 font-mono"
          />
        </div>
      </div>

      {/* Advanced Collapsible: Auth & Token Endpoints */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvancedEndpoints(!showAdvancedEndpoints)}
          className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/70 font-bold flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>OAuth Endpoints (Auth URL & Token URL)</span>
          </div>
          {showAdvancedEndpoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedEndpoints && (
          <div className="mt-2.5 p-3.5 bg-[#0A0F1D] border border-white/10 rounded-xl space-y-3">
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                Authorization Endpoint URL
              </label>
              <input
                type="text"
                value={values.oauthAuthUrl || ''}
                onChange={(e) => onChange({ oauthAuthUrl: e.target.value })}
                placeholder="https://accounts.google.com/o/oauth2/v2/auth"
                className="w-full bg-[#0D1425] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                Token Endpoint URL
              </label>
              <input
                type="text"
                value={values.oauthTokenUrl || ''}
                onChange={(e) => onChange({ oauthTokenUrl: e.target.value })}
                placeholder="https://oauth2.googleapis.com/token"
                className="w-full bg-[#0D1425] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
