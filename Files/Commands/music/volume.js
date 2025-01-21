module.exports = {
    name: 'volume',
    aliases: ['vol'],
    description: "Sets volume of the bot.",
    howTo: ".volume [1-100]",
    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        const vol = Number(args[0]);

        // Check for no music playing or invalid input
        if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music currently playing!. ❌`);
        if (!vol || vol === NaN) return message.channel.send(`${message.author} Please ensure you select a valid number.`);
        if (vol < 1 || vol > 100) return message.channel.send(`${message.author} You can only set volume between 1% & 100%`);

        // Set volume and save to the database
        const success = queue.node.setVolume(vol);
        client.db.query(`
            INSERT INTO volume (guild_id, volume_percentage) 
            VALUES ($1, $2)
            ON CONFLICT (guild_id)
            DO UPDATE SET volume_percentage = $2;
        `, [message.guild.id, vol]);

        // Create progress bar with 10 steps
        function createProgressBar(current, total, steps = 10) {
            const progress = Math.round((current / total) * steps);
            const emptyProgress = steps - progress;
            const progressText = '🟩'.repeat(progress); // Filled part (green)
            const emptyText = '⬜'.repeat(emptyProgress); // Empty part (gray)
            const percentage = ((current / total) * 100).toFixed(2); // Percentage completion
            return `${progressText}${emptyText} ${percentage}%`;
        }

        // Build embed with progress bar
        const volEmbed = new Discord.EmbedBuilder()
            .setTitle('Volume Control')
            .setDescription(`${createProgressBar(vol, 100, 10)}`)

        // Send the embed response
        return message.channel.send({ embeds: [volEmbed] });
    }
};
