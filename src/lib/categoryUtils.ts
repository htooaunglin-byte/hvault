import React from 'react';
import { 
  Folder, 
  Share2, 
  DollarSign, 
  Briefcase, 
  Film, 
  ShoppingBag, 
  Shield, 
  Tag, 
  Layers,
  CreditCard,
  KeyRound,
  Key,
  Terminal,
  Cpu,
  Lock,
  LucideIcon
} from 'lucide-react';
import { CategoryFlowType, DEFAULT_CATEGORY_FLOWS, CATEGORY_FLOW_OPTIONS } from '../types';

export interface CategoryVisual {
  badgeClass: string;
  dotClass: string;
  accentColor: string;
  activeClass: string;
  isSafe: boolean;
  isCard?: boolean;
  isOAuth?: boolean;
  isApiKey?: boolean;
}

export function getFlowIconComponent(flow: CategoryFlowType): LucideIcon {
  switch (flow) {
    case 'api_key':
      return Key;
    case 'oauth':
      return KeyRound;
    case 'atm_card':
      return CreditCard;
    case 'safes':
      return Shield;
    case 'password':
    default:
      return Lock;
  }
}

export function getCategoryFlow(
  categoryName?: string,
  customFlows?: Record<string, CategoryFlowType>
): CategoryFlowType {
  if (!categoryName) return 'password';
  const trimmed = categoryName.trim();

  // 1. Check custom user mapping if configured
  if (customFlows && customFlows[trimmed]) {
    return customFlows[trimmed];
  }

  // 2. Check direct default mapping
  if (DEFAULT_CATEGORY_FLOWS[trimmed]) {
    return DEFAULT_CATEGORY_FLOWS[trimmed];
  }

  // Check case-insensitive match in default flows
  const defaultKey = Object.keys(DEFAULT_CATEGORY_FLOWS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  if (defaultKey && DEFAULT_CATEGORY_FLOWS[defaultKey]) {
    return DEFAULT_CATEGORY_FLOWS[defaultKey];
  }

  // 3. Fallback name heuristics
  const lower = trimmed.toLowerCase();
  if (lower.includes('api') || lower.includes('token') || lower.includes('secret') || lower.includes('webhook') || lower.includes('credential')) {
    return 'api_key';
  }
  if (lower.includes('oauth') || lower.includes('client id') || lower.includes('sso') || lower.includes('auth0') || lower.includes('okta')) {
    return 'oauth';
  }
  if (lower.includes('card') || lower.includes('atm') || lower.includes('bank card') || lower.includes('credit') || lower.includes('debit') || lower.includes('payment')) {
    return 'atm_card';
  }
  if (lower.includes('safe') || lower.includes('vault') || lower.includes('locker') || lower.includes('combo') || lower.includes('box')) {
    return 'safes';
  }

  return 'password';
}

export function getCategoryIconComponent(
  categoryName: string,
  customFlows?: Record<string, CategoryFlowType>
): LucideIcon {
  if (!categoryName) return Folder;

  // If a custom flow is defined for this category, return the flow's primary icon
  if (customFlows && customFlows[categoryName]) {
    const flow = customFlows[categoryName];
    if (flow === 'api_key') return Key;
    if (flow === 'oauth') return KeyRound;
    if (flow === 'atm_card') return CreditCard;
    if (flow === 'safes') return Shield;
    if (flow === 'password') return Lock;
  }

  const lower = categoryName.trim().toLowerCase();

  if (lower === 'api keys' || lower === 'api key' || lower === 'api' || lower === 'tokens' || lower === 'secrets' || lower === 'api credentials') {
    return Key;
  }
  if (lower === 'oauth' || lower === 'oauth 2.0' || lower === 'oauth credentials' || lower === 'clients') {
    return KeyRound;
  }
  if (lower === 'atm cards' || lower === 'cards' || lower === 'credit cards' || lower === 'debit cards') {
    return CreditCard;
  }
  if (lower === 'safes' || lower === 'safe' || lower === 'vault' || lower === 'pin') {
    return Shield;
  }
  if (lower === 'finance' || lower === 'banking' || lower === 'crypto' || lower === 'money') {
    return DollarSign;
  }
  if (lower === 'social' || lower === 'media' || lower === 'chat') {
    return Share2;
  }
  if (lower === 'work' || lower === 'business' || lower === 'office') {
    return Briefcase;
  }
  if (lower === 'entertainment' || lower === 'movies' || lower === 'music' || lower === 'gaming') {
    return Film;
  }
  if (lower === 'shopping' || lower === 'ecommerce' || lower === 'store') {
    return ShoppingBag;
  }
  if (lower === 'general') {
    return Folder;
  }
  if (lower === 'other' || lower === 'misc' || lower === 'miscellaneous') {
    return Layers;
  }

  return Tag;
}

const PRESET_STYLES: Record<string, CategoryVisual> = {
  General: {
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    dotClass: 'bg-slate-400',
    accentColor: '#94a3b8',
    activeClass: 'bg-slate-600 text-white border-slate-400 shadow-md shadow-slate-900/30',
    isSafe: false,
  },
  'API Keys': {
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/40',
    dotClass: 'bg-amber-400',
    accentColor: '#f59e0b',
    activeClass: 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/30',
    isSafe: false,
    isApiKey: true,
  },
  OAuth: {
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-950/40',
    dotClass: 'bg-indigo-400',
    accentColor: '#818cf8',
    activeClass: 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/30',
    isSafe: false,
    isOAuth: true,
  },
  Social: {
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-400',
    accentColor: '#c084fc',
    activeClass: 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/30',
    isSafe: false,
  },
  Finance: {
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    accentColor: '#34d399',
    activeClass: 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/30',
    isSafe: false,
  },
  'ATM Cards': {
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/40',
    dotClass: 'bg-emerald-400',
    accentColor: '#10b981',
    activeClass: 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/30',
    isSafe: false,
    isCard: true,
  },
  Work: {
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400',
    accentColor: '#38bdf8',
    activeClass: 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/30',
    isSafe: false,
  },
  Entertainment: {
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
    accentColor: '#fb7185',
    activeClass: 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/30',
    isSafe: false,
  },
  Shopping: {
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    accentColor: '#fbbf24',
    activeClass: 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/30',
    isSafe: false,
  },
  Safes: {
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
    accentColor: '#f59e0b',
    activeClass: 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/30',
    isSafe: true,
  },
  Other: {
    badgeClass: 'bg-white/5 text-white/60 border-white/10',
    dotClass: 'bg-white/40',
    accentColor: '#cbd5e1',
    activeClass: 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/30',
    isSafe: false,
  },
};

export interface OAuthProviderPreset {
  id: string;
  name: string;
  providerKey: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  iconName: string;
  defaultAuthUrl?: string;
  defaultTokenUrl?: string;
  defaultScopes?: string;
  defaultGrantType?: string;
  defaultRedirectUri?: string;
  websiteUrl?: string;
  description: string;
}

export const POPULAR_OAUTH_PROVIDERS: OAuthProviderPreset[] = [
  {
    id: 'google',
    name: 'Google Cloud / Google OAuth',
    providerKey: 'Google',
    badgeBg: 'bg-red-500/15 border-red-500/30',
    badgeText: 'text-red-300',
    accentColor: '#4285F4',
    iconName: 'google',
    defaultAuthUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    defaultTokenUrl: 'https://oauth2.googleapis.com/token',
    defaultScopes: 'openid email profile',
    defaultGrantType: 'Authorization Code (PKCE)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/google',
    websiteUrl: 'https://console.cloud.google.com/apis/credentials',
    description: 'Google Identity Services & Cloud APIs',
  },
  {
    id: 'github',
    name: 'GitHub OAuth App',
    providerKey: 'GitHub',
    badgeBg: 'bg-slate-700/40 border-slate-500/40',
    badgeText: 'text-slate-200',
    accentColor: '#24292e',
    iconName: 'github',
    defaultAuthUrl: 'https://github.com/login/oauth/authorize',
    defaultTokenUrl: 'https://github.com/login/oauth/access_token',
    defaultScopes: 'read:user user:email repo',
    defaultGrantType: 'Authorization Code',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/github',
    websiteUrl: 'https://github.com/settings/developers',
    description: 'GitHub API & Developer Integrations',
  },
  {
    id: 'discord',
    name: 'Discord Developer Application',
    providerKey: 'Discord',
    badgeBg: 'bg-indigo-600/20 border-indigo-500/40',
    badgeText: 'text-indigo-300',
    accentColor: '#5865F2',
    iconName: 'discord',
    defaultAuthUrl: 'https://discord.com/api/oauth2/authorize',
    defaultTokenUrl: 'https://discord.com/api/oauth2/token',
    defaultScopes: 'identify email guilds bot',
    defaultGrantType: 'Authorization Code (Bot/User)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/discord',
    websiteUrl: 'https://discord.com/developers/applications',
    description: 'Discord Bot & User API Access',
  },
  {
    id: 'slack',
    name: 'Slack App / Bot',
    providerKey: 'Slack',
    badgeBg: 'bg-fuchsia-600/20 border-fuchsia-500/40',
    badgeText: 'text-fuchsia-300',
    accentColor: '#4A154B',
    iconName: 'slack',
    defaultAuthUrl: 'https://slack.com/oauth/v2/authorize',
    defaultTokenUrl: 'https://slack.com/api/oauth.v2.access',
    defaultScopes: 'chat:write commands channels:read',
    defaultGrantType: 'Authorization Code',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/slack',
    websiteUrl: 'https://api.slack.com/apps',
    description: 'Slack Workspace & Bot Webhooks',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Entra ID (Azure AD)',
    providerKey: 'Microsoft',
    badgeBg: 'bg-sky-600/20 border-sky-500/40',
    badgeText: 'text-sky-300',
    accentColor: '#00A4EF',
    iconName: 'microsoft',
    defaultAuthUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    defaultTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    defaultScopes: 'openid profile email User.Read offline_access',
    defaultGrantType: 'Authorization Code (PKCE)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/microsoft',
    websiteUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps',
    description: 'Microsoft Graph & Azure Cloud',
  },
  {
    id: 'auth0',
    name: 'Auth0 / Okta App',
    providerKey: 'Auth0',
    badgeBg: 'bg-orange-600/20 border-orange-500/40',
    badgeText: 'text-orange-300',
    accentColor: '#EB5424',
    iconName: 'auth0',
    defaultAuthUrl: 'https://YOUR_DOMAIN.auth0.com/authorize',
    defaultTokenUrl: 'https://YOUR_DOMAIN.auth0.com/oauth/token',
    defaultScopes: 'openid profile email offline_access',
    defaultGrantType: 'Authorization Code (PKCE)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/auth0',
    websiteUrl: 'https://manage.auth0.com',
    description: 'Universal Identity & M2M Clients',
  },
  {
    id: 'stripe',
    name: 'Stripe Connect / OAuth',
    providerKey: 'Stripe',
    badgeBg: 'bg-violet-600/20 border-violet-500/40',
    badgeText: 'text-violet-300',
    accentColor: '#635BFF',
    iconName: 'stripe',
    defaultAuthUrl: 'https://connect.stripe.com/oauth/authorize',
    defaultTokenUrl: 'https://connect.stripe.com/oauth/token',
    defaultScopes: 'read_write',
    defaultGrantType: 'Authorization Code',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/stripe',
    websiteUrl: 'https://dashboard.stripe.com/settings/connect',
    description: 'Stripe Connect Accounts & Payments',
  },
  {
    id: 'spotify',
    name: 'Spotify Developer App',
    providerKey: 'Spotify',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentColor: '#1DB954',
    iconName: 'spotify',
    defaultAuthUrl: 'https://accounts.spotify.com/authorize',
    defaultTokenUrl: 'https://accounts.spotify.com/api/token',
    defaultScopes: 'user-read-private user-read-email streaming',
    defaultGrantType: 'Authorization Code (PKCE)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback/spotify',
    websiteUrl: 'https://developer.spotify.com/dashboard',
    description: 'Spotify Web API & Playback SDK',
  },
  {
    id: 'custom',
    name: 'Custom OAuth 2.0 / OIDC',
    providerKey: 'OAuth 2.0',
    badgeBg: 'bg-indigo-600/20 border-indigo-500/40',
    badgeText: 'text-indigo-300',
    accentColor: '#8B5CF6',
    iconName: 'key',
    defaultScopes: 'openid profile email',
    defaultGrantType: 'Authorization Code (PKCE)',
    defaultRedirectUri: 'http://localhost:3000/api/auth/callback',
    description: 'Custom OAuth 2.0 / OpenID Connect Client',
  },
];

export interface ApiKeyProviderPreset {
  id: string;
  name: string;
  providerKey: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  iconName: string;
  defaultHeaderPrefix: string; // e.g. 'Bearer', 'ApiKey', 'X-API-Key'
  keyPrefixHint: string;        // e.g. 'sk-...', 'sk-ant-...', 'AIzaSy...'
  websiteUrl: string;
  description: string;
  sampleKeyName: string;
}

export const POPULAR_API_PROVIDERS: ApiKeyProviderPreset[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter API',
    providerKey: 'OpenRouter',
    badgeBg: 'bg-indigo-600/20 border-indigo-500/40',
    badgeText: 'text-indigo-300',
    accentColor: '#6366f1',
    iconName: 'openrouter',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'sk-or-v1-...',
    websiteUrl: 'https://openrouter.ai/keys',
    description: 'Unified AI Gateway for Claude, GPT-4, Llama 3, DeepSeek',
    sampleKeyName: 'OpenRouter Production Key',
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    providerKey: 'OpenAI',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentColor: '#10a37f',
    iconName: 'openai',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'sk-proj-... / sk-...',
    websiteUrl: 'https://platform.openai.com/api-keys',
    description: 'GPT-4o, DALL-E, Whisper, Embeddings',
    sampleKeyName: 'Production Backend Key',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude API',
    providerKey: 'Anthropic',
    badgeBg: 'bg-amber-600/20 border-amber-500/40',
    badgeText: 'text-amber-300',
    accentColor: '#d97706',
    iconName: 'anthropic',
    defaultHeaderPrefix: 'x-api-key',
    keyPrefixHint: 'sk-ant-api03-...',
    websiteUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    sampleKeyName: 'Claude Agent API Key',
  },
  {
    id: 'gemini',
    name: 'Google AI Studio / Gemini',
    providerKey: 'Gemini',
    badgeBg: 'bg-blue-600/20 border-blue-500/40',
    badgeText: 'text-blue-300',
    accentColor: '#3b82f6',
    iconName: 'google',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'AIzaSy...',
    websiteUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Gemini 2.5 Pro, Flash, Live Multimodal API',
    sampleKeyName: 'Gemini Flash Production Key',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    providerKey: 'DeepSeek',
    badgeBg: 'bg-sky-600/20 border-sky-500/40',
    badgeText: 'text-sky-300',
    accentColor: '#0284c7',
    iconName: 'deepseek',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'sk-...',
    websiteUrl: 'https://platform.deepseek.com/api_keys',
    description: 'DeepSeek-V3 & DeepSeek-R1 Reasoning Models',
    sampleKeyName: 'DeepSeek R1 Key',
  },
  {
    id: 'groq',
    name: 'Groq Cloud LPU',
    providerKey: 'Groq',
    badgeBg: 'bg-orange-600/20 border-orange-500/40',
    badgeText: 'text-orange-300',
    accentColor: '#f97316',
    iconName: 'groq',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'gsk_...',
    websiteUrl: 'https://console.groq.com/keys',
    description: 'Ultra-fast Llama 3 / Mixtral Inference',
    sampleKeyName: 'Groq Llama 3.3 Key',
  },
  {
    id: 'stripe',
    name: 'Stripe API Keys',
    providerKey: 'Stripe',
    badgeBg: 'bg-violet-600/20 border-violet-500/40',
    badgeText: 'text-violet-300',
    accentColor: '#635bff',
    iconName: 'stripe',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'sk_live_... / sk_test_...',
    websiteUrl: 'https://dashboard.stripe.com/apikeys',
    description: 'Secret Key & Restricted API Access Tokens',
    sampleKeyName: 'Stripe Live Secret Key',
  },
  {
    id: 'supabase',
    name: 'Supabase Service Role / Anon',
    providerKey: 'Supabase',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentColor: '#3ecf8e',
    iconName: 'supabase',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'eyJhbGciOi...',
    websiteUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    description: 'Service Role Secret & JWT API Key',
    sampleKeyName: 'Supabase Service Role Secret',
  },
  {
    id: 'aws',
    name: 'AWS Access Key & Secret',
    providerKey: 'AWS',
    badgeBg: 'bg-amber-600/20 border-amber-500/40',
    badgeText: 'text-amber-300',
    accentColor: '#ff9900',
    iconName: 'aws',
    defaultHeaderPrefix: 'AWS4-HMAC-SHA256',
    keyPrefixHint: 'AKIA... / Secret Key',
    websiteUrl: 'https://console.aws.amazon.com/iam',
    description: 'IAM User Programmatic Access Key',
    sampleKeyName: 'S3 Production Backup Key',
  },
  {
    id: 'resend',
    name: 'Resend Email API',
    providerKey: 'Resend',
    badgeBg: 'bg-zinc-700/40 border-zinc-500/40',
    badgeText: 'text-zinc-200',
    accentColor: '#ffffff',
    iconName: 'resend',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 're_...',
    websiteUrl: 'https://resend.com/api-keys',
    description: 'Transactional Email Sending API',
    sampleKeyName: 'Transactional Mail Key',
  },
  {
    id: 'github',
    name: 'GitHub Personal Access Token (PAT)',
    providerKey: 'GitHub',
    badgeBg: 'bg-slate-700/40 border-slate-500/40',
    badgeText: 'text-slate-200',
    accentColor: '#24292e',
    iconName: 'github',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'ghp_... / github_pat_...',
    websiteUrl: 'https://github.com/settings/tokens',
    description: 'GitHub CLI, GraphQL & REST API Token',
    sampleKeyName: 'CI/CD Deployment Token',
  },
  {
    id: 'custom',
    name: 'Custom Service API Key',
    providerKey: 'API Key',
    badgeBg: 'bg-amber-600/20 border-amber-500/40',
    badgeText: 'text-amber-300',
    accentColor: '#f59e0b',
    iconName: 'key',
    defaultHeaderPrefix: 'Bearer',
    keyPrefixHint: 'key_...',
    websiteUrl: '',
    description: 'Secret Key / Token for Custom Backend',
    sampleKeyName: 'Primary API Key',
  },
];

