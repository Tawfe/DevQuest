import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useAuthStore } from '@/services/auth';

export function SignInScreen() {
  const { t } = useTranslation();
  const status = useAuthStore(state => state.status);
  const signIn = useAuthStore(state => state.signIn);
  const [error, setError] = useState(false);

  const handleSignIn = async () => {
    setError(false);
    try {
      await signIn();
    } catch {
      setError(true);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-5xl font-extrabold text-primary">
        {t('common.appName')}
      </Text>
      <Text className="mt-3 text-center text-lg text-ink-muted">
        {t('signIn.tagline')}
      </Text>

      <View className="mt-12 w-full">
        <Button
          label={
            status === 'signingIn'
              ? t('signIn.signingIn')
              : t('signIn.continueWithRoblox')
          }
          loading={status === 'signingIn'}
          onPress={handleSignIn}
        />
      </View>

      {error ? (
        <Text className="mt-4 text-center text-danger">
          {t('signIn.error')}
        </Text>
      ) : null}

      <Text className="mt-8 text-center text-xs text-ink-muted">
        {t('signIn.notLiveNote')}
      </Text>
    </View>
  );
}
