const { spawn } = require("child_process");
const play = require("play-dl");

class Track {
  constructor({ url, title, duration, isLive, thumbnail, thumbnails }) {
    this.url = url;
    this.title = title || "Unknown Title";
    this.duration = duration || null; // seconds
    this.isLive = !!isLive;
    this.thumbnail = thumbnail || null; // best single URL
    this.thumbnails = thumbnails || []; // full list
  }

  static _pickBestThumbnail(thumbnails = []) {
    if (!Array.isArray(thumbnails) || thumbnails.length === 0) return null;
    // choose by largest area (width*height)
    const best = thumbnails.reduce((a, b) => {
      const aw = (a?.width || 0) * (a?.height || 0);
      const bw = (b?.width || 0) * (b?.height || 0);
      return bw > aw ? b : a;
    });
    return best?.url || thumbnails[0]?.url || null;
  }

  static async fromUrl(input) {
    let url = input;

    const looksLikeUrl =
      typeof url === "string" &&
      (url.startsWith("http") ||
        url.startsWith("youtube.com") ||
        url.startsWith("youtu.be") ||
        url.startsWith("www."));

    try {
      if (!looksLikeUrl) {
        // search first, then resolve real URL
        const results = await play.search(url, {
          limit: 1,
          source: { youtube: "video" },
        });
        if (!results.length) throw new Error("No results found");
        url = results[0].url;
      }

      const info = await play.video_info(url);
      const d = info.video_details;

      const bestThumb = Track._pickBestThumbnail(d.thumbnails);

      return new Track({
        url: d.url,
        title: d.title,
        duration: d.durationInSec,
        isLive: d.live,
        thumbnail: bestThumb,
        thumbnails: d.thumbnails || [],
      });
    } catch (err) {
      console.error("play-dl metadata error:", err?.message || err);
      // Fallback minimal track if metadata failed
      return new Track({ url });
    }
  }

  /**
   * Returns { stream, kill } where 'stream' is OggOpus readable for @discordjs/voice
   * Pipeline: yt-dlp (stdout) -> ffmpeg (to OggOpus)
   */
  createAudioStream() {
    const ytdlpProc = spawn(
      "yt-dlp",
      [
        "-f",
        "bestaudio",
        "-o",
        "-", // write to stdout
        "--no-playlist",
        this.url,
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    const ffmpegProc = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "warning",
        "-i",
        "pipe:0",
        "-vn",
        "-acodec",
        "libopus",
        "-b:a",
        "160k",
        "-f",
        "ogg",
        "pipe:1",
      ],
      { stdio: ["pipe", "pipe", "ignore"] }
    );

    ytdlpProc.stdout.pipe(ffmpegProc.stdin);

    const cleanup = () => {
      try {
        ytdlpProc.kill("SIGKILL");
      } catch {}
      try {
        ffmpegProc.kill("SIGKILL");
      } catch {}
    };

    ffmpegProc.on("close", cleanup);

    return { stream: ffmpegProc.stdout, kill: cleanup };
  }
}

module.exports = { Track };
