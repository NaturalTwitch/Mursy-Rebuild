const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: 'reload',
    aliases: ['r'],
    description: 'Reloads Command Files',
    execute(client, message, cmd, args, Discord) {
        if (message.author.id !== '513413045251342336') return message.channel.send(`You don't have authorization to access this command`)
        //  if(args[0] === 'music') return;

        try {
            delete require.cache[require.resolve(`../${args[0]}`)];
            const newCommand = require(`../${args[0]}`);
            client.commands.set(newCommand.name, newCommand);
        } catch (e) {

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle('Reloading')
                .setDescription(`${args[0]} command couldn't be reloaded ☹️`)

            console.log(e)
            return message.channel.send({ embeds: [errorEmbed] })

        }

        const successfulEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Reloading')
            .setDescription(`${args[0]} command was successfully reloaded 😄`)
        message.channel.send({ embeds: [successfulEmbed] })

    }
}