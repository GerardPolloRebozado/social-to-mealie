# Social Media to Mealie Plus

**This is a fork of [GerardPolloRebozado's project](https://github.com/GerardPolloRebozado/social-to-mealie), with some improvements that I deemed necessary. However, all credit for the original work goes to him.

I added a database to store information about the variables and URLs that have already been processed, to prevent duplicate imports. This includes a web page for configuration and another web page to display the import history.

A better interface for performing bulk imports would also be helpful.





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
    <summary>Docker Compose (Recommended)</summary>

1. Create a `docker-compose.yml` file:

    ```yml
    services:
      social-to-mealie:
        restart: unless-stopped
        image: ghcr.io/maitrekuc/social-to-mealie-plus:latest
        container_name: social-to-mealie-plus
        ports:
          - 4000:3000
        volumes:
          - social-to-mealie-data:/app/data
          - /path/to/cookies.txt:/app/cookies/cookies.txt
        security_opt:
          - no-new-privileges:true
    ```

2. **Start the service:**
   ```sh
   docker-compose up -d
   ```

3. **First setup:** Go to http://localhost:4000/setup to create an admin account and configure the application.
</details>

<details>
    <summary>Docker Run</summary>

⚠️ **Important:** The volume `-v xxx:/app/data` is **REQUIRED** to persist your database and configuration!

```sh
# Or with local directory
docker run -d \
  --name social-to-mealie-plus \
  --restart unless-stopped \
  -p 4000:3000 \
  -v /path/to/cookies.txt:/app/cookies/cookies.txt \
  -v ./data:/app/data \  
  ghcr.io/maitrekuc/social-to-mealie-plus:latest
```

**First setup:** Go to http://localhost:4000/setup to create an admin account and configure the application.
</details>

## Configuration

All configuration is done through the web interface at `/setup` on first run. No environment variables needed!

| Setting          | Required | Description                                                      |
|------------------|----------|------------------------------------------------------------------|
| OPENAI_URL       | Yes      | URL for the OpenAI API                                           |
| OPENAI_API_KEY   | Yes      | API key for OpenAI                                               |
| WHISPER_MODEL    | Yes      | Whisper model to use                                             |
| MEALIE_URL       | Yes      | URL of your Mealie instance                                      |
| MEALIE_API_KEY   | Yes      | API key for Mealie                                               |
| USER_PROMPT      | No       | Custom prompt for recipe extraction                              |
| EXTRA_PROMPT     | No       | Additional instructions for AI, such as language translation     |
| COOKIES_PATH     | Maybe    | Path to cookies file if you encounter issues with yt-dlp        |

### Data Persistence

- **Database**: SQLite database stored in `/app/data/database.db`
- **Configuration**: All settings stored in the database (no environment files needed)
- **Volume**: Mount `/app/data` to persist your data between container restarts
