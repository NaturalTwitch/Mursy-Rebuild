const { Track } = require("../../Modules/track.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  name: "test",
  description: "Test Command - Used for testing new things **HIGHLY UNSTABLE**",
  utilisation: "{prefix}test",
  async execute(client, message, cmd, args, Discord) {
    const queue = getQueue(message.guild);
    const np = queue.getNowPlaying(24);

    if (!np) return message.channel.send("No song is currently playing.");

    return message.channel.send(`Now Playing: ${np.title} || Progress: ${np.duration} || Position: ${np.position} || Bar: ${np.bar} `);
  },
};