export const POPULAR_BANKS = [
  { name: 'Chase', country: 'US', color: '#117ACA' },
  { name: 'Bank of America', country: 'US', color: '#E31837' },
  { name: 'Wells Fargo', country: 'US', color: '#D71E28' },
  { name: 'Citibank', country: 'US', color: '#003B70' },
  { name: 'Capital One', country: 'US', color: '#004879' },
  { name: 'HSBC', country: 'Global', color: '#DB0011' },
  { name: 'Barclays', country: 'UK', color: '#00AEEF' },
  { name: 'Santander', country: 'Global', color: '#EC0000' },
  { name: 'Standard Chartered', country: 'Global', color: '#008559' },
  { name: 'DBS Bank', country: 'SG', color: '#FF3333' },
  { name: 'OCBC', country: 'SG', color: '#ED1C24' },
  { name: 'KBZ Bank', country: 'MM', color: '#005696' },
  { name: 'AYA Bank', country: 'MM', color: '#ED1C24' },
  { name: 'CB Bank', country: 'MM', color: '#F15A24' },
  { name: 'Yoma Bank', country: 'MM', color: '#D32F2F' },
  { name: 'Revolut', country: 'Fintech', color: '#0075EB' },
  { name: 'Monzo', country: 'Fintech', color: '#FF365D' },
  { name: 'Wise', country: 'Fintech', color: '#9FE870' },
  { name: 'Apple Card / Goldman', country: 'US', color: '#F5F5F7' },
];

