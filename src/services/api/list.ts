import { apiClient } from './client';

export interface ListItem {
  id: string;
  text: string;
}

export async function fetchList(): Promise<ListItem[]> {
  const { data } = await apiClient.get<ListItem[]>('/list');
  return data;
}

export async function addListItem(text: string): Promise<ListItem> {
  const { data } = await apiClient.post<ListItem>('/list', { text });
  return data;
}

export async function deleteListItem(id: string): Promise<void> {
  await apiClient.delete(`/list/${id}`);
}
