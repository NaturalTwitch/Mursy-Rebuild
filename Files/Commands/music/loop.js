const { getQueue } = require('../../Modules/queue');

module.exports = {
    name: 'loop',
    aliases: ['lp'],
    description: 'Loop individual songs or the full queue',
    utilisation: '{prefix}loop [off|track|queue]',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        const queue = getQueue(message.guild);
        if (!queue) {
            return message.channel.send(`${message.author}, there is no music playing currently.`);
        }

        // If no arg, show current mode
        const modeNameFromVal = (v) =>
            v === 0 ? 'OFF' : v === 1 ? 'TRACK' : v === 2 ? 'QUEUE' : 'OFF';

        if (!args[0]) {
            return message.channel.send(
                `Loop mode is currently **${modeNameFromVal(queue.loopMode)}**. Usage: \`${client.prefix || '{prefix}'}loop off|track|queue\``
            );
        }

        const raw = String(args[0]).toLowerCase();

        // Accept some aliases
        const MODE_ALIASES = {
            off: 'off',
            none: 'off',
            disable: 'off',
            track: 'track',
            song: 'track',
            single: 'track',
            queue: 'queue',
            all: 'queue',
            list: 'queue',
        };

        const normalized = MODE_ALIASES[raw];
        if (!normalized) {
            return message.channel.send(
                `${message.author} ensure you select a proper mode: \`OFF, TRACK, QUEUE\`.`
            );
        }

        queue.setLoop(normalized); // your queue accepts case-insensitive strings
        return message.channel.send(`Loop mode set to **${normalized.toUpperCase()}**.`);
    },
};