export const CARD_NETWORKS = [
  { id: 'Visa', label: 'Visa', symbol: 'VISA', color: '#1A1F71' },
  { id: 'Mastercard', label: 'Mastercard', symbol: 'MC', color: '#EB001B' },
  { id: 'American Express', label: 'Amex', symbol: 'AMEX', color: '#006FCF' },
  { id: 'JCB', label: 'JCB', symbol: 'JCB', color: '#0E4E96' },
  { id: 'UnionPay', label: 'UnionPay', symbol: 'UPI', color: '#007B83' },
  { id: 'Discover', label: 'Discover', symbol: 'DISC', color: '#FF6000' },
];

export interface CardColorOption {
  id: string;
  label: string;
  desc: string;
  bgGradient: string;
  borderClass: string;
  textColor: string;
  chipColor: string;
  previewBg: string;
}

export const CARD_COLORS: CardColorOption[] = [
  {
    id: 'Obsidian Black',
    label: 'Obsidian Black',
    desc: 'Metallic Dark Titanium',
    bgGradient: 'from-[#111318] via-[#1a1d24] to-[#0d0f14]',
    borderClass: 'border-slate-700/60 shadow-slate-950/80',
    textColor: 'text-white',
    chipColor: 'from-amber-300 via-amber-400 to-amber-600',
    previewBg: 'bg-slate-900 border-slate-700',
  },
  {
    id: 'Midnight Navy',
    label: 'Midnight Navy',
    desc: 'Deep Sapphire Blue',
    bgGradient: 'from-[#0a192f] via-[#112240] to-[#061120]',
    borderClass: 'border-sky-700/50 shadow-sky-950/80',
    textColor: 'text-sky-100',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-blue-950 border-blue-700',
  },
  {
    id: '24K Royal Gold',
    label: '24K Royal Gold',
    desc: 'Pure Gold Brushed Metal',
    bgGradient: 'from-[#422006] via-[#78350f] to-[#451a03]',
    borderClass: 'border-amber-500/60 shadow-amber-950/80',
    textColor: 'text-amber-100',
    chipColor: 'from-amber-100 via-amber-300 to-amber-500',
    previewBg: 'bg-amber-900 border-amber-500',
  },
  {
    id: 'Emerald Platinum',
    label: 'Emerald Platinum',
    desc: 'Rich Forest Emerald',
    bgGradient: 'from-[#022c22] via-[#064e3b] to-[#02221c]',
    borderClass: 'border-emerald-600/50 shadow-emerald-950/80',
    textColor: 'text-emerald-100',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-emerald-950 border-emerald-600',
  },
  {
    id: 'Crimson Velvet',
    label: 'Crimson Velvet',
    desc: 'Deep Ruby Wine',
    bgGradient: 'from-[#450a0a] via-[#7f1d1d] to-[#360808]',
    borderClass: 'border-red-600/50 shadow-red-950/80',
    textColor: 'text-red-100',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-red-950 border-red-600',
  },
  {
    id: 'Titanium Silver',
    label: 'Titanium Silver',
    desc: 'Brushed Steel Minimal',
    bgGradient: 'from-[#334155] via-[#475569] to-[#1e293b]',
    borderClass: 'border-slate-400/50 shadow-slate-950/80',
    textColor: 'text-slate-100',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-slate-700 border-slate-400',
  },
  {
    id: 'Rose Gold Luxe',
    label: 'Rose Gold Luxe',
    desc: 'Metallic Rose Gold',
    bgGradient: 'from-[#4c0519] via-[#831843] to-[#3a0413]',
    borderClass: 'border-rose-500/50 shadow-rose-950/80',
    textColor: 'text-rose-100',
    chipColor: 'from-rose-200 via-amber-300 to-rose-400',
    previewBg: 'bg-rose-950 border-rose-500',
  },
  {
    id: 'Cyberpunk Neon',
    label: 'Cyberpunk Neon',
    desc: 'Vibrant Cyan & Purple',
    bgGradient: 'from-[#1e1b4b] via-[#311042] to-[#0f172a]',
    borderClass: 'border-cyan-500/60 shadow-cyan-950/80',
    textColor: 'text-cyan-100',
    chipColor: 'from-cyan-300 via-cyan-400 to-purple-400',
    previewBg: 'bg-indigo-950 border-cyan-500',
  },
  {
    id: 'Deep Ocean Teal',
    label: 'Deep Ocean Teal',
    desc: 'Aquamarine Shimmer',
    bgGradient: 'from-[#042f2e] via-[#115e59] to-[#03201f]',
    borderClass: 'border-teal-500/50 shadow-teal-950/80',
    textColor: 'text-teal-100',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-teal-950 border-teal-500',
  },
  {
    id: 'Nordic Slate',
    label: 'Nordic Slate',
    desc: 'Dark Minimalist Matte',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#090d16]',
    borderClass: 'border-slate-600/50 shadow-slate-950/80',
    textColor: 'text-slate-200',
    chipColor: 'from-amber-300 via-amber-400 to-amber-600',
    previewBg: 'bg-slate-800 border-slate-600',
  },
];

