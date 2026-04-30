import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { brand } from '@/constants/brand';
import '../global.css';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: brand.accent,
    background: brand.bg,
    card: brand.surface,
    text: brand.text,
    border: 'rgba(255,255,255,0.12)',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: brand.bg },
            headerTintColor: brand.accent,
            headerTitleStyle: { color: brand.text, fontWeight: '700' },
            contentStyle: { backgroundColor: brand.bg },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="job/[id]" options={{ title: 'Job details' }} />
          <Stack.Screen name="login" options={{ title: 'Log in' }} />
          <Stack.Screen name="register" options={{ title: 'Sign up' }} />
          <Stack.Screen name="reset-password" options={{ title: 'Reset password' }} />
          <Stack.Screen name="profile" options={{ title: 'My profile' }} />
          <Stack.Screen name="about" options={{ title: 'About' }} />
          <Stack.Screen name="contact" options={{ title: 'Contact' }} />
          <Stack.Screen name="pricing" options={{ title: 'Pricing' }} />
          <Stack.Screen name="upgrade" options={{ title: 'Upgrade' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="verify-email/[token]" options={{ title: 'Verify email' }} />
          <Stack.Screen name="employers" options={{ headerShown: false }} />
          <Stack.Screen name="unauthorized" options={{ title: 'Unauthorized' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}
