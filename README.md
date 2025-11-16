# Social Media to Mealie

Have you found a recipe on social media and don’t want to write it out yourself? This tool lets you import recipes from videos directly into [Mealie](https://github.com/mealie-recipes/mealie).

**Tested social media platforms:**
- Instagram
- TikTok
- Facebook
- YouTube Shorts
- Pinterest

Other sites may work as well, since the tool uses `yt-dlp` to download videos. If you encounter issues with other websites, please open an issue.

> **Note:** If you receive a `BAD_RECIPE` error, it may be due to Mealie’s recipe parsing. If you find a better prompt or solution, feel free to open an issue or PR!

## Features

- Import posts into Mealie with a link and a click
- [iOS Shortcut](https://www.icloud.com/shortcuts/a66a809029904151a39d8d3b98fecae4) for easy importing

## Screenshot

![Screenshot of the web interface](./public/screenshot.png "Screenshot of the web interface")


## Requirements

- [Mealie 1.9.0+](https://github.com/mealie-recipes/mealie) with AI provider configured ([docs](https://docs.mealie.io/documentation/getting-started/installation/open-ai/))
- [Docker](https://docs.docker.com/engine/install/)

## Deployment

<details open>
    <summary>Docker Compose</summary>

1. Create a `docker-compose.yml` file based on the example below. Use environment variable substitution to keep your secrets out of version control. You can define your secrets in a `.env` file in the same directory.

    ```yml
    services:
      social-to-mealie:
        restart: unless-stopped
        image: ghcr.io/gerardpollorebozado/social-to-mealie:latest
        container_name: social-to-mealie
        environment:
          - OPENAI_URL=https://api.openai.com/v1 #URL of api endpoint of AI provider
          - OPENAI_API_KEY=${OPENAI_API_KEY}
          - WHISPER_MODEL=whisper-1 # this model will be used to transcribe the audio to text
          - MEALIE_URL=https://mealie.example.com # url of you mealie instance
          - MEALIE_API_KEY=${MEALIE_API_KEY}
          # Optional, Mealie group name, defaults to "home"
          - MEALIE_GROUP_NAME=home
          # Optional, customize the standard prompt if needed this will replace it
          - USER_PROMPT=Custom prompt
          # Optional, addition to the prompt, useful for translation needs
          - EXTRA_PROMPT=The description, ingredients, and instructions must be provided in Spanish
        ports:
          - 4000:3000
        security_opt:
          - no-new-privileges:true
    ```

2. **Create a `.env` file** in the same directory as your `docker-compose.yml` and fill in your secrets:
    ```env
    OPENAI_API_KEY="sk-..."
    MEALIE_API_KEY="ey..."
    ```

3. **Start the service with Docker Compose:**
   ```sh
   docker-compose up -d
   ```
</details>

<details open>
    <summary>Docker Run</summary>

```sh
docker run --restart unless-stopped --name social-to-mealie \
  -e OPENAI_URL=https://api.openai.com/v1 \
  -e OPENAI_API_KEY=sk-... \
  -e WHISPER_MODEL=whisper-1 \
  -e MEALIE_URL=https://mealie.example.com \
  -e MEALIE_API_KEY=ey... \
  -e MEALIE_GROUP_NAME=home \
  -e USER_PROMPT="Custom prompt" \
  -e EXTRA_PROMPT="The description, ingredients, and instructions must be provided in Spanish" \
  -p 4000:3000 \
  --security-opt no-new-privileges:true \
  ghcr.io/gerardpollorebozado/social-to-mealie:latest
```
</details>

## Environment Variables

| Variable          | Required | Description                                                  |
| ----------------- | -------- | ------------------------------------------------------------ |
| OPENAI_URL        | Yes      | URL for the OpenAI API                                       |
| OPENAI_API_KEY    | Yes      | API key for OpenAI                                           |
| WHISPER_MODEL     | Yes      | Whisper model to use                                         |
| MEALIE_URL        | Yes      | URL of your Mealie instance                                  |
| MEALIE_API_KEY    | Yes      | API key for Mealie                                           |
| MEALIE_GROUP_NAME | No       | Mealie group name, defaults to "home"                        |
| USER_PROMPT       | No       | Custom prompt for recipe extraction                          |
| EXTRA_PROMPT      | No       | Additional instructions for AI, such as language translation |
