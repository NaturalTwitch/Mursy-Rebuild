//Discord Player
const Discord = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const client = require('../Client/DiscordClient.js')

console.log(`Music Client Loaded`)

client.config = require('../../config.js');
client.player = new Player(client, {
    ...client.config.opt.discordPlayer,
});

const player = client.player;
// player.extractors.register(YoutubeiExtractor, {
//     authentication: process.env.YOUTUBE_TOKEN,
// });
client.player.extractors.loadMulti(DefaultExtractors);

player.events.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.events.on('connectionError', (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
    queue.metadata.channel.send(`An error occurred while trying to connect to the voice channel: ${error.message}`);
    console.log(error)

    const success = queue.skip();
});

player.events.on('playerStart', async (queue, track) => {
    const id = queue.metadata.guildId;
    const volume = await getVolume(id, client)
    if (volume) {
        queue.node.setVolume(Number(volume));
    }
    const trackStart = new Discord.EmbedBuilder()
        .setTitle(`🎧Mursy's Jukebox🎧`)
        .setDescription(`Now playing [${track.title}](${track.url})`)
        .setThumbnail(`${track.thumbnail}`)
        .addFields({
            name: 'Requested By:',
            value: `${queue.metadata.requestedBy}`
        },
            {
                name: 'Volume:',
                value: `${volume}%`
            })
    if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
    queue.metadata.channel.send({ embeds: [trackStart] });
})

player.events.on('audioTracksAdd', (queue, tracks) => {
    const trackTitles = tracks.map(track => `[${track.title}](${track.url})`);

    let description = '';
    for (const title of trackTitles) {
        if ((description + title + ', ').length > 1000) break;
        description += `${title}, `;
    }

    description = description.slice(0, -2);

    if (trackTitles.length > description.split(',').length) {
        description += '... and more!';
    }

    const trackAdd = new Discord.EmbedBuilder()
        .setDescription(`Added ${description} to the Queue.`)
    queue.metadata.channel.send({ embeds: [trackAdd] });
});


player.events.on('audioTrackAdd', (queue, track) => {
    const trackAdd = new Discord.EmbedBuilder()
        .setDescription(`Added **${track.title}** to the queue.`)
    queue.metadata.channel.send({ embeds: [trackAdd] });
});

player.events.on('channelEmpty', (queue) => {
    queue.metadata.channel.send('The voice channel was empty, so I left');
});

player.events.on('emptyQueue', (queue) => {
    const guildId = queue.metadata.guildId
    client.db.query(`insert into loop_toggle (guild_id, toggled) values ($1, $2) on conflict (guild_id) do update set toggled = $2`, [guildId, 'false'])
});



//Database Calls

async function getVolume(id, client) {
    const response = await client.db.query(`select volume_percentage from volume where guild_id = $1`, [
        id,
    ]);
    if (response && response.rowCount) return response.rows[0].volume_percentage;
    return null;
}