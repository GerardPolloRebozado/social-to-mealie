import { getRecipe, postRecipe } from "@//lib/mealie";
import type { progressType, recipeInfo, socialMediaResult } from "@//lib/types";
import {
    generateRecipeFromAI,
    getTranscription,
    refineRecipeWithAI,
} from "@/lib/ai"; // Import new AI functions
import { downloadMediaWithYtDlp } from "@/lib/yt-dlp";

interface RequestBody {
    url: string;
}
async function handleRequest(
    url: string,
    isSse: boolean,
    controller?: ReadableStreamDefaultController
) {
    const encoder = new TextEncoder();
    let socialMediaResult: socialMediaResult;
    let initialRecipe: any; // Using 'any' for now, will be Schema.org Recipe JSON
    let refinedRecipe: any; // Using 'any' for now, will be Schema.org Recipe JSON

    const progress: progressType = {
        videoDownloaded: null,
        audioTranscribed: null,
        recipeCreated: null,
    };

    try {
        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );
        }
        socialMediaResult = await downloadMediaWithYtDlp(url);
        progress.videoDownloaded = true;

        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );
        }
        const transcription = await getTranscription(socialMediaResult.blob);
        progress.audioTranscribed = true;
        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );
        }

        // Generate initial recipe JSON using AI
        initialRecipe = await generateRecipeFromAI(
            transcription,
            socialMediaResult.description,
            url, // Use the original URL for postURL
            socialMediaResult.thumbnail
        );

        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({ progress, initialRecipe })})\n\n`
                )
            );
        }

        refinedRecipe = await refineRecipeWithAI(initialRecipe);

        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({ progress, refinedRecipe })})\n\n`
                )
            );
        }

        console.log("Posting recipe to Mealie");
        const mealieResponse = await postRecipe(refinedRecipe);
        const createdRecipe = await getRecipe(await mealieResponse);
        console.log("Recipe created");
        progress.recipeCreated = true;
        if (isSse && controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(createdRecipe)}\n\n`)
            );
            controller.close();
            return;
        }
        return new Response(JSON.stringify({ createdRecipe, progress }), {
            status: 200,
        });
    } catch (error: any) {
        if (isSse && controller) {
            progress.recipeCreated = false;
            controller.enqueue(
                encoder.encode(
                    `data: ${JSON.stringify({
                        error: error.message,
                        progress,
                    })}\n\n`
                )
            );
            controller.close();
            return;
        }
        return new Response(
            JSON.stringify({ error: error.message, progress }),
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const body: RequestBody = await req.json();
    const url = body.url;
    const contentType = req.headers.get("Content-Type");

    if (contentType === "text/event-stream") {
        const stream = new ReadableStream({
            async start(controller) {
                await handleRequest(url, true, controller);
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    }
    return handleRequest(url, false);
}
