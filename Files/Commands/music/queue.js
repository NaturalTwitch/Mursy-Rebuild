// Files/Commands/music/queue.js
const { EmbedBuilder } = require('discord.js');
const { getQueue } = require('../../Modules/queue.js'); // adjust path if needed

// small helpers (match those in your queue for formatting)
function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(totalSec = 0) {
  totalSec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

module.exports = {
  name: 'queue',
  aliases: ['qu', 'progress'],
  description: 'View all songs in your queue',
  utilisation: '{prefix}queue',
  voiceChannel: true,

  async execute(client, message) {
    try {
      const queue = getQueue(message.guild);

      const isPlaying = !!queue.current;
      const hasUpcoming = queue.tracks.length > 0;

      if (!isPlaying && !hasUpcoming) {
        return message.channel.send(`${message.author}, there is no music playing currently!`);
      }

      // Build "Up Next" list
      const lines = queue.tracks.map((t, i) => {
        const dur = Number.isFinite(t.duration) ? `\`${fmtTime(t.duration)}\`` : '`LIVE`';
        const by  = t.author || t.channel || ''; // only if you store a channel/author name
        const req = t.requestedBy?.tag || t.requestedBy?.username || t.requestedBy || '';
        const meta = [by && by.trim(), req && `req: ${req}`].filter(Boolean).join(' • ');
        return `**${i + 1}.** [${t.title || 'Unknown Title'}](${t.url || '#'}) ${dur}${meta ? ` — ${meta}` : ''}`;
      });

      const shown = 10;
      const extraCount = Math.max(0, queue.tracks.length - shown);

      const embed = new EmbedBuilder()
        .setTitle(`Server Queue — ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL({ size: 256 }))
        .setColor(0x00ae86)
        .setTimestamp();

      if (isPlaying) {
        const np = queue.getNowPlaying(24); // { title, url, bar, label, thumbnail, duration, position }
        embed.addFields(
          { name: 'Now Playing', value: `[${np.title}](${np.url})` },
          { name: 'Progress', value: `${np.bar}  ${np.label}`, inline: false }
        );
        if (np.thumbnail) embed.setImage(np.thumbnail);
      }

      embed.addFields({
        name: `Up Next (${queue.tracks.length})`,
        value: lines.slice(0, shown).join('\n') || '—',
      });

      const footerBits = [];
      if (extraCount > 0) footerBits.push(`…and ${extraCount} more`);
      footerBits.push(`requested by: ${message.author.tag}`);
      embed.setFooter({ text: footerBits.join(' • ') });

      return message.channel.send({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      return message.channel.send('⚠️ Could not show the queue right now.');
    }
  }
};
