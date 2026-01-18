import { env } from "./constants";
import { createOpenAI } from "@ai-sdk/openai";
import { experimental_transcribe, generateObject } from "ai";
import { z } from "zod";
import { pipeline } from '@huggingface/transformers';
import {WaveFile} from 'wavefile';

const client = createOpenAI({
    baseURL: env.OPENAI_URL,
    apiKey: env.OPENAI_API_KEY,
});

const transcriptionModel = client.transcription(env.TRANSCRIPTION_MODEL);
const textModel = client.chat(env.TEXT_MODEL);

export async function getTranscription(blob: Blob): Promise<string> {
    if (env.LOCAL_WHISPER_MODEL) {
        console.info("Using local Whisper model for transcription:", env.LOCAL_WHISPER_MODEL);
        const transcriber = await pipeline('automatic-speech-recognition', env.LOCAL_WHISPER_MODEL);
        const arrayBuffer = Buffer.from(await blob.arrayBuffer());
        try {
            const wav = new WaveFile(new Uint8Array(arrayBuffer));
            // Pipeline expects Float32Array samples
            wav.toBitDepth('32f');
            // Whisper expects 16k sample rate
            wav.toSampleRate(16000);
            let audioData: any = wav.getSamples();
            if (Array.isArray(audioData)) {
                if (audioData.length > 1) {
                    const SCALING_FACTOR = Math.sqrt(2);
                    for (let i = 0; i < audioData[0].length; ++i) {
                        audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
                    }
                }
                audioData = audioData[0];
            }
            const result = await transcriber(audioData);

            if (result && typeof result === 'object' && 'text' in result) {
                return (result as any).text;
            }

            return String(result);
        } catch (err) {
            console.error('Error transcribing with local Whisper model:', err);
            throw err;
        }
    }

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

export async function generateRecipeFromAI(
    transcription: string,
    description: string,
    postURL: string,
    thumbnail: string,
    extraPrompt: string,
    tags: string[]
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
        keywords: z.array(z.string()).optional(),
    });

    try {
        const { object } = await generateObject({
            model: textModel,
            schema,
            prompt: `
         You are an expert chef assistant. Review the following recipe transcript and refine it for clarity, conciseness, and accuracy.
        Ensure ingredients and instructions are well-formatted and easy to follow.
        Correct any obvious errors or omissions.
        Output must be valid JSON-LD Schema.org Recipe format.
        The keywords field should not be modified leave it as it comes, it they are not present dont include them.

        <Metadata>
          Post URL: ${postURL}
          Description: ${description}
          Thumbnail: ${thumbnail}
        </Metadata>

        <Transcription>
          ${transcription}
        </Transcription>

        ${
            tags && tags.length > 0 && Array.isArray(tags)
                ? `<keywords>${tags.join(", ")}</keywords>`
                : ""
        }

                ${
                    tags && tags.length > 0 && !Array.isArray(tags)
                        ? `<keywords>${tags}</keywords>`
                        : ""
                }

        Use the thumbnail for the image field and the post URL for the url field.
        Extract ingredients and instructions clearly.
        Output must be valid JSON-LD Schema.org Recipe format.
        ${
            extraPrompt.length > 1
                ? ` Also the user requests that:
        ${extraPrompt}`
                : ""
        }
      `,
        });

        return object;
    } catch (error) {
        console.error("Error generating recipe with AI:", error);
        throw new Error("Failed to generate recipe structure");
    }
}