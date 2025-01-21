module.exports = {
    name: 'back',
    aliases: ['previous'],
    description: 'Play Previous song',
    utilisation: '{prefix}back',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music playing!`)

        await queue.history.back();
        message.channel.send(`Playing Previous song!`);
    }
}