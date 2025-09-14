const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  name: "pause",
  aliases: [],
  description: "Pause your Current Music",
  utilisation: "{prefix}pause",
  voiceChannel: true,

  async execute(client, message, cmd, args, Discord) {
    const queue = getQueue(message.guild);

    if (!queue)
      return message.channel.send(
        `${message.author}, There is no music currently playing!`
      );

    const success = queue.pause();
    return message.channel.send(
      success
        ? `The Currently playing music has been Paused!`
        : `${message.author}, Something Went Wrong!`
    );
  },
};
