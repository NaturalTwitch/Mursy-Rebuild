module.exports = {
    name: 'skip',
    aliases: ['next'],
    description: "Skip to the next song in queue",
    utilisation: '{prefix}skip',
    voiceChannel: true,
    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if(!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music currently playing!`);
        const currentTrack = queue.currentTrack;
        queue.node.skip();

        return message.channel.send(`**${currentTrack.title}**, Skipped Song!`)
    }
}