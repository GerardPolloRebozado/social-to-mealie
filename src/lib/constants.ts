import type { envTypes } from '@//lib/types';

export const env: envTypes = {
  OPENROUTER_URL: process.env.OPENROUTER_URL
    ? process.env.OPENROUTER_URL.trim().replace(/\/+$/, '')
    : 'https://openrouter.ai/api/v1',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim() as string,
  TRANSCRIPTION_MODEL: process.env.TRANSCRIPTION_MODEL?.trim() as string,
  MEALIE_URL: process.env.MEALIE_URL?.trim().replace(/\/+$/, '') as string,
  MEALIE_API_KEY: process.env.MEALIE_API_KEY?.trim().replace(/\n/g, '') as string,
  MEALIE_GROUP_NAME: process.env.MEALIE_GROUP_NAME?.trim() || 'home' as string,
};
