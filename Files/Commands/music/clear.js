module.exports = {
    name: 'queueclear',
    aliases: [],
    utilisation: '{prefix}queueclear',
    description: 'Clear current Music Queue',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, No music currently playing!`);
        await queue.tracks.clear();

        message.channel.send(`The queue has just been cleared!`)
    }
}