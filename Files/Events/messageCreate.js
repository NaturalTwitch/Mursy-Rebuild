const ms = require('ms');
const Discord = require('discord.js');
const userCooldowns = new Map();

module.exports = {
    async execute(message) {

        // console.log(message.content);
        const { client } = message;

        this.commandHandler(message, client);
        // this.messageHandler(message, client);
    },

    async commandHandler(message, client) {
        const customPrefix = await getCustomPrefix(message, client);
        const { prefix } = client;

        if (customPrefix) {
            if (!message.content.startsWith(customPrefix) || message.author.bot) return;
        } else if (!message.content.startsWith(prefix) || message.author.bot) return;

        const usedPrefix = message.content.startsWith(prefix) ? prefix : customPrefix;

        const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

        try {
            command.execute(client, message, cmd, args, Discord);
            const currentDate = new Date();
            console.log(`[${currentDate.toLocaleString()}][Mursy Systems] ${message.author.tag} used command: ${cmd}`);
        } catch (e) {
            const currentDate = new Date();
            console.log(`[${currentDate.toLocaleString()}][Mursy Systems] ${message.author.tag} tried to use command: ${cmd} but it errored out` + e.stack);
        }
    },
}


async function getCustomPrefix(message, client) {
    try {
        const response = await client.db.query(
            `select prefix from prefix where guild_id = $1`,
            [message.guild.id]
        );
        if (response && response.rowCount) return response.rows[0].prefix;
        return null;
    } catch (err) {
        return null;
    }
}