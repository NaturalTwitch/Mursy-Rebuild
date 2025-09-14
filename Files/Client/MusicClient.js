// Files/Modules/musicClient.js
const { EventEmitter } = require('node:events');

class MusicClient extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // avoid warnings across many guilds
  }
}

const music = new MusicClient();

const MUSIC_EVENTS = Object.freeze({
  TRACK_ADD:     'music:trackAdd',
  TRACK_START:   'music:trackStart',
  TRACK_END:     'music:trackEnd',
  QUEUE_EMPTY:   'music:queueEmpty',
  CONNECTED:     'music:connected',
  DISCONNECTED:  'music:disconnected',
  STOPPED:       'music:stopped',
  PLAYER_ERROR:  'music:playerError',
  VOLUME_CHANGE: 'music:volumeChange',
});

module.exports = { music, MUSIC_EVENTS };
