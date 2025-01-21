module.exports = {
    name: 'stop',
    aliases: ['st'],
    description: "Stop all music playback",
    utilisation: '{prefix}stop',
    voiceChannel: true,
    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music currently playing!`);
        queue.delete();
        message.channel.send(`Ending Playback, Clearing Queue, Leaving Voice Channel!`)
    }
}