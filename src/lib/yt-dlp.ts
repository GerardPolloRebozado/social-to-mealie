import fs from "node:fs/promises";
import path from "node:path";
import type { socialMediaResult } from "@/lib/types";
import YTDlpWrap from "yt-dlp-wrap";
import { title } from "node:process";

const ytDlpPath = path.resolve("./yt-dlp");
const outputDir = path.resolve("./temp");

export async function ensureYtDlpBinary() {
    const ytDlpVersion = process.env.YT_DLP_VERSION || "2025.09.05";
    const exists = await fs
        .access(ytDlpPath)
        .then(() => true)
        .catch(() => false);

    if (!exists) {
        console.log(`Downloading yt-dlp binary version ${ytDlpVersion}...`);
        await YTDlpWrap.downloadFromGithub(ytDlpPath, ytDlpVersion);
        try {
            await fs.chmod(ytDlpPath, 0o755);
        } catch (e) {
            console.warn(
                "Could not set executable permissions on yt-dlp binary:",
                e
            );
        }
        console.log("yt-dlp binary downloaded.");
    }
}

export async function downloadWithYtDlp(url: string) {
    await ensureYtDlpBinary();
    const ytDlpWrap = new YTDlpWrap(ytDlpPath);
    const outputFile = path.join(outputDir, "audio.wav");
    await fs.mkdir(outputDir, { recursive: true });
    try {
        await ytDlpWrap.execPromise([
            url,
            "-x",
            "--audio-format",
            "wav",
            "-o",
            outputFile,
        ]);
        const metadata = await ytDlpWrap.getVideoInfo(url);
        const buffer = await fs.readFile(outputFile);
        return { buffer, metadata };
    } finally {
        await fs.unlink(outputFile).catch(() => {});
    }
}

export async function downloadMediaWithYtDlp(
    url: string
): Promise<socialMediaResult> {
    const { buffer, metadata } = await downloadWithYtDlp(url);
    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8], { type: "audio/wav" });

    let additionalText = metadata.description;

    if (metadata.description.length < metadata.title.length) {
        additionalText = metadata.title;
    }
    return {
        blob: blob,
        thumbnail: metadata.thumbnail,
        description: additionalText,
    };
}
