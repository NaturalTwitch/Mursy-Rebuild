const { EmbedBuilder, PermissionsBitField } = require("discord.js")

module.exports = {
  name: 'welcome',
  description: "sets mod log channel",
  utilisation: '{prefix}welcome [channelID]',
  async execute(client, message, cmd, args, Discord) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return message.channel.send(`You don't have enough permissions to do this`);

    if (args[0] === 'disable' || args[0] === 'Disable') {

      client.db.query(`delete from welcome where guild_id = $1`, [message.guild.id])
      message.channel.send(`<@${message.author.id}>, You successfully disabled the welcome channel`)
    } else if (!args[0]) {

      const response = await client.db.query(`select channel_id from welcome where guild_id = $1`, [message.guild.id])
      const row = response.rows[0]

      //if there is info in the database
      if (response && response.rowCount) {

        message.channel.send(`<@${message.author.id}>, Please make sure to add Channel Mention or \`disable\` to disable welcome messages `)

      } else {
        message.channel.send(`<@${message.author.id}>, Please ensure you add a Channel Mention`)
      }
    } else {

      let checkChannel = message.mentions.channels.first().id;
      let channels = message.mentions.channels;
      let channel = channels.filter((c) => c.isTextBased()).first()


      client.db.query(`insert into welcome (guild_id, channel_id, guild_name) values ($1, $2, $3) on conflict (guild_id) do update set channel_id = $2`, [message.guild.id, checkChannel, message.guild.name])

      message.channel.send(`<@${message.author.id}>, You have set the welcome channel to <#${checkChannel}>`)


      channel.send(`<@${message.author.id}>, I will send welcome messages here.`)
    }
  }

}
