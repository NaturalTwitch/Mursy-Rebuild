const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  name: "skip",
  aliases: ["next"],
  description: "Skip to the next song in queue",
  utilisation: "{prefix}skip",
  voiceChannel: true,
  async execute(client, message, cmd, args, Discord) {
    const queue = getQueue(message.guild);

    if (!queue)
      return message.channel.send(
        `${message.author}, There is no music currently playing!`
      );
    queue.skip();

    return message.channel.send(`Skipped Song!`);
  },
};
