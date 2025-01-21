const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'queue',
    aliases: ['qu'],
    description: "View all songs in your queue",
    utilisation: '{prefix}queue',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        try {
            const queue = client.player.nodes.get(message.guild.id);

            if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, there is no music playing currently!`);
            if (!queue.tracks) return message.channel.send(`Queue is Empty, add more songs with the play command.`)
            const tracks = queue.tracks.map((track, i) => `**${i + 1}** - ${track.title} | ${track.author} (Requested by ${queue.metadata.requestedBy})`);
            const songs = queue.tracks.size;
            const nextSongs = songs > 5 ? `And **${songs - 5}** Other Song...` : `There are **${songs}** Songs in the List.`;

            const embed = new EmbedBuilder()
                .setThumbnail(message.guild.iconURL({ size: 2048, dynamic: true }))
                .setTitle(`Server Music List - ${message.guild.name}`)
                .setDescription(`Currently Playing: \`${queue.currentTrack.title}\`\n\n${tracks.slice(0, 5).join('\n')}\n\n${nextSongs}`)
                .setTimestamp()
                .setFooter({ text: `requested by: ${message.author.tag}` });

            message.channel.send({ embeds: [embed] })
        } catch (e) {
            console.log(e)
        }
    }
}