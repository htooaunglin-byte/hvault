import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Lock, 
  User, 
  Globe, 
  ShieldAlert,
  ArrowRight,
  Star,
  Shield,
  KeyRound,
  Grid,
  Palette,
  Hash,
  Plus,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Layers,
  Settings,
  Zap,
  CreditCard,
  Key
} from 'lucide-react';
import { CategoryType, DecryptedPasswordEntry, DEFAULT_CATEGORIES, CategoryFlowType, CATEGORY_FLOW_OPTIONS } from '../types';
import { evaluatePasswordStrength, generateSecurePassword } from '../lib/crypto';
import { getCategoryVisual, getCategoryFlow, getCategoryIconComponent, getFlowIconComponent } from '../lib/categoryUtils';
import { resolveServiceAutoFill } from '../lib/autofillUtils';
import { AtmCardModalSection, AtmCardFormValues } from './AtmCardModalSection';
import { OAuthModalSection, OAuthFormValues } from './OAuthModalSection';
import { ApiKeyModalSection, ApiKeyFormValues } from './ApiKeyModalSection';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
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
  }) => Promise<void>;
  initialData?: DecryptedPasswordEntry | null;
  masterPassphrase: string;
  defaultCategory?: CategoryType;
  categories?: string[];
  categoryFlows?: Record<string, CategoryFlowType>;
  onAddCategory?: (name: string, flow?: CategoryFlowType) => Promise<void>;
  onOpenManageCategories?: () => void;
}

const SAFE_SIZES = [
  { id: 'Small', label: 'Small Safe', icon: '🔒', desc: 'Compact Box' },
  { id: 'Medium', label: 'Medium Safe', icon: '🛡️', desc: 'Standard Size' },
  { id: 'Large', label: 'Large Safe', icon: '🏰', desc: 'Heavy Duty / Tall' },
  { id: 'Extra Large', label: 'Extra Large', icon: '🏢', desc: 'Vault / Standing' },
];

