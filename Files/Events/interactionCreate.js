const Discord = require("discord.js");
const currentDate = new Date();

// in your interactionCreate event
module.exports = {
  execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.slashCommands.get(
        interaction.commandName
      );
      if (!command) return;
      command.execute(interaction, interaction.client);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashCommands.get(
        interaction.commandName
      );
      if (!command || !command.autocomplete) return;
      command.autocomplete(interaction, interaction.client);
    }
  },
};
