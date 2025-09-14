const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    aliases: ['purge'],
    description: 'Clears Past Messages',
    utilisation: `{prefix}clear [# of Messages]`,
    async execute(client, message, cmd, args, Discord) {
        let member = message.author.username;

        let modlog = await getCustomChannel(message, client);
        let channel = message.guild.channels.cache.find((x) => x.id === `${modlog}`);
        let admin = message.author.id;

        if (message.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) {
            if (message.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages) || admin === '513413045251342336') {
                if (!args[0]) return message.reply('Please enter the amount of messages to clear!');
                if (isNaN(args[0])) return message.reply('Please Enter the amount of messages to clear!');

                if (args[0] > 100) return message.reply('Please enter an amount below 100 messages!');
                if (args[0] < 1)
                    return message.reply("What you doing silly you can't clear negative number");

                await message.channel.messages.fetch({ limit: Number(args[0]) + 1 }).then((messages) => {
                    message.channel
                        .bulkDelete(messages)
                        .catch((err) => console.log(err))
                        .then(() => { });
                    const message1Embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setDescription(`${args[0]} Messages Cleared`);

                    const message2Embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setDescription(`${args[0]} Message Cleared`);

                    const message3Embed = new EmbedBuilder()
                        .setColor('#000000')
                        .setTitle('Messages Cleared')
                        .setDescription(`<@${admin}> used the Clear Command`)
                        .addFields({ name: `Cleared ${args[0]} Message in`, value: `<#${message.channel.id}>` });

                    const message4Embed = new EmbedBuilder()
                        .setColor('#000000')
                        .setTitle('Messages Cleared')
                        .setDescription(`<@${admin}> used the Clear Command`)
                        .addFields({ name: `Cleared ${args[0]} Message in`, value: `<#${message.channel.id}>` });

                    if (args[0] > 1) {
                        message.channel.send({ embeds: [message1Embed] });
                        console.log(`clear command accessed by ${member} to clear ${args[0]} Messages `);
                        if (channel) {
                            channel.send({ embeds: [message4Embed] });
                        }
                        setTimeout(function () {
                            message.channel.bulkDelete(1);
                        }, 3000);
                    }

                    if (args[0] < 2) {
                        message.channel.send({ embeds: [message2Embed] }).catch((err) => console.log(err));
                        console.log(`clear command accessed by ${member} to clear ${args[0]} Message `);
                        if (channel) {
                            channel.send({ embeds: [message3Embed] });
                        }
                        setTimeout(function () {
                            message.channel.bulkDelete(1);
                        }, 3000);
                    }
                });
            } else {
                const accessEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`You Don't Have Enough Permissions To Execute This Command!`);
                message.channel.send({ embeds: [accessEmbed] });
            }
        } else {
            const permissionEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(
                    "I Don't Have Enough Permissions To Execute This Command! `MANAGE_MESSAGES`",
                );
            message.channel.send({ embeds: [permissionEmbed] });
        }
    },
};

async function getCustomChannel(message, client) {
    const response = await client.db.query(`select channel_id from modlogs where guild_id = $1`, [
        message.guild.id,
    ]);
    if (response && response.rowCount) return response.rows[0].channel_id;
    return null;
}