const { getQueue } = require('../../Modules/queue')

module.exports = {
    name: 'loop',
    aliases: ['lp'],
    description: 'Loop indiviual songs or the full queue',
    utilisation: '{prefix}loop \n {prefix}loop <queue>',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = getQueue(message.guild)
        console.log(queue.loop)

        if (!queue || !queue.current) return message.channel.send(`${message.author}, No music currently playing!`);
        if (!queue.loop) {
            queue.setLoop(true);
        } else {
            queue.setLoop(false);
        }

        return message.channel.send(`${message.author}, Loop is now: \`${queue.loop ? "Enabled" : "Disabled"}\``)



    },
};
