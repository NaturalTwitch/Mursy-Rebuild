module.exports = {
    name: 'ban',
    aliases: ['banhammer'],
    description: 'Ban a user from the server',
    utilisation: '{prefix}ban [user]',
    async execute(client, message, cmd, args, Discord) {
        let modlog = await getCustomChannel(message, client)
        let channel = message.guild.channels.cache.find((x) => (x.id === `${modlog}`));
        const member = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason provided";
        let admin = message.author;
        const adminRole = member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers);
        const guild = message.guild;

        if (member.bot) return message.channel.send("You cannot ban a bot");
        if (member === admin) return message.channel.send("You cannot ban yourself");
        if (adminRole) return message.channel.send("You cannot ban an admin");

        let banreason = `Banned by ${admin.tag} for ${reason}`;

        const successEmbed = new Discord.EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Ban Hammer has Spoken')
            .setDescription(`Banned ${member} for ${reason}`)
            .setTimestamp()


        if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) return message.channel.send("You do not have the required permissions to use this command.");
        if (!member) return message.channel.send("Please mention a user to ban");
        if (!member.bannable) return message.channel.send("This user cannot be banned");

        let userBanEmbed = new Discord.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`You have been banned from ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields({
                name: 'Reason',
                value: `${reason}`,
                inline: true
            }, {
                name: 'Banned by',
                value: `${admin.tag}`,
                inline: true
            })
            .setTimestamp()

        member.send({ embeds: [userBanEmbed] });

        setTimeout(() => {
            member.ban({ reason: banreason });
        }, 1000)
        message.delete();
        if (channel) {
            channel.send({ embeds: [successEmbed] });
        } else {
            message.channel.send({ embeds: [successEmbed] }).then(m => setTimeout(() => m.delete(), 5000));
        }
    }
}

async function getCustomChannel(message, client) {
    const response = await client.db.query(`select channel_id from modlogs where guild_id = $1`, [message.guild.id])
    if (response && response.rowCount) return response.rows[0].channel_id
    return null;
}