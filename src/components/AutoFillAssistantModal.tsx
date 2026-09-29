import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Zap, 
  Check, 
  Copy, 
  ExternalLink, 
  Bookmark, 
  ShieldCheck, 
  Play, 
  Globe, 
  Sparkles, 
  ArrowRight,
  User,
  Key,
  Info,
  HelpCircle,
  Lock,
  Smartphone,
  Layers,
  Terminal,
  Download
} from 'lucide-react';
import { HVaultLogo } from './HVaultLogo';
import { KNOWN_SERVICES, getAutoFillBookmarkletCode } from '../lib/autofillUtils';
import { DecryptedPasswordEntry } from '../types';

interface AutoFillAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  autofillEnabled: boolean;
  onToggleAutofill: () => void;
  entries: DecryptedPasswordEntry[];
  onTriggerAutoFill: (entry: DecryptedPasswordEntry) => void;
  onCopy?: (text: string, label: string) => void;
  isUnlocked?: boolean;
}

export const AutoFillAssistantModal: React.FC<AutoFillAssistantModalProps> = ({
  isOpen,
  onClose,
  autofillEnabled,
  onToggleAutofill,
  entries,
  onTriggerAutoFill,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'bookmarklet' | 'mobile-android'>('overview');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // Test simulation state
  const [simService, setSimService] = useState<'netflix' | 'spotify' | 'gmail'>('netflix');
  const [simUser, setSimUser] = useState('');
  const [simPass, setSimPass] = useState('');
  const [simAutoFilled, setSimAutoFilled] = useState(false);

  if (!isOpen) return null;

  const bookmarkletCode = getAutoFillBookmarkletCode(entries);

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  // Find entries for test simulation
  const findMatchingEntry = (serviceKey: string) => {
    return entries.find((e) => {
      const name = (e.serviceName || '').toLowerCase();
      const url = (e.websiteUrl || '').toLowerCase();
      if (serviceKey === 'netflix') return name.includes('netflix') || url.includes('netflix');
      if (serviceKey === 'spotify') return name.includes('spotify') || url.includes('spotify');
      if (serviceKey === 'gmail') return name.includes('gmail') || name.includes('google') || url.includes('google');
      return false;
    });
  };

  const handleRunSimulation = (serviceKey: 'netflix' | 'spotify' | 'gmail') => {
    setSimService(serviceKey);
    const matched = findMatchingEntry(serviceKey);
    if (matched && matched.decryptedPassword) {
      setSimUser(matched.username || 'user@example.com');
      setSimPass(matched.decryptedPassword);
    } else {
      setSimUser(`user_${serviceKey}@example.com`);
      setSimPass('••••••••••••');
    }
    setSimAutoFilled(true);
  };

  const resetSimulation = () => {
    setSimUser('');
    setSimPass('');
    setSimAutoFilled(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-[#0D1425] border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#0A0F1D]/80">
          <div className="flex items-center gap-3">
            <HVaultLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                  AutoFill Assistant
                </h2>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                  autofillEnabled 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {autofillEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-white/50">
                1-Click QuickFill & Launch for Netflix, Spotify, Steam, 1xBet, Gmail, and custom websites
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Toggle Banner */}
        <div className="px-5 sm:px-6 py-4 bg-sky-950/30 border-b border-sky-500/20 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">Enable AutoFill & 1-Click Launch</span>
            </div>
            <p className="text-[11px] text-white/60">
              Adds instant "⚡ Quick Launch & Fill" buttons to your vault cards and stages credentials safely.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={onToggleAutofill}
            role="switch"
            aria-checked={autofillEnabled}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autofillEnabled ? 'bg-sky-500 shadow-[0_0_14px_rgba(56,189,248,0.4)]' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                autofillEnabled ? 'translate-x-7 text-sky-600' : 'translate-x-0 text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
            </span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0A0F1D]/40 px-3 sm:px-6 gap-1 sm:gap-2 pt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview' as const, label: 'Services', icon: Globe },
            { id: 'test' as const, label: 'Simulator', icon: Play },
            { id: 'bookmarklet' as const, label: 'Bookmarklet', icon: Bookmark },
            { id: 'mobile-android' as const, label: '📱 Mobile & Android', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs leading-relaxed text-white/70">
                  <p className="font-bold text-white">How hVault AutoFill Works:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/60">
                    <li>Matches entries for popular services (Netflix, Spotify, Gmail, Amazon, GitHub, etc.) or any custom website URL.</li>
                    <li>1-Click opens the exact secure login portal with credentials staged.</li>
                    <li>Floating QuickFill HUD provides instantaneous 1-click clipboard paste buttons while you log in.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white/80">
                  Pre-configured Top Services
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {KNOWN_SERVICES.slice(0, 9).map((service) => {
                    const hasEntry = entries.some(
                      (e) => (e.serviceName || '').toLowerCase().includes(service.id) || (e.websiteUrl || '').toLowerCase().includes(service.domain)
                    );
                    return (
                      <div
                        key={service.id}
                        className="bg-[#0A0F1D] border border-white/10 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-sky-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{service.name}</span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase tracking-widest rounded border ${service.badgeBg} ${service.badgeText} ${service.badgeBorder}`}>
                            {hasEntry ? 'In Vault' : 'Supported'}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40 truncate">{service.domain}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Select a service to simulate 1-Click AutoFill:</span>
                {simAutoFilled && (
                  <button
                    onClick={resetSimulation}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer font-bold"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              {/* Service Simulator Pickers */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'netflix' as const, label: 'Netflix', color: 'border-red-500/40 bg-red-500/10 text-red-300' },
                  { id: 'spotify' as const, label: 'Spotify', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
                  { id: 'gmail' as const, label: 'Gmail / Google', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleRunSimulation(s.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      simService === s.id && simAutoFilled
                        ? `${s.color} shadow-md`
                        : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Simulated Browser Window */}
              <div className="bg-[#070b14] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#0A0F1D] px-4 py-2 border-b border-white/10 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-[10px] text-white/60 font-mono flex-1 text-center truncate">
                    {simService === 'netflix' && 'https://www.netflix.com/login'}
                    {simService === 'spotify' && 'https://accounts.spotify.com/login'}
                    {simService === 'gmail' && 'https://accounts.google.com/signin'}
                  </div>
                </div>

                <div className="p-6 space-y-4 max-w-sm mx-auto">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      {simService === 'netflix' && 'Sign In to Netflix'}
                      {simService === 'spotify' && 'Log in to Spotify'}
                      {simService === 'gmail' && 'Sign in to Google Account'}
                    </h4>
                    <p className="text-[10px] text-white/40">Simulated Target Login Page</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase">Email or Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={simUser}
                          placeholder="user@example.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 font-mono"
                        />
                        {simAutoFilled && (
                          <span className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                            AutoFilled
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase">Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          readOnly
                          value={simPass}
                          placeholder="••••••••••••"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 font-mono"
                        />
                        {simAutoFilled && (
                          <span className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                            AutoFilled
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRunSimulation(simService)}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-900/30"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{simAutoFilled ? 'Re-Trigger AutoFill' : 'Test 1-Click AutoFill'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookmarklet' && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                    <Bookmark className="w-4 h-4" />
                    <span>hVault Shadow DOM Bookmarklet (with Multi-Account Support)</span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 rounded border border-sky-500/40">
                    {entries.length} Vault Accounts
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Inspects the active browser tab URL before triggering. If multiple accounts match the website (e.g. 2+ Gmail accounts), it renders an isolated <strong>Shadow DOM</strong> panel allowing you to select and fill the exact account needed.
                </p>
              </div>

              {/* Draggable Bookmarklet Pill, 1-Click Copy & Live In-Page Test */}
              <div className="p-5 bg-[#0A0F1D] border border-sky-500/25 rounded-2xl space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full text-[11px] font-bold text-sky-300">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>2 Fast Ways to Add to Opera / Chrome</span>
                  </div>
                  <p className="text-xs text-white/70">
                    Drag the button or use the 1-click <strong>Copy Code</strong> button below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Draggable Anchor with HTML5 Drag API payload */}
                  <a
                    href={bookmarkletCode}
                    draggable={true}
                    onDragStart={(e) => {
                      try {
                        e.dataTransfer.setData('text/uri-list', bookmarkletCode);
                        e.dataTransfer.setData('text/plain', bookmarkletCode);
                        e.dataTransfer.setData('text/html', `<a href="${bookmarkletCode}">🔒 hVault AutoFill</a>`);
                        e.dataTransfer.effectAllowed = 'copyLink';
                      } catch (err) {
                        console.warn('DragStart notice:', err);
                      }
                    }}
                    onClick={(e) => {
                      // Prevent link navigation if clicked instead of dragged, execute test instead
                      e.preventDefault();
                      try {
                        const scriptOnly = bookmarkletCode.replace(/^javascript:/i, '');
                        const fn = new Function(scriptOnly);
                        fn();
                      } catch (err: any) {
                        alert('Could not run preview: ' + err?.message);
                      }
                    }}
                    className="inline-flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-sky-950/60 border border-sky-400/50 cursor-grab active:cursor-grabbing hover:scale-105 transition-all select-none"
                    title="Drag to Bookmarks Bar or Click to Test Overlay"
                  >
                    <HVaultLogo size="custom" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] pointer-events-none" />
                    <span className="pointer-events-none select-none">🔒 hVault AutoFill (Drag to Bar)</span>
                  </a>

                  {/* 1-Click Copy Bookmarklet Button */}
                  <button
                    type="button"
                    onClick={handleCopyBookmarklet}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-950/60 border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    {copiedBookmarklet ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBookmarklet ? '✅ Copied to Clipboard!' : '📋 Copy Bookmarklet Code'}</span>
                  </button>

                  {/* Test HUD Overlay Button */}
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const scriptOnly = bookmarkletCode.replace(/^javascript:/i, '');
                        const fn = new Function(scriptOnly);
                        fn();
                      } catch (err: any) {
                        alert('Error running bookmarklet preview: ' + err?.message);
                      }
                    }}
                    className="px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>▶ Test HUD Overlay</span>
                  </button>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-left space-y-1.5">
                  <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                    <span>💡 Note on Opera & Browser iFrames:</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    If your browser blocks dragging items out of preview frames into your bookmarks bar, simply click <strong>"📋 Copy Bookmarklet Code"</strong> above, right-click your bookmarks bar &rarr; click <strong>Add Page...</strong> (or Add Bookmark) &rarr; name it <code className="text-sky-300">🔒 hVault</code> &rarr; and <strong>Paste</strong> into the Address/URL field.
                  </p>
                </div>
              </div>

              {/* Step-by-Step for Opera */}
              <div className="bg-sky-950/30 border border-sky-500/20 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-2">
                  <HVaultLogo size="custom" className="w-4 h-4" />
                  <span>Opera & Chrome 3-Step Setup:</span>
                </div>
                <ol className="text-[11px] text-white/70 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Click <strong className="text-emerald-300">📋 Copy Bookmarklet Code</strong> above.</li>
                  <li>In Opera, right-click your <strong>Bookmarks Bar</strong> (under the address bar) &rarr; select <strong>Add Page...</strong> (or <strong>Add Bookmark</strong>).</li>
                  <li>Set Name to <code className="text-sky-300 font-bold">🔒 hVault</code> &rarr; in <strong>Address / URL</strong>: press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white font-mono">Ctrl + V</kbd> (or <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white font-mono">Cmd + V</kbd>) to Paste &rarr; Click <strong>Save</strong>.</li>
                  <li>Done! Whenever you visit Steam, 1xBet, Netflix, Spotify, or Gmail, click <strong>🔒 hVault</strong> in your bookmarks bar!</li>
                </ol>
              </div>

              {/* Domain Filtering & Multi-Account Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Domain Inspection & Zero Cross-Domain Leaks:</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  The script checks <code className="text-sky-300 font-mono">window.location.hostname</code> and only matches entries belonging to the current domain. Credentials for other sites are never exposed or filled into the wrong service.
                </p>
              </div>

              {/* Gmail / 2-Step Login Help */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <User className="w-4 h-4 shrink-0" />
                  <span>How Gmail / Google 2-Step Login Works:</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Unlike Spotify where Email and Password are on the same page, Google shows <strong>Email first</strong>, and <strong>Password second</strong>:
                </p>
                <ol className="text-[11px] text-white/70 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>On the Google <strong>Email</strong> screen: Click the bookmarklet &rarr; fill/paste email &rarr; click <em>AutoFill</em> &rarr; click <em>Next</em> on Google.</li>
                  <li>On the Google <strong>Password</strong> screen: Click the bookmarklet &rarr; fill/paste password &rarr; click <em>AutoFill</em>.</li>
                </ol>
              </div>

              {/* Copy Script Fallback */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Manual Bookmarklet Javascript Code</div>
                  <div className="text-[10px] text-white/40 font-mono truncate max-w-xs sm:max-w-md">
                    {bookmarkletCode.slice(0, 60)}...
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBookmarklet}
                  className="py-1.5 px-3 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBookmarklet ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'mobile-android' && (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-blue-500/15 border border-emerald-500/30 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Mobile Browser vs Native Android Autofill</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Browsers enforce strict sandbox isolation on mobile devices: a website in one tab cannot inject code directly into another website's tab without user permission or native OS APIs. Here is how mobile autofill works now, and the complete architecture for native Android app integration.
                </p>
              </div>

              {/* Section 1: Mobile Web Experience Today */}
              <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>1. How to AutoFill on Mobile Browsers (Web Version)</span>
                </div>
                <div className="space-y-2.5 text-xs text-white/70">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-black">A</span>
                      <span>1-Tap Launch & Floating QuickFill HUD (Recommended)</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-white/60 pl-6.5">
                      Tap the <strong className="text-sky-300">"⚡ AutoFill [Service]"</strong> button on any vault card. It opens the exact login portal in a new tab while keeping the <strong>Floating QuickFill HUD</strong> docked at the bottom of your screen for 1-tap copy/paste.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-black">B</span>
                      <span>Mobile Chrome & Opera Bookmarklet</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-white/60 pl-6.5">
                      In mobile Chrome or Opera: add a bookmark named <code className="text-sky-300">🔒 hVault</code> with the bookmarklet script. When you are on any login page (e.g. Netflix, Spotify), type <code className="text-sky-300">🔒 hVault</code> in the browser URL bar and tap the bookmark suggestion to trigger instant in-page autofill.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: PWA Home Screen Installation */}
              <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Download className="w-4 h-4" />
                  <span>2. Install as Standalone App (PWA on Android & iOS)</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  hVault has a fully configured Progressive Web App manifest. You can install it on your Android or iPhone right now:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                      <span>🤖 Android (Chrome/Opera/Brave)</span>
                    </span>
                    <ol className="text-[10px] text-white/60 list-decimal list-inside space-y-0.5 leading-relaxed">
                      <li>Tap the <strong>3 dots menu</strong> (⋮) in your browser.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                      <li>Launches full-screen with zero browser address bar!</li>
                    </ol>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                      <span>🍎 iOS (Safari)</span>
                    </span>
                    <ol className="text-[10px] text-white/60 list-decimal list-inside space-y-0.5 leading-relaxed">
                      <li>Tap the <strong>Share button</strong> (box with arrow up).</li>
                      <li>Scroll down & tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Runs like a native iOS application.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Section 3: Android Native App Architecture & AutofillService */}
              <div className="bg-[#0A0F1D] border border-emerald-500/25 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Terminal className="w-4 h-4" />
                    <span>3. Native Android App: Android AutofillService Architecture</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold uppercase">
                    Android 8.0+ / API 26+
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  When you convert hVault into an Android app (e.g. with Kotlin / Android Studio, Capacitor, or React Native), Android provides the <strong>Android Autofill Framework</strong> and <strong>Credential Manager API</strong>. Here is the exact structure:
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[10px]">
                    <div className="text-sky-300 font-bold">1. AndroidManifest.xml Registration:</div>
                    <pre className="text-white/60 overflow-x-auto p-2 bg-black/60 rounded-lg text-[9px] leading-tight">
{`<service
  android:name=".HVaultAutofillService"
  android:permission="android.permission.BIND_AUTOFILL_SERVICE">
  <intent-filter>
    <action android:name="android.service.autofill.AutofillService" />
  </intent-filter>
  <meta-data
    android:name="android.autofill"
    android:resource="@xml/autofill_service_config" />
</service>`}
                    </pre>
                  </div>

                  <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[10px]">
                    <div className="text-emerald-300 font-bold">2. How Android OS Triggers hVault:</div>
                    <ul className="text-white/70 list-disc list-inside space-y-1 text-[10px] font-sans">
                      <li>Whenever the user taps a username, password, or ATM card field in <strong>ANY app or browser</strong> on Android, Android OS fires <code className="text-emerald-300 font-mono">onFillRequest()</code>.</li>
                      <li>hVault verifies biometric/PIN unlock and matches the app package or web domain.</li>
                      <li>Android displays an inline keyboard prompt: <strong className="text-sky-300">"Autofill with hVault"</strong>.</li>
                      <li>1-Tap populates username, password, or ATM card details directly into the fields system-wide.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0F1D]/80 flex items-center justify-between">
          <span className="text-[11px] text-white/40">
            {autofillEnabled ? '⚡ AutoFill is currently ACTIVE in your vault' : 'AutoFill is currently DISABLED'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
