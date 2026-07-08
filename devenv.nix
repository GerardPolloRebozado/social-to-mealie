{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  packages = [
    pkgs.ffmpeg
    pkgs.yt-dlp
    pkgs.gallery-dl
  ];

  dotenv.enable = true;
  enterShell = ''
    export YTDLP_PATH="${pkgs.yt-dlp}/bin/yt-dlp"
    export FFMPEG_PATH="${pkgs.ffmpeg}/bin/ffmpeg"
    export GALLERY_DL_PATH="${pkgs.gallery-dl}/bin/gallery-dl"
  '';
  # See full reference at https://devenv.sh/reference/options/
}
