import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/services/auth';
import sampleLesson from '@/content/lessons/sample-lesson.json';

export function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  return (
    <View className="flex-1 bg-surface-dim px-5 pt-6">
      <Text className="text-base text-ink-muted">
        {t('home.greeting', { name: user?.displayName ?? t('home.guestName') })}
      </Text>
      <Text className="mt-1 text-3xl font-extrabold text-ink">
        {t('home.title')}
      </Text>

      <View className="mt-6 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-surface p-4">
          <Text className="text-xs font-semibold uppercase text-ink-muted">
            {t('home.energyLabel')}
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-accent">
            5 / 5
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-surface p-4">
          <Text className="text-xs font-semibold uppercase text-ink-muted">
            {t('home.streakLabel')}
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-primary">0</Text>
        </View>
      </View>

      <View className="mt-6 rounded-2xl bg-surface p-5">
        <Text className="text-xs font-semibold uppercase text-ink-muted">
          {t('home.sampleLessonHeading')}
        </Text>
        <Text className="mt-2 text-xl font-bold text-ink">
          {sampleLesson.title}
        </Text>
        <Text className="mt-1 text-sm text-ink-muted">
          +{sampleLesson.xpReward} XP
        </Text>
      </View>

      <Text className="mt-8 text-center text-sm text-ink-muted">
        {t('home.scaffoldNote')}
      </Text>
    </View>
  );
}
