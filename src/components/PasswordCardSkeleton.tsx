import React from 'react';

interface PasswordCardSkeletonProps {
  count?: number;
}

export const PasswordCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden animate-pulse">
      {/* Subtle top shimmer glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon placeholder */}
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/20 shrink-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-sky-400/30 rounded-md" />
          </div>
          
          {/* Title & Category Badge placeholder */}
          <div className="min-w-0 space-y-2">
            <div className="h-4 w-32 bg-white/20 rounded-md" />
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-16 bg-sky-500/15 border border-sky-500/30 rounded" />
              <div className="h-3.5 w-12 bg-white/5 border border-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Action icons placeholders */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5" />
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5" />
        </div>
      </div>

      {/* Fields Box */}
      <div className="space-y-3 bg-[#0A0F1D] p-3.5 rounded-xl border border-white/10 text-xs">
        {/* Username row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-3.5 h-3.5 bg-sky-400/30 rounded-full shrink-0" />
            <div className="h-3.5 w-28 bg-white/15 rounded" />
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/5 shrink-0" />
        </div>

        <div className="border-t border-white/10" />

        {/* Password row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-3.5 h-3.5 bg-sky-400/30 rounded-full shrink-0" />
            <div className="h-3.5 w-36 bg-white/20 rounded font-mono" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-white/5" />
            <div className="w-6 h-6 rounded-lg bg-white/5" />
          </div>
        </div>
      </div>

      {/* Notes bar placeholder */}
      <div className="h-3 w-40 bg-white/5 rounded px-1" />

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-white/40 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30" />
            <div className="h-3 w-16 bg-emerald-500/20 rounded" />
          </div>
          <div className="h-3 w-20 bg-white/5 rounded hidden sm:block" />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="w-12 h-6 bg-white/5 rounded-lg" />
          <div className="w-7 h-6 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const PasswordGridSkeleton: React.FC<PasswordCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="space-y-4">
      {/* Decryption status header badge */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>Decrypting Vault Items...</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono">AES-256-GCM</span>
      </div>

      {/* Skeleton Card Grid identical to Vault Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <PasswordCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};
