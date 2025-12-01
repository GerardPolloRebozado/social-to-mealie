import { env } from '@/lib/constants';
import type { socialMediaResult } from '@/lib/types';
import { YtDlp, type VideoInfo } from 'ytdlp-nodejs';

const ytdlp = new YtDlp({
  ffmpegPath: env.FFMPEG_PATH,
  binaryPath: env.YTDLP_PATH,
});

export async function downloadMediaWithYtDlp(url: string): Promise<socialMediaResult> {
  try {
    // Get video metadata first
    const metadata = (await ytdlp.getInfoAsync(url)) as VideoInfo;

    // Get audio stream as a file/buffer
    // ytdlp-nodejs 'getFileAsync' with filter 'audioonly' retrieves the audio
    // and allows accessing it via .bytes() which returns a Uint8Array
    const audioFile = await ytdlp.getFileAsync(url, {
      format: { filter: 'audioonly' },
    });

    const buffer = await audioFile.bytes();

    return {
      blob: new Blob([buffer], { type: 'audio/wav' }), // Using wav as generic container for processed audio or source
      thumbnail: metadata.thumbnail,
      description: metadata.description || 'No description found',
      title: metadata.title,
    };
  } catch (error) {
    console.error('Error in downloadMediaWithYtDlp:', error);
    throw new Error('Failed to download media or metadata');
  }
}