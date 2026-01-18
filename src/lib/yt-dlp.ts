import { env } from "@/lib/constants";
import type { socialMediaResult } from "@/lib/types";
import { YtDlp, type VideoInfo } from "ytdlp-nodejs";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

const ytdlp = new YtDlp({
    ffmpegPath: env.FFMPEG_PATH,
    binaryPath: env.YTDLP_PATH,
});

async function convertBufferToWav(inputBuffer: Uint8Array): Promise<Buffer> {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.wav`);

    await writeFileAsync(inputPath, inputBuffer);

    try {
        await execAsync(`${env.FFMPEG_PATH} -i "${inputPath}" -ac 1 -ar 16000 -f wav "${outputPath}"`);
        return await readFileAsync(outputPath);
    } catch (error) {
        console.error("Error converting audio to WAV:", error);
        throw new Error("Failed to convert audio to WAV");
    } finally {
        try { await unlinkAsync(inputPath); } catch {}
        try { await unlinkAsync(outputPath); } catch {}
    }
}

export async function downloadMediaWithYtDlp(
    url: string
): Promise<socialMediaResult> {
    try {
        // Get video metadata first
        const metadata = (await ytdlp.getInfoAsync(url, {
            cookies: env.COOKIES,
        })) as VideoInfo;

        // Get audio stream as a file/buffer
        const audioFile = await ytdlp.getFileAsync(url, {
            format: { filter: "audioonly" },
            cookies: env.COOKIES,
        });

        const buffer = await audioFile.bytes();
        const wavBuffer = await convertBufferToWav(buffer);

        return {
            blob: new Blob([wavBuffer], { type: "audio/wav" }),
            thumbnail: metadata.thumbnail,
            description: metadata.description || "No description found",
            title: metadata.title,
        };
    } catch (error) {
        console.error("Error in downloadMediaWithYtDlp:", error);
        throw new Error("Failed to download media or metadata");
    }
}