const { SlashCommandBuilder } = require("discord.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  // name: "pause",
  // aliases: [],
  // description: "Pause your Current Music",
  // utilisation: "{prefix}pause",
  // voiceChannel: true,

  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause your current music"),

  async execute(interaction, client) {
    // voiceChannel: true enforcement
    const vc = interaction.member?.voice?.channel;
    if (!vc) {
      return interaction.reply({
        content: `You need to be in a voice channel to pause music ❌`,
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
      const success = queue.pause();
      return interaction.reply(
        success
          ? `⏸️ | The currently playing music has been paused!`
          : `${interaction.user}, something went wrong! ❌`
      );
    } catch (err) {
      console.error("[pause] error:", err);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply("⚠️ Could not pause right now.");
      }
      return interaction.reply({
        content: "⚠️ Could not pause right now.",
        ephemeral: true,
      });
    }
  },
};
