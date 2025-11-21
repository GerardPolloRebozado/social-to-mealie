import { Buffer } from 'node:buffer';

import { OpenRouter } from '@openrouter/sdk';

import { env } from './constants';

const openRouterClient = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  serverURL: env.OPENROUTER_URL,
});

function detectAudioFormat(mimeType: string | undefined): 'mp3' | 'wav' {
  if (!mimeType) {
    return 'wav';
  }
  if (mimeType.includes('wav')) {
    return 'wav';
  }
  return 'mp3';
}

export async function getTranscription(blob: Blob) {
  try {
    if (!env.TRANSCRIPTION_MODEL) {
      throw new Error('TRANSCRIPTION_MODEL is not set');
    }
    if (!env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const audioBuffer = Buffer.from(await blob.arrayBuffer());
    const base64Audio = audioBuffer.toString('base64');
    const response = await openRouterClient.callModel({
      model: env.TRANSCRIPTION_MODEL,
      instructions: 'Transcribe the provided audio into plain text without additional commentary.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_audio',
              inputAudio: {
                data: base64Audio,
                format: detectAudioFormat(blob.type),
              },
            },
          ],
        },
      ],
      text: {
        format: { type: 'text' },
        verbosity: 'low',
      },
    });

    const transcription = await response.getText();
    if (!transcription) {
      throw new Error('Transcription result was empty');
    }
    return transcription.trim();
  } catch (error) {
    console.error('Error in getTranscription:', error);
    throw new Error('Failed to transcribe audio');
  }
}
