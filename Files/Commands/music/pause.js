module.exports = {
    name: 'pause',
    aliases: [],
    description: "Pause your Current Music",
    utilisation: '{prefix}pause',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if(!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music currently playing!`)
        
        const success = queue.node.pause();
        return message.channel.send(success ? `The Currently playing music named **${queue.currentTrack.title}** Has been Paused!` : `${message.author}, Something Went Wrong!`);
    }
}