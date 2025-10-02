import { getRecipe, postRecipe } from '@//lib/mealie';
import type { progressType, recipeInfo, socialMediaResult } from '@//lib/types';
import { getTranscription } from '@/lib/ai';
import { downloadMediaWithYtDlp } from '@/lib/yt-dlp';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEnv } from '@/lib/constants';

interface RequestBody {
  url: string;
}

async function handleRequest(url: string, req: NextRequest, isSse: boolean, controller?: ReadableStreamDefaultController) {
  const encoder = new TextEncoder();
  let socialMediaResult: socialMediaResult;
  const progress: progressType = {
    videoDownloaded: null,
    audioTranscribed: null,
    recipeCreated: null,
  };

  // Get the latest configuration
  const config = await getEnv();

  try {
    // Download video
    progress.videoDownloaded = null;
    if (isSse) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
    }

    // Use cookies path from configuration
    const cookiesPath = config.COOKIES_PATH;
    console.log('Using cookies path from config:', cookiesPath);
    
    socialMediaResult = await downloadMediaWithYtDlp(url, cookiesPath);
    progress.videoDownloaded = true;
    
    if (isSse) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
    }

    // Transcribe audio
    progress.audioTranscribed = null;
    if (isSse) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
    }

    // Use configurations for transcription
    const transcription = await getTranscription(socialMediaResult.blob);
    progress.audioTranscribed = true;
    
    if (isSse) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
    }

    // Create recipe in Mealie
    progress.recipeCreated = null;
    if (isSse) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
    }

    const recipeInfo: recipeInfo = {
      postURL: url,
      transcription: transcription,
      thumbnail: socialMediaResult.thumbnail,
      description: socialMediaResult.description
    };

    const createdRecipe = await postRecipe(recipeInfo);
    progress.recipeCreated = true;

    // Save to ProcessedUrl
    await prisma.processedUrl.create({
      data: {
        url,
        status: 'success',
        recipeId: createdRecipe.id
      }
    });

    if (isSse) {
      controller?.enqueue(
        encoder.encode(`data: ${JSON.stringify({ progress, createdRecipe })}\n\n`),
      );
      controller?.close();
    }

    return createdRecipe;
  } catch (error) {
    // Save failed attempt to ProcessedUrl
    await prisma.processedUrl.create({
      data: {
        url,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error;
  }
}

export const POST = async (req: NextRequest) => {
  const encoder = new TextEncoder();

  try {
    const { url } = await req.json() as RequestBody;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          await handleRequest(url, req, true, controller);
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export const GET = async (req: NextRequest) => {
  return new Response(null, { status: 405 });
};
