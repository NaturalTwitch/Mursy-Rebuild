const { useMainPlayer, QueryType } = require('discord-player');
const urlVerifier = require('../../Modules/urlVerifier.js')

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: "Play a song in your Voice Channel - **Supports Spotify Only!**",
    utilisation: '{prefix}play [song name/url]',
    voiceChannel: true,

    async execute(client, message, cmd, args, Discord) {
        if (!args[0]) return message.channel.send(`${message.author}, Write the name of the music you want to search.`);

        const player = useMainPlayer();
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(`${message.author}, You are not connected to a voice channel.`)

        let queryType = QueryType.SPOTIFY_SEARCH;
        const urlType = urlVerifier(args[0]);

        if (urlType) {
            console.log(`URL detected: ${urlType}`);
            if (urlType === 'SPOTIFY_TRACK') {
                queryType = QueryType.SPOTIFY_SONG;
            } else if (urlType === 'SPOTIFY_PLAYLIST') {
                queryType = QueryType.SPOTIFY_PLAYLIST
            } else {
                return message.channel.send(`${message.author}, Unsupported URL platform.`);
            }
        }

        const searchResult = await player.search(args.join(' '), {
            requestedBy: message.member.user,
            searchEngine: queryType
        });

        if (!searchResult.hasTracks()) return message.channel.send(`${message.author}, No results found!`);

        try {
            await player.play(voiceChannel, searchResult, {
                nodeOptions: {
                    metadata: {
                        channel: message.channel,
                        client: client.user.id,
                        requestedBy: message.author,
                        guildId: message.guild.id
                    }
                }
            });
        } catch (e) {
            console.log(`${searchResult}` + e)
            message.channel.send(`${message.author}, An error occurred while playing the track.`);
            message.channel.send(`${e.stack}`)
        }
    }
}
