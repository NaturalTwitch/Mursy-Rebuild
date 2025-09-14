const Discord = require("discord.js");
const client = require("./Files/Client/DiscordClient.js");
const musicClient = require("./Files/Client/MusicClient.js");
const { registerMusicEvents } = require("./Files/Loaders/registerMusicEvents");

registerMusicEvents();

// eslint-disable-next-line no-undef
process.on("unhandledRejection", (error) => {
  console.log(error);
});
// eslint-disable-next-line no-undef
process.on("uncaughtException", (error) => {
  console.log(error);
});
