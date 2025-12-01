import type { envTypes } from "@//lib/types";

export const env: envTypes = {
  OPENAI_URL: process.env.OPENAI_URL?.trim().replace(/\/+$/, '') as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() as string,
  WHISPER_MODEL: (process.env.WHISPER_MODEL || process.env.TRANSCRIPTION_MODEL)?.trim() as string,
  TEXT_MODEL: process.env.TEXT_MODEL?.trim() as string,
  MEALIE_URL: process.env.MEALIE_URL?.trim().replace(/\/+$/, '') as string,
  MEALIE_API_KEY: process.env.MEALIE_API_KEY?.trim().replace(/\n/g, '') as string,
  MEALIE_GROUP_NAME: process.env.MEALIE_GROUP_NAME?.trim() || 'home' as string,
  LOCAL_WHISPER: process.env.LOCAL_WHISPER?.trim() || '' as string,
  FFMPEG_PATH: process.env.FFMPEG_PATH?.trim() || '/usr/bin/ffmpeg' as string,
  YTDLP_PATH: process.env.YTDLP_PATH?.trim() || '/usr/bin/ytdlp' as string,
};
