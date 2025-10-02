export type recipeInfo = {
  postURL: string;
  transcription: string;
  thumbnail: string;
  description: string;
};

export type envTypes = {
  OPENAI_URL: string;
  OPENAI_API_KEY: string;
  WHISPER_MODEL: string;
  MEALIE_URL: string;
  MEALIE_API_KEY: string;
  USER_PROMPT: string;
  EXTRA_PROMPT: string;
  COOKIES_PATH: string;
};

export type recipeResult = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  url: string;
};

export type progressType = {
  videoDownloaded: null | boolean;
  audioTranscribed: null | boolean;
  recipeCreated: null | boolean;
};

export type socialMediaResult = {
  blob: Blob;
  thumbnail: string;
  description: string;
};

export type HistoryEntry = {
  id: string;
  url: string;
  status: 'success' | 'error';
  errorMessage?: string;
  recipeId?: string;
  createdAt: Date;
};
