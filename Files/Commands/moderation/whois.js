const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'whois',
    description: 'Displays Information about a user',
    async execute(client, message, cmd, args, Discord) {
        const { guild, channel } = message;
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        let muteRole = message.member.roles.cache.some((role) => role.name === 'muted');
        if (!muteRole) muteRole = message.member.roles.cache.some((role) => role.name === 'Muted');
        let timedOut = "False"
        let timeRemaining = null

        const targetDate = member.communicationDisabledUntil
        const now = new Date()
        const timeRemainingMilliseconds = targetDate - now;
        const seconds = Math.floor(timeRemainingMilliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (timeRemainingMilliseconds > 0) {
            const seconds = Math.floor(timeRemainingMilliseconds / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            timeRemaining = `${days}:${hours % 24}:${minutes % 60}:${seconds % 60}`
        }


        if (member.isCommunicationDisabled() === true) {
            timedOut = `True [Time Remaining: ${timeRemaining}]`
        }

        const userInfoEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle(`User Info for ${user.username}`)
            .setThumbnail(`${user.displayAvatarURL()}`)
            .addFields(
                { name: 'Display Name', value: `${user.displayName}` },
                { name: 'User Tag:', value: `${user.tag}` },
                { name: 'Online Status:', value: `${member.presence}` },
                { name: 'Nickname:', value: member.nickname || 'N/A' },
                { name: 'Bot:', value: `${user.bot}`, inline: true },
                {
                    name: 'Joined on:',
                    value: new Date(member.joinedTimestamp).toLocaleDateString(),
                    inline: true,
                },
                {
                    name: 'Created on:',
                    value: new Date(user.createdTimestamp).toLocaleDateString(),
                    inline: true,
                },
                { name: 'Bannable:', value: `${member.bannable}`, inline: true },
                { name: 'Highest Role:', value: `${member.roles.highest}`, inline: true },
                { name: 'Timed Out:', value: `${timedOut}`, inline: true },
            )
            .setFooter({ text: `Requested by ${message.author.displayName}` })
            .setTimestamp();

        message.channel.send({ embeds: [userInfoEmbed] });
    },
};