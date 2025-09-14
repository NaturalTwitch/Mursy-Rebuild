const fs = require('fs');
const path = require('path');
const { music } = require('../../Files/Client/MusicClient.js'); // the singleton emitter

let loaded = false;
function registerMusicEvents() {
  if (loaded) return; // prevent double-binding on hot reloads
  const dir = path.join(__dirname, '..', 'Events', 'music');

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const evt = require(path.join(dir, file));
    music[evt.once ? 'once' : 'on'](evt.name, (...args) => evt.execute(...args));
  }
  loaded = true;
  console.log(`[Music] Loaded music events from ${dir}`);
}

module.exports = { registerMusicEvents };
