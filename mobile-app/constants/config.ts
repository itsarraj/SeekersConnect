import Constants from 'expo-constants';

/**
 * Dev API URLs — override with EXPO_PUBLIC_* in .env (loaded at bundle time).
 *
 * Physical device:
 * - Set EXPO_PUBLIC_AUTH_API_URL / EXPO_PUBLIC_BFF_API_URL to full URLs (e.g. cloudflared/ngrok HTTPS).
 * - Or EXPO_PUBLIC_DEV_API_HOST=192.168.x.x to rewrite localhost → your PC on LAN.
 * - Or EXPO_PUBLIC_DEV_TRANSPORT=adb and run `npm run android:reverse:dev` (USB forwards :8000/:8080/:8081).
 *
 * Expo --tunnel exposes Metro only; do not rewrite APIs to the tunnel hostname. We only auto-derive
 * host from expo hostUri when it is a private LAN IPv4.
 */
function isPrivateLanIPv4(host: string): boolean {
  const parts = host.split('.');
  if (parts.length !== 4) return false;
  const n = parts.map((p) => Number(p));
  if (n.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return false;
  const [a, b] = n;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function devMachineHostForApi(): string | null {
  if (!__DEV__) return null;
  if (process.env.EXPO_PUBLIC_DEV_TRANSPORT === 'adb') return null;

  const explicit = process.env.EXPO_PUBLIC_DEV_API_HOST?.trim();
  if (explicit) return explicit;

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri || typeof hostUri !== 'string') return null;
  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  if (!isPrivateLanIPv4(host)) return null;
  return host;
}

function rewriteLocalhostForDevice(url: string): string {
  const host = devMachineHostForApi();
  if (!host) return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      u.hostname = host;
      return u.href;
    }
  } catch {
    /* ignore invalid URL */
  }
  return url;
}

const rawAuthUrl =
  process.env.EXPO_PUBLIC_AUTH_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const rawBffUrl = process.env.EXPO_PUBLIC_BFF_API_URL ?? 'http://localhost:8080';

export const AUTH_API_URL = rewriteLocalhostForDevice(rawAuthUrl);
export const AUTH_API_VERSION =
  process.env.EXPO_PUBLIC_AUTH_API_VERSION ?? process.env.EXPO_PUBLIC_API_VERSION ?? 'v1';

export const BFF_API_URL = rewriteLocalhostForDevice(rawBffUrl);

if (__DEV__) {
  const hostUri = Constants.expoConfig?.hostUri;
  const tunnel =
    typeof hostUri === 'string' &&
    (hostUri.includes('exp.direct') ||
      hostUri.includes('ngrok') ||
      hostUri.includes('trycloudflare.com'));
  const apiLocal =
    AUTH_API_URL.includes('localhost') ||
    AUTH_API_URL.includes('127.0.0.1') ||
    BFF_API_URL.includes('localhost') ||
    BFF_API_URL.includes('127.0.0.1');
  if (tunnel && apiLocal) {
    console.warn(
      '[SeekerConnect] Tunnel Metro + localhost APIs: use USB and start with npm run dev:android-tunnel-adb (runs adb reverse). Or set EXPO_PUBLIC_AUTH_API_URL / EXPO_PUBLIC_BFF_API_URL to HTTPS tunnel URLs.',
    );
  }
}
export const BFF_API_VERSION = process.env.EXPO_PUBLIC_BFF_API_VERSION ?? 'v1';

export const STORAGE_KEYS = {
  accessToken: process.env.EXPO_PUBLIC_ACCESS_TOKEN_KEY ?? 'matchmyresume_access_token',
  refreshToken: process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY ?? 'matchmyresume_refresh_token',
  userProfile: process.env.EXPO_PUBLIC_USER_PROFILE_KEY ?? 'matchmyresume_user_profile',
} as const;

export const EMPLOYER_SIGNUP_STORAGE_KEY = 'employerSignupData';
