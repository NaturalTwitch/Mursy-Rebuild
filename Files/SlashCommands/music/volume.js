const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Sets volume of the bot, between 1-100."),

    async execute(interaction, client) {
        const vc = interaction.member?.voice?.channel;
        const vol = Number(interaction.options.getString("percent", true));

        if (!vc) {
            return interaction.reply({
                content: `You need to be in a voice channel to change the bot's volume`,
                ephemeral: true,
            });
        }

        const queue = getQueue(interaction.guild);

        if (!queue) {
            return interaction.reply({
                content: `${interaction.user}, There is no music currently in queue`,
                ephemeral: true,
            });
        }
        if (vol < 1 || vol > 100) return interaction.reply({
            content: `${interaction.user}, You can only set the volume between 1% and 100%`
        })
        if (!vol || vol === NaN) return interaction.reply({
            content: `${interaction.user}, Please ensure that you entered a vaild Number.`,
            ephemeral: true,
        })

        client.db.query(`
            INSERT INTO volume (guild_id, volume_percentage) 
            VALUES ($1, $2)
            ON CONFLICT (guild_id)
            DO UPDATE SET volume_percentage = $2;
        `, [interaction.guild.id, vol]);
        
        const success = queue.setVolume(vol);

        interaction.reply({
            content: `🔊 | Volume is now at ${vol}%`,
            flags: MessageFlags.Ephemeral,
        })
    }

}