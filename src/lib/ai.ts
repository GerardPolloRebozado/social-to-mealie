import { env } from "./constants";
import { createOpenAI } from "@ai-sdk/openai";
import { experimental_transcribe, generateObject } from "ai";
import { z } from "zod";
import * as os from "os";
import * as path from "path";
import { writeFile, unlink } from "fs/promises";
import { randomBytes } from "crypto";

// Initialize OpenAI client
const client = createOpenAI({
    baseURL: env.OPENAI_URL,
    apiKey: env.OPENAI_API_KEY,
});

const transcriptionModel = client.transcription(env.WHISPER_MODEL);
const textModel = client.chat(env.TEXT_MODEL);

export async function getTranscription(blob: Blob): Promise<string> {
    const useLocal =
        env.LOCAL_WHISPER === "true" || env.LOCAL_WHISPER === "TRUE";

    if (useLocal) {
        const buffer = Buffer.from(await blob.arrayBuffer());
        const tmpDir = os.tmpdir();
        const tmpName = `ai-transcribe-${Date.now()}-${randomBytes(6).toString(
            "hex"
        )}.wav`;
        const tmpPath = path.join(tmpDir, tmpName);

        try {
            await writeFile(tmpPath, buffer);

            const modelName = env.WHISPER_MODEL || "base";
            const { nodewhisper } = await import("nodejs-whisper");

            const rawResult = await nodewhisper(tmpPath, {
                modelName,
                autoDownloadModelName: modelName,
                removeWavFileAfterTranscription: true,
                whisperOptions: {
                    outputInText: true,
                },
            } as any);

            // Handle different return types from nodejs-whisper
            if (typeof rawResult === "string") return rawResult;

            // It might return an object with text, result, or outputFile
            const resultObj = rawResult as any;
            if (resultObj.text) return resultObj.text;
            if (resultObj.result) return resultObj.result;
            if (resultObj.outputFile) {
                try {
                    const { readFile } = await import("fs/promises");
                    return await readFile(resultObj.outputFile, "utf8");
                } catch (err) {
                    console.error(
                        "Error reading nodewhisper output file:",
                        err
                    );
                }
            }

            return JSON.stringify(resultObj);
        } catch (e) {
            console.error("Local whisper transcription error:", e);
            throw new Error("Failed to transcribe audio locally");
        } finally {
            await unlink(tmpPath).catch(() => undefined);
        }
    } else {
        try {
            const audioBuffer = Buffer.from(await blob.arrayBuffer());

            const result = await experimental_transcribe({
                model: transcriptionModel,
                audio: audioBuffer,
            });

            return result.text;
        } catch (error) {
            console.error("Error in getTranscription (AI SDK):", error);
            throw new Error("Failed to transcribe audio via API");
        }
    }
}

export async function generateRecipeFromAI(
    transcription: string,
    description: string,
    postURL: string,
    thumbnail: string
) {
    const schema = z.object({
        "@context": z
            .literal("https://schema.org")
            .default("https://schema.org"),
        "@type": z.literal("Recipe").default("Recipe"),
        name: z.string(),
        image: z.string().optional(),
        url: z.string().optional(),
        description: z.string(),
        recipeIngredient: z.array(z.string()),
        recipeInstructions: z.array(
            z.object({
                "@type": z.literal("HowToStep").default("HowToStep"),
                text: z.string(),
            })
        ),
    });

    try {
        const { object } = await generateObject({
            model: textModel,
            schema,
            prompt: `
        You are an expert chef assistant. Extract a structured recipe from the transcript below.
        <Metadata>
          Post URL: ${postURL}
          Description: ${description}
          Thumbnail: ${thumbnail}
        </Metadata>

        <Transcription>
          ${transcription}
        </Transcription>

        Use the thumbnail for the image field and the post URL for the url field.
        Extract ingredients and instructions clearly.
        Output must be valid JSON-LD Schema.org Recipe format.
      `,
        });

        return object;
    } catch (error) {
        console.error("Error generating recipe with AI:", error);
        throw new Error("Failed to generate recipe structure");
    }
}

export async function refineRecipeWithAI(initialRecipeJson: any) {
    const schema = z.object({
        "@context": z
            .literal("https://schema.org")
            .default("https://schema.org"),
        "@type": z.literal("Recipe").default("Recipe"),
        name: z.string(),
        image: z.string().optional(),
        url: z.string().optional(),
        description: z.string(),
        recipeIngredient: z.array(z.string()),
        recipeInstructions: z.array(
            z.object({
                "@type": z.literal("HowToStep").default("HowToStep"),
                text: z.string(),
            })
        ),
    });

    try {
        const { object } = await generateObject({
            model: textModel,
            schema,
            prompt: `
        You are an expert chef assistant. Review the following recipe JSON and refine it for clarity, conciseness, and accuracy.
        Ensure ingredients and instructions are well-formatted and easy to follow.
        Correct any obvious errors or omissions.
        Output must be valid JSON-LD Schema.org Recipe format.

        <InitialRecipeJson>
          ${JSON.stringify(initialRecipeJson, null, 2)}
        </InitialRecipeJson>
      `,
        });
        return object;
    } catch (error) {
        console.error("Error refining recipe with AI:", error);
        throw new Error("Failed to refine recipe structure");
    }
}
