const { EmbedBuilder } = require('discord.js');
const { getQueue } = require('../../Modules/queue');
module.exports = {
  name: 'music:trackStart',
  once: false,
  execute({ guild, queue }) {
    const channel = queue.textChannelId && guild.channels.cache.get(queue.textChannelId);

    const embed = new EmbedBuilder()
      .setTitle(`🎶Now Playing🎶`)
      .setColor(0x00ae86)
      .setTimestamp();

    const np = queue.getNowPlaying(24); // { title, url, bar, label, thumbnail, duration, position }
    embed.addFields(
      { name: 'Now Playing', value: `[${np.title}](${np.url})` },
      { name: 'Progress', value: `${np.bar}  ${np.label}`, inline: false }
    );
    if (np.thumbnail) embed.setImage(np.thumbnail);



    if (channel) channel.send({ embeds: [embed] }).catch((e) => { console.error("trackStart message send error:", e); });
  },
};