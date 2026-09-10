#!/bin/sh
# entrypoint.sh
# Ensures yt-dlp with curl_cffi is available and updates it if requested

set -e

YTDLP_BIN_PATH="${YTDLP_PATH:-./yt-dlp}"
YTDLP_VER="${YTDLP_VERSION:-latest}"
VENV_PATH="${VIRTUAL_ENV:-/venv}"

update_yt_dlp() {
  if [ -z "$YTDLP_VER" ] || [ "$YTDLP_VER" = "none" ] || [ "$YTDLP_VER" = "false" ] || [ "$YTDLP_VER" = "skip" ]; then
    echo "yt-dlp update skipped (YTDLP_VERSION=$YTDLP_VER)"
    return 0
  fi

  # Ensure virtual environment exists
  if [ ! -d "$VENV_PATH" ]; then
    echo "Creating virtual environment at $VENV_PATH..."
    python3 -m venv "$VENV_PATH" || {
      echo "Failed to create virtual environment at $VENV_PATH"
      return 1
    }
  fi

  if [ "$YTDLP_VER" = "latest" ]; then
    # If it is 'latest', check if updated in the last 24 hours
    if [ -f "$VENV_PATH/.yt-dlp-updated" ] && [ -z "$(find "$VENV_PATH/.yt-dlp-updated" -mtime +0 2>/dev/null)" ]; then
      echo "yt-dlp is present, less than 1 day old, and version is 'latest'. Skipping update."
      return 0
    fi

    echo "Updating yt-dlp (latest) with curl_cffi..."
    if "$VENV_PATH/bin/pip" install --no-cache-dir -U "yt-dlp[default,curl-cffi]"; then
      touch "$VENV_PATH/.yt-dlp-updated"
      echo "yt-dlp updated successfully"
    else
      echo "Failed to update yt-dlp via pip, continuing with existing installation"
      return 1
    fi
  else
    CLEAN_VER="${YTDLP_VER#v}"
    CURRENT_VER="$("$VENV_PATH/bin/yt-dlp" --version 2>/dev/null || true)"
    if [ "$CURRENT_VER" = "$CLEAN_VER" ]; then
      echo "yt-dlp is already at version $CLEAN_VER"
      return 0
    fi

    echo "Installing yt-dlp version $CLEAN_VER with curl_cffi..."
    if "$VENV_PATH/bin/pip" install --no-cache-dir "yt-dlp[default,curl-cffi]==$CLEAN_VER"; then
      touch "$VENV_PATH/.yt-dlp-updated"
      echo "yt-dlp $CLEAN_VER installed successfully"
    else
      echo "Failed to install yt-dlp $CLEAN_VER via pip"
      return 1
    fi
  fi
}

ensure_symlink() {
  if [ -x "$VENV_PATH/bin/yt-dlp" ]; then
    # If YTDLP_BIN_PATH is ./yt-dlp or /app/yt-dlp, ensure it links to the venv binary
    if [ "$YTDLP_BIN_PATH" = "./yt-dlp" ] || [ "$YTDLP_BIN_PATH" = "/app/yt-dlp" ]; then
      if [ "$(readlink -f "$YTDLP_BIN_PATH" 2>/dev/null)" != "$VENV_PATH/bin/yt-dlp" ]; then
        mkdir -p "$(dirname "$YTDLP_BIN_PATH")"
        ln -sf "$VENV_PATH/bin/yt-dlp" "$YTDLP_BIN_PATH"
      fi
    elif [ ! -e "$YTDLP_BIN_PATH" ]; then
      mkdir -p "$(dirname "$YTDLP_BIN_PATH")"
      ln -sf "$VENV_PATH/bin/yt-dlp" "$YTDLP_BIN_PATH"
    fi
  fi
}

# Try updating/installing yt-dlp
update_yt_dlp || true
ensure_symlink || true

# exec the main process (passed as CMD)
exec "$@"
