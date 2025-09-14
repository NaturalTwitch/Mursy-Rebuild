const { EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const { getQueue } = require("../../Modules/queue.js");
const { Track } = require("../../Modules/track.js");

module.exports = {
  name: "progress",
  aliases: ["time"],
  description: "Shows how much of the song is left",
  utilisation: "{prefix}progress",
  voiceChannel: true,

  async execute(client, message, cmd, args, Discord) {
    try {
      const queue = getQueue(message.guild);
      const track = queue.getNowPlaying();

      if (!queue)
        return message.channel.send(
          `${message.author}, There is no music currently playing!`
        );

      const progressEmbed = new EmbedBuilder()
        .setColor(`000000`)
        .setTitle(`${track.title}`)
        .setImage(`${track.thumbnail}`)
        .setDescription(`${track.bar}`);

      message.channel.send({ embeds: [progressEmbed] });
    } catch (e) {
      console.log(e);
      return;
    }
  },
};
