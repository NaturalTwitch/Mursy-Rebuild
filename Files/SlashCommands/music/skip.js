// commands/music/skip.js
const { SlashCommandBuilder } = require("discord.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next song in queue"),

  async execute(interaction, client) {
    // enforce VC requirement (voiceChannel: true in prefix version)
    const vc = interaction.member?.voice?.channel;
    if (!vc) {
      return interaction.reply({
        content: `You need to be in a voice channel to skip music ❌`,
        ephemeral: true,
      });
    }

    const queue = getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        content: `${interaction.user}, there is no music currently playing! ❌`,
      });
    }

    try {
      queue.skip();
      return interaction.reply(`⏭️ | Skipped Song!`);
    } catch (err) {
      console.error("[skip] error:", err);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply("⚠️ Could not skip right now.");
      }
      return interaction.reply({
        content: "⚠️ Could not skip right now.",
        ephemeral: true,
      });
    }
  },
};
