import React from 'react';
import { Key, Terminal, Cpu, Sparkles, Database, Cloud, Mail, Zap, Bot } from 'lucide-react';

interface ApiKeyLogoProps {
  provider?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ApiKeyLogo: React.FC<ApiKeyLogoProps> = ({
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

  // 0. OpenRouter API
  if (norm.includes('openrouter')) {
    return (
      <div 
        className={`rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center p-2 text-[#818cf8] shadow-md shadow-[#6366f1]/20 ${sizeClasses} ${className}`}
        title="OpenRouter AI Gateway"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-indigo-300">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.122 2.122m8.485 8.485l2.122 2.122M5.636 18.364l2.122-2.122m8.485-8.485l2.122-2.122" />
        </svg>
      </div>
    );
  }

  // 1. OpenAI (ChatGPT / GPT-4)
  if (norm.includes('openai') || norm.includes('chatgpt') || norm.includes('gpt')) {
    return (
      <div 
        className={`rounded-xl bg-[#10a37f]/20 border border-[#10a37f]/40 flex items-center justify-center p-2 text-[#10a37f] shadow-md shadow-[#10a37f]/20 ${sizeClasses} ${className}`}
        title="OpenAI API"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="currentColor" className="shrink-0 text-[#10a37f]">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.937a4.485 4.485 0 0 1 2.365-1.983V12.7a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.937zm15.82 3.824-5.843-3.369v-2.332a.08.08 0 0 1 .033-.062l4.84-2.796a4.5 4.5 0 0 1 6.14 1.646 4.47 4.47 0 0 1 .536 3.014l-.142-.085-4.783-2.759a.771.771 0 0 0-.78 0zm2.01-1.761v-5.74a.766.766 0 0 0-.388-.676L13.967 1.83l2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.504 4.504 0 0 1 1.612 6.177 4.485 4.485 0 0 1-2.365 1.983zM10.74 1.57a4.476 4.476 0 0 1 2.876 1.04l-.141.081-4.779 2.758a.795.795 0 0 0-.392.681v6.737L6.284 11.7a.071.071 0 0 1-.038-.052V6.065A4.504 4.504 0 0 1 10.74 1.57zm-1.045 7.62 3.045-1.758 3.045 1.758v3.516l-3.045 1.758-3.045-1.758z"/>
        </svg>
      </div>
    );
  }

  // 2. Anthropic (Claude)
  if (norm.includes('anthropic') || norm.includes('claude')) {
    return (
      <div 
        className={`rounded-xl bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center p-2 text-[#d97706] shadow-md shadow-[#d97706]/20 ${sizeClasses} ${className}`}
        title="Anthropic Claude API"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="currentColor" className="shrink-0 text-amber-400">
          <path d="M14.072 2.5a.69.69 0 0 0-.641.442L7.337 18.739l2.766.722 1.503-3.876h6.14l1.458 3.864 2.81-.722L15.93 2.942a.69.69 0 0 0-.641-.442h-1.217zm.58 4.228 2.072 5.567h-4.205l2.133-5.567zM4.697 19.349l2.257-.59-1.246-3.21-2.258.59 1.247 3.21z"/>
        </svg>
      </div>
    );
  }

  // 3. Google AI Studio / Gemini
  if (norm.includes('gemini') || norm.includes('google') || norm.includes('aistudio')) {
    return (
      <div 
        className={`rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-400/40 flex items-center justify-center p-2 text-blue-300 shadow-md shadow-blue-950/40 ${sizeClasses} ${className}`}
        title="Google AI Studio / Gemini API"
      >
        <Sparkles style={{ width: iconSizes, height: iconSizes }} className="text-blue-300 animate-pulse" />
      </div>
    );
  }

  // 4. DeepSeek
  if (norm.includes('deepseek')) {
    return (
      <div 
        className={`rounded-xl bg-sky-600/25 border border-sky-400/40 flex items-center justify-center p-2 text-sky-300 shadow-md shadow-sky-950/40 ${sizeClasses} ${className}`}
        title="DeepSeek API"
      >
        <Bot style={{ width: iconSizes, height: iconSizes }} className="text-sky-300" />
      </div>
    );
  }

  // 5. Groq
  if (norm.includes('groq')) {
    return (
      <div 
        className={`rounded-xl bg-orange-600/25 border border-orange-400/40 flex items-center justify-center p-2 text-orange-300 shadow-md shadow-orange-950/40 ${sizeClasses} ${className}`}
        title="Groq Cloud LPU"
      >
        <Zap style={{ width: iconSizes, height: iconSizes }} className="text-orange-400" />
      </div>
    );
  }

  // 6. Stripe API
  if (norm.includes('stripe')) {
    return (
      <div 
        className={`rounded-xl bg-[#635BFF]/25 border border-indigo-400/40 flex items-center justify-center p-2 text-white font-black shadow-md shadow-indigo-950/40 ${sizeClasses} ${className}`}
        title="Stripe Secret API Key"
      >
        <span className="font-mono font-black text-indigo-200 tracking-tighter" style={{ fontSize: iconSizes * 0.9 }}>
          S\
        </span>
      </div>
    );
  }

  // 7. Supabase
  if (norm.includes('supabase')) {
    return (
      <div 
        className={`rounded-xl bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center p-2 text-[#3ECF8E] shadow-md shadow-[#3ECF8E]/20 ${sizeClasses} ${className}`}
        title="Supabase API Key"
      >
        <Database style={{ width: iconSizes, height: iconSizes }} className="text-emerald-400" />
      </div>
    );
  }

  // 8. AWS IAM / Secret
  if (norm.includes('aws') || norm.includes('amazon')) {
    return (
      <div 
        className={`rounded-xl bg-[#FF9900]/20 border border-[#FF9900]/40 flex items-center justify-center p-2 text-[#FF9900] shadow-md shadow-[#FF9900]/20 ${sizeClasses} ${className}`}
        title="AWS Access Key & Secret"
      >
        <Cloud style={{ width: iconSizes, height: iconSizes }} className="text-amber-400" />
      </div>
    );
  }

  // 9. Resend
  if (norm.includes('resend')) {
    return (
      <div 
        className={`rounded-xl bg-zinc-800 border border-zinc-600 flex items-center justify-center p-2 text-white shadow-md shadow-black/40 ${sizeClasses} ${className}`}
        title="Resend Email API Key"
      >
        <Mail style={{ width: iconSizes, height: iconSizes }} className="text-zinc-200" />
      </div>
    );
  }

  // 10. GitHub Token
  if (norm.includes('github')) {
    return (
      <div 
        className={`rounded-xl bg-[#24292e]/80 border border-slate-600/50 flex items-center justify-center p-2 text-white shadow-md shadow-black/40 ${sizeClasses} ${className}`}
        title="GitHub Personal Access Token"
      >
        <svg viewBox="0 0 24 24" width={iconSizes} height={iconSizes} fill="currentColor" className="shrink-0 text-white">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>
    );
  }

  // Default: Developer API Key Icon
  return (
    <div 
      className={`rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20 border border-amber-400/40 flex items-center justify-center p-2 text-amber-300 shadow-lg shadow-amber-950/40 relative overflow-hidden group ${sizeClasses} ${className}`}
      title="Developer API Key"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-yellow-400/10 pointer-events-none" />
      <div className="relative flex items-center justify-center">
        <Key className="text-amber-300 transition-transform group-hover:rotate-12" style={{ width: iconSizes, height: iconSizes }} />
        <span className="absolute -bottom-1 -right-1 text-[7px] font-black font-mono text-amber-200 px-0.5 rounded bg-black/70 border border-amber-400/40 leading-none">
          API
        </span>
      </div>
    </div>
  );
};
