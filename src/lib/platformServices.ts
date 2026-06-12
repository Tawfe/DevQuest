import { Platform } from 'react-native';
import { hasGmsSync, hasHmsSync } from 'react-native-device-info';

/**
 * Which mobile-services stack is available on this device.
 *
 * - `google`: iOS (APNs via Firebase) or Android with Google Play Services
 * - `huawei`: Android with Huawei Mobile Services only (no GMS)
 * - `none`:   Android with neither (rare; e.g. some custom ROMs)
 *
 * Build flavors (`gms` / `hms`) decide what ships in the APK; this runtime
 * check is the safety net that decides what actually runs on the device.
 */
export type MobileServices = 'google' | 'huawei' | 'none';

let cached: MobileServices | null = null;

export function getMobileServices(): MobileServices {
  if (cached !== null) {
    return cached;
  }
  if (Platform.OS === 'ios') {
    cached = 'google';
    return cached;
  }
  if (hasGmsSync()) {
    cached = 'google';
  } else if (hasHmsSync()) {
    cached = 'huawei';
  } else {
    cached = 'none';
  }
  return cached;
}

export function hasGoogleServices(): boolean {
  return getMobileServices() === 'google';
}

export function hasHuaweiServices(): boolean {
  return getMobileServices() === 'huawei';
}
