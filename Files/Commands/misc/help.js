module.exports = {
    name: 'help',
    aliases: ['cmd'],
    description: `Shows what commands the bot has.`,
    howTo: ".help \n .help [cmd] to show what the command does.",
    catergory: 'misc',
    async execute(client, message, cmd, args, Discord) {
        const command = client.commands.get(args[0]);

        if (!command) {
            // Group commands by categories
            const categorizedCommands = {};
            client.commands.forEach(cmd => {
                const catergory = cmd.catergory || "Uncategorized"; // Ensure every command has a catergory

                //Hides dev only commands - NT September 9th 2025
                if (catergory === 'botowner' && message.author.id !== '513413045251342336') return;

                if (!categorizedCommands[catergory]) {
                    categorizedCommands[catergory] = [];
                }
                categorizedCommands[catergory].push(cmd);
            });

            // Generate select menu options based on categories - NT
            const catergoryOptions = Object.keys(categorizedCommands).map(catergory => ({
                label: capitalizeFirstLetter(catergory),
                value: catergory.toLowerCase()
            }));

            const menu = new Discord.StringSelectMenuBuilder()
                .setCustomId(`Help_Menu`)
                .setPlaceholder("Help Categories...")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(catergoryOptions);

            const defaultEmbed = new Discord.EmbedBuilder()
                .setColor(`#000000`)
                .setTitle(`Mursy Help Menu`)
                .setDescription("[Support Server](https://discord.gg/3beHZ6c2HV) | Prefix `.`")
                .addFields({
                    name: `**__How to use:__**`,
                    value: `To select your help catergory, use the drop-down menu. This embed will change to display the commands for that catergory.`,
                })
                .setFooter({
                    text: `Support Mursy on [Patreon](https://www.patreon.com/MursyDiscord)`
                });

            // Send the menu with the default help embed
            const row = new Discord.ActionRowBuilder().addComponents(menu);
            const helpMessage = await message.channel.send({ embeds: [defaultEmbed], components: [row] });

            // Set up an interaction collector to listen for menu selections
            const filter = (interaction) => interaction.customId === 'Help_Menu' && interaction.user.id === message.author.id;
            const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                const selectedcatergory = interaction.values[0].toLowerCase();
                const commandsIncatergory = categorizedCommands[selectedcatergory] || [];

                if (commandsIncatergory.length === 0) {
                    await interaction.deferUpdate();
                    await helpMessage.edit({
                        content: `No commands found in the catergory **${capitalizeFirstLetter(selectedcatergory)}**.`,
                        embeds: [],
                        components: []
                    });
                    return;
                }

                // Generate an embed showcasing the commands in the selected catergory
                const catergoryEmbed = new Discord.EmbedBuilder()
                    .setColor(`#000000`)
                    .setTitle(`${capitalizeFirstLetter(selectedcatergory)} Commands`)
                    .setDescription("[Support Server](https://discord.gg/dFBKKPB8Y3) | Prefix `.`")
                    .addFields(
                        commandsIncatergory.map(cmd => ({
                            name: capitalizeFirstLetter(cmd.name),
                            value: cmd.description || 'No description available.',
                            inline: true
                        }))
                    );

                await interaction.deferUpdate();
                await helpMessage.edit({ embeds: [catergoryEmbed], components: [] });
            });

            return;
        }

        if (command.catergory === 'botowner' && message.author.id !== '513413045251342336') return;

        // Fallback: If a command is directly requested by name - NT
        const name = command.name;
        const cmdaliases = command.aliases ? command.aliases.join(', ') : 'None';
        const description = command.description || 'No description available.';
        const catergory = command.catergory || "Uncategorized";
        const howTo = command.howTo || command.utilisation || "No example was found"

        const cmdShowcase = new Discord.EmbedBuilder()
            .setColor(`#000000`)
            .setTitle(capitalizeFirstLetter(name) || 'null')
            .addFields(
                { name: `Aliases:`, value: cmdaliases },
                { name: `Description:`, value: capitalizeFirstLetter(description) },
                { name: `How to Use:`, value: capitalizeFirstLetter(howTo) },
                { name: `Catergory:`, value: capitalizeFirstLetter(catergory) }
            );

        message.channel.send({ embeds: [cmdShowcase] });
    }
};

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    if (!string) return ''; // Handle empty strings
    return string.charAt(0).toUpperCase() + string.slice(1);
}
