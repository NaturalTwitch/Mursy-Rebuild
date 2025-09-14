const { EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'music:trackStart',
  once: false,
  execute({ guild, queue }) {
    const channel = queue.textChannelId && guild.channels.cache.get(queue.textChannelId);

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('🎶 Playing Next Song 🎶')


    if (channel) channel.send('✅ Playing Next Song').catch(()=>{});
  },
};