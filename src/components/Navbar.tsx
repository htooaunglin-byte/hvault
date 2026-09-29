import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HVaultLogo } from './HVaultLogo';
import { 
  Shield, 
  Plus, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  Key, 
  Sparkles,
  User,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Trash2,
  Check,
  ChevronDown,
  AlertTriangle,
  Sliders,
  Layers,
  Settings,
  Zap,
  Clock,
  Timer,
  RefreshCw,
  CloudCheck,
  Cloud,
  CreditCard,
  Fingerprint
} from 'lucide-react';
import { CategoryType, DEFAULT_CATEGORIES, CategoryFlowType } from '../types';
import { getCategoryIconComponent } from '../lib/categoryUtils';
import { triggerHaptic } from '../lib/haptics';
import { isBiometricsSupported, hasSavedBiometrics, removeBiometricCredential } from '../lib/webauthn';

export const AUTO_LOCK_PRESETS = [1, 2, 3, 5, 10, 15, 30];

interface NavbarProps {
  userEmail?: string | null;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
  onSignOut: () => void;
  onOpenAddModal: () => void;
  selectedCategory: CategoryType | 'All';
  onCategoryChange: (category: CategoryType | 'All') => void;
  activeTab: 'vault' | 'audit' | 'generator';
  onTabChange: (tab: 'vault' | 'audit' | 'generator') => void;
  onLockVault: () => void;
  isUnlocked: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onWipeClipboard: () => void;
  autoLockTimeout: number;
  onChangeAutoLockTimeout: (minutes: number) => void;
  onCycleAutoLockTimer?: () => void;
  categories?: string[];
  categoryFlows?: Record<string, CategoryFlowType>;
  onOpenManageCategories?: () => void;
  autofillEnabled?: boolean;
  onToggleAutofill?: () => void;
  onOpenAutofillAssistant?: () => void;
  autoLockRemainingSeconds?: number;
  onResetAutoLockTimer?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
  lastSyncTime?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  userDisplayName,
  userPhotoURL,
  onSignOut,
  onOpenAddModal,
  selectedCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
  onLockVault,
  isUnlocked,
  theme,
  onToggleTheme,
  onWipeClipboard,
  autoLockTimeout,
  onChangeAutoLockTimeout,
  onCycleAutoLockTimer,
  categories = DEFAULT_CATEGORIES,
  categoryFlows,
  onOpenManageCategories,
  autofillEnabled = true,
  onToggleAutofill,
  onOpenAutofillAssistant,
  autoLockRemainingSeconds,
  onResetAutoLockTimer,
  syncStatus = 'synced',
  lastSyncTime,
}) => {
  const [showSecurityMenu, setShowSecurityMenu] = useState(false);
  const securityMenuRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkCategoryScroll();
    const timer = setTimeout(checkCategoryScroll, 100);
    window.addEventListener('resize', checkCategoryScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkCategoryScroll);
    };
  }, [categories, selectedCategory]);

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (securityMenuRef.current && !securityMenuRef.current.contains(e.target as Node)) {
        setShowSecurityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const allCategoryTabs: (string | 'All')[] = ['All', ...categories];

  return (
    <header className="sticky top-0 z-30 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-1.5 sm:gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <HVaultLogo size="md" className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1 sm:gap-1.5">
                <span className="text-base sm:text-2xl font-black tracking-tighter text-sky-400">hVAULT</span>
                <span className="px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hidden sm:inline-block">
                  ENCRYPTED
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold hidden lg:block">
                Client-Side Encrypted
              </span>
            </div>
          </div>

          {/* Subtle Firestore Sync Status Indicator */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {syncStatus === 'syncing' ? (
                <motion.div
                  key="status-syncing"
                  initial={{ opacity: 0, scale: 0.85, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-sky-500/15 border border-sky-500/35 text-sky-300 rounded-full text-[10px] sm:text-[11px] font-bold shadow-md shadow-sky-950/60 select-none animate-pulse"
                  title="Pushing and fetching changes from Firestore..."
                >
                  <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 animate-spin shrink-0" />
                  <span className="font-mono tracking-tight hidden xs:inline sm:inline">Syncing...</span>
                </motion.div>
              ) : syncStatus === 'synced' ? (
                <motion.div
                  key="status-synced"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300/90 rounded-full text-[10px] sm:text-[11px] font-bold shadow-sm shadow-emerald-950/30 select-none hover:bg-emerald-500/20 transition-colors"
                  title={`Data fully consistent with Firestore • Last synced ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'just now'}`}
                >
                  <CloudCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                  <span className="tracking-tight hidden xs:inline sm:inline">Synced</span>
                </motion.div>
              ) : (
                <motion.div
                  key="status-error"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold select-none"
                  title="Offline / Sync notice"
                >
                  <Cloud className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Offline</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Tabs (Desktop - lg:flex) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#0D1425] p-1 rounded-xl border border-white/10 text-xs shrink-0">
            {[
              { id: 'vault' as const, label: 'hVault', icon: Key },
              { id: 'audit' as const, label: 'Audit', icon: ShieldCheck },
              { id: 'generator' as const, label: 'Generator', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-lg font-black tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPillDesktop"
                      className="absolute inset-0 bg-sky-600 rounded-lg shadow-md shadow-sky-900/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 z-10" />
                  <span className="z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions Cluster (Optimized for Mobile, Tablet & Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            {/* Primary CTA: Add Entry */}
            <button
              onClick={onOpenAddModal}
              title="Add New Entry"
              className="py-1.5 px-2 sm:py-2 sm:px-3 lg:px-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-900/20 transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 min-h-[36px] sm:min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">+ Entry</span>
              <span className="sm:hidden text-[10px]">Add</span>
            </button>

            {/* Lock / Unlock status */}
            <button
              onClick={onLockVault}
              title={isUnlocked ? "Lock hVault Session" : "Unlock hVault"}
              className={`p-1.5 sm:p-2 lg:p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 active:scale-95 min-h-[36px] sm:min-h-[40px] flex items-center justify-center ${
                isUnlocked 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Visual Idle Auto-Lock Countdown & Cycle Timer Button (Hidden on small mobile to preserve room for Logout) */}
            {isUnlocked && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  if (onCycleAutoLockTimer) {
                    onCycleAutoLockTimer();
                  } else {
                    const currentIndex = AUTO_LOCK_PRESETS.indexOf(autoLockTimeout);
                    const next = currentIndex === -1 ? 1 : AUTO_LOCK_PRESETS[(currentIndex + 1) % AUTO_LOCK_PRESETS.length];
                    onChangeAutoLockTimeout(next);
                  }
                }}
                title={
                  autoLockTimeout > 0 && typeof autoLockRemainingSeconds === 'number'
                    ? `Auto-lock: ${autoLockTimeout}m timeout (${Math.floor(autoLockRemainingSeconds / 60)}m ${autoLockRemainingSeconds % 60}s left). Tap to switch to ${
                        AUTO_LOCK_PRESETS[(AUTO_LOCK_PRESETS.indexOf(autoLockTimeout) + 1) % AUTO_LOCK_PRESETS.length] || 1
                      }m.`
                    : 'Auto-lock disabled. Tap to enable 1 min auto-lock.'
                }
                className={`hidden md:flex px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all items-center gap-1.5 cursor-pointer shrink-0 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider active:scale-90 active:brightness-125 select-none touch-manipulation min-h-[36px] sm:min-h-[40px] group ${
                  autoLockTimeout === 0
                    ? 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    : autoLockRemainingSeconds !== undefined && autoLockRemainingSeconds <= 30
                    ? 'bg-red-500/25 border-red-500/60 text-red-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : autoLockRemainingSeconds !== undefined && autoLockRemainingSeconds <= 60
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20 shadow-sm'
                }`}
              >
                <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                  autoLockTimeout === 0
                    ? 'text-white/40'
                    : (autoLockRemainingSeconds !== undefined && autoLockRemainingSeconds <= 30)
                    ? 'text-red-400 animate-spin'
                    : (autoLockRemainingSeconds !== undefined && autoLockRemainingSeconds <= 60)
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`} />
                <span className="tabular-nums">
                  {autoLockTimeout > 0 && typeof autoLockRemainingSeconds === 'number'
                    ? `${Math.floor(autoLockRemainingSeconds / 60)}:${autoLockRemainingSeconds % 60 < 10 ? '0' : ''}${autoLockRemainingSeconds % 60}`
                    : 'Off'}
                </span>
                {autoLockTimeout > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-sky-400/15 border border-sky-400/30 rounded font-sans text-sky-300 font-bold group-hover:bg-sky-400/30 transition-colors">
                    {autoLockTimeout}m
                  </span>
                )}
              </button>
            )}

            {/* Quick AutoFill Assistant Button (Desktop only) */}
            <button
              type="button"
              onClick={() => onOpenAutofillAssistant?.()}
              title={autofillEnabled ? "1-Click AutoFill is Active (Click to open presets & test)" : "1-Click AutoFill is Disabled (Click to setup)"}
              className={`hidden xl:flex p-2 lg:px-2.5 lg:py-2 rounded-xl border transition-all items-center gap-1.5 cursor-pointer shadow-sm shrink-0 min-h-[36px] sm:min-h-[40px] ${
                autofillEnabled 
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25 hover:border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              <HVaultLogo size="custom" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-xs font-bold">AutoFill</span>
            </button>

            {/* Manual Clipboard Wipe Button (Desktop only) */}
            <button
              onClick={onWipeClipboard}
              title="Wipe Clipboard (Clear Copied Passwords & Sensitive Data)"
              className="hidden 2xl:flex p-2 lg:px-2.5 lg:py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl transition-all items-center gap-1.5 cursor-pointer active:scale-95 group shadow-sm shrink-0 min-h-[36px] sm:min-h-[40px]"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs font-bold text-red-300">Wipe</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <motion.button
              type="button"
              onClick={onToggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              title={theme === 'dark' ? "Switch to High-Contrast Light Theme" : "Switch to Dark Theme"}
              className={`p-1.5 sm:p-2 lg:p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center relative overflow-hidden group shrink-0 min-h-[36px] sm:min-h-[40px] ${
                theme === 'dark'
                  ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                  : 'border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Security Settings & Idle Auto-Lock Menu */}
            <div className="relative shrink-0" ref={securityMenuRef}>
              <button
                type="button"
                onClick={() => setShowSecurityMenu(!showSecurityMenu)}
                title={`Security & Lock Settings: ${autoLockTimeout > 0 ? `${autoLockTimeout}m timeout` : 'Disabled'}`}
                className={`p-1.5 sm:p-2 lg:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  showSecurityMenu
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                <span className="hidden 2xl:inline text-[10px] font-black uppercase tracking-wider text-white/70">
                  {autoLockTimeout > 0 ? `${autoLockTimeout}m` : 'Off'}
                </span>
              </button>

              {/* Security Settings Dropdown & Mobile Overlay */}
              {showSecurityMenu && (
                <>
                  <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setShowSecurityMenu(false)}
                  />

                  <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full mt-2 sm:w-80 bg-[#0D1425] border border-white/15 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                      <div className="flex items-center gap-1.5 text-sky-400 font-black text-xs uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        <span>Security & Utilities</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    </div>

                    {/* Account Info on mobile */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Signed In As</div>
                        <div className="text-xs font-bold text-white truncate max-w-[180px]">{userEmail || 'User'}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSecurityMenu(false);
                          onSignOut();
                        }}
                        className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/80">Idle Auto-Lock Timeout</span>
                        <span className="text-[9px] text-sky-400 font-mono font-bold">
                          {autoLockTimeout > 0 && typeof autoLockRemainingSeconds === 'number'
                            ? `Locking in ${Math.floor(autoLockRemainingSeconds / 60)}:${autoLockRemainingSeconds % 60 < 10 ? '0' : ''}${autoLockRemainingSeconds % 60}`
                            : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed px-1">
                        Automatically locks your vault after a period of keyboard, mouse, or touch inactivity.
                      </p>

                      <div className="space-y-1 pt-1 max-h-56 overflow-y-auto pr-1">
                        {[
                          { minutes: 1, label: '⚡ 1 Minute', desc: 'Ultra High Security' },
                          { minutes: 2, label: '⚡ 2 Minutes', desc: 'Fast Auto-Lock' },
                          { minutes: 3, label: '⚡ 3 Minutes', desc: 'Quick Timeout' },
                          { minutes: 5, label: '🔒 5 Minutes', desc: 'Recommended Default' },
                          { minutes: 10, label: '⏳ 10 Minutes', desc: 'Standard Session' },
                          { minutes: 15, label: '⏳ 15 Minutes', desc: 'Extended Session' },
                          { minutes: 30, label: '⌛ 30 Minutes', desc: 'Long Work Session' },
                          { minutes: 60, label: '🕒 60 Minutes', desc: 'Maximum Window' },
                          { minutes: 0, label: '⛔ Disabled', desc: 'Manual Lock Only' },
                        ].map((option) => (
                          <button
                            key={option.minutes}
                            type="button"
                            onClick={() => {
                              onChangeAutoLockTimeout(option.minutes);
                              setShowSecurityMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                              autoLockTimeout === option.minutes
                                ? 'bg-sky-500/20 border border-sky-400/40 text-white shadow-sm'
                                : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{option.label}</span>
                                {autoLockTimeout === option.minutes && (
                                  <span className="text-[9px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">Active</span>
                                )}
                              </div>
                              <div className="text-[9px] text-white/40 font-medium">{option.desc}</div>
                            </div>
                            {autoLockTimeout === option.minutes && (
                              <Check className="w-4 h-4 text-sky-400 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Wipe Clipboard action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div className="text-[11px] font-bold text-white/80">Clipboard Protection</div>
                      <button
                        type="button"
                        onClick={() => {
                          onWipeClipboard();
                          setShowSecurityMenu(false);
                        }}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none touch-manipulation active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Wipe Now</span>
                      </button>
                    </div>

                    {/* Biometric WebAuthn Hardware Security Status */}
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/90">Fingerprint / WebAuthn</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          hasSavedBiometrics(userEmail || 'hvault-default-user')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/10 text-white/40 border-white/10'
                        }`}>
                          {hasSavedBiometrics(userEmail || 'hvault-default-user') ? 'Active on Device' : 'Not Linked Yet'}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed px-1">
                        {hasSavedBiometrics(userEmail || 'hvault-default-user')
                          ? 'Hardware credentials registered. You can unlock your vault with your laptop fingerprint sensor.'
                          : 'Hardware-backed biometric unlock (e.g. ThinkPad / Windows Hello / Touch ID). Type your passphrase and tap "Link & Unlock" on the lock screen to pair.'}
                      </p>
                    </div>

                    {/* AutoFill Master Toggle in Security Menu */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/90">Website AutoFill</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleAutofill?.();
                          }}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            autofillEnabled 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-white/10 text-white/40 border-white/10'
                          }`}
                        >
                          {autofillEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSecurityMenu(false);
                          onOpenAutofillAssistant?.();
                        }}
                        className="w-full py-1.5 px-2.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Manage AutoFill & Presets</span>
                      </button>
                    </div>

                    {/* Account Section with Sign Out in Dropdown */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Account</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span>
                          Connected
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white/80 truncate font-mono px-1">
                        {userEmail || 'User'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSecurityMenu(false);
                          onSignOut();
                        }}
                        className="w-full py-2 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 hover:border-red-500/60 text-red-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Sign Out of Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User display badge (large desktop) */}
            <div className="hidden 2xl:flex flex-col items-end text-right shrink-0">
              <span className="text-[11px] font-bold text-white/70 truncate max-w-[120px]">
                {userEmail || 'User'}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                Connected
              </span>
            </div>

            {/* Prominent Sign Out Button (ALWAYS visible & accessible on Mobile, Tablet & Desktop) */}
            <button
              onClick={onSignOut}
              title={`Signed in as ${userEmail || 'User'}. Click to Sign Out`}
              className="py-1.5 px-2 sm:py-2 sm:px-2.5 lg:px-3 bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/30 border border-red-500/35 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 shadow-sm min-h-[36px] sm:min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-300">
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Segmented Tabs on Mobile & Tablet (lg:hidden) */}
        <div className="pb-2 pt-0 lg:hidden">
          <div className="flex items-center bg-[#0D1425] p-1 rounded-xl border border-white/10 text-xs w-full">
            {[
              { id: 'vault' as const, label: 'hVault', icon: Key },
              { id: 'audit' as const, label: 'Audit', icon: ShieldCheck },
              { id: 'generator' as const, label: 'Generator', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex-1 py-1.5 rounded-lg font-black tracking-wider uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer text-[10px] sm:text-xs ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPillMobile"
                      className="absolute inset-0 bg-sky-600 rounded-lg shadow-md shadow-sky-900/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 z-10" />
                  <span className="z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Chips & Organize Controls */}
        <div className="py-1.5 sm:py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
            
            {/* Mobile Header Row with Organize Button & Swipe Hint */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 px-0.5 sm:hidden">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>CATEGORIES</span>
              </span>
              <div className="flex items-center gap-2">
                {onOpenManageCategories && (
                  <button
                    type="button"
                    onClick={onOpenManageCategories}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-400 bg-sky-500/10 border border-sky-400/30 px-2.5 py-1 rounded-full active:scale-95 transition-all"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Organize</span>
                  </button>
                )}
                <span className="flex items-center gap-0.5 text-white/40 font-bold tracking-widest text-[9px]">
                  <span>SWIPE</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>

            {/* Scrollable Category Filter Pills with Mouse-Wheel and Navigation Arrows */}
            <div className="relative flex items-center flex-1 overflow-hidden min-w-0 group/catnav">
              {/* Left Edge Gradient Fade & Scroll Button */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0A0F1D] to-transparent z-10 pointer-events-none" />
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleCategoryScroll('left')}
                  title="Scroll categories left"
                  className="hidden sm:flex absolute left-0.5 z-20 items-center justify-center w-6 h-6 bg-[#0D1425]/95 hover:bg-sky-600 border border-white/20 hover:border-sky-400 text-white/80 hover:text-white rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Scrollable Category Container */}
              <div 
                ref={categoryScrollRef}
                onScroll={checkCategoryScroll}
                onWheel={(e) => {
                  if (e.deltaY !== 0 && categoryScrollRef.current) {
                    categoryScrollRef.current.scrollLeft += e.deltaY;
                    checkCategoryScroll();
                  }
                }}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-1 px-1 sm:px-2 text-xs w-full scroll-smooth select-none"
              >
                <span className="text-white/30 shrink-0 font-black text-[10px] tracking-widest uppercase mr-1 hidden sm:inline">
                  CATEGORY:
                </span>
                {allCategoryTabs.map((cat) => {
                  const isSelected = selectedCategory === cat || selectedCategory.toLowerCase() === cat.toLowerCase();
                  const IconComp = cat === 'All' ? Layers : getCategoryIconComponent(cat, categoryFlows);
                  return (
                    <button
                      key={cat}
                      onClick={() => onCategoryChange(cat)}
                      className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30 scale-[1.02]'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <IconComp className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'opacity-70'}`} />
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Edge Gradient Fade & Scroll Button */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0A0F1D] to-transparent z-10 pointer-events-none" />
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleCategoryScroll('right')}
                  title="Scroll categories right"
                  className="hidden sm:flex absolute right-0.5 z-20 items-center justify-center w-6 h-6 bg-[#0D1425]/95 hover:bg-sky-600 border border-white/20 hover:border-sky-400 text-white/80 hover:text-white rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Organize Categories Button */}
            {onOpenManageCategories && (
              <div className="hidden sm:flex items-center shrink-0 pl-2">
                <button
                  type="button"
                  onClick={onOpenManageCategories}
                  title="Manage, reorder, add, or delete categories"
                  className="px-3 py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase transition-all flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:border-sky-400/60 cursor-pointer shadow-sm active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5 text-sky-400" />
                  <span>Organize Categories</span>
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </header>
  );
};
