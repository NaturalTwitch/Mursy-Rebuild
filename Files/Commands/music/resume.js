const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  name: "resume",
  aliases: [],
  description: "Resume Music Playback",
  utilisation: "{prefix}resume",
  voiceChannel: true,

  execute(client, message, cmd, args, Discord) {
    const queue = getQueue(message.guild);

    if (!queue)
      return message.channel.send(
        `${message.author}, There is no music currently playing!.`
      );

    const success = queue.resume();

    return message.channel.send(
      success
        ? `Your queue has been Resumed!`
        : `${message.author}, Something went wrong.`
    );
  },
};
