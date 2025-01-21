module.exports = {
    name: 'resume',
    aliases: [],
    description: "Resume Music Playback",
    utilisation: '{prefix}resume',
    voiceChannel: true,

    execute(client, message, cmd, args, Discord) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue) return message.channel.send(`${message.author}, There is no music currently playing!.`);

        const success = queue.node.resume();

        return message.channel.send(success ? `**${queue.currentTrack.title}**, The Song has been Resumed!` : `${message.author}, Something went wrong.`);
    },
};