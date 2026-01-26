import type { envTypes } from "@//lib/types";

export const env: envTypes = {
    OPENAI_URL: process.env.OPENAI_URL?.trim().replace(/\/+$/, "") as string,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() as string,
    TRANSCRIPTION_MODEL: (
        process.env.TRANSCRIPTION_MODEL || process.env.TRANSCRIPTION_MODEL
    )?.trim() as string,
    TEXT_MODEL: process.env.TEXT_MODEL?.trim() as string,
    MEALIE_URL: process.env.MEALIE_URL?.trim().replace(/\/+$/, "") as string,
    MEALIE_API_KEY: process.env.MEALIE_API_KEY?.trim().replace(
        /\n/g,
        ""
    ) as string,
    MEALIE_GROUP_NAME:
        process.env.MEALIE_GROUP_NAME?.trim() || ("home" as string),
    FFMPEG_PATH:
        process.env.FFMPEG_PATH?.trim() || ("/usr/bin/ffmpeg" as string),
    YTDLP_PATH:
        process.env.YTDLP_PATH?.trim() || ("/usr/local/bin/yt-dlp" as string),
    EXTRA_PROMPT: process.env.EXTRA_PROMPT?.trim() || ("" as string),
    COOKIES: process.env.COOKIES?.trim() || ("" as string),
    LOCAL_TRANSCRIPTION_MODEL: process.env.LOCAL_TRANSCRIPTION_MODEL?.trim() || ("" as string),
};
