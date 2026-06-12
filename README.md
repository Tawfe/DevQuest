# DevQuest

A Duolingo-style app that teaches kids (10–15) to build real Roblox games
through 5-minute daily quests. See [DEVQUEST_PLAN.md](./DEVQUEST_PLAN.md) for
the full product plan.

**Bare React Native + TypeScript**, targeting **iOS**, **Android (Google
Play)**, and **Huawei (AppGallery, no Google Play Services)**.

## Stack

| Concern         | Choice                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| Framework       | React Native 0.86 (bare, React Native CLI — no Expo)                          |
| Language        | TypeScript (`@/*` path alias → `src/*`)                                       |
| Styling         | NativeWind v4 (Tailwind CSS for React Native), tokens in `tailwind.config.js` |
| Navigation      | React Navigation v7 (native stack + bottom tabs), portrait-locked             |
| App state       | Zustand                                                                       |
| Server data     | TanStack Query v5 + MMKV-persisted cache                                      |
| Network         | axios client with normalized errors, token refresh, backoff retry             |
| Push            | Firebase Cloud Messaging (iOS + gms) / HMS Push Kit (hms, stub)               |
| Analytics       | Firebase Analytics (iOS + gms) / HMS Analytics Kit (hms, stub)                |
| Crash reporting | Firebase Crashlytics (iOS + gms) / AGC Crash Service (hms, stub)              |
| Auth            | Roblox OAuth 2.0 (Auth Code + PKCE) via react-native-app-auth                 |
| Secure storage  | react-native-keychain (tokens) · MMKV (non-secret data)                       |
| Config          | react-native-config (`.env.development` / `.env.staging` / `.env.production`) |
| i18n            | react-i18next — all copy in `src/i18n/en.json`, none hardcoded                |

## Project layout

```
src/
  components/      shared UI (NativeWind-styled)
  constants/       app-wide constants (storage keys, etc.)
  content/         lesson JSON (schema + full curriculum arrive in M2)
  hooks/           shared hooks
  i18n/            i18next setup + string resources
  lib/             storage (MMKV), GMS/HMS runtime detection
  navigation/      root navigator (auth gate → tabs)
  screens/         SignIn, Home, Profile
  services/
    api/           axios client, errors, retry, query client/keys, online manager
    auth/          Roblox OAuth, Keychain token storage, Zustand auth store
    push/          unified push interface; FCM provider + HMS stub
    analytics/     typed event map + provider facade (COPPA-safe)
    crash/         crash reporter facade
```

## Getting started

```bash
nvm use            # Node 22 (.nvmrc)
npm install
npm start          # Metro
```

**Android (Google Play flavor):**

```bash
# one-time: copy android/app/src/gms/google-services.example.json
#           → google-services.json and fill from the Firebase console
npm run android:gms
```

**iOS** (macOS only):

```bash
cd ios && bundle install && bundle exec pod install && cd ..
# one-time: copy ios/DevQuest/GoogleService-Info.example.plist
#           → GoogleService-Info.plist (add it to the Xcode target)
#           and fill from the Firebase console
npm run ios
```

**Checks:**

```bash
npm run typecheck
npm run lint
npm test
```

Husky + lint-staged run ESLint/Prettier on every commit.

## Android dual-target: gms / hms

Two product flavors in `android/app/build.gradle`:

- **`gms`** — Google Play build: Firebase (Analytics, Crashlytics, FCM).
  The `google-services` and `crashlytics` Gradle plugins are applied only
  for non-hms builds.
- **`hms`** — Huawei AppGallery build: AGConnect plugin is stubbed
  (commented out) until a Huawei release is planned.

Always build a **specific variant** (`assembleGmsDebug`, `assembleHmsRelease`,
…). Building both flavors in one Gradle invocation breaks the conditional
plugin logic.

At runtime, `src/lib/platformServices.ts` detects which services the device
actually has (via `react-native-device-info`) and the push/analytics/crash
facades pick the matching provider automatically.

