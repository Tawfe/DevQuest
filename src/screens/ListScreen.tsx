import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/services/api/queryKeys';
import {
  addListItem,
  deleteListItem,
  fetchList,
  type ListItem,
} from '@/services/api/list';

export function ListScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.list(),
    queryFn: fetchList,
  });

  const addMutation = useMutation({
    mutationFn: addListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      setText('');
      setMutationError(null);
    },
    onError: () => setMutationError(t('list.addError')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      setMutationError(null);
    },
    onError: () => setMutationError(t('list.deleteError')),
  });

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed || addMutation.isPending) return;
    addMutation.mutate(trimmed);
  };

  const renderItem = ({ item }: { item: ListItem }) => (
    <View className="mb-3 flex-row items-center rounded-2xl bg-surface px-4 py-3">
      <Text className="flex-1 text-base text-ink">{item.text}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete item"
        className="ml-3 rounded-xl bg-surface-dim px-3 py-1 active:opacity-60"
        disabled={deleteMutation.isPending}
        onPress={() => deleteMutation.mutate(item.id)}
      >
        <Text className="text-sm font-semibold text-danger">✕</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-dim"
    >
      <View className="flex-1 px-5 pt-6">
        <Text className="text-3xl font-extrabold text-ink">
          {t('list.title')}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6D5DF6" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 16 }}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-ink-muted">
                {t('list.empty')}
              </Text>
            }
          />
        )}

        {mutationError ? (
          <Text className="mb-2 text-center text-sm text-danger">
            {mutationError}
          </Text>
        ) : null}

        <View className="mb-4 flex-row gap-3">
          <TextInput
            className="flex-1 rounded-2xl bg-surface px-4 py-3 text-base text-ink"
            placeholder={t('list.inputPlaceholder')}
            placeholderTextColor="#6E6A8A"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            editable={!addMutation.isPending}
          />
          <Pressable
            accessibilityRole="button"
            className={`items-center justify-center rounded-2xl bg-primary px-5 ${
              addMutation.isPending || !text.trim()
                ? 'opacity-60'
                : 'active:bg-primary-dark'
            }`}
            disabled={addMutation.isPending || !text.trim()}
            onPress={handleAdd}
          >
            {addMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">{t('list.add')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
