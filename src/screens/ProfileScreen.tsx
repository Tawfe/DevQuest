import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getVersion } from 'react-native-device-info';

import { Button } from '@/components/Button';
import { useAuthStore } from '@/services/auth';

export function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  return (
    <View className="flex-1 bg-surface-dim px-5 pt-6">
      <Text className="text-3xl font-extrabold text-ink">
        {t('profile.title')}
      </Text>

      <View className="mt-6 rounded-2xl bg-surface p-5">
        <Text className="text-base text-ink">
          {t('profile.signedInAs', {
            name: user?.displayName ?? user?.id ?? '—',
          })}
        </Text>
        <Text className="mt-2 text-xs text-ink-muted">
          {t('profile.versionLabel')}: {getVersion()}
        </Text>
      </View>

      <View className="mt-6">
        <Button
          label={t('profile.signOut')}
          variant="secondary"
          onPress={() => signOut()}
        />
      </View>
    </View>
  );
}
