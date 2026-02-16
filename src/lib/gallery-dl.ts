import type { socialMediaResult } from "@/lib/types";
import { exec } from "child_process";
import { promisify } from "util";
import sharp from "sharp";
import emojiStrip from "emoji-strip";

const execPromise = promisify(exec);

async function getBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resizedBuffer = await sharp(buffer)
        .resize(500, 500, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

    return `data:image/jpeg;base64,${resizedBuffer.toString("base64")}`;
}

export async function downloadMediaWithGalleryDl(
    url: string
): Promise<socialMediaResult> {
    let result: socialMediaResult = {
        blob: null,
        thumbnail: "notfound",
        description: "No description found",
        title: "not found",
        images: []
    };

    try {
        const { stdout } = await execPromise(`gallery-dl -j --cookies cookies.txt "${url}"`);

        const rawData = JSON.parse(emojiStrip(stdout));
        for (const item of rawData) {
            const type = item[0];

            if (type === 2 && item[1]) {
                const meta = item[1];
                result.description = meta.description || result.description;
                result.title = meta.fullname || meta.username || "Instagram Post";

            }

            if (type === 3) {
                const imageUrl = item[1];
                result.thumbnail = imageUrl;
                if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                    try {
                        const base64 = await getBase64(imageUrl);
                        result.images.push(base64);
                    } catch (imgErr) {
                        console.error(`Error procesando imagen ${imageUrl}:`, imgErr);
                    }
                }
            }
        }


        result.description = result.description.trim();

    } catch (error) {
        console.error("Error crítico en downloadMediaWithGalleyDl:", error);
    }

    console.log(result)
    return result;
}