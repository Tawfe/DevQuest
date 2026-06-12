/**
 * Single source of truth for React Query keys. Never inline key arrays in
 * components — build them here so invalidation stays consistent.
 */
export const queryKeys = {
  all: ['devquest'] as const,

  profile: () => [...queryKeys.all, 'profile'] as const,

  tracks: () => [...queryKeys.all, 'tracks'] as const,
  track: (trackId: string) => [...queryKeys.tracks(), trackId] as const,
  lesson: (trackId: string, lessonId: string) =>
    [...queryKeys.track(trackId), 'lessons', lessonId] as const,

  progress: () => [...queryKeys.all, 'progress'] as const,
  streak: () => [...queryKeys.all, 'streak'] as const,
} as const;