const SAFE_COLORS = [
  { id: 'Matte Black', label: 'Matte Black', hex: '#1c1e24', dotClass: 'bg-slate-900 border-slate-600' },
  { id: 'Gunmetal Steel', label: 'Gunmetal Steel', hex: '#475569', dotClass: 'bg-slate-600 border-slate-400' },
  { id: 'Crimson Red', label: 'Crimson Red', hex: '#991b1b', dotClass: 'bg-red-800 border-red-500' },
  { id: 'Navy Blue', label: 'Navy Blue', hex: '#1e3a8a', dotClass: 'bg-blue-900 border-blue-500' },
  { id: 'Brass Gold', label: 'Brass Gold', hex: '#b45309', dotClass: 'bg-amber-600 border-amber-400' },
  { id: 'Alpine Silver', label: 'Alpine Silver', hex: '#94a3b8', dotClass: 'bg-slate-300 border-white' },
  { id: 'Emerald Green', label: 'Emerald Green', hex: '#059669', dotClass: 'bg-emerald-700 border-emerald-400' },
  { id: 'Rose Gold', label: 'Rose Gold', hex: '#be185d', dotClass: 'bg-rose-600 border-rose-300' },
  { id: 'Midnight Purple', label: 'Midnight Purple', hex: '#6b21a8', dotClass: 'bg-purple-900 border-purple-400' },
  { id: 'Copper Bronze', label: 'Copper Bronze', hex: '#9a3412', dotClass: 'bg-orange-900 border-orange-500' },
  { id: 'Charcoal Grey', label: 'Charcoal Grey', hex: '#334155', dotClass: 'bg-slate-800 border-slate-500' },
  { id: 'Arctic White', label: 'Arctic White', hex: '#f8fafc', dotClass: 'bg-slate-100 border-slate-300' },
];

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  masterPassphrase,
  defaultCategory = 'General',
  categories = DEFAULT_CATEGORIES,
  categoryFlows,
  onAddCategory,
  onOpenManageCategories,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<CategoryType>('General');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [autofillEnabled, setAutofillEnabled] = useState(true);
  const [safeSize, setSafeSize] = useState('Standard');
  const [safeColor, setSafeColor] = useState('Matte Black');
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#10b981');

  // ATM Card Specific States
  const [bankName, setBankName] = useState('');
  const [cardProvider, setCardProvider] = useState('Visa');
  const [cardType, setCardType] = useState('Debit Card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardColor, setCardColor] = useState('Obsidian Black');
  const [showPin, setShowPin] = useState(false);

  // OAuth Specific States
  const [clientId, setClientId] = useState('');
  const [oauthRedirectUri, setOauthRedirectUri] = useState('');
  const [oauthScopes, setOauthScopes] = useState('');
  const [oauthGrantType, setOauthGrantType] = useState('Authorization Code (PKCE)');
  const [oauthClientType, setOauthClientType] = useState('Confidential');
  const [oauthAuthUrl, setOauthAuthUrl] = useState('');
  const [oauthTokenUrl, setOauthTokenUrl] = useState('');
  const [oauthProvider, setOauthProvider] = useState('');
  const [showOAuthSecret, setShowOAuthSecret] = useState(false);

  // API Key Specific States
  const [keyName, setKeyName] = useState('');
  const [keyEnvironment, setKeyEnvironment] = useState('Production');
  const [keyHeaderPrefix, setKeyHeaderPrefix] = useState('Bearer');
  const [showApiKeySecret, setShowApiKeySecret] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inline Add Category state
  const [showInlineAddCategory, setShowInlineAddCategory] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');
  const [inlineCategoryFlow, setInlineCategoryFlow] = useState<CategoryFlowType>('password');
  const [inlineCategoryError, setInlineCategoryError] = useState('');
  const [inlineAdding, setInlineAdding] = useState(false);

  // Custom Generator Options state
  const [genLength, setGenLength] = useState(18);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [showGeneratorOptions, setShowGeneratorOptions] = useState(false);

  // Overwrite Confirmation state
  const [pendingNewPassword, setPendingNewPassword] = useState<string | null>(null);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);

  // Ensure active category is included even if not in standard list
  const displayCategories = Array.from(new Set([...categories, ...(category ? [category] : [])]));

  useEffect(() => {
    setShowConfirmOverwrite(false);
    setPendingNewPassword(null);
    setShowGeneratorOptions(false);
    setShowInlineAddCategory(false);
    setInlineCategoryName('');
    setInlineCategoryError('');

    if (initialData) {
      setServiceName(initialData.serviceName || '');
      setUsername(initialData.username || '');
      setPassword(initialData.decryptedPassword || '');
      setCategory(initialData.category || 'General');
      setWebsiteUrl(initialData.websiteUrl || '');
      setNotes(initialData.notes || '');
      setIsFavorite(Boolean(initialData.isFavorite));
      setAutofillEnabled(initialData.autofillEnabled !== undefined ? Boolean(initialData.autofillEnabled) : true);
      setSafeSize(initialData.safeSize || 'Medium');
      
      // ATM Card fields
      setBankName(initialData.bankName || initialData.serviceName || '');
      setCardProvider(initialData.cardProvider || 'Visa');
      setCardType(initialData.cardType || 'Debit Card');
      setCardHolder(initialData.cardHolder || initialData.username || '');
      setCardNumber(initialData.cardNumber || '');
      setCardExpiry(initialData.cardExpiry || '');
      setCardCvv(initialData.cardCvv || '');
      setCardColor(initialData.cardColor || 'Obsidian Black');

      // OAuth fields
      setClientId(initialData.clientId || initialData.username || '');
      setOauthRedirectUri(initialData.oauthRedirectUri || '');
      setOauthScopes(initialData.oauthScopes || '');
      setOauthGrantType(initialData.oauthGrantType || 'Authorization Code (PKCE)');
      setOauthClientType(initialData.oauthClientType || 'Confidential');
      setOauthAuthUrl(initialData.oauthAuthUrl || '');
      setOauthTokenUrl(initialData.oauthTokenUrl || '');
      setOauthProvider(initialData.oauthProvider || '');

      // API Key fields
      setKeyName(initialData.keyName || initialData.username || '');
      setKeyEnvironment(initialData.keyEnvironment || 'Production');
      setKeyHeaderPrefix(initialData.keyHeaderPrefix || 'Bearer');
      setShowApiKeySecret(false);

      const existingColor = initialData.safeColor || 'Matte Black';
      const matchedPreset = SAFE_COLORS.find(c => c.id === existingColor);
      if (matchedPreset) {
        setSafeColor(existingColor);
        setIsCustomColor(false);
        setCustomColorInput('');
      } else {
        setSafeColor(existingColor);
        setIsCustomColor(true);
        setCustomColorInput(existingColor);
      }
    } else {
      setServiceName('');
      setUsername('');
      setPassword('');
      setCategory(defaultCategory || 'General');
      setWebsiteUrl('');
      setNotes('');
      setIsFavorite(false);
      setAutofillEnabled(true);
      setSafeSize('Medium');
      setSafeColor('Matte Black');
      setIsCustomColor(false);
      setCustomColorInput('');

      // Card defaults
      setBankName('');
      setCardProvider('Visa');
      setCardType('Debit Card');
      setCardHolder('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardColor('Obsidian Black');

      // OAuth defaults
      setClientId('');
      setOauthRedirectUri('');
      setOauthScopes('');
      setOauthGrantType('Authorization Code (PKCE)');
      setOauthClientType('Confidential');
      setOauthAuthUrl('');
      setOauthTokenUrl('');
      setOauthProvider('');
      setShowOAuthSecret(false);

      // API Key defaults
      setKeyName('');
      setKeyEnvironment('Production');
      setKeyHeaderPrefix('Bearer');
      setShowApiKeySecret(false);
    }
    setError('');
  }, [initialData, isOpen, defaultCategory]);

  const currentFlow = getCategoryFlow(category, categoryFlows);
  const isSafeCategory = currentFlow === 'safes' || category === 'Safes';
  const isAtmCardCategory = currentFlow === 'atm_card' || category === 'ATM Cards';
  const isOAuthCategory = currentFlow === 'oauth' || category === 'OAuth';
  const isApiKeyCategory = currentFlow === 'api_key' || category === 'API Keys';

  const handleInlineAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inlineCategoryName.trim();
    if (!trimmed) {
      setInlineCategoryError('Category name cannot be empty.');
      return;
    }
    if (trimmed.length > 30) {
      setInlineCategoryError('Category name must be 30 chars or less.');
      return;
    }
    if (displayCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      const existing = displayCategories.find(c => c.toLowerCase() === trimmed.toLowerCase())!;
      setCategory(existing);
      setShowInlineAddCategory(false);
      setInlineCategoryName('');
      setInlineCategoryError('');
      return;
    }

    try {
      setInlineAdding(true);
      if (onAddCategory) {
        await onAddCategory(trimmed, inlineCategoryFlow);
      }
      setCategory(trimmed);
      setShowInlineAddCategory(false);
      setInlineCategoryName('');
      setInlineCategoryError('');
    } catch (err: any) {
      setInlineCategoryError(err.message || 'Failed to add category');
    } finally {
      setInlineAdding(false);
    }
  };

  const createGeneratedPassword = (overridePinLength?: number) => {
    if (isSafeCategory || isAtmCardCategory) {
      const len = overridePinLength || (isAtmCardCategory ? 4 : 6);
      return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    }
    return generateSecurePassword(genLength, {
      uppercase: genUppercase,
      lowercase: genLowercase,
      numbers: genNumbers,
      symbols: genSymbols,
    });
  };

  const triggerPasswordGeneration = (overridePinLength?: number) => {
    const newPass = createGeneratedPassword(overridePinLength);
    if (password && password.trim().length > 0) {
      setPendingNewPassword(newPass);
      setShowConfirmOverwrite(true);
    } else {
      setPassword(newPass);
      setShowPassword(true);
      setShowPin(true);
    }
  };

  const handleGeneratePassword = () => {
    triggerPasswordGeneration();
  };

  const handleGenerateNumericPin = (length: number) => {
    triggerPasswordGeneration(length);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isSafeCategory || isAtmCardCategory) {
      const numericVal = val.replace(/[^0-9]/g, '');
      setPassword(numericVal);
    } else {
      setPassword(val);
    }
  };

  const handleAtmCardFormChange = (updated: Partial<AtmCardFormValues>) => {
    if (updated.bankName !== undefined) setBankName(updated.bankName);
    if (updated.cardProvider !== undefined) setCardProvider(updated.cardProvider);
    if (updated.cardType !== undefined) setCardType(updated.cardType);
    if (updated.cardHolder !== undefined) setCardHolder(updated.cardHolder);
    if (updated.cardNumber !== undefined) setCardNumber(updated.cardNumber);
    if (updated.cardExpiry !== undefined) setCardExpiry(updated.cardExpiry);
    if (updated.cardCvv !== undefined) setCardCvv(updated.cardCvv);
    if (updated.cardColor !== undefined) setCardColor(updated.cardColor);
    if (updated.atmPin !== undefined) setPassword(updated.atmPin);
  };

  const handleOAuthFormChange = (updated: Partial<OAuthFormValues>) => {
    if (updated.serviceName !== undefined) setServiceName(updated.serviceName);
    if (updated.clientId !== undefined) setClientId(updated.clientId);
    if (updated.clientSecret !== undefined) setPassword(updated.clientSecret);
    if (updated.oauthRedirectUri !== undefined) setOauthRedirectUri(updated.oauthRedirectUri);
    if (updated.oauthScopes !== undefined) setOauthScopes(updated.oauthScopes);
    if (updated.oauthGrantType !== undefined) setOauthGrantType(updated.oauthGrantType);
    if (updated.oauthClientType !== undefined) setOauthClientType(updated.oauthClientType);
    if (updated.oauthAuthUrl !== undefined) setOauthAuthUrl(updated.oauthAuthUrl);
    if (updated.oauthTokenUrl !== undefined) setOauthTokenUrl(updated.oauthTokenUrl);
    if (updated.websiteUrl !== undefined) setWebsiteUrl(updated.websiteUrl);
    if (updated.oauthProvider !== undefined) setOauthProvider(updated.oauthProvider);
  };

  const handleGenerateOAuthSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const hexSecret = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    setPassword(hexSecret);
    setShowOAuthSecret(true);
  };

  const handleApiKeyFormChange = (updated: Partial<ApiKeyFormValues>) => {
    if (updated.serviceName !== undefined) setServiceName(updated.serviceName);
    if (updated.keyName !== undefined) setKeyName(updated.keyName);
    if (updated.apiKeySecret !== undefined) setPassword(updated.apiKeySecret);
    if (updated.keyEnvironment !== undefined) setKeyEnvironment(updated.keyEnvironment);
    if (updated.keyHeaderPrefix !== undefined) setKeyHeaderPrefix(updated.keyHeaderPrefix);
    if (updated.websiteUrl !== undefined) setWebsiteUrl(updated.websiteUrl);
    if (updated.notes !== undefined) setNotes(updated.notes);
  };

  const handleGenerateApiKeySecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const hexKey = `key_${Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')}`;
    setPassword(hexKey);
    setShowApiKeySecret(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isApiKeyCategory) {
      if (!serviceName.trim()) {
        setError('Service Name (e.g. OpenAI, Google Gemini, Anthropic) is required.');
        return;
      }
      if (!keyName.trim()) {
        setError('Key Name / Description (e.g. Production Backend Key) is required.');
        return;
      }
      if (!password.trim()) {
        setError('API Key secret is required.');
        return;
      }
    } else if (isAtmCardCategory) {
      if (!bankName.trim()) {
        setError('Bank or Financial Provider name is required for ATM Cards.');
        return;
      }
      if (!password.trim()) {
        setError('ATM PIN is required.');
        return;
      }
      if (!/^[0-9]+$/.test(password.trim())) {
        setError('ATM PIN must contain numbers only (digits 0-9).');
        return;
      }
    } else if (isOAuthCategory) {
      if (!serviceName.trim()) {
        setError('OAuth Application or Service Name is required.');
        return;
      }
      if (!clientId.trim()) {
        setError('Client ID is required for OAuth applications.');
        return;
      }
      if (!password.trim()) {
        setError('Client Secret is required.');
        return;
      }
    } else if (isSafeCategory) {
      if (!serviceName.trim() || !password) {
        setError('Safe Name/Label and Numeric Combination PIN are required.');
        return;
      }
      if (!/^[0-9]+$/.test(password)) {
        setError('Safe combination must contain NUMBERS ONLY (digits 0-9).');
        return;
      }
    } else {
      if (!serviceName.trim() || !username.trim() || !password) {
        setError('Service Name, Username, and Password are required.');
        return;
      }
    }

    if (!masterPassphrase) {
      setError('Vault is locked. Please unlock with your Master Passphrase first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalServiceName = isAtmCardCategory
        ? (bankName.trim() ? (cardType ? `${bankName.trim()} ${cardType}` : bankName.trim()) : serviceName.trim() || 'ATM Card')
        : serviceName;

      const finalUsername = isApiKeyCategory
        ? (keyName.trim() || 'API Key')
        : isAtmCardCategory
        ? (cardHolder.trim() || (cardNumber ? `•••• ${cardNumber.slice(-4)}` : 'Cardholder'))
        : isSafeCategory
        ? (username.trim() || 'Safe Box')
        : isOAuthCategory
        ? (clientId.trim())
        : username;

      await onSave({
        id: initialData?.id,
        serviceName: finalServiceName,
        username: finalUsername,
        password,
        category,
        websiteUrl: isSafeCategory || isAtmCardCategory ? undefined : websiteUrl,
        notes,
        isFavorite,
        autofillEnabled: isSafeCategory || isAtmCardCategory ? false : autofillEnabled,
        safeSize: isSafeCategory ? safeSize : undefined,
        safeColor: isSafeCategory ? safeColor : undefined,
        bankName: isAtmCardCategory ? bankName.trim() : undefined,
        cardProvider: isAtmCardCategory ? cardProvider : undefined,
        cardType: isAtmCardCategory ? cardType : undefined,
        cardHolder: isAtmCardCategory ? cardHolder.trim() : undefined,
        cardNumber: isAtmCardCategory ? cardNumber.trim() : undefined,
        cardExpiry: isAtmCardCategory ? cardExpiry.trim() : undefined,
        cardCvv: isAtmCardCategory ? cardCvv.trim() : undefined,
        cardColor: isAtmCardCategory ? cardColor : undefined,
        clientId: isOAuthCategory ? clientId.trim() : undefined,
        oauthRedirectUri: isOAuthCategory ? oauthRedirectUri.trim() : undefined,
        oauthScopes: isOAuthCategory ? oauthScopes.trim() : undefined,
        oauthGrantType: isOAuthCategory ? oauthGrantType : undefined,
        oauthClientType: isOAuthCategory ? oauthClientType : undefined,
        oauthAuthUrl: isOAuthCategory ? oauthAuthUrl.trim() : undefined,
        oauthTokenUrl: isOAuthCategory ? oauthTokenUrl.trim() : undefined,
        oauthProvider: isOAuthCategory ? oauthProvider : undefined,
        keyName: isApiKeyCategory ? keyName.trim() : undefined,
        keyEnvironment: isApiKeyCategory ? keyEnvironment : undefined,
        keyHeaderPrefix: isApiKeyCategory ? keyHeaderPrefix : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const strength = evaluatePasswordStrength(password);
  const autoFillInfo = resolveServiceAutoFill(serviceName, websiteUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="password-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/85 backdrop-blur-md"
        >
          <motion.div
            key="password-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-lg bg-[#0D1425] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
          >
            
            {/* Overwrite Existing Password Confirmation Overlay */}
            <AnimatePresence>
              {showConfirmOverwrite && (
                <motion.div
                  key="confirm-overwrite-overlay"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 z-50 bg-[#0A0F1D]/95 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <div className="w-full max-w-md bg-[#0D1425] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3 text-amber-400">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white">Overwrite Password?</h3>
                        <p className="text-xs text-white/60 font-medium">An existing password or PIN is currently set.</p>
                      </div>
                    </div>

                    <div className="bg-[#0A0F1D] border border-white/10 rounded-xl p-3.5 space-y-2">
                      <p className="text-xs text-white/80 font-medium">
                        Are you sure you want to replace your current code with a newly generated secure code?
                      </p>
                      {pendingNewPassword && (
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                          <span className="text-white/40 font-sans text-[10px] uppercase font-bold">NEW:</span>
                          <span className="text-emerald-400 font-bold truncate max-w-[200px]">{pendingNewPassword}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowConfirmOverwrite(false);
                          setPendingNewPassword(null);
                        }}
                        className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-colors cursor-pointer"
                      >
                        Keep Current
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (pendingNewPassword) {
                            setPassword(pendingNewPassword);
                            setShowPassword(true);
                            setShowPin(true);
                          }
                          setShowConfirmOverwrite(false);
                          setPendingNewPassword(null);
                        }}
                        className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                      >
                        Replace Code
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isApiKeyCategory
                ? 'bg-amber-500/10 border-amber-400/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : isOAuthCategory
                ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : isAtmCardCategory
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isSafeCategory
                ? 'bg-amber-500/10 border-amber-400/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'bg-sky-500/10 border-sky-400/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
            }`}>
              {isApiKeyCategory ? <Key className="w-5 h-5" /> : isOAuthCategory ? <KeyRound className="w-5 h-5" /> : isAtmCardCategory ? <CreditCard className="w-5 h-5" /> : isSafeCategory ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>{initialData ? 'EDIT ENTRY' : 'NEW ENTRY'}</span>
                {isApiKeyCategory && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded uppercase font-black tracking-widest">
                    API KEY
                  </span>
                )}
                {isOAuthCategory && (
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded uppercase font-black tracking-widest">
                    OAUTH APP
                  </span>
                )}
                {isAtmCardCategory && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded uppercase font-black tracking-widest">
                    ATM CARD
                  </span>
                )}
                {isSafeCategory && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded uppercase font-black tracking-widest">
                    SAFE MODE
                  </span>
                )}
              </h2>
              <p className="text-[10px] font-bold text-white/40">
                {isApiKeyCategory ? 'Service Name, Key Name & Encrypted API Token' : isOAuthCategory ? 'Client ID, Secret & Developer Auth Endpoints' : isAtmCardCategory ? 'Bank details, PIN & luxury card finish' : isSafeCategory ? 'Configure physical safe combination & attributes' : 'Encrypted credential record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Item Mode Switcher */}
        <div className="px-6 pt-3 pb-1 bg-[#090E1A] border-b border-white/5 grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setCategory('General');
            }}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              !isSafeCategory && !isAtmCardCategory && !isOAuthCategory && !isApiKeyCategory
                ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3 shrink-0" />
            <span className="truncate">Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory('API Keys');
            }}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              isApiKeyCategory
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <Key className="w-3 h-3 shrink-0" />
            <span className="truncate">API Key</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory('OAuth');
            }}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              isOAuthCategory
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3 shrink-0" />
            <span className="truncate">OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory('ATM Cards');
            }}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              isAtmCardCategory
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <CreditCard className="w-3 h-3 shrink-0" />
            <span className="truncate">ATM Card</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory('Safes');
              if (password && !/^[0-9]+$/.test(password)) {
                setPassword(password.replace(/[^0-9]/g, ''));
              }
            }}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              isSafeCategory
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3 shrink-0" />
            <span className="truncate">Safe Box</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* API Key Flow View */}
          {isApiKeyCategory ? (
            <ApiKeyModalSection
              values={{
                serviceName,
                keyName,
                apiKeySecret: password,
                keyEnvironment,
                keyHeaderPrefix,
                websiteUrl,
                notes,
              }}
              onChange={handleApiKeyFormChange}
              showSecret={showApiKeySecret}
              onToggleShowSecret={() => setShowApiKeySecret(!showApiKeySecret)}
              onGenerateSecret={handleGenerateApiKeySecret}
            />
          ) : isOAuthCategory ? (
            <OAuthModalSection
              values={{
                serviceName,
                clientId,
                clientSecret: password,
                oauthRedirectUri,
                oauthScopes,
                oauthGrantType,
                oauthClientType,
                oauthAuthUrl,
                oauthTokenUrl,
                websiteUrl,
                oauthProvider,
              }}
              onChange={handleOAuthFormChange}
              showSecret={showOAuthSecret}
              onToggleShowSecret={() => setShowOAuthSecret(!showOAuthSecret)}
              onGenerateSecret={handleGenerateOAuthSecret}
            />
          ) : isAtmCardCategory ? (
            <AtmCardModalSection
              values={{
                bankName,
                cardProvider,
                cardType,
                cardHolder,
                cardNumber,
                cardExpiry,
                cardCvv,
                cardColor,
                atmPin: password,
              }}
              onChange={handleAtmCardFormChange}
              showPin={showPin}
              onToggleShowPin={() => setShowPin(!showPin)}
              onGeneratePin={(digits) => triggerPasswordGeneration(digits)}
            />
          ) : (
            <>
              {/* Category Selector for standard / safes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/60">
                    Category
                  </label>
                  {onOpenManageCategories && (
                    <button
                      type="button"
                      onClick={onOpenManageCategories}
                      className="text-[10px] font-black text-sky-400 hover:text-sky-300 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Organize Categories</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {displayCategories.map((cat) => {
                    const catFlow = getCategoryFlow(cat, categoryFlows);
                    const visual = getCategoryVisual(cat, categoryFlows);
                    const IconComp = getCategoryIconComponent(cat, categoryFlows);
                    const isSelected = category === cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          if (catFlow === 'safes' && password && !/^[0-9]+$/.test(password)) {
                            setPassword(password.replace(/[^0-9]/g, ''));
                          }
                        }}
                        className={`py-2 px-2 text-[10px] rounded-xl font-black uppercase tracking-wider border text-center transition-all cursor-pointer truncate flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? visual.activeClass
                            : 'bg-[#0A0F1D] text-white/50 border-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}

                  {/* Add New Category Button */}
                  <button
                    type="button"
                    onClick={() => setShowInlineAddCategory(!showInlineAddCategory)}
                    className={`py-2 px-2 text-[10px] rounded-xl font-black uppercase tracking-wider border text-center transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                      showInlineAddCategory
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                        : 'bg-[#0A0F1D] text-sky-400/80 border-dashed border-sky-500/30 hover:border-sky-400 hover:text-sky-300'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Custom</span>
                  </button>
                </div>

                {/* Inline Add Category Form */}
                <AnimatePresence>
                  {showInlineAddCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 p-3.5 bg-[#0A0F1D] border border-sky-500/30 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-sky-400">
                          Create New Category
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowInlineAddCategory(false)}
                          className="p-1 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inlineCategoryName}
                          onChange={(e) => {
                            setInlineCategoryName(e.target.value);
                            if (inlineCategoryError) setInlineCategoryError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInlineAddCategory();
                            }
                          }}
                          placeholder="e.g. Stripe Keys, GitHub Apps, Crypto Vault..."
                          maxLength={30}
                          className="flex-1 bg-[#0D1425] border border-sky-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400 font-bold"
                        />
                        <button
                          type="button"
                          disabled={!inlineCategoryName.trim() || inlineAdding}
                          onClick={() => handleInlineAddCategory()}
                          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          {inlineAdding ? 'Adding...' : 'Create'}
                        </button>
                      </div>

                      {/* Creation Flow Selection */}
                      <div className="space-y-1.5 pt-1 border-t border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                          Creation Flow (Choose field template):
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {CATEGORY_FLOW_OPTIONS.map((flowOpt) => {
                            const isSelected = inlineCategoryFlow === flowOpt.id;
                            const IconComp = getFlowIconComponent(flowOpt.id);
                            return (
                              <button
                                key={flowOpt.id}
                                type="button"
                                onClick={() => setInlineCategoryFlow(flowOpt.id)}
                                className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm'
                                    : 'bg-[#0D1425] border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                                }`}
                              >
                                <IconComp className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold leading-tight truncate">{flowOpt.label}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {inlineCategoryError && (
                        <p className="text-[10px] text-rose-400 font-bold">{inlineCategoryError}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Service / Safe Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
                  {isSafeCategory ? 'Safe Name / Label' : 'Service Name'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder={isSafeCategory ? "e.g. Master Closet Safe, Gun Vault, Office Wall Safe" : "e.g. Netflix, Gmail, GitHub, Spotify"}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50"
                />
              </div>

              {/* Username / Email */}
              {!isSafeCategory && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
                    Username / Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="user@example.com or @username"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                </div>
              )}

              {/* Safe Special Configuration */}
              {isSafeCategory && (
                <div className="p-4 bg-[#0A0F1D] border border-amber-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-amber-400" />
                      <span>Safe Specifications</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest">
                      Custom Attributes
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">
                      Safe Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SAFE_SIZES.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSafeSize(size.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            safeSize === size.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
                              : 'bg-[#0D1425] border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          <span className="text-base">{size.icon}</span>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">{size.label}</p>
                            <p className="text-[9px] opacity-60 font-medium">{size.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-amber-400" />
                        <span>Safe Color</span>
                      </span>
                      <span className="text-amber-300 font-black text-xs uppercase tracking-wider">{safeColor}</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {SAFE_COLORS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            setSafeColor(col.id);
                            setIsCustomColor(false);
                          }}
                          className={`py-2 px-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            !isCustomColor && safeColor === col.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
                              : 'bg-[#0D1425] border-white/10 text-white/50 hover:border-white/20'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border ${col.dotClass} shrink-0`} />
                          <span className="text-[10px] font-black uppercase tracking-wider truncate">{col.label}</span>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomColor(true);
                          const initialName = customColorInput || 'Custom Color';
                          setCustomColorInput(initialName);
                          setSafeColor(initialName);
                        }}
                        className={`py-2 px-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isCustomColor
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
                            : 'bg-[#0D1425] border-dashed border-amber-500/40 text-amber-400 hover:border-amber-400'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider truncate">+ Custom</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Password / Combination Field for standard and safes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                    <span>{isSafeCategory ? 'Safe Combination / PIN' : 'Password'}</span>
                    <span className="text-red-400">*</span>
                    {isSafeCategory && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] rounded font-black uppercase tracking-widest border border-amber-500/30">
                        NUMBERS ONLY
                      </span>
                    )}
                  </label>

                  {isSafeCategory ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-white/40 uppercase font-bold hidden sm:inline">PIN:</span>
                      {[4, 6, 8].map((len) => (
                        <button
                          key={len}
                          type="button"
                          tabIndex={-1}
                          onClick={() => handleGenerateNumericPin(len)}
                          className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] font-black tracking-wider transition-colors cursor-pointer"
                        >
                          +{len} DIGITS
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={handleGeneratePassword}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>GENERATE SECURE</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  {isSafeCategory ? (
                    <Hash className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                  )}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode={isSafeCategory ? 'numeric' : 'text'}
                    pattern={isSafeCategory ? '[0-9]*' : undefined}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder={isSafeCategory ? "Enter numeric combination (digits 0-9)" : "Password"}
                    className={`w-full bg-[#0A0F1D] border rounded-xl pl-10 pr-10 py-3 text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none ${
                      isSafeCategory 
                        ? 'border-amber-500/30 focus:border-amber-400/80 tracking-widest text-amber-300 text-sm' 
                        : 'border-white/10 focus:border-sky-400/50'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
                    title={showPassword ? "Hide Combination" : "Reveal Combination"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter for standard passwords */}
                {!isSafeCategory && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Strength:</span>
                      <span className={strength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0F1D] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Generator Customization Panel */}
                {!isSafeCategory && (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowGeneratorOptions(!showGeneratorOptions)}
                      className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-[#0A0F1D] hover:bg-white/5 rounded-xl border border-white/10 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-sky-500/10 border border-sky-400/30 rounded-lg text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                              Generator Rules
                            </span>
                            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-400/20">
                              {genLength} CHARS
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-white/40 block">
                            {[
                              genUppercase && 'A-Z',
                              genLowercase && 'a-z',
                              genNumbers && '0-9',
                              genSymbols && '!@#$',
                            ].filter(Boolean).join(' • ') || 'None selected'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-400/20 shrink-0">
                        {showGeneratorOptions ? 'HIDE' : 'CUSTOMIZE'}
                      </span>
                    </button>

                    {showGeneratorOptions && (
                      <div className="p-3.5 bg-[#0A0F1D] border border-white/10 rounded-xl space-y-4 animate-in fade-in duration-150">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/70">
                            <span>Password Length: <span className="text-sky-400 font-mono text-xs">{genLength}</span> chars</span>
                            <span className="text-white/40 text-[9px]">Min 8 • Max 48</span>
                          </div>

                          <input
                            type="range"
                            min={8}
                            max={48}
                            value={genLength}
                            onChange={(e) => setGenLength(parseInt(e.target.value))}
                            className="w-full accent-sky-400 bg-[#0D1425] rounded-lg cursor-pointer h-2"
                          />

                          <div className="flex items-center justify-between gap-1.5 pt-1">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest shrink-0">Presets:</span>
                            <div className="flex items-center gap-1.5">
                              {[12, 16, 24, 32].map((len) => (
                                <button
                                  key={len}
                                  type="button"
                                  onClick={() => setGenLength(len)}
                                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                                    genLength === len
                                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                      : 'bg-[#0D1425] border-white/10 text-white/50 hover:text-white'
                                  }`}
                                >
                                  {len}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                            genUppercase 
                              ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                              : 'bg-[#0D1425] border-white/10 text-white/40 hover:border-white/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={genUppercase}
                              onChange={(e) => setGenUppercase(e.target.checked)}
                              className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="font-black text-xs leading-none">A-Z</p>
                              <p className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-0.5">Uppercase</p>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                            genLowercase 
                              ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                              : 'bg-[#0D1425] border-white/10 text-white/40 hover:border-white/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={genLowercase}
                              onChange={(e) => setGenLowercase(e.target.checked)}
                              className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="font-black text-xs leading-none">a-z</p>
                              <p className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-0.5">Lowercase</p>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                            genNumbers 
                              ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                              : 'bg-[#0D1425] border-white/10 text-white/40 hover:border-white/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={genNumbers}
                              onChange={(e) => setGenNumbers(e.target.checked)}
                              className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="font-black text-xs leading-none">0-9</p>
                              <p className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-0.5">Numbers</p>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                            genSymbols 
                              ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                              : 'bg-[#0D1425] border-white/10 text-white/40 hover:border-white/20'
                          }`}>
                            <input
                              type="checkbox"
                              checked={genSymbols}
                              onChange={(e) => setGenSymbols(e.target.checked)}
                              className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <p className="font-black text-xs leading-none">!@#$</p>
                              <p className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-0.5">Symbols</p>
                            </div>
                          </label>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>GENERATE WITH THESE RULES</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Website URL */}
              {!isSafeCategory && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
                    Website URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://netflix.com or accounts.google.com"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50"
                    />
                  </div>
                </div>
              )}

              {/* AutoFill Settings for Web Accounts */}
              {!isSafeCategory && (
                <div className="p-3.5 bg-[#0A0F1D] border border-sky-500/20 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                        <Zap className="w-4 h-4 fill-sky-400/30 text-sky-300" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-white">1-Click AutoFill & Launch</p>
                        <p className="text-[10px] text-white/50">Allow 1-click credential fill and auto-open</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutofillEnabled(!autofillEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                        autofillEnabled
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20'
                          : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                      }`}
                    >
                      {autofillEnabled ? '⚡ ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  {autoFillInfo.isKnownService ? (
                    <div className="bg-sky-500/10 border border-sky-500/25 rounded-lg px-3 py-2 text-[11px] text-sky-300 flex items-center justify-between gap-2">
                      <span className="font-bold truncate">Detected Preset: {autoFillInfo.displayName}</span>
                      <span className="text-[9px] font-mono text-white/50 truncate max-w-[200px]">{autoFillInfo.targetUrl}</span>
                    </div>
                  ) : autoFillInfo.targetUrl ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white/70 flex items-center justify-between gap-2">
                      <span className="font-bold truncate">Custom Site: {autoFillInfo.displayName}</span>
                      <span className="text-[9px] font-mono text-sky-400/80 truncate max-w-[200px]">{autoFillInfo.targetUrl}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
              {isAtmCardCategory ? 'Notes / Daily Withdrawal Limit (Optional)' : isSafeCategory ? 'Notes / Key Instructions (Optional)' : 'Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAtmCardCategory ? "e.g. Daily limit $1,000, linked checking #9201, branch Downtown" : isSafeCategory ? "e.g. Turn key left twice before entering dial PIN, emergency key in study desk" : "e.g. Pin code 4321, Security Q: Childhood dog name"}
              className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50"
            />
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#0A0F1D] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">Favorite Item</p>
                <p className="text-[10px] text-white/40 font-medium">Pin this card or credential to the top of your vault</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              }`}
            >
              {isFavorite ? '★ FAVORITED' : '☆ FAVORITE'}
            </button>
          </div>

          {/* Encryption Footer Note */}
          <div className="p-3 bg-[#0A0F1D] border border-white/10 rounded-xl text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" /> Securely Encrypted
            </span>
            <span className="text-white/40 font-medium text-[10px]">
              {initialData?.createdAt && !isNaN(new Date(initialData.createdAt).getTime()) ? (
                `Created ${new Date(initialData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              ) : (
                'Auto Date Timestamped'
              )}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`py-3 px-5 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isAtmCardCategory
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : isSafeCategory
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/30'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{initialData ? 'SAVE CHANGES' : isAtmCardCategory ? 'ENCRYPT & SAVE ATM CARD' : isSafeCategory ? 'ENCRYPT & SAVE SAFE' : 'ENCRYPT & SAVE'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

