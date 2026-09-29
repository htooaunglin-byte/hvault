import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  Hash, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Palette, 
  Plus, 
  Check, 
  Copy, 
  Wifi, 
  User, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';
import { POPULAR_BANKS, CARD_NETWORKS, CARD_COLORS, CardColorOption, getCardColorStyle } from '../lib/categoryUtils';

export interface AtmCardFormValues {
  bankName: string;
  cardProvider: string;
  cardType: string;
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardColor: string;
  atmPin: string;
}

interface AtmCardModalSectionProps {
  values: AtmCardFormValues;
  onChange: (updated: Partial<AtmCardFormValues>) => void;
  showPin: boolean;
  onToggleShowPin: () => void;
  onGeneratePin: (digits: number) => void;
}

export const AtmCardModalSection: React.FC<AtmCardModalSectionProps> = ({
  values,
  onChange,
  showPin,
  onToggleShowPin,
  onGeneratePin,
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customHex, setCustomHex] = useState('#0f172a');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeColorStyle: CardColorOption = getCardColorStyle(values.cardColor);

  const handleCardNumberChange = (raw: string) => {
    // Only allow numbers and spaces, format as 4-4-4-4
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 19);
    const parts = digitsOnly.match(/.{1,4}/g) || [];
    const formatted = parts.join(' ');
    onChange({ cardNumber: formatted });
  };

  const handleExpiryChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      onChange({ cardExpiry: `${digits.slice(0, 2)}/${digits.slice(2)}` });
    } else {
      onChange({ cardExpiry: digits });
    }
  };

  const handleCvvChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    onChange({ cardCvv: digits });
  };

  const handlePinChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    onChange({ atmPin: digits });
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Masked card number display
  const displayCardNumber = () => {
    if (!values.cardNumber) return '•••• •••• •••• ••••';
    if (showCardNumber) return values.cardNumber;
    const parts = values.cardNumber.split(' ');
    if (parts.length <= 1) return values.cardNumber;
    return parts.map((p, idx) => (idx === parts.length - 1 ? p : '••••')).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Interactive Realistic Live ATM Card Preview */}
      <div className="relative">
        <div 
          className={`w-full rounded-2xl p-5 border bg-gradient-to-br ${activeColorStyle.bgGradient} ${activeColorStyle.borderClass} ${activeColorStyle.textColor} shadow-2xl relative overflow-hidden transition-all duration-300 min-h-[190px] flex flex-col justify-between`}
        >
          {/* Subtle Metallic Specular Texture Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-white/[0.08] pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/[0.04] blur-xl pointer-events-none" />

          {/* Top Row: Bank Name, Contactless Icon, Card Type */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 opacity-80" />
              <span className="text-sm sm:text-base font-black tracking-wider uppercase drop-shadow-sm truncate max-w-[200px]">
                {values.bankName.trim() || 'BANK OF HVAULT'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {values.cardType ? (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/30 border border-white/15">
                  {values.cardType}
                </span>
              ) : null}
              <Wifi className="w-4 h-4 rotate-90 opacity-75" />
            </div>
          </div>

          {/* Middle Row: EMV Metallic Chip & Masked Card Number */}
          <div className="my-2 z-10 space-y-2">
            <div className="flex items-center justify-between">
              {/* Realistic Gold/Silver EMV Chip */}
              <div className={`w-10 h-7 rounded-md bg-gradient-to-br ${activeColorStyle.chipColor} border border-amber-300/40 shadow-inner flex flex-col justify-around p-1 opacity-90`}>
                <div className="w-full h-0.5 bg-black/20 rounded-full" />
                <div className="w-full h-0.5 bg-black/20 rounded-full" />
                <div className="w-full h-0.5 bg-black/20 rounded-full" />
              </div>

              {/* PIN preview badge */}
              <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10 text-[10px] font-mono">
                <span className="opacity-60 text-[9px] uppercase font-bold">ATM PIN:</span>
                <span className="text-emerald-300 font-black tracking-widest">
                  {values.atmPin ? (showPin ? values.atmPin : '••••') : '----'}
                </span>
              </div>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between font-mono text-sm sm:text-base tracking-[0.2em] font-bold drop-shadow">
              <span>{displayCardNumber()}</span>
              {values.cardNumber && (
                <button
                  type="button"
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="opacity-60 hover:opacity-100 transition-opacity p-1 text-xs cursor-pointer"
                  title={showCardNumber ? "Hide number" : "Show full number"}
                >
                  {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Cardholder Name, Expiry Date, Card Network */}
          <div className="flex items-end justify-between z-10 text-[10px] sm:text-xs">
            <div>
              <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold">CARDHOLDER</p>
              <p className="font-mono font-black uppercase tracking-wider truncate max-w-[160px]">
                {values.cardHolder.trim() || 'VALUED CLIENT'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold">EXPIRES</p>
              <p className="font-mono font-black tracking-wider">
                {values.cardExpiry.trim() || 'MM/YY'}
              </p>
            </div>

            <div className="text-right">
              {values.cardProvider ? (
                <span className="font-black italic tracking-tighter text-xs sm:text-sm uppercase opacity-90">
                  {values.cardProvider}
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">
                  CARD
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ATM PIN Section (Encrypted Core Credential) */}
      <div className="p-4 bg-[#0A0F1D] border border-emerald-500/30 rounded-2xl space-y-3 shadow-md shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span>ATM PIN (Encrypted Master Code)</span>
            <span className="text-red-400">*</span>
          </label>

          {/* Quick PIN Generator Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onGeneratePin(4)}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-black tracking-wider transition-colors cursor-pointer active:scale-95"
            >
              🎲 4-Digit PIN
            </button>
            <button
              type="button"
              onClick={() => onGeneratePin(6)}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-black tracking-wider transition-colors cursor-pointer active:scale-95"
            >
              🎲 6-Digit PIN
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={values.atmPin}
            onChange={(e) => handlePinChange(e.target.value)}
            placeholder="Enter 4 or 6 digit ATM PIN (e.g. 7482)"
            maxLength={8}
            className="w-full bg-[#0D1425] border border-emerald-500/40 focus:border-emerald-400 rounded-xl pl-4 pr-10 py-3 text-sm font-mono font-bold tracking-[0.25em] text-emerald-300 placeholder:text-white/20 placeholder:tracking-normal focus:outline-none"
          />
          <button
            type="button"
            onClick={onToggleShowPin}
            className="absolute right-3.5 top-3.5 text-emerald-400/60 hover:text-emerald-300 transition-colors cursor-pointer"
            title={showPin ? "Hide PIN" : "Reveal PIN"}
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-[10px] text-white/50 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Client-side AES-256 encrypted before transmission to Firestore.</span>
        </p>
      </div>

      {/* Luxury Card Color & Metal Finish Theme (Placed ABOVE Bank Provider) */}
      <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Card Finish & Color Theme</span>
          </label>
          <span className="text-amber-300 font-mono font-bold text-[10px] uppercase">
            {values.cardColor || 'Obsidian Black'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CARD_COLORS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                onChange({ cardColor: col.id });
                setIsCustomColor(false);
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                !isCustomColor && values.cardColor === col.id
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm'
                  : 'bg-[#0D1425] border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${col.previewBg} shrink-0`} />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-tight truncate">{col.label}</p>
                <p className="text-[8px] opacity-50 font-medium truncate">{col.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bank Provider Selection */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-widest text-white/60">
          Bank / Financial Provider <span className="text-red-400">*</span>
        </label>
        
        {/* Popular Quick Bank Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {POPULAR_BANKS.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => onChange({ bankName: b.name })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                values.bankName.toLowerCase() === b.name.toLowerCase()
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-[#0A0F1D] text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          required
          value={values.bankName}
          onChange={(e) => onChange({ bankName: e.target.value })}
          placeholder="e.g. Chase, Bank of America, KBZ Bank, Revolut"
          className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400"
        />
      </div>

      {/* Card Network & Card Type Grid (OPTIONAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card Network / Provider (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Card Network
            </label>
            <span className="text-[9px] font-bold uppercase text-white/30 tracking-wider">
              Optional
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {CARD_NETWORKS.map((net) => {
              const isSelected = values.cardProvider === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => onChange({ cardProvider: isSelected ? '' : net.id })}
                  title={isSelected ? "Click to deselect" : `Select ${net.label}`}
                  className={`py-1.5 px-2 text-[10px] font-black uppercase rounded-lg border text-center transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 shadow-sm ring-1 ring-sky-400'
                      : 'bg-[#0A0F1D] text-white/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  {net.label}
                </button>
              );
            })}
          </div>
          {values.cardProvider && (
            <button
              type="button"
              onClick={() => onChange({ cardProvider: '' })}
              className="mt-1 text-[9px] text-white/40 hover:text-red-400 font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ✕ Clear Network
            </button>
          )}
        </div>

        {/* Card Type (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Card Type
            </label>
            <span className="text-[9px] font-bold uppercase text-white/30 tracking-wider">
              Optional
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {['Debit Card', 'Credit Card', 'ATM Card', 'Prepaid Card'].map((type) => {
              const isSelected = values.cardType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ cardType: isSelected ? '' : type })}
                  title={isSelected ? "Click to deselect" : `Select ${type}`}
                  className={`py-1.5 px-2 text-[10px] font-black uppercase rounded-lg border text-center transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 shadow-sm ring-1 ring-sky-400'
                      : 'bg-[#0A0F1D] text-white/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          {values.cardType && (
            <button
              type="button"
              onClick={() => onChange({ cardType: '' })}
              className="mt-1 text-[9px] text-white/40 hover:text-red-400 font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ✕ Clear Type
            </button>
          )}
        </div>
      </div>

      {/* Card Details: Number, Holder, Expiry, CVV */}
      <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
            <span>Card Attributes (Optional)</span>
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            For Safe Keeping
          </span>
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={values.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4532 8900 1234 5678"
              className="w-full bg-[#0D1425] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400"
            />
            {values.cardNumber && (
              <button
                type="button"
                onClick={() => handleCopy(values.cardNumber, 'number')}
                className="absolute right-2.5 top-2 text-white/40 hover:text-white p-1 text-[10px] uppercase font-bold"
              >
                {copiedField === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
            Cardholder Name
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
            <input
              type="text"
              value={values.cardHolder}
              onChange={(e) => onChange({ cardHolder: e.target.value })}
              placeholder="e.g. HTOO AUNG LIN"
              className="w-full bg-[#0D1425] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400 uppercase"
            />
          </div>
        </div>

        {/* Expiry Date & CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
              <input
                type="text"
                value={values.cardExpiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full bg-[#0D1425] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
              CVV / CVC
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={values.cardCvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              placeholder="3 or 4 digits"
              maxLength={4}
              className="w-full bg-[#0D1425] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