### Activating the hms flavor for real (when Huawei ships)

1. Register the app in [AppGallery Connect](https://developer.huawei.com/consumer/en/service/josp/agc/index.html);
   download `agconnect-services.json` into `android/app/` (gitignored; an
   example file is committed).
2. Uncomment the `com.huawei.agconnect:agcp` classpath in
   `android/build.gradle` and the `apply plugin: "com.huawei.agconnect"`
   block in `android/app/build.gradle`.
3. `npm install @hmscore/react-native-hms-push` (+ analytics/crash kits as
   needed) and implement the stubs in `src/services/push/hms.ts`,
   `src/services/analytics/hmsProvider.ts`, `src/services/crash/agcProvider.ts`.
4. Build with `./gradlew :app:assembleHmsRelease`.

## 16KB page size compliance

Google Play requires 16KB-page support for apps targeting Android 15+.
Locked in from day one:

- **NDK r28** (`android/build.gradle`) — 16KB ELF alignment by default
- **AGP modern packaging** — `useLegacyPackaging = false` (uncompressed,
  zip-aligned native libs)
- **CI gate** — `scripts/check_elf_alignment.sh` inspects every 64-bit `.so`
  in the built APK and fails the build if any LOAD segment is aligned below
  16384 bytes. A future dependency that ships 4KB-aligned libs breaks CI,
  not the Play release.

Local check: build any APK, then
`scripts/check_elf_alignment.sh path/to/app.apk`.
To smoke-test on a 16KB device: create an Android 15+ emulator image with a
16KB page size kernel (Android Studio → SDK Manager → "Android 15.0 16KB
Page Size" system image) and run the app on it.

## Roblox OAuth setup

Sign-in uses Roblox OAuth 2.0 (Authorization Code + PKCE; public client, no
secret in the app). It is **stubbed until Roblox approves the app**:

1. Create an OAuth app at
   [create.roblox.com/dashboard/credentials](https://create.roblox.com/dashboard/credentials)
   with scopes `openid profile` and redirect URL `devquest://oauth/callback`.
2. Put the client ID in the `.env.*` files (`ROBLOX_CLIENT_ID`).
3. Roblox requires app review before third-party users can sign in — until
   approval, only the owning account works.

The redirect scheme `devquest` is registered in
`android/app/build.gradle` (`appAuthRedirectScheme`) and
`ios/DevQuest/Info.plist` (`CFBundleURLTypes`); the iOS AppDelegate forwards
the callback to react-native-app-auth.

COPPA note: Roblox-account sign-in makes the child the account holder. A
parental-consent flow must be added before public launch (tracked for the
auth milestone).

## Firebase setup

1. Create a Firebase project with an Android app (`com.devquest.app`) and an
   iOS app (`com.devquest.app`).
2. Android: `google-services.json` → `android/app/src/gms/`.
   iOS: `GoogleService-Info.plist` → `ios/DevQuest/` (add to Xcode target).
   Both are gitignored; committed `*.example.*` files show the shape.
3. COPPA configuration is already baked in: advertising-ID collection and
   ad-personalization signals are disabled in `AndroidManifest.xml` and
   `Info.plist`. Keep it that way on every child-reachable surface.

Analytics events are typed: every event lives in
`src/services/analytics/types.ts` and screens call
`analytics.track('event', params)` — never a provider SDK directly.

## Environments

`react-native-config` reads `.env` by default; select a committed
environment file per build:

```bash
ENVFILE=.env.staging npm run android:gms
ENVFILE=.env.production ./gradlew :app:assembleGmsRelease   # from android/
```

Committed `.env.*` files contain **non-secret** values only (URLs, public
client IDs). Real secrets never enter the repo.

## CI

`.github/workflows/ci.yml`, on every push/PR:

1. **quality** — `tsc --noEmit`, ESLint, Jest
2. **android-16kb-alignment** — assembles `gmsRelease` against the
   placeholder Firebase config and runs the 16KB ELF alignment check
