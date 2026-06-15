/* eslint-env jest */

// React 19 concurrent act() support for React Native Testing Library.
global.IS_REACT_ACT_ENVIRONMENT = true;

// In-memory MMKV — same API surface the app uses.
jest.mock('react-native-mmkv', () => {
  const createMMKV = () => {
    const store = new Map();
    return {
      set: (key, value) => store.set(key, value),
      getString: key => {
        const value = store.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      getNumber: key => {
        const value = store.get(key);
        return typeof value === 'number' ? value : undefined;
      },
      getBoolean: key => {
        const value = store.get(key);
        return typeof value === 'boolean' ? value : undefined;
      },
      contains: key => store.has(key),
      remove: key => store.delete(key),
      clearAll: () => store.clear(),
    };
  };
  return { createMMKV };
});

// Keychain: starts empty; tests can override per-case.
jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly' },
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('react-native-safe-area-context', () => {
  // The official mock exports everything under `default`.
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'development',
    API_BASE_URL: 'https://unequal-capacity-happy.ngrok-free.dev',
    ROBLOX_CLIENT_ID: '5717850802896701234',
    ROBLOX_REDIRECT_URL: 'devquest://oauth/callback',
  },
}));

jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock'),
);

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
  refresh: jest.fn(),
  revoke: jest.fn(),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    id: 'test-socket',
  })),
}));

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 },
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn().mockResolvedValue('test-token'),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  requestPermission: jest.fn().mockResolvedValue(1),
  deleteToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  log: jest.fn(),
  recordError: jest.fn(),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
}));
