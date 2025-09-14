module.exports = {
    name: 'pat',
    description: 'Pat another users head',
    utilisation: '{prefix}pat [User]',
    async execute(client, message, cmd, args, Discord) {
        const mention = message.mentions.members.first()
        const author = message.author

        patEmbed = new Discord.EmbedBuilder()
            .setColor(`#00FF00`)
            .setTitle(`${author.displayName} Patted ${mention.displayName} on the head`)
            .setImage(`https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif`)

        if(!mention) return message.reply(`You must mention a user to pat them.`)
        
        message.channel.send({ embeds: [patEmbed]});
    }
}