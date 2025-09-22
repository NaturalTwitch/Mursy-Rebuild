// commands/music/play.js
const { SlashCommandBuilder } = require("discord.js");
const ytSearch = require("yt-search");
const { Track } = require("../../Modules/track.js");
const { getQueue } = require("../../Modules/queue.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel — YouTube only.")
    .addStringOption(
      (opt) =>
        opt
          .setName("query")
          .setDescription("Song name or YouTube URL")
          .setRequired(true)
          .setAutocomplete(true) // 👈 enable autocomplete
    ),

  /**
   * Autocomplete handler
   */
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const query = focused.value;

    if (!query) {
      return interaction.respond([]);
    }

    try {
      // Search YouTube (first 5 results)
      const results = await ytSearch(query);
      const videos = results.videos.slice(0, 5);

      await interaction.respond(
        videos.map((v) => {
          // Make sure the name is <= 100 chars
          const name = `${v.title} (${v.timestamp})`;
          return {
            name: name.length > 100 ? name.slice(0, 97) + "..." : name,
            value: v.url,
          };
        })
      );
    } catch (err) {
      console.error("[autocomplete error]", err);
      await interaction.respond([]);
    }
  },

  /**
   * Command execution
   */
  async execute(interaction, client) {
    const query = interaction.options.getString("query", true);

    const vc = interaction.member?.voice?.channel;
    if (!vc) {
      return interaction.reply({
        content: `You need to be in a voice channel to play music. ❌`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const queue = getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        content: `Music system isn’t initialized for this guild yet. ❌`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await interaction.deferReply();

      await queue.connect(vc);

      const track = await Track.fromUrl(query, interaction.guild.id);
      const pos = await queue.enqueue(track);

      await interaction.editReply(
        `🎶 | **${track.title}** has been added to the queue! (Position: ${pos})`
      );
    } catch (err) {
      console.error("[play] error:", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(
          `There was an error trying to play that track. ❌`
        );
      } else {
        await interaction.reply({
          content: `There was an error trying to play that track. ❌`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
