module.exports = {
    name: 'prefix',
    aliases: ['setprefix'],
    description: 'Set the prefix for the server',
    async execute(client, message, cmd, args, Discord) {
        if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) return message.channel.send("You do not have the required permissions to use this command.");
        const newPrefix = args[0];

        if (!newPrefix) return message.channel.send("Please provide a new prefix");

        if (newPrefix.toLowerCase() === 'disable') {
            client.db.query('DELETE FROM prefix WHERE guild_id = $1', [message.guild.id]);
            return message.channel.send("The prefix has been reset to the default prefix");
        }

        if (newPrefix.length > 2) return message.channel.send("The prefix must be less than 2 characters");

        client.db.query('INSERT INTO prefix (guild_id, prefix) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET prefix = $2', [message.guild.id, newPrefix]);
        message.channel.send(`The prefix has been set to ${newPrefix}`);
    }
}