const { QueueRepeatMode } = require('discord-player');

module.exports = {
    name: 'loop',
    aliases: ['lp'],
    description: 'Loop indiviual songs or the full queue',
    utilisation: '{prefix}loop \n {prefix}loop <queue>',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {

        let loopToggle = await getLoopToggle(message, client);

        if (!loopToggle) {
            loopToggle = false;
        }

        try {

            const queue = client.player.nodes.get(message.guild.id);
            if (!queue || !queue.node.isPlaying()) return message.channel.send(`${message.author}, There is no music currently playing!. ❌`);

            if (!loopToggle || loopToggle === 'false') {
                client.db.query(`insert into loop_toggle (guild_id, toggled) values ($1, $2) on conflict (guild_id) do update set toggled = $2`, [message.guild.id, 'true'])
            } else if (loopToggle === 'true') {
                client.db.query(`insert into loop_toggle (guild_id, toggled) values ($1, $2) on conflict (guild_id) do update set toggled = $2`, [message.guild.id, 'false'])
            }

            if (args.join('').toLowerCase() === 'queue') {
                if (queue.repeatMode === 1) return message.channel.send(`${message.author}, You should disable loop mode of existing music first **(${client.config.px}loop)** ❌`);
                queue.setRepeatMode(queue.repeatMode === 0 ? QueueRepeatMode.QUEUE : QueueRepeatMode.OFF);
                return message.channel.send(loopToggle ? `Loop Mode: **${queue.repeatMode === 0 ? 'Inactive' : 'Active'}**, The whole sequence will repeat non-stop 🔁` : `${message.author}, Something went wrong. ❌`);
            } else {
                if (queue.repeatMode === 2) return message.channel.send(`${message.author}, In Loop mode you must disable existing queue first **(${client.config.px}loop queue)** ❌`);
                await queue.setRepeatMode(queue.repeatMode === 0 ? QueueRepeatMode.TRACK : QueueRepeatMode.OFF);
                return message.channel.send(loopToggle ? `Loop Mode: **${queue.repeatMode === 0 ? 'Inactive' : 'Active'}**, Current music will be repeated non-stop (all music in the list **${client.config.px}loop queue**  You can repeat it with the option.) 🔂` : `${message.author}, Something went wrong ❌`);
            };
        } catch (e) {
            console.log(e)
            return;
        }
    },
};

async function getLoopToggle(message, client) {
    const response = await client.db.query(`select toggled from loop_toggle where guild_id = $1`, [message.guild.id])
    if (response && response.rowCount) return response.rows[0].toggled
    return null;
}