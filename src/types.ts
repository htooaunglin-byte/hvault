export type CategoryType = string;

export type CategoryFlowType = 'password' | 'safes' | 'atm_card' | 'oauth' | 'api_key';

export const DEFAULT_CATEGORY_FLOWS: Record<string, CategoryFlowType> = {
  General: 'password',
  'API Keys': 'api_key',
  OAuth: 'oauth',
  Social: 'password',
  Finance: 'password',
  'ATM Cards': 'atm_card',
  Work: 'password',
  Entertainment: 'password',
  Shopping: 'password',
  Safes: 'safes',
  Other: 'password',
};

export interface CategoryFlowMeta {
  id: CategoryFlowType;
  label: string;
  shortLabel: string;
  description: string;
  iconName: 'Lock' | 'Shield' | 'CreditCard' | 'KeyRound' | 'Key';
  badgeClass: string;
  accentColor: string;
}

export const CATEGORY_FLOW_OPTIONS: CategoryFlowMeta[] = [
  {
    id: 'password',
    label: 'Normal Password',
    shortLabel: 'Password',
    description: 'Username, password generator, website URL & notes',
    iconName: 'Lock',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    accentColor: '#38bdf8',
  },
  {
    id: 'api_key',
    label: 'API Key / Token',
    shortLabel: 'API Key',
    description: 'Service provider, key name, encrypted token, environment & cURL',
    iconName: 'Key',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    accentColor: '#f59e0b',
  },
  {
    id: 'oauth',
    label: 'OAuth 2.0 App',
    shortLabel: 'OAuth App',
    description: 'Client ID, Secret, redirect URIs, scopes & auth endpoints',
    iconName: 'KeyRound',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    accentColor: '#818cf8',
  },
  {
    id: 'atm_card',
    label: 'ATM & Payment Card',
    shortLabel: 'ATM Card',
    description: 'Bank name, cardholder, card number, expiry, CVV & ATM PIN',
    iconName: 'CreditCard',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accentColor: '#10b981',
  },
  {
    id: 'safes',
    label: 'Safe Box / Combination',
    shortLabel: 'Safe Box',
    description: 'Dial combination / keypad PIN, safe size & metal exterior finish',
    iconName: 'Shield',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    accentColor: '#d97706',
  },
];

export const DEFAULT_CATEGORIES: string[] = [
  'General',
  'API Keys',
  'OAuth',
  'Social',
  'Finance',
  'ATM Cards',
  'Work',
  'Entertainment',
  'Shopping',
  'Safes',
  'Other',
];

export interface PasswordEntry {
  id: string;
  serviceName: string;
  username: string; // Service username, or Key Name / Label for API Keys
  encryptedPassword: string; // Base64 cipher text (contains Password, ATM PIN, Safe Combination, Client Secret, or API Key)
  iv: string;                // Base64 initialization vector
  salt: string;              // Base64 salt for PBKDF2
  category: CategoryType;
  websiteUrl?: string;
  notes?: string;
  isFavorite?: boolean;

  // API Keys properties
  keyName?: string;          // Name/description of the API key (e.g. 'Production Read-Only Key', 'OpenAI Backend GPT-4', 'Stripe Live Secret')
  keyEnvironment?: string;   // 'Production' | 'Development' | 'Staging' | 'Test'
  keyHeaderPrefix?: string;  // e.g. 'Bearer', 'ApiKey', 'Basic', 'X-API-Key'
  keyExpiresAt?: string;     // Optional expiration date
  
  // Safes properties
  safeSize?: string;
  safeColor?: string;
  // ATM / Payment Card properties
  bankName?: string;         // e.g. Chase, Wells Fargo, Bank of America, KBZ, DBS, etc.
  cardProvider?: string;     // e.g. Visa, Mastercard, Amex, JCB, UnionPay, Discover
  cardType?: string;         // e.g. 'Debit Card', 'Credit Card', 'ATM Card', 'Prepaid Card'
  cardHolder?: string;       // Cardholder Name
  cardNumber?: string;       // Card Number (masked or formatted)
  cardExpiry?: string;       // MM/YY
  cardCvv?: string;          // CVV / CVC
  cardColor?: string;        // Color Theme / Finish
  
  // OAuth 2.0 / API Credential properties
  clientId?: string;         // Public Client ID
  oauthRedirectUri?: string; // Callback / Redirect URI
  oauthScopes?: string;      // Scopes list (e.g. 'openid email profile')
  oauthAuthUrl?: string;     // Authorization Endpoint URL
  oauthTokenUrl?: string;    // Token Endpoint URL
  oauthGrantType?: string;   // e.g. 'Authorization Code (PKCE)', 'Client Credentials (M2M)'
  oauthClientType?: string;  // e.g. 'Confidential', 'Public'
  oauthProvider?: string;    // Preset provider name e.g. 'Google Cloud', 'GitHub', 'Discord', 'Custom'
  
  autofillEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastAccessedAt?: string;
}

export interface DecryptedPasswordEntry extends PasswordEntry {
  decryptedPassword?: string;
  decryptError?: boolean;
}

export interface AutoFillPreset {
  id: string;
  name: string;
  matchPattern: RegExp;
  loginUrl: string;
  domain: string;
  color: string;
  iconName: string;
}

export interface PasswordStrengthResult {
  score: number; // 0 (weak) to 4 (very strong)
  label: string;
  color: string;
  feedback: string[];
}
