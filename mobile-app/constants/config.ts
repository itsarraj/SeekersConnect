/**
 * API URLs — override with EXPO_PUBLIC_* in app config or .env (Expo loads EXPO_PUBLIC_ at build time).
 * Android emulator: use http://10.0.2.2:8080 for host machine localhost.
 */
export const AUTH_API_URL =
  process.env.EXPO_PUBLIC_AUTH_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
export const AUTH_API_VERSION =
  process.env.EXPO_PUBLIC_AUTH_API_VERSION ?? process.env.EXPO_PUBLIC_API_VERSION ?? 'v1';

export const BFF_API_URL = process.env.EXPO_PUBLIC_BFF_API_URL ?? 'http://localhost:8080';
export const BFF_API_VERSION = process.env.EXPO_PUBLIC_BFF_API_VERSION ?? 'v1';

export const STORAGE_KEYS = {
  accessToken: process.env.EXPO_PUBLIC_ACCESS_TOKEN_KEY ?? 'matchmyresume_access_token',
  refreshToken: process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY ?? 'matchmyresume_refresh_token',
  userProfile: process.env.EXPO_PUBLIC_USER_PROFILE_KEY ?? 'matchmyresume_user_profile',
} as const;

export const EMPLOYER_SIGNUP_STORAGE_KEY = 'employerSignupData';
