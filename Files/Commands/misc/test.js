module.exports = {
    name:'test',
    description: 'Test Command - Used for testing new things **HIGHLY UNSTABLE**',
    utilisation: '{prefix}test',
    async execute(client, message, cmd, args, Discord) {
        const embed = new Discord.EmbedBuilder()

        const testEmbed = embed
        .setColor('#0099ff')
        .setTitle('Test Command')
        .setDescription('Test Command Works!')
        .setTimestamp()

        message.channel.send({ embeds: [testEmbed] });
    }
}