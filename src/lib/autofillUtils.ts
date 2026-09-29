import { DecryptedPasswordEntry } from '../types';

export interface ServiceAutoFillConfig {
  id: string;
  name: string;
  domain: string;
  loginUrl: string;
  brandColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  aliases: string[];
}

export const KNOWN_SERVICES: ServiceAutoFillConfig[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    domain: 'netflix.com',
    loginUrl: 'https://www.netflix.com/login',
    brandColor: '#E50914',
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/30',
    aliases: ['netflix', 'netflix.com', 'net flix'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    domain: 'spotify.com',
    loginUrl: 'https://accounts.spotify.com/en/login',
    brandColor: '#1DB954',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    aliases: ['spotify', 'spotify.com', 'spotify music'],
  },
  {
    id: 'gmail',
    name: 'Gmail / Google',
    domain: 'google.com',
    loginUrl: 'https://accounts.google.com/signin',
    brandColor: '#4285F4',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    aliases: ['gmail', 'google', 'google.com', 'gmail.com', 'google mail', 'gsuite', 'google workspace'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    loginUrl: 'https://www.amazon.com/ap/signin',
    brandColor: '#FF9900',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    aliases: ['amazon', 'amazon.com', 'amazon prime', 'aws'],
  },
  {
    id: 'github',
    name: 'GitHub',
    domain: 'github.com',
    loginUrl: 'https://github.com/login',
    brandColor: '#2ea44f',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    aliases: ['github', 'github.com', 'gh'],
  },
  {
    id: 'disneyplus',
    name: 'Disney+',
    domain: 'disneyplus.com',
    loginUrl: 'https://www.disneyplus.com/login',
    brandColor: '#113CCF',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/30',
    aliases: ['disney', 'disney+', 'disneyplus', 'disney plus', 'disneyplus.com'],
  },
  {
    id: 'apple',
    name: 'Apple ID / iCloud',
    domain: 'apple.com',
    loginUrl: 'https://appleid.apple.com/sign-in',
    brandColor: '#A2AAAD',
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-500/30',
    aliases: ['apple', 'apple id', 'icloud', 'apple.com', 'itunes'],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    domain: 'x.com',
    loginUrl: 'https://x.com/i/flow/login',
    brandColor: '#1DA1F2',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    aliases: ['twitter', 'x', 'x.com', 'twitter.com'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft / Outlook',
    domain: 'microsoft.com',
    loginUrl: 'https://login.microsoftonline.com/',
    brandColor: '#00A4EF',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/30',
    aliases: ['microsoft', 'outlook', 'office365', 'hotmail', 'live.com', 'azure'],
  },
  {
    id: 'steam',
    name: 'Steam',
    domain: 'steampowered.com',
    loginUrl: 'https://store.steampowered.com/login/',
    brandColor: '#171a21',
    badgeBg: 'bg-slate-700/20',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/30',
    aliases: ['steam', 'steampowered', 'steampowered.com', 'steamcommunity.com', 'steamcommunity', 'valve'],
  },
  {
    id: '1xbet',
    name: '1xBet',
    domain: '1xbet.com',
    loginUrl: 'https://1xbet.com',
    brandColor: '#1C6BB0',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/30',
    aliases: ['1xbet', '1x-bet', '1xbet.com', '1xbet.ng', '1xbet.mobi', '1xbet.co.ke', '1xbet.in', '1xbet.ph', '1x_bet'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI',
    domain: 'openai.com',
    loginUrl: 'https://chatgpt.com/auth/login',
    brandColor: '#10a37f',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    aliases: ['chatgpt', 'openai', 'chat.openai.com', 'chatgpt.com'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    domain: 'facebook.com',
    loginUrl: 'https://www.facebook.com/login',
    brandColor: '#1877F2',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    aliases: ['facebook', 'meta', 'facebook.com', 'fb'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    loginUrl: 'https://www.linkedin.com/login',
    brandColor: '#0A66C2',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    aliases: ['linkedin', 'linkedin.com'],
  },
  {
    id: 'discord',
    name: 'Discord',
    domain: 'discord.com',
    loginUrl: 'https://discord.com/login',
    brandColor: '#5865F2',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/30',
    aliases: ['discord', 'discord.com', 'discordapp'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    domain: 'paypal.com',
    loginUrl: 'https://www.paypal.com/signin',
    brandColor: '#003087',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    aliases: ['paypal', 'paypal.com'],
  },
];

/**
 * Safely extracts hostname / domain from a website URL string
 */
export function extractDomainFromUrl(url: string): string {
  if (!url || !url.trim()) return '';
  let cleaned = url.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    const rawHost = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
    return rawHost.replace(/^www\./i, '').toLowerCase();
  }
}

/**
 * Checks if a given service alias matches the user input service name
 */
function isAliasMatch(serviceName: string, alias: string): boolean {
  const cleanName = serviceName.trim().toLowerCase();
  const cleanAlias = alias.trim().toLowerCase();

  // Exact match
  if (cleanName === cleanAlias) return true;

  // For very short aliases (e.g. 'x', 'gh', 'fb', 'aws'), ONLY match exact string or discrete words
  if (cleanAlias.length <= 3) {
    const regex = new RegExp(`(^|[\\s._\\-/@])${cleanAlias}([\\s._\\-/@]|$)`, 'i');
    return regex.test(cleanName);
  }

  // For longer aliases (e.g. 'netflix', 'spotify', 'gmail'), match word boundaries or inclusion
  if (cleanName.includes(cleanAlias)) {
    return true;
  }

  return false;
}

/**
 * Resolves a service name or URL to its known configuration or creates a normalized URL
 */
export function resolveServiceAutoFill(serviceName: string = '', websiteUrl: string = ''): {
  matchedConfig: ServiceAutoFillConfig | null;
  targetUrl: string;
  displayName: string;
  isKnownService: boolean;
  domain: string;
} {
  const trimmedName = (serviceName || '').trim();
  const trimmedUrl = (websiteUrl || '').trim();
  const domainFromUrl = extractDomainFromUrl(trimmedUrl);

  // 1. If websiteUrl is provided, match by DOMAIN first
  if (domainFromUrl) {
    const matchedByDomain = KNOWN_SERVICES.find((service) => {
      return domainFromUrl === service.domain || domainFromUrl.endsWith('.' + service.domain);
    });

    if (matchedByDomain) {
      // User entered a URL belonging to a known service (e.g. mail.google.com or netflix.com)
      let target = matchedByDomain.loginUrl;
      // If user typed a custom full login path, respect their URL
      if (trimmedUrl.includes('/login') || trimmedUrl.includes('/signin') || trimmedUrl.includes('/auth') || trimmedUrl.includes('/app')) {
        target = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
      }
      return {
        matchedConfig: matchedByDomain,
        targetUrl: target,
        displayName: trimmedName || matchedByDomain.name,
        isKnownService: true,
        domain: domainFromUrl,
      };
    }

    // Website URL is a custom/other website (e.g. 1xbet.com, mybank.com)
    // DO NOT falsely override with Twitter/X or other known service!
    let normalized = trimmedUrl;
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    return {
      matchedConfig: null,
      targetUrl: normalized,
      displayName: trimmedName || domainFromUrl,
      isKnownService: false,
      domain: domainFromUrl,
    };
  }

  // 2. If websiteUrl was NOT provided, match by serviceName against known presets
  if (trimmedName) {
    const matchedByName = KNOWN_SERVICES.find((service) => {
      return service.aliases.some((alias) => isAliasMatch(trimmedName, alias));
    });

    if (matchedByName) {
      return {
        matchedConfig: matchedByName,
        targetUrl: matchedByName.loginUrl,
        displayName: matchedByName.name,
        isKnownService: true,
        domain: matchedByName.domain,
      };
    }
  }

  // 3. Fallback for custom entries without matching preset and without URL
  return {
    matchedConfig: null,
    targetUrl: '',
    displayName: trimmedName || 'Website',
    isKnownService: false,
    domain: '',
  };
}

/**
 * Attempts modern Web Credential Management API registration for browser autofill
 */
export async function registerBrowserCredential(entry: DecryptedPasswordEntry): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return false;
  }

  try {
    if ('PasswordCredential' in window && (window as any).PasswordCredential && entry.decryptedPassword) {
      const cred = new (window as any).PasswordCredential({
        id: entry.username || 'user',
        password: entry.decryptedPassword,
        name: entry.serviceName,
      });
      await navigator.credentials.store(cred);
      return true;
    }
  } catch (err) {
    // Silently continue if browser sandboxing or security policies disallow credential storage
    console.debug('Credential Management API note:', err);
  }
  return false;
}

/**
 * Helper to match an entry's domain or websiteUrl against an active browser hostname
 */
export function isDomainMatch(entryDomainOrUrl: string, currentHostname: string): boolean {
  if (!entryDomainOrUrl || !currentHostname) return false;
  const cleanEntryDomain = extractDomainFromUrl(entryDomainOrUrl) || entryDomainOrUrl.trim().toLowerCase().replace(/^www\./i, '');
  const cleanCurrentHost = currentHostname.trim().toLowerCase().replace(/^www\./i, '');

  if (cleanCurrentHost === cleanEntryDomain) return true;
  if (cleanCurrentHost.endsWith('.' + cleanEntryDomain)) return true;
  if (cleanEntryDomain.endsWith('.' + cleanCurrentHost)) return true;

  // Google / Gmail cross-alias handling (e.g. gmail.com on accounts.google.com)
  const isGoogleHost = cleanCurrentHost.includes('google.') || cleanCurrentHost.includes('gmail.');
  const isGoogleEntry = cleanEntryDomain.includes('google.') || cleanEntryDomain.includes('gmail.');
  if (isGoogleHost && isGoogleEntry) return true;

  // Steam cross-domain handling (store.steampowered.com and steamcommunity.com)
  const isSteamHost = cleanCurrentHost.includes('steampowered.') || cleanCurrentHost.includes('steamcommunity.') || cleanCurrentHost.includes('steam');
  const isSteamEntry = cleanEntryDomain.includes('steampowered.') || cleanEntryDomain.includes('steamcommunity.') || cleanEntryDomain.includes('steam');
  if (isSteamHost && isSteamEntry) return true;

  // 1xBet mirror & cross-domain handling (1xbet.com, 1xbet.ng, 1xbet.mobi, 1x-bet, etc.)
  const is1xHost = cleanCurrentHost.includes('1xbet') || cleanCurrentHost.includes('1x-bet') || cleanCurrentHost.includes('1x_bet');
  const is1xEntry = cleanEntryDomain.includes('1xbet') || cleanEntryDomain.includes('1x-bet') || cleanEntryDomain.includes('1x_bet');
  if (is1xHost && is1xEntry) return true;

  return false;
}

/**
 * Generates an isolated, non-intrusive Shadow DOM bookmarklet with active-URL domain inspection,
 * zero `#` hash collisions, pure DOM tree construction (100% TrustedHTML immune), and multi-account selection.
 */
export function getAutoFillBookmarkletCode(entries: DecryptedPasswordEntry[] = []): string {
  const payload: Array<{ s: string; u: string; p: string; d: string; w: string }> = [];

  if (Array.isArray(entries)) {
    for (const e of entries) {
      if (!e || typeof e !== 'object') continue;
      const u = typeof e.username === 'string' ? e.username : '';
      const p = typeof e.decryptedPassword === 'string' ? e.decryptedPassword : '';
      if (!u && !p) continue;

      const s = typeof e.serviceName === 'string' ? e.serviceName : 'Account';
      const w = typeof e.websiteUrl === 'string' ? e.websiteUrl : '';
      const autoInfo = resolveServiceAutoFill(s, w);
      const domain = autoInfo.domain || extractDomainFromUrl(w) || s.trim().toLowerCase();

      payload.push({
        s: s.slice(0, 100),
        u: u.slice(0, 100),
        p: p.slice(0, 100),
        d: domain.replace(/^www\./i, '').toLowerCase().slice(0, 100),
        w: w.slice(0, 200),
      });
    }
  }

  let encodedData = '';
  try {
    if (typeof btoa !== 'undefined' && payload.length > 0) {
      const jsonStr = JSON.stringify(payload);
      encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    }
  } catch (err) {
    console.warn('AutoFill bookmarklet serialization notice:', err);
    encodedData = '';
  }

  const scriptContent = `(function(){
  try {
    var existingHost = document.getElementById('hvault-shadow-host');
    if (existingHost) { existingHost.remove(); return; }

    var rawData = '${encodedData}';
    var vaultData = [];
    if (rawData) {
      try {
        vaultData = JSON.parse(decodeURIComponent(escape(atob(rawData))));
      } catch(e) {}
    }

    function cleanHost(h) {
      if (!h) return '';
      h = h.toLowerCase();
      if (h.indexOf('www.') === 0) h = h.substring(4);
      return h;
    }

    var currHost = cleanHost(window.location.hostname || '');

    function matchService(entryD, entryW, host) {
      if (!host) return false;
      var d = cleanHost(entryD || '');
      var w = cleanHost((entryW || '').replace('https://','').replace('http://','').split('/')[0].split('?')[0]);

      if (d && (host === d || host.indexOf('.' + d) !== -1 || d.indexOf('.' + host) !== -1 || host.indexOf(d) !== -1)) return true;
      if (w && (host === w || host.indexOf('.' + w) !== -1 || w.indexOf('.' + host) !== -1 || host.indexOf(w) !== -1)) return true;

      var isGHost = host.indexOf('google.') !== -1 || host.indexOf('gmail.') !== -1;
      var isGEntry = (d.indexOf('google.') !== -1 || d.indexOf('gmail.') !== -1 || w.indexOf('google.') !== -1 || w.indexOf('gmail.') !== -1);
      if (isGHost && isGEntry) return true;

      var isSHost = host.indexOf('steampowered.') !== -1 || host.indexOf('steamcommunity.') !== -1 || host.indexOf('steam') !== -1;
      var isSEntry = (d.indexOf('steampowered.') !== -1 || d.indexOf('steamcommunity.') !== -1 || d.indexOf('steam') !== -1 || w.indexOf('steampowered.') !== -1 || w.indexOf('steamcommunity.') !== -1 || w.indexOf('steam') !== -1);
      if (isSHost && isSEntry) return true;

      var is1xHost = host.indexOf('1xbet') !== -1 || host.indexOf('1x-bet') !== -1 || host.indexOf('1x_bet') !== -1;
      var is1xEntry = (d.indexOf('1xbet') !== -1 || d.indexOf('1x-bet') !== -1 || d.indexOf('1x_bet') !== -1 || w.indexOf('1xbet') !== -1 || w.indexOf('1x-bet') !== -1 || w.indexOf('1x_bet') !== -1);
      if (is1xHost && is1xEntry) return true;

      return false;
    }

    var matches = vaultData.filter(function(item){
      return matchService(item.d, item.w, currHost);
    });

    var displayAccounts = matches.length > 0 ? matches : vaultData;

    function isIgnored(el) {
      if (!el) return true;
      var t = (el.type || '').toLowerCase();
      if (t === 'hidden' || t === 'submit' || t === 'button' || t === 'checkbox' || t === 'radio' || t === 'search' || t === 'file' || t === 'range' || t === 'color') return true;
      if (el.disabled || el.readOnly) return true;
      try {
        var st = window.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return true;
      } catch(e){}
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0 && !el.offsetParent) return true;
      var attrStr = ((el.id || '') + ' ' + (el.name || '') + ' ' + (el.className || '') + ' ' + (el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
      if (attrStr.indexOf('search') !== -1 || attrStr.indexOf('promo') !== -1 || attrStr.indexOf('coupon') !== -1) return true;
      return false;
    }

    function deepCollect(root, selector) {
      var res = [];
      if (!root) return res;
      try {
        var direct = root.querySelectorAll(selector);
        for (var i = 0; i < direct.length; i++) res.push(direct[i]);
      } catch(e){}
      try {
        var all = root.querySelectorAll('*');
        for (var j = 0; j < all.length; j++) {
          if (all[j].shadowRoot) {
            var sRes = deepCollect(all[j].shadowRoot, selector);
            res = res.concat(sRes);
          }
        }
      } catch(e){}
      try {
        var ifs = root.querySelectorAll('iframe');
        for (var k = 0; k < ifs.length; k++) {
          try {
            var doc = ifs[k].contentDocument || (ifs[k].contentWindow && ifs[k].contentWindow.document);
            if (doc) {
              var iRes = deepCollect(doc, selector);
              res = res.concat(iRes);
            }
          } catch(corsErr){}
        }
      } catch(e){}
      return res;
    }

    function findInputs() {
      var modalSelectors = '[role="dialog"], [aria-modal="true"], .modal, .popup, [class*="auth-modal" i], [class*="login-modal" i], [class*="auth-popup" i], [class*="login-popup" i], [id*="auth_modal" i], [id*="login_modal" i], [class*="modal--auth" i], [class*="c-auth" i], [class*="b-auth" i], [class*="login-dialog" i], [class*="auth-dialog" i], [class*="header-auth" i], [class*="c-popup" i]';
      var modals = deepCollect(document, modalSelectors);
      for (var m = 0; m < modals.length; m++) {
        var mc = modals[m];
        var mcPass = mc.querySelector ? mc.querySelector('input[type="password"]:not([disabled])') : null;
        var mcUser = mc.querySelector ? mc.querySelector('input[autocomplete="username"], input[type="email"], input[name="username" i], input[name="login" i], input[name="auth_id" i], input[name="account_name" i], input[name="user" i], input[name="email" i], input[name*="user" i], input[name*="auth" i], input[id*="username" i], input[id*="account" i], input[id*="user" i], input[id*="email" i], input[placeholder*="ID" i], input[placeholder*="e-mail" i], input[placeholder*="email" i], input[placeholder*="login" i]') : null;
        if (!mcUser && mcPass && mc.querySelectorAll) {
          var mInputs = mc.querySelectorAll('input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
          for (var mi = 0; mi < mInputs.length; mi++) {
            if (!isIgnored(mInputs[mi])) { mcUser = mInputs[mi]; break; }
          }
        }
        if (mcPass || mcUser) return { uEl: mcUser, pEl: mcPass };
      }

      var allPass = deepCollect(document, 'input[type="password"]:not([disabled])');
      var p = null;
      for (var pi = 0; pi < allPass.length; pi++) {
        if (!isIgnored(allPass[pi])) { p = allPass[pi]; break; }
      }

      var u = null;
      if (p) {
        var container = p.closest ? p.closest('form, div[class*="login" i], div[class*="auth" i], div[class*="signin" i], div[id*="login" i], div[id*="auth" i], main, body') : p.parentElement;
        if (container) {
          u = container.querySelector ? container.querySelector('input[autocomplete="username"], input[type="email"], input[name="username" i], input[name="login" i], input[name="auth_id" i], input[name="account_name" i], input[name="user" i], input[name="email" i], input[name*="user" i], input[name*="auth" i], input[id*="username" i], input[id*="account" i], input[id*="user" i], input[id*="email" i], input[placeholder*="ID" i], input[placeholder*="e-mail" i], input[placeholder*="email" i], input[placeholder*="login" i]') : null;
          if (!u && container.querySelectorAll) {
            var cInputs = container.querySelectorAll('input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
            for (var ci = 0; ci < cInputs.length; ci++) {
              if (cInputs[ci] !== p && !isIgnored(cInputs[ci])) { u = cInputs[ci]; break; }
            }
          }
        }
      }

      if (!u) {
        var uCandidates = deepCollect(document, '[id="identifierId"], input[name="identifier"], input[autocomplete="username"], input[type="email"], input[name="account_name" i], input[name="username" i], input[name="login" i], input[name="auth_id" i], input[name="user" i], input[name="email" i], input[name*="user" i], input[id*="username" i], input[id*="account" i], input[id*="user" i], input[id*="email" i], input[placeholder*="ID" i], input[placeholder*="e-mail" i], input[placeholder*="email" i]');
        for (var ui = 0; ui < uCandidates.length; ui++) {
          if (!isIgnored(uCandidates[ui])) { u = uCandidates[ui]; break; }
        }
      }

      if (!p) {
        var gPass = deepCollect(document, '[id="Passwd"], input[name="Passwd"], input[name="password" i], input[type="password"]');
        for (var gpi = 0; gpi < gPass.length; gpi++) {
          if (!isIgnored(gPass[gpi])) { p = gPass[gpi]; break; }
        }
      }

      if (!u) {
        var allInps = deepCollect(document, 'input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
        for (var ai = 0; ai < allInps.length; ai++) {
          if (allInps[ai] !== p && !isIgnored(allInps[ai])) { u = allInps[ai]; break; }
        }
      }

      return { uEl: u, pEl: p };
    }

    function findTrigger() {
      var trs = deepCollect(document, 'button[class*="login" i], a[class*="login" i], button[id*="login" i], a[id*="login" i], [class*="auth__button" i], [class*="header-auth" i], [class*="auth-button" i], [class*="c-auth__login" i], [data-modal*="auth" i], [data-modal*="login" i], [data-test*="login" i], [data-testid*="login" i], [aria-label*="Log in" i], [aria-label*="Sign in" i], [title*="Log in" i], [title*="Sign in" i], [class*="c-btn--login" i]');
      for (var t = 0; t < trs.length; t++) {
        if (trs[t].offsetParent !== null || trs[t].getBoundingClientRect().width > 0) return trs[t];
      }
      return null;
    }

    function setVal(el, val) {
      if (!el || typeof val !== 'string') return;
      try { el.focus(); } catch(e){}
      var proto = window.HTMLInputElement ? window.HTMLInputElement.prototype : Object.getPrototypeOf(el);
      var desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) { desc.set.call(el, val); } else { el.value = val; }
      try { el.dispatchEvent(new Event('input', { bubbles: true, composed: true })); } catch(e){}
      try { el.dispatchEvent(new Event('change', { bubbles: true, composed: true })); } catch(e){}
      try { el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true })); } catch(e){}
      try { el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, composed: true })); } catch(e){}
      try { el.dispatchEvent(new Event('blur', { bubbles: true, composed: true })); } catch(e){}
      el.style.outline = '2px solid rgb(16,185,129)';
      el.style.boxShadow = '0 0 12px rgba(16,185,129,0.5)';
    }

    function copyVal(text, cb) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(cb).catch(function(){ fbCopy(text, cb); });
      } else {
        fbCopy(text, cb);
      }
    }

    function fbCopy(text, cb) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); } catch(e){}
      ta.remove();
      if (cb) cb();
    }

    function fillCreds(uVal, pVal, callback) {
      var tg = findInputs();
      var count = 0;
      if (uVal && tg.uEl) { setVal(tg.uEl, uVal); count++; }
      if (pVal && tg.pEl) { setVal(tg.pEl, pVal); count++; }

      if (count === 0) {
        var trg = findTrigger();
        if (trg) {
          try { trg.click(); } catch(e){}
          setTimeout(function(){
            var fresh = findInputs();
            var fCount = 0;
            if (uVal && fresh.uEl) { setVal(fresh.uEl, uVal); fCount++; }
            if (pVal && fresh.pEl) { setVal(fresh.pEl, pVal); fCount++; }
            if (callback) callback(fCount, fresh, true);
          }, 350);
          return;
        }
      }
      if (callback) callback(count, tg, false);
    }

    var host = document.createElement('div');
    host.id = 'hvault-shadow-host';
    host.style.cssText = 'all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;';
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = [
      '* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
      '.panel { width: 340px; max-width: calc(100vw - 32px); background: rgb(13, 20, 37); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 16px; box-shadow: 0 20px 45px rgba(0,0,0,0.85), 0 0 25px rgba(56,189,248,0.15); color: rgb(255, 255, 255); padding: 14px; font-size: 13px; line-height: 1.4; animation: hvFade 0.15s ease-out; }',
      '@keyframes hvFade { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }',
      '.header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 10px; }',
      '.brand { font-size: 13px; font-weight: 900; color: rgb(56, 189, 248); display: flex; align-items: center; gap: 6px; }',
      '.domain-badge { font-size: 10px; background: rgba(56, 189, 248, 0.12); color: rgb(125, 211, 252); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 2px 6px; font-weight: 700; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.close-btn { background: transparent; border: none; color: rgb(148, 163, 184); font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 6px; }',
      '.close-btn:hover { color: rgb(255, 255, 255); background: rgba(255,255,255,0.1); }',
      '.section-title { font-size: 11px; font-weight: 700; color: rgb(148, 163, 184); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }',
      '.account-list { display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; margin-bottom: 10px; }',
      '.account-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
      '.account-card:hover { background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.5); }',
      '.acc-info { overflow: hidden; flex: 1; }',
      '.acc-user { font-weight: 700; color: rgb(255, 255, 255); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.acc-label { font-size: 10px; color: rgb(148, 163, 184); }',
      '.acc-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }',
      '.fill-btn { font-size: 10px; font-weight: 800; background: rgb(2, 132, 199); color: rgb(255, 255, 255); border: none; padding: 5px 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; }',
      '.fill-btn:hover { background: rgb(3, 105, 161); }',
      '.copy-btn { font-size: 9px; font-weight: 700; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgb(226, 232, 240); padding: 4px 6px; border-radius: 6px; cursor: pointer; }',
      '.copy-btn:hover { background: rgba(56, 189, 248, 0.25); color: rgb(255,255,255); }',
      '.manual-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 10px; margin-top: 6px; }',
      '.inp { width: 100%; box-sizing: border-box; background: rgb(6, 11, 23); border: 1px solid rgb(51, 65, 85); border-radius: 6px; padding: 6px 8px; color: rgb(255, 255, 255); font-size: 12px; margin-top: 3px; outline: none; }',
      '.inp:focus { border-color: rgb(56, 189, 248); }',
      '.btn-action { width: 100%; box-sizing: border-box; background: rgb(2, 132, 199); color: rgb(255, 255, 255); border: none; border-radius: 8px; padding: 8px; font-weight: 800; font-size: 12px; cursor: pointer; margin-top: 8px; }',
      '.btn-action:hover { background: rgb(3, 105, 161); }',
      '.status { font-size: 11px; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; display: none; }',
      '.status.success { display: block; background: rgba(16, 185, 129, 0.15); color: rgb(52, 211, 153); border: 1px solid rgba(16, 185, 129, 0.3); }',
      '.status.warn { display: block; background: rgba(245, 158, 11, 0.15); color: rgb(251, 191, 36); border: 1px solid rgba(245, 158, 11, 0.3); }',
      '.empty-state { text-align: center; padding: 8px 4px; color: rgb(148, 163, 184); font-size: 12px; }'
    ].join('');
    shadow.appendChild(style);

    var panel = document.createElement('div');
    panel.className = 'panel';

    var header = document.createElement('div');
    header.className = 'header';

    var brand = document.createElement('div');
    brand.className = 'brand';
    var brandText = document.createElement('span');
    brandText.textContent = '🔒 hVault AutoFill';
    var domainBadge = document.createElement('span');
    domainBadge.className = 'domain-badge';
    domainBadge.textContent = currHost || 'Current Site';

    brand.appendChild(brandText);
    brand.appendChild(domainBadge);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close';
    closeBtn.onclick = function(){ host.remove(); };

    header.appendChild(brand);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var statusBox = document.createElement('div');
    statusBox.className = 'status';
    panel.appendChild(statusBox);

    function showStat(type, txt) {
      statusBox.className = 'status ' + type;
      statusBox.textContent = txt;
    }

    if (displayAccounts.length > 0) {
      var secTitle = document.createElement('div');
      secTitle.className = 'section-title';
      var titleText = document.createElement('span');
      titleText.textContent = matches.length > 0
        ? (matches.length > 1 ? 'Matching Accounts (' + matches.length + '):' : 'Matching Account:')
        : 'All Vault Accounts (' + displayAccounts.length + '):';
      secTitle.appendChild(titleText);
      panel.appendChild(secTitle);

      var accList = document.createElement('div');
      accList.className = 'account-list';

      displayAccounts.forEach(function(item){
        var card = document.createElement('div');
        card.className = 'account-card';

        var info = document.createElement('div');
        info.className = 'acc-info';
        var userText = document.createElement('div');
        userText.className = 'acc-user';
        userText.textContent = item.u || '(No Username)';
        var serviceText = document.createElement('div');
        serviceText.className = 'acc-label';
        serviceText.textContent = item.s;

        info.appendChild(userText);
        info.appendChild(serviceText);

        var actions = document.createElement('div');
        actions.className = 'acc-actions';

        var fillBtn = document.createElement('button');
        fillBtn.className = 'fill-btn';
        fillBtn.textContent = '⚡ Fill';
        fillBtn.onclick = function(e){
          e.stopPropagation();
          fillCreds(item.u, item.p, function(count, tg, wasTrig){
            if (count > 0) {
              showStat('success', (wasTrig ? '🚀 Opened Login & populated ' : '🎉 AutoFilled ') + (item.u || item.s) + ' (' + count + ' fields)');
              setTimeout(function(){ host.remove(); }, 1200);
            } else {
              var warnMsg = tg.uEl && !tg.pEl 
                ? '⚡ AutoFilled Email! Click "Next" on Google, then click Fill again for Password.'
                : '⚠️ Click "LOG IN" on the page popup first, then click Fill.';
              showStat('warn', warnMsg);
            }
          });
        };

        var copyUserBtn = document.createElement('button');
        copyUserBtn.className = 'copy-btn';
        copyUserBtn.textContent = '📋 User';
        copyUserBtn.title = 'Copy Username';
        copyUserBtn.onclick = function(e){
          e.stopPropagation();
          copyVal(item.u, function(){ showStat('success', '📋 Copied username to clipboard!'); });
        };

        var copyPassBtn = document.createElement('button');
        copyPassBtn.className = 'copy-btn';
        copyPassBtn.textContent = '🔑 Pass';
        copyPassBtn.title = 'Copy Password';
        copyPassBtn.onclick = function(e){
          e.stopPropagation();
          copyVal(item.p, function(){ showStat('success', '🔑 Copied password to clipboard!'); });
        };

        actions.appendChild(fillBtn);
        if (item.u) actions.appendChild(copyUserBtn);
        if (item.p) actions.appendChild(copyPassBtn);

        card.appendChild(info);
        card.appendChild(actions);
        accList.appendChild(card);
      });

      panel.appendChild(accList);
    } else {
      var emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No accounts stored in vault yet.';
      panel.appendChild(emptyState);
    }

    var manualBox = document.createElement('div');
    manualBox.className = 'manual-box';

    var manualHeader = document.createElement('div');
    manualHeader.style.display = 'flex';
    manualHeader.style.justifyContent = 'space-between';
    manualHeader.style.alignItems = 'center';

    var manualTitle = document.createElement('span');
    manualTitle.style.fontSize = '10px';
    manualTitle.style.fontWeight = '700';
    manualTitle.style.color = 'rgb(148, 163, 184)';
    manualTitle.style.textTransform = 'uppercase';
    manualTitle.textContent = 'Manual QuickFill';

    var toggleManualBtn = document.createElement('button');
    toggleManualBtn.style.background = 'none';
    toggleManualBtn.style.border = 'none';
    toggleManualBtn.style.color = 'rgb(56, 189, 248)';
    toggleManualBtn.style.fontSize = '10px';
    toggleManualBtn.style.cursor = 'pointer';
    toggleManualBtn.textContent = displayAccounts.length === 0 ? 'Hide' : '+ Paste custom';

    manualHeader.appendChild(manualTitle);
    manualHeader.appendChild(toggleManualBtn);
    manualBox.appendChild(manualHeader);

    var manualForm = document.createElement('div');
    manualForm.style.display = displayAccounts.length === 0 ? 'block' : 'none';
    manualForm.style.marginTop = '6px';

    var manU = document.createElement('input');
    manU.className = 'inp';
    manU.type = 'text';
    manU.placeholder = 'Username / Email';

    var manP = document.createElement('input');
    manP.className = 'inp';
    manP.type = 'password';
    manP.placeholder = 'Password';
    manP.style.marginTop = '6px';

    var btnManFill = document.createElement('button');
    btnManFill.className = 'btn-action';
    btnManFill.textContent = '⚡ Fill Current Page';
    btnManFill.onclick = function(){
      var uV = manU.value;
      var pV = manP.value;
      fillCreds(uV, pV, function(count, tg, wasTrig){
        if (count > 0) {
          showStat('success', (wasTrig ? '🚀 Opened Login & populated ' : '🎉 Populated ') + count + ' fields!');
          setTimeout(function(){ host.remove(); }, 1200);
        } else {
          showStat('warn', '⚠️ Click "LOG IN" on the page popup first, then click Fill.');
        }
      });
    };

    toggleManualBtn.onclick = function(){
      var isHidden = manualForm.style.display === 'none';
      manualForm.style.display = isHidden ? 'block' : 'none';
      toggleManualBtn.textContent = isHidden ? 'Hide' : '+ Paste custom';
    };

    manualForm.appendChild(manU);
    manualForm.appendChild(manP);
    manualForm.appendChild(btnManFill);
    manualBox.appendChild(manualForm);
    panel.appendChild(manualBox);

    shadow.appendChild(panel);

    var initTg = findInputs();
    if (initTg.uEl) initTg.uEl.style.boxShadow = '0 0 10px rgba(56,189,248,0.7)';
    if (initTg.pEl) initTg.pEl.style.boxShadow = '0 0 10px rgba(56,189,248,0.7)';

  } catch(err) {
    console.warn('hVault AutoFill notice:', err);
  }
})();void(0);`;

  const cleanCode = scriptContent.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return `javascript:${cleanCode}`;
}
