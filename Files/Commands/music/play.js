const { useMainPlayer, QueryType } = require("discord-player");
const urlVerifier = require("../../Modules/urlVerifier.js");

const { Track } = require("../../Modules/track.js");
const { getQueue } = require("../../Modules/queue.js");


module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song in your Voice Channel - **Supports Youtube Only!**",
  utilisation: "{prefix}play [song name/url]",
  voiceChannel: true,

  async execute(client, message, cmd, args, Discord) {
    const url = args.join(" ");
    if (!args.length)
      return message.channel.send(
        `${message.author}, Please provide a song name or url to play! ❌`
      );

    const vc = message.member?.voice?.channel;
    if (!vc)
      return message.channel.send(
        `${message.author}, You need to be in a Voice Channel to play a song! ❌`
      );

    const queue = getQueue(message.guild);

    queue.setTextChannel(message.channel.id);

    if (!queue) {
      const join = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
    }

    try {
      await queue.connect(vc);

      // const input = url.startsWith("http") ? url : `ytsearch1${url}`;
      const track = await Track.fromUrl(url, message.guild.id);
      const pos = await queue.enqueue(track);

      message.reply(
        `🎶 | **${track.title}** has been added to the queue! (Position: ${pos})`
      );
    } catch (error) {
      console.error(error);
      message.channel.send(
        `${message.author}, There was an error trying to play the song ❌`
      );
    }
  },
};
