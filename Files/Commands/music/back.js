const { getQueue } = require("../../Modules/queue.js")

module.exports = {
    name: 'back',
    aliases: ["previous", "lastsong"],
    description: `Return to the previously playing song`,
    utilisation: `{prefix}back`,
    voiceChannel: true,
    async execute(client, message, cmd, args, Discord) {
        const queue = getQueue(message.guild)

        if (!queue) return message.reply(`${message.author}, There is no music playing.`).then(m => {
            setTimeout(() => {
                m.delete()
            }, 5000)
        });

        queue.previousTrack();
    }
}