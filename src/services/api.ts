import { apiConfig } from '../config/aws';

export type DonateRequest = {
  kg: number;
  note?: string;
};

export type DonateResponse = {
  message: string;
  pointsAdded: number;
};

export type ProfileResponse = {
  name: string;
  points: number;
  history: Array<{ kg: number; points: number; createdAt: string }>;
};

const buildUrl = (path: string) => {
  const base = apiConfig.baseUrl.replace(/\/$/, '');
  return `${base}${path}`;
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error('Không thể kết nối API');
  }

  return (await response.json()) as T;
};

export const donatePlastic = (payload: DonateRequest, token?: string) =>
  request<DonateResponse>('/donate', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

export const getProfile = (token: string) =>
  request<ProfileResponse>('/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
