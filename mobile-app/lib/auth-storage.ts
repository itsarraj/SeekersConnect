import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/config';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
}

export async function setAuthBundle(access: string, refresh: string, userJson: string): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, access],
    [STORAGE_KEYS.refreshToken, refresh],
    [STORAGE_KEYS.userProfile, userJson],
  ]);
}

export async function clearAuthStorage(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.userProfile,
  ]);
}

export async function getStoredUserJson(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.userProfile);
}
