export type recipeInfo = {
    postURL: string;
    transcription: string;
    thumbnail: string;
    description: string;
};

export type envTypes = {
    OPENAI_URL: string;
    OPENAI_API_KEY: string;
    TRANSCRIPTION_MODEL: string;
    TEXT_MODEL: string;
    MEALIE_URL: string;
    MEALIE_API_KEY: string;
    MEALIE_GROUP_NAME: string;
    FFMPEG_PATH: string;
    YTDLP_PATH: string;
    EXTRA_PROMPT: string;
    COOKIES: string;
    LOCAL_WHISPER_MODEL: string;
};

export type recipeResult = {
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
    title: string;
};

export type tag = {
    id: string;
    groupId: string;
    name: string;
    slug: string;
};

export type Option = {
    label: string;
    value: string;
};
