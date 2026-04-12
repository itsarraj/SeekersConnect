# SeekerConnect (Expo / React Native)

SeekerConnect is an [Expo](https://expo.dev) app using a **development build** (not Expo Go), [Expo Router](https://docs.expo.dev/router/introduction/), and **NativeWind v4**.

## Documentation

- **[SETUP.md](./SETUP.md)** — Full development setup: physical Android device, Metro + tunnel, **adb reverse** for local APIs, env vars, Babel/NativeWind, URL schemes, and troubleshooting.

## Quick start

```bash
cd mobile-app
npm install
```

**Physical Android (USB + Expo tunnel + local auth/BFF on this machine):**

```bash
npm run dev:android-tunnel-adb
```

Then press **`a`** in the terminal or open the dev client on the device. See [SETUP.md](./SETUP.md) for LAN-only mode, `.env` options, and when to run `npx expo run:android --device`.

**First time / after native dependency changes:** install the dev client with `npx expo run:android --device` (or `npm run android:rebuild`). If **AsyncStorage** or another native module errors with “NativeModule is null”, uninstall the app from the phone and rebuild — see [SETUP.md §9](./SETUP.md#9-troubleshooting).

## Environment

Copy **`env.example`** to **`.env`** and adjust `EXPO_PUBLIC_*` values. Restart Metro after changes.

## Fresh Expo starter cleanup

To reset the starter layout:

```bash
npm run reset-project
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
