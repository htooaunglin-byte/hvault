import React, { useState } from 'react';
import { Key, Sparkles, Eye, EyeOff, Copy, Check, ExternalLink, Terminal, Shield, Globe, Cpu, AlertCircle, Wrench } from 'lucide-react';
import { POPULAR_API_PROVIDERS, ApiKeyProviderPreset } from '../lib/categoryUtils';
import { ApiKeyLogo } from './ApiKeyLogo';
import { triggerHaptic } from '../lib/haptics';

export interface ApiKeyFormValues {
  serviceName: string;
  keyName: string;
  apiKeySecret: string;
  keyEnvironment: string;
  keyHeaderPrefix: string;
  websiteUrl: string;
  notes?: string;
}

interface ApiKeyModalSectionProps {
  values: ApiKeyFormValues;
  onChange: (updated: Partial<ApiKeyFormValues>) => void;
  showSecret: boolean;
  onToggleShowSecret: () => void;
  onGenerateSecret: () => void;
}

const ENVIRONMENTS = [
  { id: 'Production', label: 'Production', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { id: 'Staging', label: 'Staging', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'Development', label: 'Dev / Local', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { id: 'Test', label: 'Test / Sandbox', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
];

const HEADER_PREFIXES = ['Bearer', 'x-api-key', 'ApiKey', 'Basic', 'Custom'];

export const ApiKeyModalSection: React.FC<ApiKeyModalSectionProps> = ({
  values,
  onChange,
  showSecret,
  onToggleShowSecret,
  onGenerateSecret,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleSelectPreset = (preset: ApiKeyProviderPreset) => {
    triggerHaptic('selection');
    onChange({
      serviceName: preset.name,
      keyName: values.keyName || preset.sampleKeyName,
      keyHeaderPrefix: preset.defaultHeaderPrefix,
      websiteUrl: preset.websiteUrl || values.websiteUrl,
    });
    setShowPresets(false);
  };

  const handleCopySecret = async () => {
    if (!values.apiKeySecret) return;
    triggerHaptic('light');
    await navigator.clipboard.writeText(values.apiKeySecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Quick Provider Template Selector */}
      <div className="bg-[#0c1222] p-3 rounded-2xl border border-amber-500/20 shadow-inner">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
              Popular API Provider Presets
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold"
          >
            {showPresets ? 'Collapse Presets' : 'View All Presets'}
          </button>
        </div>

        {/* Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {POPULAR_API_PROVIDERS.slice(0, 5).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition-all shrink-0 group cursor-pointer"
            >
              <ApiKeyLogo provider={preset.name} size="sm" />
              <div className="text-left">
                <div className="text-[11px] font-bold text-white group-hover:text-amber-200">
                  {preset.providerKey}
                </div>
                <div className="text-[9px] text-white/40 group-hover:text-amber-300/70 font-mono truncate max-w-[80px]">
                  {preset.keyPrefixHint}
                </div>
              </div>
            </button>
          ))}
        </div>

        {showPresets && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 animate-in fade-in duration-200">
            {POPULAR_API_PROVIDERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="flex items-start gap-2 p-2 rounded-xl bg-black/40 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/40 text-left transition-all group"
              >
                <ApiKeyLogo provider={preset.name} size="sm" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[9px] text-white/40 truncate">
                    {preset.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. Service Name & Environment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-amber-300/80 uppercase tracking-wider mb-1.5">
            Service / Provider Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={values.serviceName}
              onChange={(e) => onChange({ serviceName: e.target.value })}
              placeholder="e.g. OpenAI, Google Gemini, Anthropic, Stripe, AWS"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-300/80 uppercase tracking-wider mb-1.5">
            Environment
          </label>
          <select
            value={values.keyEnvironment || 'Production'}
            onChange={(e) => onChange({ keyEnvironment: e.target.value })}
            className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
          >
            {ENVIRONMENTS.map((env) => (
              <option key={env.id} value={env.id} className="bg-slate-900 text-white">
                {env.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Key Name / Label */}
      <div>
        <label className="block text-[11px] font-bold text-amber-300/80 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Key Name / Identifier *</span>
          <span className="text-[10px] text-white/40 normal-case">Purpose or description for this key</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={values.keyName}
            onChange={(e) => onChange({ keyName: e.target.value })}
            placeholder="e.g. Production Backend Key, Read-Only Client Key, Claude Opus Agent Token"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
          />
        </div>
      </div>

      {/* 3. API Key (Password / Secret) */}
      <div className="p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/20">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>API Key (Secret Token) *</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerateSecret}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Generate cryptographic random 32-byte hex API token"
            >
              <Wrench className="w-2.5 h-2.5" />
              <span>Generate Random Token</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            required
            value={values.apiKeySecret}
            onChange={(e) => onChange({ apiKeySecret: e.target.value })}
            placeholder="sk-proj-..., AIzaSy..., or custom API secret key"
            className="w-full bg-black/50 border border-amber-500/30 rounded-xl pl-3.5 pr-20 py-2.5 text-sm font-mono text-amber-200 placeholder-white/20 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {values.apiKeySecret && (
              <button
                type="button"
                onClick={handleCopySecret}
                className="p-1.5 text-amber-400/70 hover:text-amber-200 transition-colors"
                title="Copy API Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleShowSecret}
              className="p-1.5 text-amber-400/70 hover:text-amber-200 transition-colors"
              title={showSecret ? 'Hide Key' : 'Reveal Key'}
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-500/10 text-[10px] text-amber-200/50">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Encrypted with AES-256-GCM via your Master Passphrase</span>
          </span>
          <span className="font-mono">
            {values.apiKeySecret ? `${values.apiKeySecret.length} chars` : '0 chars'}
          </span>
        </div>
      </div>

      {/* 4. Auth Header Format & Developer Console URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-amber-300/80 uppercase tracking-wider mb-1.5">
            HTTP Auth Header Type
          </label>
          <div className="flex items-center gap-1.5">
            {HEADER_PREFIXES.map((prefix) => (
              <button
                key={prefix}
                type="button"
                onClick={() => onChange({ keyHeaderPrefix: prefix })}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer truncate ${
                  (values.keyHeaderPrefix || 'Bearer') === prefix
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm'
                    : 'bg-white/5 text-white/40 border-white/10 hover:text-white/80'
                }`}
              >
                {prefix}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-300/80 uppercase tracking-wider mb-1.5">
            Developer Portal / Docs URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={values.websiteUrl}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              placeholder="https://platform.openai.com/api-keys"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60"
            />
          </div>
        </div>
      </div>

      {/* Developer cURL / Header Preview Snippet */}
      {values.apiKeySecret && (
        <div className="bg-[#090d16] p-2.5 rounded-xl border border-white/5 font-mono text-[10px]">
          <div className="text-white/40 mb-1 flex items-center justify-between">
            <span>HEADER PREVIEW:</span>
            <span className="text-amber-400/80">{values.keyEnvironment || 'Production'}</span>
          </div>
          <div className="text-amber-200/90 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
            Authorization: {values.keyHeaderPrefix || 'Bearer'} {values.apiKeySecret.slice(0, 8)}••••••••{values.apiKeySecret.slice(-4)}
          </div>
        </div>
      )}
    </div>
  );
};
