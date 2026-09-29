import React from 'react';

interface HVaultLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  glow?: boolean;
}

export const HVaultLogo: React.FC<HVaultLogoProps> = ({ 
  size = 'md', 
  className = '',
  glow = true 
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    custom: '',
  };

  const dimensions = size !== 'custom' ? sizeMap[size] : '';

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} ${className}`}
      aria-label="hVault Logo"
    >
      <svg 
        viewBox="0 0 512 512" 
        className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hVaultBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#050814" />
          </linearGradient>
          <linearGradient id="hVaultLockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="hVaultShackleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <filter id="hVaultGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex/Rounded Shield Container */}
        <rect 
          x="16" 
          y="16" 
          width="480" 
          height="480" 
          rx="120" 
          fill="url(#hVaultBgGrad)" 
          stroke="#38BDF8" 
          strokeWidth="12" 
          strokeOpacity="0.4" 
        />
        
        {/* Subtle Inner Ambient Glow */}
        {glow && (
          <circle cx="256" cy="256" r="160" fill="#38BDF8" fillOpacity="0.08" />
        )}

        {/* Lock Shackle */}
        <path 
          d="M 180 236 V 164 C 180 122 214 88 256 88 C 298 88 332 122 332 164 V 236" 
          fill="none" 
          stroke="url(#hVaultShackleGrad)" 
          strokeWidth="36" 
          strokeLinecap="round" 
        />

        {/* Lock Body */}
        <rect 
          x="136" 
          y="216" 
          width="240" 
          height="196" 
          rx="38" 
          fill="url(#hVaultLockGrad)" 
          filter="url(#hVaultGlowFilter)"
        />

        {/* Body Highlight Bevel */}
        <rect 
          x="148" 
          y="228" 
          width="216" 
          height="172" 
          rx="28" 
          fill="none" 
          stroke="#BAE6FD" 
          strokeWidth="4" 
          strokeOpacity="0.45" 
        />

        {/* Stylized 'H' & Keyhole */}
        {/* Left vertical bar of H */}
        <path 
          d="M 224 278 V 352" 
          stroke="#070D1E" 
          strokeWidth="20" 
          strokeLinecap="round" 
        />
        {/* Right vertical bar of H */}
        <path 
          d="M 288 278 V 352" 
          stroke="#070D1E" 
          strokeWidth="20" 
          strokeLinecap="round" 
        />
        {/* Crossbar of H */}
        <path 
          d="M 224 315 H 288" 
          stroke="#070D1E" 
          strokeWidth="20" 
          strokeLinecap="round" 
        />
        
        {/* Glowing Center Keyhole Core */}
        <circle cx="256" cy="315" r="9" fill="#38BDF8" />
      </svg>
    </div>
  );
};
