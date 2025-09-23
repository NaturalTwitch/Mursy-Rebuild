const { getQueue } = require("../../Modules/queue.js");

module.exports = {
    name: 'queueclear',
    aliases: ['qc'],
    utilisation: '{prefix}queueclear',
    description: 'Clear current Music Queue',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = getQueue(message.guild)
        

        if (!queue) return message.channel.send(`${message.author}, No music currently playing!`);
        const now = queue.getNowPlaying(24);
        

        const removed = queue.clear();
        return message.channel.send(
            `${message.author}, Cleared the queue! Removed ${removed} songs.`
        );
    }
}