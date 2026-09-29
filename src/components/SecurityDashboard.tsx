import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Key, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { DecryptedPasswordEntry } from '../types';
import { evaluatePasswordStrength } from '../lib/crypto';

interface SecurityDashboardProps {
  entries: DecryptedPasswordEntry[];
  onEditEntry: (entry: DecryptedPasswordEntry) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  entries,
  onEditEntry,
}) => {
  const [revealedGroups, setRevealedGroups] = useState<Record<number, boolean>>({});

  const toggleGroupReveal = (index: number) => {
    setRevealedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (entries.length === 0) {
    return (
      <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto border border-sky-400/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">No Passwords to Audit</h3>
        <p className="text-xs font-medium text-white/50">
          Add accounts to your hVault to receive automated strength scoring, reuse detection, and security audit recommendations.
        </p>
      </div>
    );
  }

  // Calculate audit statistics
  let totalScore = 0;
  const weakEntries: DecryptedPasswordEntry[] = [];
  const passwordMap = new Map<string, DecryptedPasswordEntry[]>();

  entries.forEach((entry) => {
    const plain = entry.decryptedPassword || '';
    const strength = evaluatePasswordStrength(plain);
    totalScore += (strength.score / 4) * 100;

    if (strength.score < 3) {
      weakEntries.push(entry);
    }

    if (plain) {
      const list = passwordMap.get(plain) || [];
      list.push(entry);
      passwordMap.set(plain, list);
    }
  });

  const reusedPasswords = Array.from(passwordMap.values()).filter((list) => list.length > 1);
  const totalReusedCount = reusedPasswords.reduce((acc, list) => acc + list.length, 0);

  const averageHealthScore = Math.round(totalScore / entries.length);

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 60) return { label: 'Good', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
    if (score >= 40) return { label: 'Needs Improvement', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'At Risk', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  const badge = getHealthBadge(averageHealthScore);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Score */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">hVault Health</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">{averageHealthScore}%</span>
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0A0F1D] rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full ${averageHealthScore >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${averageHealthScore}%` }}
            />
          </div>
        </div>

        {/* Total Passwords */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Total Accounts</span>
            <Key className="w-4 h-4 text-white/40" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{entries.length}</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Securely Encrypted</p>
        </div>

        {/* Weak Passwords */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Weak Passwords</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{weakEntries.length}</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            {weakEntries.length === 0 ? 'All Strong' : 'Action Required'}
          </p>
        </div>

        {/* Reused Passwords */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Reused Passwords</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">{totalReusedCount}</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            {totalReusedCount === 0 ? 'Zero Duplicate' : `${reusedPasswords.length} Duplicates`}
          </p>
        </div>

      </div>

      {/* Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weak Passwords List */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Weak Passwords ({weakEntries.length})</h3>
            </div>
          </div>

          {weakEntries.length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-white/40 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>GREAT JOB! NO WEAK PASSWORDS DETECTED.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {weakEntries.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#0A0F1D] p-3 rounded-xl border border-white/10 text-xs"
                >
                  <div>
                    <p className="font-black text-white uppercase tracking-tight">{item.serviceName}</p>
                    <p className="text-[11px] font-bold text-white/40">{item.username}</p>
                  </div>
                  <button
                    onClick={() => onEditEntry(item)}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>UPGRADE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reused Passwords List */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Reused Passwords ({totalReusedCount})</h3>
            </div>
            {reusedPasswords.length > 0 && (
              <button
                onClick={() => {
                  const allRevealed = reusedPasswords.every((_, idx) => revealedGroups[idx]);
                  const nextState: Record<number, boolean> = {};
                  reusedPasswords.forEach((_, idx) => {
                    nextState[idx] = !allRevealed;
                  });
                  setRevealedGroups(nextState);
                }}
                className="text-[10px] font-black uppercase tracking-wider text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                {reusedPasswords.every((_, idx) => revealedGroups[idx]) ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide All</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show All</span>
                  </>
                )}
              </button>
            )}
          </div>

          {reusedPasswords.length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-white/40 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ZERO PASSWORD REUSE FOUND ACROSS ACCOUNTS.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {reusedPasswords.map((group, idx) => {
                const isRevealed = Boolean(revealedGroups[idx]);

                return (
                  <div key={idx} className="bg-[#0A0F1D] p-3.5 rounded-xl border border-red-500/30 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                          Reused across {group.length} services:
                        </span>
                      </div>
                      <button
                        onClick={() => toggleGroupReveal(idx)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title={isRevealed ? "Hide service names" : "Show service names"}
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Show</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      {group.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onEditEntry(item)}
                          title={isRevealed ? `Edit ${item.serviceName}` : "Click Eye icon to reveal service name"}
                          className="px-2.5 py-1 bg-[#0D1425] hover:bg-white/10 text-white/90 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{isRevealed ? item.serviceName : '••••••••'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
