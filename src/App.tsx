import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  getDocs,
  addDoc, 
  doc, 
  setDoc,
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { encryptPassword, decryptPassword } from './lib/crypto';
import { CategoryType, PasswordEntry, DecryptedPasswordEntry, DEFAULT_CATEGORIES, CategoryFlowType, DEFAULT_CATEGORY_FLOWS } from './types';

// UI Components
import { AuthScreen } from './components/AuthScreen';
import { MasterPassphraseModal } from './components/MasterPassphraseModal';
import { Navbar } from './components/Navbar';
import { PasswordCard } from './components/PasswordCard';
import { PasswordModal } from './components/PasswordModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SecurityDashboard } from './components/SecurityDashboard';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { AutoFillAssistantModal } from './components/AutoFillAssistantModal';
import { QuickFillHUD } from './components/QuickFillHUD';
import { PasswordGridSkeleton } from './components/PasswordCardSkeleton';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HVaultLogo } from './components/HVaultLogo';
import { PullToRefresh } from './components/PullToRefresh';
import { resolveServiceAutoFill } from './lib/autofillUtils';
import { triggerHaptic } from './lib/haptics';

import { 
  Key, 
  ShieldCheck, 
  Plus, 
  Search, 
  Lock, 
  AlertCircle, 
  AlertTriangle, 
  X,
  Clock,
  ArrowUpDown,
  ArrowDownAZ,
  Calendar,
  Sparkles,
  History,
  Zap,
  LogOut
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Master Passphrase State
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');
  const [isPassphraseModalOpen, setIsPassphraseModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Vault Items State
  const [rawEntries, setRawEntries] = useState<PasswordEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedPasswordEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Theme Preference State (Dark vs High-Contrast Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('hvault_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Idle Auto-Lock Timeout State (in minutes: 1, 5, 15, 30, 60, or 0 = disabled)
  const [autoLockTimeout, setAutoLockTimeout] = useState<number>(() => {
    const saved = localStorage.getItem('hvault_autolock_timeout');
    return saved !== null ? Number(saved) : 5;
  });

  // Firestore Real-Time Sync Indicator State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markSyncSuccess = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    }, 600);
  }, []);

  const markSyncStart = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    setSyncStatus('syncing');
  }, []);

  const markSyncError = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    setSyncStatus('error');
  }, []);

  // Website AutoFill Feature Master State (Enabled / Disabled)
  const [autofillEnabled, setAutofillEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('hvault_autofill_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // AutoFill Assistant Modal state
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);

  // QuickFill HUD Active Staging State
  const [activeQuickFill, setActiveQuickFill] = useState<{
    entry: DecryptedPasswordEntry;
    targetUrl: string;
    serviceName: string;
  } | null>(null);

  const handleToggleAutofill = async () => {
    const nextVal = !autofillEnabled;
    setAutofillEnabled(nextVal);
    localStorage.setItem('hvault_autofill_enabled', String(nextVal));
    if (user) {
      try {
        const prefDocRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await setDoc(prefDocRef, { autofillEnabled: nextVal, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn('Could not sync autofill preference:', e);
      }
    }
    addToast(
      'info',
      nextVal ? 'Website AutoFill Enabled' : 'Website AutoFill Disabled',
      nextVal
        ? '1-Click AutoFill HUD and Quick Launch are now active for your vault entries.'
        : 'AutoFill launch buttons and quick fills are deactivated.'
    );
  };

  const AUTO_LOCK_PRESETS = [1, 2, 3, 5, 10, 15, 30];

  const handleChangeAutoLockTimeout = async (minutes: number) => {
    setAutoLockTimeout(minutes);
    lastActivityRef.current = Date.now();
    setRemainingAutoLockSeconds(minutes * 60);
    localStorage.setItem('hvault_autolock_timeout', String(minutes));
    if (user) {
      try {
        const prefDocRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await setDoc(prefDocRef, { autoLockTimeout: minutes, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn('Could not sync preferences to Firestore:', e);
      }
    }
    addToast(
      'info',
      'Auto-Lock Timer Updated',
      minutes === 0
        ? 'Idle auto-lock disabled. Vault must be manually locked.'
        : `Auto-lock timeout set to ${minutes} minute${minutes > 1 ? 's' : ''}.`
    );
  };

  const handleCycleAutoLockTimeout = () => {
    triggerHaptic('selection');
    const currentIndex = AUTO_LOCK_PRESETS.indexOf(autoLockTimeout);
    let nextTimeout: number;
    if (currentIndex === -1) {
      nextTimeout = 1;
    } else {
      nextTimeout = AUTO_LOCK_PRESETS[(currentIndex + 1) % AUTO_LOCK_PRESETS.length];
    }
    handleChangeAutoLockTimeout(nextTimeout);
  };

  // Multi-tier robust system clipboard wiper
  const wipeSystemClipboard = async (): Promise<boolean> => {
    let success = false;

    try {
      if (typeof window !== 'undefined') {
        window.focus();
      }
    } catch {
      // ignore focus errors
    }

    // Stage 1: Async Clipboard API with empty string
    try {
      await navigator.clipboard.writeText('');
      success = true;
    } catch {
      // Failed or not focused
    }

    // Stage 2: Async Clipboard API with space fallback
    if (!success) {
      try {
        await navigator.clipboard.writeText(' ');
        success = true;
      } catch {
        // Failed
      }
    }

    // Stage 3: Legacy execCommand DOM fallback
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = '';
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const res = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (res) {
          success = true;
        }
      } catch {
        // Failed
      }
    }

    return success;
  };

  // Manual wipe trigger
  const handleWipeClipboard = async () => {
    await wipeSystemClipboard();
    addToast('info', 'Clipboard Cleared', 'Sensitive data was wiped from your clipboard.');
  };

  useEffect(() => {
    localStorage.setItem('hvault_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    addToast(
      'info',
      nextTheme === 'light' ? 'Light Theme Active' : 'Dark Theme Active',
      `Switched to ${nextTheme === 'light' ? 'High-Contrast Light Mode' : 'Dark Mode'}.`
    );
  };

  // Helper to safely persist string lists to localStorage without circular object issues
  const safeSaveStringArray = (key: string, items: any[]) => {
    try {
      if (!Array.isArray(items)) return;
      const cleanList = Array.from(
        new Set(
          items
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .map((s) => s.trim())
        )
      );
      localStorage.setItem(key, JSON.stringify(cleanList));
    } catch {
      // Ignore serialization/storage errors
    }
  };

  // Categories State & Management
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hvault_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  const [categoryFlows, setCategoryFlows] = useState<Record<string, CategoryFlowType>>(() => {
    try {
      const saved = localStorage.getItem('hvault_category_flows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_CATEGORY_FLOWS, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORY_FLOWS;
  });

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  // Active UI filters, sorting & navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'vault' | 'audit' | 'generator'>('vault');
  const [sortBy, setSortBy] = useState<'lastAccessed' | 'name' | 'created' | 'updated'>(() => {
    try {
      const saved = localStorage.getItem('hvault_sort_by');
      if (saved === 'lastAccessed' || saved === 'name' || saved === 'created' || saved === 'updated') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'name';
  });

  const handleSortChange = (newSort: 'lastAccessed' | 'name' | 'created' | 'updated') => {
    setSortBy(newSort);
    try {
      localStorage.setItem('hvault_sort_by', newSort);
    } catch {
      // ignore
    }
  };

  const handleCategoryChange = (category: CategoryType | 'All') => {
    setSelectedCategory(category);
    if (activeTab !== 'vault') {
      setActiveTab('vault');
    }
  };

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DecryptedPasswordEntry | null>(null);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    rawEntries.forEach((entry) => {
      const cat = entry.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [rawEntries]);

  // Load user categories from Firestore and local storage when user logs in
  useEffect(() => {
    if (!user) return;

    // 1. Check user-specific local storage
    try {
      const userSaved = localStorage.getItem(`hvault_categories_${user.uid}`);
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
          if (clean.length > 0) {
            setCategories(clean);
          }
        }
      }

      const userFlowsSaved = localStorage.getItem(`hvault_category_flows_${user.uid}`);
      if (userFlowsSaved) {
        const parsedFlows = JSON.parse(userFlowsSaved);
        if (parsedFlows && typeof parsedFlows === 'object') {
          setCategoryFlows({ ...DEFAULT_CATEGORY_FLOWS, ...parsedFlows });
        }
      }
    } catch {
      // ignore
    }

    // 2. Sync categories setting from Firestore
    const catDocRef = doc(db, 'users', user.uid, 'settings', 'categories');
    const unsubCat = onSnapshot(
      catDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.list)) {
            const cleanRemote = (data.list as any[])
              .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
              .map((c) => c.trim());

            if (cleanRemote.length > 0) {
              setCategories(cleanRemote);
              safeSaveStringArray(`hvault_categories_${user.uid}`, cleanRemote);
              safeSaveStringArray('hvault_custom_categories', cleanRemote);
            }
          }
          if (data?.flows && typeof data.flows === 'object') {
            const merged = { ...DEFAULT_CATEGORY_FLOWS, ...data.flows };
            setCategoryFlows(merged);
            try {
              localStorage.setItem(`hvault_category_flows_${user.uid}`, JSON.stringify(merged));
              localStorage.setItem('hvault_category_flows', JSON.stringify(merged));
            } catch {
              // ignore
            }
          }
        }
      },
      (err) => {
        console.warn('Category settings sync notice:', err.message);
      }
    );

    // 3. Sync user preferences (including auto-lock timeout) from Firestore
    const prefDocRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    const unsubPref = onSnapshot(
      prefDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data?.autoLockTimeout === 'number') {
            setAutoLockTimeout(data.autoLockTimeout);
            localStorage.setItem('hvault_autolock_timeout', String(data.autoLockTimeout));
          }
          if (typeof data?.autofillEnabled === 'boolean') {
            setAutofillEnabled(data.autofillEnabled);
            localStorage.setItem('hvault_autofill_enabled', String(data.autofillEnabled));
          }
        }
      },
      (err) => {
        console.warn('Preferences sync notice:', err.message);
      }
    );

    return () => {
      unsubCat();
      unsubPref();
    };
  }, [user]);

  // Automatically discover categories from newly loaded password records
  useEffect(() => {
    if (!user || rawEntries.length === 0) return;

    const entryCategories = rawEntries
      .map((e) => e.category?.trim())
      .filter((c): c is string => typeof c === 'string' && c.length > 0);

    const currentCatSet = new Set(categories.map((c) => c.toLowerCase()));
    const missing = entryCategories.filter((c) => !currentCatSet.has(c.toLowerCase()));

    if (missing.length > 0) {
      const uniqueMissing = Array.from(new Set(missing));
      const updatedList = Array.from(new Set([...categories, ...uniqueMissing]));

      setCategories(updatedList);
      safeSaveStringArray(`hvault_categories_${user.uid}`, updatedList);
      safeSaveStringArray('hvault_custom_categories', updatedList);

      const catDocRef = doc(db, 'users', user.uid, 'settings', 'categories');
      setDoc(catDocRef, { list: updatedList, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {
        // Silently catch background sync notices
      });
    }
  }, [user, rawEntries]);

  // Save updated categories list (reordered, added, or deleted)
  const handleSaveCategories = async (
    newCategories: string[],
    updatedFlows?: Record<string, CategoryFlowType>
  ) => {
    if (!Array.isArray(newCategories)) return;
    const cleanList = Array.from(
      new Set(
        newCategories
          .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
          .map((s) => s.trim())
      )
    );
    if (cleanList.length === 0) return;

    const newFlows = updatedFlows ? { ...categoryFlows, ...updatedFlows } : categoryFlows;

    setCategories(cleanList);
    setCategoryFlows(newFlows);
    safeSaveStringArray('hvault_custom_categories', cleanList);

    try {
      localStorage.setItem('hvault_category_flows', JSON.stringify(newFlows));
    } catch {
      // ignore
    }

    if (user) {
      safeSaveStringArray(`hvault_categories_${user.uid}`, cleanList);
      try {
        localStorage.setItem(`hvault_category_flows_${user.uid}`, JSON.stringify(newFlows));
      } catch {
        // ignore
      }

      try {
        const catDocRef = doc(db, 'users', user.uid, 'settings', 'categories');
        await setDoc(catDocRef, { list: cleanList, flows: newFlows, updatedAt: serverTimestamp() }, { merge: true });
        addToast('success', 'Categories Saved', 'Category order and preferences updated successfully.');
      } catch (err: any) {
        console.error('Error saving categories to Firestore:', err);
        addToast('info', 'Saved Locally', 'Category preferences saved to your device.');
      }
    }
  };

  // Quick Add Category (from Password Modal or Navbar)
  const handleQuickAddCategory = async (newCategory: string, flow?: CategoryFlowType) => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...categories, trimmed];
    const newFlows = flow ? { ...categoryFlows, [trimmed]: flow } : categoryFlows;
    await handleSaveCategories(updated, newFlows);
    addToast('success', 'Category Created', `Added "${trimmed}" (${flow || 'password'}) to your categories.`);
  };

  // Delete Category with automatic reassign of existing items
  const handleDeleteCategoryWithReassign = async (categoryToDelete: string) => {
    if (!user) return;

    // Find all items under this category and reassign to 'General' (or first available category)
    const fallbackCategory = categories.find((c) => c !== categoryToDelete) || 'General';
    const itemsToReassign = rawEntries.filter((e) => e.category === categoryToDelete);

    if (itemsToReassign.length > 0) {
      try {
        await Promise.all(
          itemsToReassign.map((item) => {
            const docRef = doc(db, 'users', user.uid, 'passwords', item.id);
            return updateDoc(docRef, {
              category: fallbackCategory,
              updatedAt: serverTimestamp(),
            });
          })
        );
        addToast(
          'info',
          'Items Reassigned',
          `Reassigned ${itemsToReassign.length} password record(s) from "${categoryToDelete}" to "${fallbackCategory}".`
        );
      } catch (err: any) {
        console.error('Error reassigning items:', err);
        addToast('error', 'Reassign Failed', err.message);
      }
    }

    if (selectedCategory === categoryToDelete) {
      setSelectedCategory('All');
    }
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Listen to Firebase Authentication
  useEffect(() => {
    // Purge any legacy stored session keys to guarantee lock on page reload/refresh
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('hvault_key_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore storage access errors
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        // Vault always starts locked on page load/refresh
        setIsUnlocked(false);
        setMasterPassphrase('');
        setIsPassphraseModalOpen(true);
      } else {
        setMasterPassphrase('');
        setIsUnlocked(false);
        setRawEntries([]);
        setDecryptedEntries([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync for collection: users/{userId}/passwords
  useEffect(() => {
    if (!user) return;

    setLoadingEntries(true);
    markSyncStart();
    const passwordsRef = collection(db, 'users', user.uid, 'passwords');
    const q = query(passwordsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        markSyncStart();
        const parseFirestoreDate = (ts: any): string => {
          if (!ts) return '';
          if (typeof ts.toDate === 'function') {
            return ts.toDate().toISOString();
          }
          if (ts.seconds) {
            return new Date(ts.seconds * 1000).toISOString();
          }
          if (typeof ts === 'string') {
            return ts;
          }
          return '';
        };

        const items: PasswordEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdIso = parseFirestoreDate(data.createdAt) || parseFirestoreDate(data.updatedAt) || new Date().toISOString();
          const updatedIso = parseFirestoreDate(data.updatedAt) || createdIso;
          const lastAccessedIso = parseFirestoreDate(data.lastAccessedAt) || parseFirestoreDate(data.lastUsedAt) || undefined;

          return {
            id: docSnap.id,
            serviceName: data.serviceName || '',
            username: data.username || '',
            encryptedPassword: data.encryptedPassword || '',
            iv: data.iv || '',
            salt: data.salt || '',
            category: data.category || 'General',
            websiteUrl: data.websiteUrl || '',
            notes: data.notes || '',
            isFavorite: Boolean(data.isFavorite),
            safeSize: data.safeSize || '',
            safeColor: data.safeColor || '',
            bankName: data.bankName || '',
            cardProvider: data.cardProvider || '',
            cardType: data.cardType || '',
            cardHolder: data.cardHolder || '',
            cardNumber: data.cardNumber || '',
            cardExpiry: data.cardExpiry || '',
            cardCvv: data.cardCvv || '',
            cardColor: data.cardColor || '',
            clientId: data.clientId || '',
            oauthRedirectUri: data.oauthRedirectUri || '',
            oauthScopes: data.oauthScopes || '',
            oauthGrantType: data.oauthGrantType || '',
            oauthClientType: data.oauthClientType || '',
            oauthAuthUrl: data.oauthAuthUrl || '',
            oauthTokenUrl: data.oauthTokenUrl || '',
            oauthProvider: data.oauthProvider || '',
            keyName: data.keyName || '',
            keyEnvironment: data.keyEnvironment || '',
            keyHeaderPrefix: data.keyHeaderPrefix || '',
            autofillEnabled: data.autofillEnabled !== undefined ? Boolean(data.autofillEnabled) : true,
            createdAt: createdIso,
            updatedAt: updatedIso,
            lastAccessedAt: lastAccessedIso,
          };
        });
        setRawEntries(items);
        setLoadingEntries(false);
        markSyncSuccess();
      },
      (err) => {
        console.error("Firestore read error:", err);
        addToast('error', 'Firestore Permission Error', err.message);
        setLoadingEntries(false);
        markSyncError();
      }
    );

    return () => unsubscribe();
  }, [user, markSyncStart, markSyncSuccess, markSyncError]);

  // Manual Firestore Sync for Pull-to-Refresh
  const handleManualSync = useCallback(async () => {
    if (!user) return;
    markSyncStart();
    try {
      const passwordsRef = collection(db, 'users', user.uid, 'passwords');
      const q = query(passwordsRef);
      const snapshot = await getDocs(q);

      const parseFirestoreDate = (ts: any): string => {
        if (!ts) return '';
        if (typeof ts.toDate === 'function') {
          return ts.toDate().toISOString();
        }
        if (ts.seconds) {
          return new Date(ts.seconds * 1000).toISOString();
        }
        if (typeof ts === 'string') {
          return ts;
        }
        return '';
      };

      const items: PasswordEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdIso = parseFirestoreDate(data.createdAt) || parseFirestoreDate(data.updatedAt) || new Date().toISOString();
        const updatedIso = parseFirestoreDate(data.updatedAt) || createdIso;
        const lastAccessedIso = parseFirestoreDate(data.lastAccessedAt) || parseFirestoreDate(data.lastUsedAt) || undefined;

        return {
          id: docSnap.id,
          serviceName: data.serviceName || '',
          username: data.username || '',
          encryptedPassword: data.encryptedPassword || '',
          iv: data.iv || '',
          salt: data.salt || '',
          category: data.category || 'General',
          websiteUrl: data.websiteUrl || '',
          notes: data.notes || '',
          isFavorite: Boolean(data.isFavorite),
          safeSize: data.safeSize || '',
          safeColor: data.safeColor || '',
          bankName: data.bankName || '',
          cardProvider: data.cardProvider || '',
          cardType: data.cardType || '',
          cardHolder: data.cardHolder || '',
          cardNumber: data.cardNumber || '',
          cardExpiry: data.cardExpiry || '',
          cardCvv: data.cardCvv || '',
          cardColor: data.cardColor || '',
          clientId: data.clientId || '',
          oauthRedirectUri: data.oauthRedirectUri || '',
          oauthScopes: data.oauthScopes || '',
          oauthGrantType: data.oauthGrantType || '',
          oauthClientType: data.oauthClientType || '',
          oauthAuthUrl: data.oauthAuthUrl || '',
          oauthTokenUrl: data.oauthTokenUrl || '',
          oauthProvider: data.oauthProvider || '',
          keyName: data.keyName || '',
          keyEnvironment: data.keyEnvironment || '',
          keyHeaderPrefix: data.keyHeaderPrefix || '',
          autofillEnabled: data.autofillEnabled !== undefined ? Boolean(data.autofillEnabled) : true,
          createdAt: createdIso,
          updatedAt: updatedIso,
          lastAccessedAt: lastAccessedIso,
        };
      });

      setRawEntries(items);
      markSyncSuccess();
      addToast('success', 'Vault Synchronized', `${items.length} credential record(s) synced from Firestore.`);
    } catch (err: any) {
      console.error("Manual Firestore sync error:", err);
      markSyncError();
      addToast('error', 'Sync Failed', err?.message || 'Could not fetch Firestore updates.');
      throw err;
    }
  }, [user, markSyncStart, markSyncSuccess, markSyncError]);

  // 3. Client-Side Decryption Cache & Handler
  const decryptedCacheRef = useRef<Map<string, { plain: string; error: boolean }>>(new Map());

  // Invalidate cache if masterPassphrase changes
  useEffect(() => {
    decryptedCacheRef.current.clear();
  }, [masterPassphrase]);

  useEffect(() => {
    if (!masterPassphrase || !isUnlocked) {
      // If locked, hide decrypted passwords
      setDecryptedEntries(
        rawEntries.map((e) => ({ ...e, decryptedPassword: undefined }))
      );
      setIsDecrypting(false);
      return;
    }

    if (rawEntries.length === 0) {
      setIsDecrypting(false);
      setDecryptedEntries([]);
      return;
    }

    let isMounted = true;

    // Check which entries need decryption
    const entriesToDecrypt = rawEntries.filter((entry) => {
      const cacheKey = `${entry.id}:${entry.encryptedPassword}:${entry.iv}:${entry.salt}:${masterPassphrase}`;
      return !decryptedCacheRef.current.has(cacheKey);
    });

    // If all entries are already cached, update decryptedEntries immediately and smoothly without showing skeleton
    if (entriesToDecrypt.length === 0) {
      const results: DecryptedPasswordEntry[] = rawEntries.map((entry) => {
        const cacheKey = `${entry.id}:${entry.encryptedPassword}:${entry.iv}:${entry.salt}:${masterPassphrase}`;
        const cached = decryptedCacheRef.current.get(cacheKey);
        return {
          ...entry,
          decryptedPassword: cached?.plain,
          decryptError: cached?.error || false,
        };
      });
      setDecryptedEntries(results);
      setIsDecrypting(false);
      return;
    }

    // Only flag isDecrypting = true if we don't have any decrypted entries yet (initial unlock)
    if (decryptedEntries.length === 0) {
      setIsDecrypting(true);
    }

    const decryptAll = async () => {
      try {
        await Promise.all(
          entriesToDecrypt.map(async (entry) => {
            const cacheKey = `${entry.id}:${entry.encryptedPassword}:${entry.iv}:${entry.salt}:${masterPassphrase}`;
            try {
              const plain = await decryptPassword(
                {
                  encryptedPassword: entry.encryptedPassword,
                  iv: entry.iv,
                  salt: entry.salt,
                },
                masterPassphrase
              );
              decryptedCacheRef.current.set(cacheKey, { plain, error: false });
            } catch {
              decryptedCacheRef.current.set(cacheKey, { plain: '', error: true });
            }
          })
        );

        if (isMounted) {
          const results: DecryptedPasswordEntry[] = rawEntries.map((entry) => {
            const cacheKey = `${entry.id}:${entry.encryptedPassword}:${entry.iv}:${entry.salt}:${masterPassphrase}`;
            const cached = decryptedCacheRef.current.get(cacheKey);
            return {
              ...entry,
              decryptedPassword: cached?.plain,
              decryptError: cached?.error || false,
            };
          });
          setDecryptedEntries(results);
        }
      } finally {
        if (isMounted) {
          setIsDecrypting(false);
        }
      }
    };

    decryptAll();

    return () => {
      isMounted = false;
    };
  }, [rawEntries, masterPassphrase, isUnlocked]);

  // Auto-close open modals when vault locks
  useEffect(() => {
    if (!isUnlocked) {
      setIsAddEditOpen(false);
      setEditingEntry(null);
    }
  }, [isUnlocked]);

  // 3.5. Auto-lock vault after configured minutes of inactivity with live countdown indicator
  const [remainingAutoLockSeconds, setRemainingAutoLockSeconds] = useState<number>(() => autoLockTimeout * 60);
  const lastActivityRef = useRef<number>(Date.now());

  const handleResetAutoLockTimer = () => {
    lastActivityRef.current = Date.now();
    if (autoLockTimeout > 0) {
      setRemainingAutoLockSeconds(autoLockTimeout * 60);
      addToast('info', 'Timer Reset', `Auto-lock countdown reset to ${autoLockTimeout} minute${autoLockTimeout > 1 ? 's' : ''}.`);
    }
  };

  useEffect(() => {
    if (!isUnlocked || autoLockTimeout === 0) {
      setRemainingAutoLockSeconds(0);
      return;
    }

    lastActivityRef.current = Date.now();
    setRemainingAutoLockSeconds(autoLockTimeout * 60);

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, handleUserActivity, { passive: true }));

    const intervalId = setInterval(() => {
      const elapsedSecs = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const totalSecs = autoLockTimeout * 60;
      const remaining = Math.max(0, totalSecs - elapsedSecs);
      setRemainingAutoLockSeconds(remaining);

      if (remaining === 0) {
        clearInterval(intervalId);
        setIsUnlocked(false);
        setMasterPassphrase('');
        setIsAddEditOpen(false);
        setEditingEntry(null);
        setIsPassphraseModalOpen(true);
        addToast(
          'info',
          'hVault Auto-Locked',
          `hVault automatically locked after ${autoLockTimeout} minute${autoLockTimeout > 1 ? 's' : ''} of inactivity.`
        );
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
    };
  }, [isUnlocked, autoLockTimeout]);

  // Handle Master Passphrase Submission
  const handleSetPassphrase = (passphrase: string) => {
    setMasterPassphrase(passphrase);
    setIsUnlocked(true);
    setIsPassphraseModalOpen(false);
    addToast('success', 'hVault Unlocked', 'Client-side encryption key initialized.');
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    setMasterPassphrase('');
    setIsAddEditOpen(false);
    setEditingEntry(null);
    setIsPassphraseModalOpen(true);
    addToast('info', 'hVault Locked', 'Master key cleared from session memory.');
  };

  // 4. CRUD Operations
  // Save (Create or Update) Entry
  const handleSaveEntry = async (data: {
    id?: string;
    serviceName: string;
    username: string;
    password: string;
    category: CategoryType;
    websiteUrl?: string;
    notes?: string;
    isFavorite?: boolean;
    safeSize?: string;
    safeColor?: string;
    bankName?: string;
    cardProvider?: string;
    cardType?: string;
    cardHolder?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardColor?: string;
    clientId?: string;
    oauthRedirectUri?: string;
    oauthScopes?: string;
    oauthGrantType?: string;
    oauthClientType?: string;
    oauthAuthUrl?: string;
    oauthTokenUrl?: string;
    oauthProvider?: string;
    keyName?: string;
    keyEnvironment?: string;
    keyHeaderPrefix?: string;
    autofillEnabled?: boolean;
  }) => {
    if (!user) throw new Error('Not authenticated');
    if (!masterPassphrase) throw new Error('Master Passphrase is missing.');

    markSyncStart();
    try {
      // Perform Client-Side AES Encryption BEFORE sending to Firestore
      const encrypted = await encryptPassword(data.password, masterPassphrase);

      const payload: Record<string, any> = {
        serviceName: data.serviceName,
        username: data.username,
        encryptedPassword: encrypted.encryptedPassword,
        iv: encrypted.iv,
        salt: encrypted.salt,
        category: data.category,
        websiteUrl: data.websiteUrl || '',
        notes: data.notes || '',
        isFavorite: Boolean(data.isFavorite),
        autofillEnabled: data.autofillEnabled !== undefined ? Boolean(data.autofillEnabled) : true,
        safeSize: data.safeSize || '',
        safeColor: data.safeColor || '',
        bankName: data.bankName || '',
        cardProvider: data.cardProvider || '',
        cardType: data.cardType || '',
        cardHolder: data.cardHolder || '',
        cardNumber: data.cardNumber || '',
        cardExpiry: data.cardExpiry || '',
        cardCvv: data.cardCvv || '',
        cardColor: data.cardColor || '',
        clientId: data.clientId || '',
        oauthRedirectUri: data.oauthRedirectUri || '',
        oauthScopes: data.oauthScopes || '',
        oauthGrantType: data.oauthGrantType || '',
        oauthClientType: data.oauthClientType || '',
        oauthAuthUrl: data.oauthAuthUrl || '',
        oauthTokenUrl: data.oauthTokenUrl || '',
        oauthProvider: data.oauthProvider || '',
        keyName: data.keyName || '',
        keyEnvironment: data.keyEnvironment || '',
        keyHeaderPrefix: data.keyHeaderPrefix || '',
        updatedAt: serverTimestamp(),
      };

      if (data.id) {
        // Update existing document
        const docRef = doc(db, 'users', user.uid, 'passwords', data.id);
        await updateDoc(docRef, payload);
        markSyncSuccess();
        const toastTitle = data.category === 'API Keys' ? 'API Key Updated' : data.category === 'ATM Cards' ? 'ATM Card Updated' : data.category === 'OAuth' ? 'OAuth App Updated' : 'Password Updated';
        addToast('success', toastTitle, `Encrypted record for ${data.serviceName} updated.`);
      } else {
        // Create new document in users/{userId}/passwords
        const collectionRef = collection(db, 'users', user.uid, 'passwords');
        await addDoc(collectionRef, {
          ...payload,
          createdAt: serverTimestamp(),
        });
        markSyncSuccess();
        const toastTitle = data.category === 'API Keys' ? 'API Key Added' : data.category === 'ATM Cards' ? 'ATM Card Added' : data.category === 'OAuth' ? 'OAuth App Added' : 'Password Added';
        addToast('success', toastTitle, `Encrypted record for ${data.serviceName} created in Firestore.`);
      }

      // Ensure the saved category exists in the persistent categories list
      const trimmedCat = data.category?.trim();
      if (trimmedCat && !categories.some((c) => c.toLowerCase() === trimmedCat.toLowerCase())) {
        const updated = [...categories, trimmedCat];
        handleSaveCategories(updated);
      }
    } catch (err: any) {
      markSyncError();
      throw err;
    }
  };

  // Toggle Favorite Status
  const handleToggleFavorite = async (id: string, currentIsFavorite: boolean) => {
    if (!user) return;
    markSyncStart();
    try {
      const docRef = doc(db, 'users', user.uid, 'passwords', id);
      await updateDoc(docRef, {
        isFavorite: !currentIsFavorite,
        updatedAt: serverTimestamp(),
      });
      markSyncSuccess();
      addToast(
        'success',
        !currentIsFavorite ? '★ Favorited' : 'Unfavorited',
        !currentIsFavorite ? 'Account pinned to top of your hVault.' : 'Account unpinned from top.'
      );
    } catch (err: any) {
      markSyncError();
      addToast('error', 'Favorite Error', err.message);
    }
  };

  // Track timestamps of recorded accesses to throttle writes and prevent UI twitching
  const accessThrottleRef = useRef<Map<string, number>>(new Map());

  // Record 'last accessed' date in background when user views, copies, reveals, or edits an entry
  const handleRecordAccess = useCallback(async (id: string) => {
    if (!user || !id) return;

    // Throttle: don't re-record if accessed within the last 60 seconds
    const lastTime = accessThrottleRef.current.get(id) || 0;
    const nowMs = Date.now();
    if (nowMs - lastTime < 60000) {
      return;
    }
    accessThrottleRef.current.set(id, nowMs);

    const nowIso = new Date(nowMs).toISOString();

    // Optimistically update decryptedEntries in place for smooth local display
    setDecryptedEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lastAccessedAt: nowIso } : item))
    );

    try {
      const docRef = doc(db, 'users', user.uid, 'passwords', id);
      await updateDoc(docRef, {
        lastAccessedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Silent lastAccessedAt update notice:', err);
    }
  }, [user]);

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this password entry? This action cannot be undone.')) {
      return;
    }

    markSyncStart();
    try {
      const docRef = doc(db, 'users', user.uid, 'passwords', id);
      await deleteDoc(docRef);
      markSyncSuccess();
      addToast('success', 'Deleted Entry', 'Password entry removed from Firestore.');
    } catch (err: any) {
      markSyncError();
      addToast('error', 'Delete Failed', err.message);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async (text: string, label: string) => {
    if (!text) return;

    let copiedSuccessfully = false;

    // Stage 1: Async Clipboard API
    try {
      await navigator.clipboard.writeText(text);
      copiedSuccessfully = true;
    } catch {
      // Async API failed or permission blocked
    }

    // Stage 2: Legacy execCommand DOM fallback
    if (!copiedSuccessfully) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copiedSuccessfully = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }

    addToast(
      'success',
      `${label} Copied`,
      'Copied to clipboard. Click "Wipe Clipboard" in the top bar to clear when done.'
    );
  };

  // Sign out
  const handleSignOut = async () => {
    if (user) {
      sessionStorage.removeItem(`hvault_key_${user.uid}`);
    }
    await signOut(auth);
    addToast('info', 'Signed Out', 'You have been safely signed out.');
  };

  // 1-Click AutoFill & Launch Trigger
  const handleTriggerAutoFill = (entry: DecryptedPasswordEntry) => {
    if (!entry.decryptedPassword && !isUnlocked) {
      addToast('info', 'Vault Locked', 'Please unlock your vault with your Master Passphrase before using AutoFill.');
      setIsPassphraseModalOpen(true);
      return;
    }

    const autoFillInfo = resolveServiceAutoFill(entry.serviceName, entry.websiteUrl);
    const targetUrl = autoFillInfo.targetUrl || (entry.websiteUrl ? (entry.websiteUrl.startsWith('http') ? entry.websiteUrl : `https://${entry.websiteUrl}`) : '');

    // Record last accessed timestamp
    handleRecordAccess(entry.id);

    // Set active QuickFill HUD
    setActiveQuickFill({
      entry,
      targetUrl,
      serviceName: autoFillInfo.displayName,
    });

    // Launch target website if URL exists
    if (targetUrl) {
      try {
        const normalizedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
        window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Could not launch website in new tab:', err);
      }
    }

    addToast(
      'success',
      `AutoFill Ready for ${autoFillInfo.displayName}`,
      `QuickFill HUD active. Credentials ready to fill or paste.`
    );
  };

  // Filtered entries for main vault list with Favorite-first sorting and configurable sort order
  const filteredEntries = decryptedEntries
    .filter((item) => {
      const matchesSearch =
        item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.websiteUrl && item.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category === selectedCategory ||
        item.category?.toLowerCase() === selectedCategory?.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // 1. Sort favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // 2. Main sort based on selected option
      if (sortBy === 'lastAccessed') {
        const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA; // Most recently accessed first
        }
        return a.serviceName.localeCompare(b.serviceName);
      }

      if (sortBy === 'created') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA; // Newest first
        }
        return a.serviceName.localeCompare(b.serviceName);
      }

      if (sortBy === 'updated') {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA; // Recently modified first
        }
        return a.serviceName.localeCompare(b.serviceName);
      }

      // Default 'name': Alphabetical by serviceName (A-Z)
      return a.serviceName.localeCompare(b.serviceName);
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-white/50">Loading hVault...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Unlock Passphrase Modal */}
      <MasterPassphraseModal
        key={isPassphraseModalOpen ? 'open' : 'closed'}
        isOpen={isPassphraseModalOpen}
        onSetPassphrase={handleSetPassphrase}
        userEmail={user.email}
        existingEntries={rawEntries}
      />

      {/* Add / Edit Password Modal */}
      <PasswordModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialData={editingEntry}
        masterPassphrase={masterPassphrase}
        defaultCategory={selectedCategory !== 'All' ? selectedCategory : 'General'}
        categories={categories}
        categoryFlows={categoryFlows}
        onAddCategory={handleQuickAddCategory}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
      />

      {/* Manage / Reorder Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        categoryFlows={categoryFlows}
        onSaveCategories={handleSaveCategories}
        categoryCounts={categoryCounts}
        onDeleteCategoryWithReassign={handleDeleteCategoryWithReassign}
      />

      {/* Website AutoFill Management & Testing Modal */}
      <AutoFillAssistantModal
        isOpen={isAutofillModalOpen}
        onClose={() => setIsAutofillModalOpen(false)}
        autofillEnabled={autofillEnabled}
        onToggleAutofill={handleToggleAutofill}
        entries={decryptedEntries}
        onTriggerAutoFill={(entry) => {
          setIsAutofillModalOpen(false);
          handleTriggerAutoFill(entry);
        }}
        onCopy={handleCopyToClipboard}
        isUnlocked={isUnlocked}
      />

      {/* Floating Staging QuickFill HUD */}
      {activeQuickFill && (
        <QuickFillHUD
          entry={activeQuickFill.entry}
          targetUrl={activeQuickFill.targetUrl}
          serviceName={activeQuickFill.serviceName}
          onClose={() => setActiveQuickFill(null)}
          onCopy={handleCopyToClipboard}
        />
      )}

      {/* Top Header & Navigation */}
      <Navbar
        userEmail={user.email}
        userDisplayName={user.displayName}
        userPhotoURL={user.photoURL}
        onSignOut={handleSignOut}
        onOpenAddModal={() => {
          setEditingEntry(null);
          setIsAddEditOpen(true);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLockVault={handleLockVault}
        isUnlocked={isUnlocked}
        theme={theme}
        onToggleTheme={toggleTheme}
        onWipeClipboard={handleWipeClipboard}
        autoLockTimeout={autoLockTimeout}
        onChangeAutoLockTimeout={handleChangeAutoLockTimeout}
        onCycleAutoLockTimer={handleCycleAutoLockTimeout}
        categories={categories}
        categoryFlows={categoryFlows}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        autofillEnabled={autofillEnabled}
        onToggleAutofill={handleToggleAutofill}
        onOpenAutofillAssistant={() => setIsAutofillModalOpen(true)}
        autoLockRemainingSeconds={remainingAutoLockSeconds}
        onResetAutoLockTimer={handleResetAutoLockTimer}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-12">
        
        {/* Lock Warning Banner if locked */}
        {!isUnlocked && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300 text-xs">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <p className="font-black text-amber-200 uppercase tracking-tight">hVault is Currently Locked</p>
                <p className="text-amber-400/80 font-bold">Enter your Master Passphrase to decrypt and access plaintext credentials.</p>
              </div>
            </div>
            <button
              onClick={() => setIsPassphraseModalOpen(true)}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-amber-400 transition-colors cursor-pointer shrink-0 w-full sm:w-auto text-center"
            >
              UNLOCK NOW
            </button>
          </div>
        )}

        {/* Decryption Error Banner if any entries failed decryption */}
        {isUnlocked && decryptedEntries.some((e) => e.decryptError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-300 text-xs shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 animate-pulse" />
              <div>
                <p className="font-black text-red-200 uppercase tracking-tight">Master Passphrase Mismatch Detected</p>
                <p className="text-red-300/80 font-bold">Your current Master Passphrase cannot decrypt your saved entries. Re-enter your correct passphrase to reveal your passwords.</p>
              </div>
            </div>
            <button
              onClick={() => setIsPassphraseModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer shrink-0 w-full sm:w-auto text-center shadow-lg shadow-red-900/30"
            >
              RE-ENTER PASSPHRASE
            </button>
          </div>
        )}

        {/* TAB CONTENT WITH SMOOTH ANIMATED TRANSITIONS */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Main Vault Items */}
          {activeTab === 'vault' && (
            <motion.div
              key="vault-tab"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <PullToRefresh
                onRefresh={handleManualSync}
                isRefreshing={syncStatus === 'syncing'}
              >
                <div className="space-y-6">
                  {/* Vault Action & Search Header */}
                  <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                      
                      {/* Title & Count */}
                      <div className="shrink-0">
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                          <Key className="w-5 h-5 text-sky-400" />
                          <span>SAVED ACCOUNTS</span>
                        </h1>
                        <p className="text-xs font-bold text-white/50 mt-0.5">
                          SHOWING {filteredEntries.length} OF {decryptedEntries.length} ENCRYPTED CREDENTIALS
                        </p>
                      </div>

                      {/* Big, High-Contrast Search Input */}
                      <div className="flex-1 max-w-xl relative">
                        <Search className="w-5 h-5 text-sky-400 absolute left-4 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search accounts, service names, usernames, or notes..."
                          className="w-full bg-[#070B14] border-2 border-white/15 focus:border-sky-400 rounded-xl pl-12 pr-10 py-3 text-sm sm:text-base font-semibold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/20 shadow-inner transition-all"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                            className="absolute right-3.5 top-3.5 text-white/40 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Add Password Button */}
                      <button
                        onClick={() => {
                          triggerHaptic('selection');
                          setEditingEntry(null);
                          setIsAddEditOpen(true);
                        }}
                        className="py-3 px-5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-sky-900/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 justify-center hover:scale-[1.02] active:scale-95 select-none touch-manipulation"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ADD PASSWORD</span>
                      </button>

                    </div>

                    {/* Secondary Bar: Active Sort Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                        <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/60">Sort By:</span>
                      </div>

                      {/* Sort Pill Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleSortChange('lastAccessed');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none touch-manipulation active:scale-95 ${
                            sortBy === 'lastAccessed'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>Last Accessed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleSortChange('name');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none touch-manipulation active:scale-95 ${
                            sortBy === 'name'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <ArrowDownAZ className="w-3.5 h-3.5 text-sky-400" />
                          <span>Name (A–Z)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleSortChange('created');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none touch-manipulation active:scale-95 ${
                            sortBy === 'created'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <span>Date Created</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleSortChange('updated');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none touch-manipulation active:scale-95 ${
                            sortBy === 'updated'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <History className="w-3.5 h-3.5 text-sky-400" />
                          <span>Recently Updated</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {loadingEntries || (isDecrypting && decryptedEntries.length === 0) ? (
                    <PasswordGridSkeleton count={rawEntries.length > 0 ? Math.min(Math.max(rawEntries.length, 3), 9) : 6} />
                  ) : filteredEntries.length === 0 ? (
                    <div className="bg-[#0D1425] border border-white/10 rounded-3xl p-6 sm:p-10 text-center space-y-5 max-w-md mx-auto shadow-2xl relative overflow-hidden">
                      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                        {/* Ambient Glow Aura */}
                        <div className="absolute inset-0 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />
                        <HVaultLogo size="xl" className="w-28 h-28" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Your hVault is Empty & Ready</h3>
                        <p className="text-xs font-medium text-white/60 mt-1.5 leading-relaxed">
                          {searchQuery || selectedCategory !== 'All'
                            ? 'No items match your search or selected category filter.'
                            : 'All your logins and passwords will be safely encrypted here. Tap "+ ADD PASSWORD" to get started!'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          triggerHaptic('selection');
                          setEditingEntry(null);
                          setIsAddEditOpen(true);
                        }}
                        className="py-3 px-6 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-900/30 cursor-pointer inline-flex items-center gap-2 select-none touch-manipulation active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ADD FIRST ENTRY</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEntries.map((entry, index) => (
                        <PasswordCard
                          key={entry.id}
                          entry={entry}
                          index={index}
                          searchQuery={searchQuery}
                          categoryFlows={categoryFlows}
                          onToggleFavorite={handleToggleFavorite}
                          onRecordAccess={handleRecordAccess}
                          onAutoFill={handleTriggerAutoFill}
                          autofillEnabled={autofillEnabled}
                          onEdit={(item) => {
                            setEditingEntry(item);
                            setIsAddEditOpen(true);
                          }}
                          onDelete={handleDeleteEntry}
                          onCopy={handleCopyToClipboard}
                          isLocked={!isUnlocked}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </PullToRefresh>
            </motion.div>
          )}

          {/* TAB 2: Security Health Audit */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit-tab"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <SecurityDashboard
                entries={decryptedEntries}
                onEditEntry={(item) => {
                  setEditingEntry(item);
                  setIsAddEditOpen(true);
                }}
              />
            </motion.div>
          )}

          {/* TAB 3: Cryptographic Generator */}
          {activeTab === 'generator' && (
            <motion.div
              key="generator-tab"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <PasswordGeneratorModal onCopy={handleCopyToClipboard} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-[10px] font-black uppercase tracking-widest text-white/30">
        <p>hVault &copy; 2026 &bull; Zero-Knowledge Encrypted Password Vault</p>
      </footer>

      {/* Mobile Floating Action Dock (Optimized for one-handed mobile use, sm:hidden) */}
      <div className="sm:hidden fixed bottom-3 inset-x-3 z-40">
        <div className="bg-[#0D1425]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between gap-1">
          {/* Add Password / Card */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setEditingEntry(null);
              setIsAddEditOpen(true);
            }}
            className="flex-1 py-2 px-1.5 bg-sky-600 hover:bg-sky-500 active:scale-90 active:brightness-125 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-sky-900/30 transition-all cursor-pointer min-h-[44px] select-none touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Add</span>
          </button>

          {/* Website AutoFill */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setIsAutofillModalOpen(true);
            }}
            className="flex-1 py-2 px-1.5 bg-sky-500/10 hover:bg-sky-500/20 active:scale-90 active:brightness-125 text-sky-300 border border-sky-400/30 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px] select-none touch-manipulation"
          >
            <Zap className="w-3 h-3 shrink-0 text-sky-400" />
            <span>AutoFill</span>
          </button>

          {/* Quick Lock/Unlock */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              if (isUnlocked) {
                handleLockVault();
              } else {
                setIsPassphraseModalOpen(true);
              }
            }}
            className={`flex-1 py-2 px-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border active:scale-90 active:brightness-125 transition-all cursor-pointer min-h-[44px] select-none touch-manipulation ${
              isUnlocked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title={isUnlocked ? "Lock vault now" : "Unlock vault"}
          >
            <Lock className="w-3 h-3 shrink-0" />
            <span>{isUnlocked ? 'Lock' : 'Unlock'}</span>
          </button>

          {/* Mobile Direct Sign Out */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('warning');
              handleSignOut();
            }}
            className="py-2 px-2.5 bg-red-500/15 hover:bg-red-500/25 active:scale-90 active:brightness-125 text-red-300 border border-red-500/35 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px] select-none touch-manipulation"
            title="Sign Out of hVault"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
