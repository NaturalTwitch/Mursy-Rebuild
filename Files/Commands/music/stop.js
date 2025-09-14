const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  name: "stop",
  aliases: ["st"],
  description: "Stop all music playback",
  utilisation: "{prefix}stop",
  voiceChannel: true,
  async execute(client, message, cmd, args, Discord) {
    const queue = getQueue(message.guild);
    if (!queue)
      return message.channel.send(
        `${message.author}, There is no music playing! ❌`
      );
    queue.stop();
    message.channel.send(
      `🛑 | Music playback has been stopped and the queue has been cleared!`
    );
  },
};
