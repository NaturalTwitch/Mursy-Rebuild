module.exports = {
    name: 'kick',
    aliases: ['kic'],
    description: 'Kicks a user from the server',
    utilisation: '{prefix}kick [User]',
    async execute(client, message, cmd, args, Discord) {
        let modlog = await getCustomChannel(message, client);
        let channel = message.guild.channels.cache.find((x) => (x.id === `${modlog}`));
        const member = message.mentions.member.first();
        const reason = args.slice(1).join(" ") || "No Reason Provided";
        const admin = message.author;
        const adminRole = member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers); // TODO: Look up KICKMEMBER FLAG
        const guild = message.guild;

        if (member.bot) return message.reply("You Cannot Kick Bots.");
        if (member === admin) return message.reply("You Cannot Kick Yourself.");
        if (adminRole) return message.reply("You cannot Kick admins");

        const kickReason = `Kicked by ${admin.tag} for ${reason}`;

        const successEmbed = new Discord.EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('The Boot Came Out.')
            .setDescription(`Kicked ${member} for ${reason}`)
            .setTimestamp()

        if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) return message.reply(`You do not have enough permissions to execute this command.`);
        if (!member) return message.reply("Please mention a user to kick");
        if (!member.bannable) return message.reply(`This user cannot be kicked`);

        const userKickEmbed = new Discord.EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`You have been kicked from ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields({
                name: 'Reason',
                value: `${reason}`,
                inline: true
            }, {
                name: 'Kicked by',
                value: `${admin.tag}`,
                inline: true
            })
            .setTimestamp()

        member.send({ embeds: [userKickEmbed] });

        setTimeout(() => {
            member.kick({ reason: kickReason })
        }, 1000)
        message.delete()

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