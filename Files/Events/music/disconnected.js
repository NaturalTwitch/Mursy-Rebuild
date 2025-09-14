module.exports = {
  name: 'music:disconnected',
  once: false,
  execute({ guild, queue }) {
    const channel = queue.textChannelId && guild.channels.cache.get(queue.textChannelId);
    if (channel) channel.send('❌ Disconnected from voice channel, clearing queue...').catch(()=>{});
  }
}