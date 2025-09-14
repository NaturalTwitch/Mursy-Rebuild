const Discord = require('discord.js');
const currentDate = new Date()

module.exports = {
    execute(cmd) {
        commandHandler(cmd);
    },
};

const commandHandler = (cmd) => {
    let author = cmd.user.tag
    if (cmd.commandName) {
        console.log(`[${currentDate.toLocaleString()}][Mursy Interactions] ${cmd.commandName} interaction was accessed by ${author} in ${cmd.guild.name}....`)
    }

    if (!cmd.isCommand()) return;


    const command = cmd.client.slashCommands.get(cmd.commandName);
    if (!command) return;

    command.execute(cmd);
};