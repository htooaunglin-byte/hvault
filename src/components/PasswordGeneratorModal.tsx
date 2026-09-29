import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { evaluatePasswordStrength, generateSecurePassword } from '../lib/crypto';

interface PasswordGeneratorModalProps {
  onCopy: (text: string, label: string) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({ onCopy }) => {
  const [length, setLength] = useState(18);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(() => 
    generateSecurePassword(18, { uppercase: true, lowercase: true, numbers: true, symbols: true })
  );
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    const pass = generateSecurePassword(length, { uppercase, lowercase, numbers, symbols });
    setGeneratedPassword(pass);
    setCopied(false);
  };

  const handleCopy = () => {
    onCopy(generatedPassword, 'Generated Password');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = evaluatePasswordStrength(generatedPassword);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 bg-sky-500/10 border border-sky-400/30 text-sky-400 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">CRYPTON PASSWORD GENERATOR</h2>
            <p className="text-xs font-bold text-white/50">
              Hardware web crypto entropy generation on device
            </p>
          </div>
        </div>

        {/* Display Generated Password */}
        <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider break-all select-all py-1">
              {showPassword ? generatedPassword : '••••••••••••••••••••••••'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0 justify-end">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2.5 text-white/40 hover:text-white bg-[#0D1425] hover:bg-white/5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRegenerate}
                className="p-2.5 text-white/40 hover:text-sky-400 bg-[#0D1425] hover:bg-white/5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                title="Regenerate Password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopy}
                className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-sky-900/30 transition-all flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Entropy Rating</span>
              <span className="text-emerald-400">{strength.label} ({strength.score}/4)</span>
            </div>
            <div className="w-full h-2 bg-[#0D1425] rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-2">
          
          {/* Length Slider & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/60">
              <span>Password Length: <span className="text-sky-400 font-mono text-sm">{length}</span> chars</span>
              <span className="text-white/30 text-[10px]">Optimal: 16+</span>
            </div>
            <input
              type="range"
              min={8}
              max={48}
              value={length}
              onChange={(e) => {
                const l = parseInt(e.target.value);
                setLength(l);
                setGeneratedPassword(generateSecurePassword(l, { uppercase, lowercase, numbers, symbols }));
              }}
              className="w-full accent-sky-400 bg-[#0A0F1D] rounded-lg cursor-pointer h-2"
            />
            {/* Presets */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0">Quick Presets:</span>
              <div className="flex items-center gap-1.5">
                {[12, 16, 24, 32].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      setLength(len);
                      setGeneratedPassword(generateSecurePassword(len, { uppercase, lowercase, numbers, symbols }));
                    }}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                      length === len
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                        : 'bg-[#0A0F1D] border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            
            <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
              uppercase 
                ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                : 'bg-[#0A0F1D] border-white/10 text-white/40 hover:border-white/20'
            }`}>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => {
                  setUppercase(e.target.checked);
                  setGeneratedPassword(generateSecurePassword(length, { uppercase: e.target.checked, lowercase, numbers, symbols }));
                }}
                className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-black text-white">A-Z</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Uppercase</p>
              </div>
            </label>

            <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
              lowercase 
                ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                : 'bg-[#0A0F1D] border-white/10 text-white/40 hover:border-white/20'
            }`}>
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => {
                  setLowercase(e.target.checked);
                  setGeneratedPassword(generateSecurePassword(length, { uppercase, lowercase: e.target.checked, numbers, symbols }));
                }}
                className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-black text-white">a-z</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Lowercase</p>
              </div>
            </label>

            <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
              numbers 
                ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                : 'bg-[#0A0F1D] border-white/10 text-white/40 hover:border-white/20'
            }`}>
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => {
                  setNumbers(e.target.checked);
                  setGeneratedPassword(generateSecurePassword(length, { uppercase, lowercase, numbers: e.target.checked, symbols }));
                }}
                className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-black text-white">0-9</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Numbers</p>
              </div>
            </label>

            <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
              symbols 
                ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-sm' 
                : 'bg-[#0A0F1D] border-white/10 text-white/40 hover:border-white/20'
            }`}>
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => {
                  setSymbols(e.target.checked);
                  setGeneratedPassword(generateSecurePassword(length, { uppercase, lowercase, numbers, symbols: e.target.checked }));
                }}
                className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-black text-white">!@#$</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Symbols</p>
              </div>
            </label>

          </div>

        </div>

      </div>
    </div>
  );
};
