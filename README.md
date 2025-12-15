# Social Media to Mealie

Have you found a recipe on social media and don’t want to write it out yourself? This tool lets you import recipes from videos directly into [Mealie](https://github.com/mealie-recipes/mealie).

**Tested social media platforms:**

-   Instagram
-   TikTok
-   Facebook
-   YouTube Shorts
-   Pinterest

Other sites may work as well, since the tool uses `yt-dlp` to download videos. If you encounter issues with other websites, please open an issue.

> **Note:** If you receive a `BAD_RECIPE` error, it may be due to Mealie’s recipe parsing. If you find a better prompt or solution, feel free to open an issue or PR!

## Features

-   Import posts into Mealie with a link and a click
-   [iOS Shortcut](https://www.icloud.com/shortcuts/a66a809029904151a39d8d3b98fecae4) for easy importing

## Screenshot

![Screenshot of the web interface](./public/screenshot.png "Screenshot of the web interface")

## Requirements

-   [Mealie 1.9.0+](https://github.com/mealie-recipes/mealie) with AI provider configured ([docs](https://docs.mealie.io/documentation/getting-started/installation/open-ai/))
-   [Docker](https://docs.docker.com/engine/install/)

## Deployment

<details open>
    <summary>Docker Compose</summary>

1. Create a `docker-compose.yml` file based on the [example](https://github.com/GerardPolloRebozado/social-to-mealie/blob/main/docker-compose.yml) in the repo and fill in the required environment variables, if you prefer having them in a separate file you can create a `.env` file based on the [example.env](https://github.com/GerardPolloRebozado/social-to-mealie/blob/main/example.env).

2. **Start the service with Docker Compose:**
    ```sh
    docker-compose up -d
    ```
    </details>

<details>
    <summary>Docker Run</summary>

```sh
docker run --restart unless-stopped --name social-to-mealie \
  -e OPENAI_URL=https://api.openai.com/v1 \
  -e OPENAI_API_KEY=sk-... \
  -e TRANSCRIPTION_MODEL=whisper-1 \
  -e MEALIE_URL=https://mealie.example.com \
  -e MEALIE_API_KEY=ey... \
  -e MEALIE_GROUP_NAME=home \
  -p 4000:3000 \
  --security-opt no-new-privileges:true \
  ghcr.io/gerardpollorebozado/social-to-mealie:latest
```

</details>

## Environment Variables

| Variable            | Required | Description                                                        |
| ------------------- | -------- | ------------------------------------------------------------------ |
| OPENAI_URL          | Yes      | URL for the OpenAI API or a compatible one                         |
| OPENAI_API_KEY      | Yes      | API key for OpenAI or a compatible one                             |
| TRANSCRIPTION_MODEL | Yes      | Whisper model to use                                               |
| TEXT_MODEL          | Yes      | Text model to use for recipe generation                            |
| MEALIE_URL          | Yes      | URL of your Mealie instance                                        |
| MEALIE_API_KEY      | Yes      | API key for Mealie                                                 |
| MEALIE_GROUP_NAME   | No       | Mealie group name, defaults to "home"                              |
| EXTRA_PROMPT        | No       | Additional instructions for AI, such as language translation       |
| YTDLP_VERSION       | No       | Version of yt-dlp to use, defaults to latest                       |
| COOKIES             | No       | Cookies string for yt-dlp to access protected content `NAME=VALUE` |
