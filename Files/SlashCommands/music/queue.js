// commands/music/queue.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { getQueue } = require("../../Modules/queue.js"); // adjust path if needed

// small helpers (match those in your queue for formatting)
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtTime(totalSec = 0) {
  totalSec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

module.exports = {
  // Metadata equivalents preserved
  // name: 'queue',
  // aliases: ['qu', 'progress'],
  // description: 'View all songs in your queue',
  // utilisation: '{prefix}queue',
  // voiceChannel: true,

  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View all songs in your queue"),

  /**
   * Command execution
   */
  async execute(interaction, client) {
    try {
      // voiceChannel: true enforcement (equivalent to your prefix prop)
      const vc = interaction.member?.voice?.channel;
      if (!vc) {
        return interaction.reply({
          content: `You need to be in a voice channel to use this. ❌`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const queue = getQueue(interaction.guild);

      const isPlaying = !!queue?.current;
      const hasUpcoming = !!queue && queue.tracks.length > 0;

      if (!isPlaying && !hasUpcoming) {
        return interaction.reply({
          content: `${interaction.user}, there is no music playing currently!`,
        });
      }

      // Build "Up Next" list
      const lines = (queue.tracks || []).map((t, i) => {
        const dur = Number.isFinite(t.duration)
          ? `\`${fmtTime(t.duration)}\``
          : "`LIVE`";
        const by = t.author || t.channel || ""; // only if you store a channel/author name
        const req =
          t.requestedBy?.tag || t.requestedBy?.username || t.requestedBy || "";
        const meta = [by && by.trim(), req && `req: ${req}`]
          .filter(Boolean)
          .join(" • ");
        return `**${i + 1}.** [${t.title || "Unknown Title"}](${
          t.url || "#"
        }) ${dur}${meta ? ` — ${meta}` : ""}`;
      });

      const shown = 10;
      const extraCount = Math.max(0, (queue.tracks?.length || 0) - shown);

      const embed = new EmbedBuilder()
        .setTitle(`Server Queue — ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL({ size: 256 }))
        .setColor(0x00ae86)
        .setTimestamp();

      if (isPlaying) {
        // expected shape from your queue.getNowPlaying(24):
        // { title, url, bar, label, thumbnail, duration, position }
        const np = queue.getNowPlaying(24);
        embed.addFields(
          { name: "Now Playing", value: `[${np.title}](${np.url})` },
          { name: "Progress", value: `${np.bar}  ${np.label}`, inline: false }
        );
        if (np.thumbnail) embed.setImage(np.thumbnail);
      }

      embed.addFields({
        name: `Up Next (${queue.tracks.length})`,
        value: lines.slice(0, shown).join("\n") || "—",
      });

      const footerBits = [];
      if (extraCount > 0) footerBits.push(`…and ${extraCount} more`);
      footerBits.push(`requested by: ${interaction.user.tag}`);
      embed.setFooter({ text: footerBits.join(" • ") });

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      // mirror your original behavior (send a plain warning)
      const content = "⚠️ Could not show the queue right now.";
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ content });
      }
      return interaction.reply({ content, ephemeral: true });
    }
  },
};