export function getCardColorStyle(colorName?: string): CardColorOption {
  if (!colorName) return CARD_COLORS[0];
  const matched = CARD_COLORS.find(
    (c) => c.id.toLowerCase() === colorName.toLowerCase() || c.label.toLowerCase() === colorName.toLowerCase()
  );
  if (matched) return matched;

  // If custom color name or hex
  return {
    id: colorName,
    label: colorName,
    desc: 'Custom Theme',
    bgGradient: 'from-[#111318] via-[#1a1d24] to-[#0d0f14]',
    borderClass: 'border-sky-500/40 shadow-sky-950/60',
    textColor: 'text-white',
    chipColor: 'from-amber-200 via-amber-400 to-amber-500',
    previewBg: 'bg-slate-900 border-slate-700',
  };
}

const DYNAMIC_PALETTES: CategoryVisual[] = [
  { badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', dotClass: 'bg-cyan-400', accentColor: '#22d3ee', activeClass: 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/30', isSafe: false },
  { badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', dotClass: 'bg-indigo-400', accentColor: '#818cf8', activeClass: 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/30', isSafe: false },
  { badgeClass: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30', dotClass: 'bg-fuchsia-400', accentColor: '#e879f9', activeClass: 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-900/30', isSafe: false },
  { badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30', dotClass: 'bg-teal-400', accentColor: '#2dd4bf', activeClass: 'bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-900/30', isSafe: false },
  { badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30', dotClass: 'bg-orange-400', accentColor: '#fb923c', activeClass: 'bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-900/30', isSafe: false },
  { badgeClass: 'bg-lime-500/10 text-lime-300 border-lime-500/30', dotClass: 'bg-lime-400', accentColor: '#a3e635', activeClass: 'bg-lime-600 text-white border-lime-400 shadow-md shadow-lime-900/30', isSafe: false },
  { badgeClass: 'bg-pink-500/10 text-pink-300 border-pink-500/30', dotClass: 'bg-pink-400', accentColor: '#f472b6', activeClass: 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-900/30', isSafe: false },
  { badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30', dotClass: 'bg-blue-400', accentColor: '#60a5fa', activeClass: 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30', isSafe: false },
];

export function getCategoryVisual(
  categoryName: string,
  customFlows?: Record<string, CategoryFlowType>
): CategoryVisual {
  if (!categoryName) return PRESET_STYLES['General'];
  
  if (PRESET_STYLES[categoryName]) {
    return PRESET_STYLES[categoryName];
  }

  const presetKey = Object.keys(PRESET_STYLES).find(
    (k) => k.toLowerCase() === categoryName.toLowerCase()
  );
  if (presetKey) {
    return PRESET_STYLES[presetKey];
  }

  const flow = getCategoryFlow(categoryName, customFlows);

  // Generate deterministic index for custom categories
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = (hash << 5) - hash + categoryName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DYNAMIC_PALETTES.length;
  const baseVisual = DYNAMIC_PALETTES[index];

  return {
    ...baseVisual,
    isSafe: flow === 'safes',
    isCard: flow === 'atm_card',
    isOAuth: flow === 'oauth',
    isApiKey: flow === 'api_key',
  };
}
