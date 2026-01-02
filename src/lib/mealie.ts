import { env } from "@//lib/constants";
import emojiStrip from "emoji-strip";
import type { recipeInfo, recipeResult } from "./types";

export async function postRecipe(recipeData: any) {
    try {
        const payloadData =
            typeof recipeData === "string"
                ? recipeData
                : JSON.stringify(recipeData);

        const res = await fetch(
            `${env.MEALIE_URL}/api/recipes/create/html-or-json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.MEALIE_API_KEY}`,
                },
                body: JSON.stringify({
                    includeTags: true,
                    data: payloadData,
                }),
                signal: AbortSignal.timeout(120000),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`${res.status} ${res.statusText} - ${errorText}`);
            throw new Error("Failed to create recipe");
        }
        const body = await res.json();
        console.log("Recipe response:", body);
        return body;
    } catch (error: any) {
        if (error.name === "AbortError") {
            console.error(
                "Timeout creating mealie recipe. Report this issue on Mealie GitHub."
            );
            throw new Error(
                `Timeout creating mealie recipe. Report this issue on Mealie GitHub. Input URL: ${env.MEALIE_URL}`
            );
        }
        console.error("Error in postRecipe:", error);
        throw new Error(error.message);
    }
}

export async function getRecipe(recipeSlug: string): Promise<recipeResult> {
    const res = await fetch(`${env.MEALIE_URL}/api/recipes/${recipeSlug}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.MEALIE_API_KEY}`,
        },
    });

    const body = await res.json();
    if (!res.ok) throw new Error("Failed to get recipe");

    return {
        name: body.name,
        description: body.description,
        imageUrl: `${env.MEALIE_URL}/api/media/recipes/${body.id}/images/original.webp`,
        url: `${env.MEALIE_URL}/g/${env.MEALIE_GROUP_NAME}/r/${recipeSlug}`,
    };
}
