import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from '@/screens/HomeScreen';
import { ListScreen } from '@/screens/ListScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SignInScreen } from '@/screens/SignInScreen';
import { useRealtimeList } from '@/hooks/useRealtimeList';
import { useAuthStore } from '@/services/auth';

export type RootStackParamList = {
  SignIn: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  List: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text className={`text-xl ${focused ? '' : 'opacity-40'}`}>{glyph}</Text>
  );
}

const renderHomeIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon glyph="🏠" focused={focused} />
);
const renderListIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon glyph="📋" focused={focused} />
);
const renderProfileIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon glyph="👤" focused={focused} />
);

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6D5DF6',
        tabBarInactiveTintColor: '#6E6A8A',
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabs.home'),
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="List"
        component={ListScreen}
        options={{
          title: t('tabs.list'),
          tabBarIcon: renderListIcon,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tabs.Navigator>
  );
}

function RestoringView() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color="#6D5DF6" />
      <Text className="mt-4 text-ink-muted">{t('common.loading')}</Text>
    </View>
  );
}

export function RootNavigator() {
  const status = useAuthStore(state => state.status);
  useRealtimeList();

  if (status === 'restoring') {
    return <RestoringView />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === 'signedIn' ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
