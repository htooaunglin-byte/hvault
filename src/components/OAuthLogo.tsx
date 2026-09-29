import React from 'react';
import { KeyRound, ShieldCheck, Workflow, Zap, Code2, Globe, Shield, Terminal } from 'lucide-react';

interface OAuthLogoProps {
  provider?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const OAuthLogo: React.FC<OAuthLogoProps> = ({
  provider = '',
  className = '',
  size = 'md',
}) => {
  const norm = (provider || '').trim().toLowerCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 26,
  }[size];

  // 1. Google Cloud / OAuth
  if (norm.includes('google') || norm.includes('gcp')) {
    return (
      <div 
        className={`rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2 text-white shadow-md shadow-red-950/20 ${sizeClasses} ${className}`}
        title="Google Cloud / Google OAuth 2.0"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} className="shrink-0">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      </div>
    );
  }

  // 2. GitHub
  if (norm.includes('github')) {
    return (
      <div 
        className={`rounded-xl bg-[#24292e]/80 border border-slate-600/50 flex items-center justify-center p-2 text-white shadow-md shadow-black/40 ${sizeClasses} ${className}`}
        title="GitHub OAuth Application"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="currentColor" className="shrink-0 text-white">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>
    );
  }

  // 3. Discord
  if (norm.includes('discord')) {
    return (
      <div 
        className={`rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center p-2 text-[#5865F2] shadow-md shadow-[#5865F2]/20 ${sizeClasses} ${className}`}
        title="Discord Developer Application"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="#5865F2" className="shrink-0">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>
    );
  }

  // 4. Slack
  if (norm.includes('slack')) {
    return (
      <div 
        className={`rounded-xl bg-[#4A154B]/25 border border-fuchsia-500/35 flex items-center justify-center p-2 text-fuchsia-300 shadow-md shadow-fuchsia-950/30 ${sizeClasses} ${className}`}
        title="Slack Application"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="currentColor" className="shrink-0 text-fuchsia-300">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      </div>
    );
  }

  // 5. Microsoft / Azure AD
  if (norm.includes('microsoft') || norm.includes('azure') || norm.includes('entra')) {
    return (
      <div 
        className={`rounded-xl bg-[#00A4EF]/20 border border-sky-400/40 flex items-center justify-center p-2 shadow-md shadow-sky-950/30 ${sizeClasses} ${className}`}
        title="Microsoft Entra ID / Azure AD"
      >
        <div className="grid grid-cols-2 gap-0.5" style={{ width: iconSizes, height: iconSizes }}>
          <div className="bg-[#F25022] rounded-[1px]" />
          <div className="bg-[#7FBA00] rounded-[1px]" />
          <div className="bg-[#00A4EF] rounded-[1px]" />
          <div className="bg-[#FFB900] rounded-[1px]" />
        </div>
      </div>
    );
  }

  // 6. Spotify
  if (norm.includes('spotify')) {
    return (
      <div 
        className={`rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center p-2 text-[#1DB954] shadow-md shadow-[#1DB954]/20 ${sizeClasses} ${className}`}
        title="Spotify Developer App"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="#1DB954" className="shrink-0">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.674.467-1.027.25-2.813-1.718-6.353-2.107-10.524-1.155-.404.092-.806-.16-.898-.564-.092-.404.16-.806.564-.898 4.567-1.042 8.477-.6 11.635 1.34.353.216.467.674.25 1.027zm1.465-3.26c-.272.443-.854.582-1.297.31-3.22-1.98-8.128-2.553-11.936-1.396-.499.152-1.028-.135-1.18-.635-.152-.499.135-1.028.635-1.18 4.354-1.321 9.774-.682 13.468 1.594.443.272.582.854.31 1.297zm.126-3.41c-3.86-2.293-10.23-2.504-13.916-1.386-.593.18-1.222-.16-1.402-.753-.18-.593.16-1.222.753-1.402 4.237-1.286 11.272-1.036 15.719 1.605.534.317.708 1.01.391 1.544-.317.534-1.01.708-1.544.391z"/>
        </svg>
      </div>
    );
  }

  // 7. Stripe
  if (norm.includes('stripe')) {
    return (
      <div 
        className={`rounded-xl bg-[#635BFF]/25 border border-indigo-400/40 flex items-center justify-center p-2 text-white font-black shadow-md shadow-indigo-950/40 ${sizeClasses} ${className}`}
        title="Stripe Connect / API"
      >
        <span className="font-mono font-black text-indigo-200 tracking-tighter" style={{ fontSize: iconSizes * 0.9 }}>
          S\
        </span>
      </div>
    );
  }

  // 8. Auth0 / Okta
  if (norm.includes('auth0') || norm.includes('okta')) {
    return (
      <div 
        className={`rounded-xl bg-[#EB5424]/20 border border-orange-500/40 flex items-center justify-center p-2 text-orange-400 shadow-md shadow-orange-950/30 ${sizeClasses} ${className}`}
        title="Auth0 / Okta"
      >
        <ShieldCheck className="w-full h-full text-orange-400" />
      </div>
    );
  }

  // Default: Sleek OAuth 2.0 / OpenID Connect Tech Logo
  return (
    <div 
      className={`rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/15 to-violet-500/20 border border-indigo-400/40 flex items-center justify-center p-2 text-indigo-300 shadow-lg shadow-indigo-950/40 relative overflow-hidden group ${sizeClasses} ${className}`}
      title="OAuth 2.0 Client Credentials"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-sky-400/10 pointer-events-none" />
      <div className="relative flex items-center justify-center">
        <KeyRound className="text-indigo-300 transition-transform group-hover:rotate-12" style={{ width: iconSizes, height: iconSizes }} />
        <span className="absolute -bottom-1 -right-1.5 text-[8px] font-black font-mono text-cyan-300 px-0.5 rounded bg-black/60 border border-cyan-400/30 leading-none">
          2.0
        </span>
      </div>
    </div>
  );
};
