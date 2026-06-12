declare module 'react-native-config' {
  export interface NativeConfig {
    APP_ENV?: 'development' | 'staging' | 'production';
    API_BASE_URL?: string;
    ROBLOX_CLIENT_ID?: string;
    ROBLOX_REDIRECT_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
