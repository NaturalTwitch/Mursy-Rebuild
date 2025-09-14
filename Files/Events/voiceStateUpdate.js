
const { getQueue } = require("../../Files/Modules/queue.js");

const leaveTimers = new Map();
const GRACE_MS = 5000;

module.exports = {
  name: "voiceStateUpdate",
  once: false,

  execute(oldState, newState) {
    handler(oldState, newState);
  },
};

function handler(oldState, newState) {
  const channel = oldState.channel || newState.channel;
  if (!channel || !channel.isVoiceBased?.()) return;

  const guild = channel.guild;
  const humans = channel.members.filter((m) => !m.user.bot).size;

  const stamp = new Date().toLocaleString();
  const actor =
    newState.member?.user?.tag || oldState.member?.user?.tag || "Unknown";

  if (humans === 0) {
    
    if (leaveTimers.has(channel.id)) return;
    const t = setTimeout(() => {
      leaveTimers.delete(channel.id);
      const stillHumans = channel.members.filter((m) => !m.user.bot).size;
      if (stillHumans === 0) {
        const q = getQueue(guild);
        q?.stop();
      }
    }, GRACE_MS);
    leaveTimers.set(channel.id, t);
  } else {
    const t = leaveTimers.get(channel.id);
    if (t) {
      clearTimeout(t);
      leaveTimers.delete(channel.id);
    }
  }
}
