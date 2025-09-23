// <---              Events               --->
// | trackStart, disconnected, playerError,  |
// | trackEnd, connected, trackAdd, stopped, |
// | volumeChange, queueEmpty, progress      |
// <----------------------------------------->

// <---                  Functions                           --->
// | getCurrentTrack(), getNowPlaying(), enqueue(track),        |
// | skip(), pause(), resume(), stop(), setVolume(percent),     |
// | previousTrack(), clear(), setLoop(mode)                    |
// <------------------------------------------------------------>

// Everything you need to know in order to operate the command files is Listed Above this line               \\
// You need not to change anything under this line unless adding something new, this works do not fuck with it \\

const LoopMode = { OFF: 0, TRACK: 1, QUEUE: 2 };

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require("@discordjs/voice");
const { music, MUSIC_EVENTS } = require("../Client/MusicClient.js");

// --- helpers for formatting ---
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtTime(totalSec = 0) {
  totalSec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function makeBar(position, duration, size = 24) {
  if (!duration || duration <= 0) return "▶──────── live";
  const ratio = Math.max(0, Math.min(1, position / duration));
  const idx = Math.min(size - 1, Math.floor(ratio * size));
  let out = "";
  for (let i = 0; i < size; i++) out += i === idx ? "🔘" : "─";
  return out;
}

function youtubeIdFromUrl(u = "") {
  try {
    const url = new URL(u.startsWith("http") ? u : `https://${u}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1);
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const m = url.pathname.match(/\/shorts\/([^/?#]+)/);
      if (m) return m[1];
    }
  } catch { }
  return null;
}

function pickBestThumbFromTrack(track) {
  // 1) if Track already has a single thumbnail URL, use it
  if (track?.thumbnail) return track.thumbnail;

  // 2) else if Track has an array of thumbnails, pick the largest by area
  const arr = Array.isArray(track?.thumbnails) ? track.thumbnails : [];
  if (arr.length) {
    let best = arr[0];
    let bestArea = (best.width || 0) * (best.height || 0);
    for (const t of arr) {
      const a = (t.width || 0) * (t.height || 0);
      if (a > bestArea) {
        best = t;
        bestArea = a;
      }
    }
    return best?.url || null;
  }

  // 3) fallback: derive a YouTube thumbnail from the URL
  const id = youtubeIdFromUrl(track?.url || "");
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null; // hqdefault is reliable
}

class GuildQueue {
  constructor(guild) {
    this.guild = guild;
    this.connection = null;
    this.player = createAudioPlayer();
    this.tracks = [];
    this.loopMode = LoopMode.OFF;
    this.lastTrack = null;
    this.nextInLine = null;
    this.current = null;
    this.killer = null;
    this.resource = null;
    this.defaultVolume = 0.5;
    this.textChannelId = null; // optional: where you'd like to post embeds

    this._progressInterval = null;
    this._progressEveryMs = 5000; // emit every 5s; tweak as you like

    this.player.on(AudioPlayerStatus.Playing, () => {
      if (this.current) {
        music.emit(MUSIC_EVENTS.TRACK_START, {
          guild: this.guild,
          track: this.current,
          queue: this,
        });
      }
      this._startProgressTicker();
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      const ended = this.current;
      this.lastTrack = this.current;
      this.killer?.();
      this.killer = null;
      this._stopProgressTicker();
      this.current = null;
      if (ended) {

        if (this.loopMode === LoopMode.TRACK) {
          this.tracks.unshift(ended);
        } else if (this.loopMode === LoopMode.QUEUE) {
          this.tracks.push(ended);
        }
        music.emit(MUSIC_EVENTS.TRACK_END, {
          guild: this.guild,
          track: ended,
          queue: this,
        });
      }
      this._playNext();
    });

    this.player.on("error", (error) => {
      const failed = this.current;
      this.killer?.();
      this.killer = null;
      this.current = null;
      music.emit(MUSIC_EVENTS.PLAYER_ERROR, {
        guild: this.guild,
        track: failed,
        error,
        queue: this,
      });
      this._playNext();
    });
  }

  /** seconds elapsed for current track */
  getPositionSeconds() {
    return Math.floor((this.resource?.playbackDuration || 0) / 1000);
  }
  /** seconds total (may be null/undefined for live) */
  getDurationSeconds() {
    return Number.isFinite(this.current?.duration)
      ? this.current.duration
      : null;
  }
  /** returns { position, duration, bar, label } */
  getProgress(size = 24) {
    const pos = this.getPositionSeconds();
    const dur = this.getDurationSeconds();
    const bar = makeBar(pos, dur, size);
    const label = dur
      ? `${fmtTime(pos)} / ${fmtTime(dur)}`
      : `${fmtTime(pos)} / LIVE`;
    return { position: pos, duration: dur, bar, label };
  }
  /** convenience for embeds/messages */
  getProgressLine(size = 24) {
    const { bar, label } = this.getProgress(size);
    return `${bar}  ${label}`;
  }

  setTextChannel(id) {
    this.textChannelId = id;
  }

  _destroyConnection() {
    try {
      this.connection?.destroy();
    } catch { }
    if (this.connection) {
      music.emit(MUSIC_EVENTS.DISCONNECTED, { guild: this.guild, queue: this });
    }
    this.connection = null;
  }

  async connect(voiceChannel) {
    if (
      this.connection &&
      this.connection.joinConfig.channelId === voiceChannel.id
    )
      return;

    this.connection?.destroy();
    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    await entersState(this.connection, VoiceConnectionStatus.Ready, 15_000);
    this.connection.subscribe(this.player);

    music.emit(MUSIC_EVENTS.CONNECTED, {
      guild: this.guild,
      channelId: voiceChannel.id,
      queue: this,
    });
  }

  getCurrentTrack() {
    return this.current || null;
  }

  // return a ready-to-use “now playing” bundle
  getNowPlaying(size = 24) {
    if (!this.current) return null;
    const pos = this.getPositionSeconds();
    const dur = this.getDurationSeconds();
    const bar = makeBar(pos, dur, size);
    const label = dur
      ? `${fmtTime(pos)} / ${fmtTime(dur)}`
      : `${fmtTime(pos)} / LIVE`;

    return {
      title: this.current.title || "Unknown Title",
      url: this.current.url,
      isLive: !!this.current.isLive,
      duration: dur,
      position: pos,
      bar,
      label,
      thumbnail: pickBestThumbFromTrack(this.current),
    };
  }

  enqueue(track) {
    this.tracks.push(track);
    const position = this.tracks.length;
    music.emit(MUSIC_EVENTS.TRACK_ADD, {
      guild: this.guild,
      track,
      position,
      queue: this,
    });
    if (!this.current) this._playNext();
    return position;
  }

  skip() {
    if (!this.current) return false;
    this.player.stop(true);
    return true;
  }
  pause() {
    try {
      return this.player.pause();
    } catch {
      return false;
    }
  }
  resume() {
    try {
      return this.player.unpause();
    } catch {
      return false;
    }
  }

  stop() {
    this.tracks = [];
    this.loopMode = LoopMode.OFF;
    this.player.stop(true);
    this.killer?.();
    this.killer = null;
    this.current = null;
    this._destroyConnection();
    music.emit(MUSIC_EVENTS.STOPPED, { guild: this.guild, queue: this });
  }

  setVolume(percent) {
    const val = Math.max(0, Math.min(200, Number(percent) || 0)) / 100;
    this.defaultVolume = val;
    if (this.resource?.volume) this.resource.volume.setVolume(val);
    music.emit(MUSIC_EVENTS.VOLUME_CHANGE, {
      guild: this.guild,
      volume: val,
      queue: this,
    });
    return val;
  }

  _playNext() {
    if (this.nextInLine) { // If we went back to the previous song this should set the queue back to normal. NT 09/23/2025
      const next = this.nextInLine;
      this.current = next;

      const { stream, kill } = next.createAudioStream();
      this.killer = kill;

      const resource = createAudioResource(stream, {
        inputType: StreamType.OggOpus,
        inlineVolume: true,
      });
      this.resource = resource;
      if (this.resource.volume)
        this.resource.volume.setVolume(this.defaultVolume);

      this.nextInLine = null; // This should make sure we aren't constantly looping the same song for the end of time lol NT 09/23/2025
      this.player.play(resource);


      return;
    }

    const next = this.tracks.shift();
    if (!next) {
      music.emit(MUSIC_EVENTS.QUEUE_EMPTY, { guild: this.guild, queue: this });
      return this._destroyConnection();
    }

    this.current = next;

    const { stream, kill } = next.createAudioStream();
    this.killer = kill;

    const resource = createAudioResource(stream, {
      inputType: StreamType.OggOpus,
      inlineVolume: true,
    });
    this.resource = resource;
    if (this.resource.volume)
      this.resource.volume.setVolume(this.defaultVolume);

    this.player.play(resource);
  }

  previousTrack() {
    if (!this.lastTrack) return false; // If there is no last track, do nothing NT 09/23/2025


    const last = this.lastTrack; // Grabs Last Song playing set in idleStatus NT 09/23/2025
    this.nextInLine = this.current; // Makes sures to set the currently playing song as the Next In Line so it rebuilds the queue in proper order NT 09/23/2025

    this.current = last; // changes this current into the previously playing song so we get the right info NT 09/23/2025

    const { stream, kill } = last.createAudioStream();
    this.killer = kill;

    const resource = createAudioResource(stream, {
      inputType: StreamType.OggOpus,
      inlineVolume: true,
    });
    this.resource = resource;
    if (this.resource.volume)
      this.resource.volume.setVolume(this.defaultVolume);

    this.player.play(resource);

  }

  clear() {
    const removed = this.tracks.length;
    this.tracks = [];
    return removed;
  }

  setLoop(mode) {
    const m = (typeof mode === "string") ? ({ off: LoopMode.OFF, track: LoopMode.TRACK, queue: LoopMode.QUEUE }[mode.toLowerCase()] ?? LoopMode.OFF) : (Object.values(LoopMode).includes(mode) ? mode : LoopMode.OFF);
    this.loopMode = m;
  }

  _startProgressTicker() {
    this._stopProgressTicker(); // avoid duplicates
    this._progressInterval = setInterval(() => {
      if (!this.current) return;
      music.emit(MUSIC_EVENTS.PROGRESS, {
        guild: this.guild,
        queue: this,
        track: this.current,
        ...this.getProgress(24), // position, duration, bar, label
      });
    }, this._progressEveryMs);
  }

  _stopProgressTicker() {
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = null;
    }
  }
}



const queues = new Map();
function getQueue(guild) {
  if (!queues.has(guild.id)) queues.set(guild.id, new GuildQueue(guild));
  return queues.get(guild.id);
}

module.exports = { getQueue, GuildQueue };
