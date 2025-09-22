const { SlashCommandBuilder } = require("discord.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop all music playback and clear the queue."),

  /**
   * Command execution
   */
  async execute(interaction, client) {
    const vc = interaction.member?.voice?.channel;
    if (!vc) {
      return interaction.reply({
        content: `You need to be in a voice channel to stop the music. ❌`,
        ephemeral: true,
      });
    }

    const queue = getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        content: `There is no music playing! ❌`,
        ephemeral: true,
      });
    }

    try {
      queue.stop();
      await interaction.reply(
        `🛑 | Music playback has been stopped and the queue has been cleared!`
      );
    } catch (err) {
      console.error("[stop] error:", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          `There was an error trying to stop the music ❌`
        );
      } else {
        await interaction.reply({
          content: `There was an error trying to stop the music ❌`,
          ephemeral: true,
        });
      }
    }
  },
};
