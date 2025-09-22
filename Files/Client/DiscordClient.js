const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const database = require("./Database.js");
require("dotenv").config();

const client = new Discord.Client({
  shards: "auto",
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.DirectMessageReactions,
    Discord.IntentsBitField.Flags.DirectMessages,
    Discord.IntentsBitField.Flags.MessageContent,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildVoiceStates,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "MEMBER"],
});

client.db = database;

//Prefix Command Handler
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync("./Files/Commands");
for (const folder of commandFolders) {
  if (folder.endsWith(".js")) {
    const command = require(`../Commands/${folder}`);
    client.commands.set(command.name, command);
  } else {
    const commandFiles = fs.readdirSync(`./Files/Commands/${folder}`);
    for (const file of commandFiles) {
      const command = require(`../Commands/${folder}/${file}`);
      command.catergory = folder;
      client.commands.set(command.name, command);
    }
  }
}

//Slash Command Handler
client.slashCommands = new Discord.Collection();
const commandFolder = fs.readdirSync("./Files/SlashCommands");

for (const folder of commandFolder) {
  if (folder.endsWith(".js")) {
    const command = require(`../SlashCommands/${folder}`);
    client.slashCommands.set(command.data.name, command); // 👈 use data.name
  } else {
    const commandFile = fs.readdirSync(`./Files/SlashCommands/${folder}`);
    for (const file of commandFile) {
      const command = require(`../SlashCommands/${folder}/${file}`);
      command.category = folder;
      client.slashCommands.set(command.data.name, command); // 👈 use data.name
    }
  }
}

// Initialize client.events
client.events = new Discord.Collection();

const loadEvents = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      loadEvents(filePath); // Recursively load events in subdirectories
    } else if (file.endsWith(".js")) {
      const event = require(filePath);
      const eventName = file.replace(/\.js$/, "");
      event.path = filePath;
      client.events.set(eventName, event);
      console.log(`Loaded event: ${eventName} from ${filePath}`);
    }
  }
};

// Load all events
loadEvents(path.join(__dirname, "../Events"));

// Register events with the client
for (const [eventName, event] of client.events) {
  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args));
  } else {
    client.on(eventName, (...args) => event.execute(...args));
  }
}

console.log("Registered events:", [...client.events.keys()]);

//Load New Commands
function watchFolder(folderToWatch) {
  try {
    fs.watch(folderToWatch, (eventType, filename) => {
      if (eventType === "rename" && filename.endsWith(".js")) {
        console.log(`A New File has been added: ${folderToWatch}/${filename}`);
        const filePath = path.join(process.cwd(), folderToWatch, filename);
        delete require.cache[require.resolve(filePath)];
        const newCommand = require(filePath);

        client.commands.set(newCommand.name, newCommand);
      }
    });

    const subdirectories = fs
      .readdirSync(folderToWatch, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(folderToWatch, dirent.name));

    for (const subdirectory of subdirectories) {
      watchFolder(subdirectory);
    }
  } catch (e) {
    console.log(`A File has been deleted: ${folderToWatch}/${filename}`);
  }
}
watchFolder("./Files/Commands");

client.prefix = ".";

client.login(process.env.DISCORD_TOKEN);

const { attachClient } = require("../../Files/Modules/queue.js");

const { REST, Routes } = require("discord.js");

client.once("clientReady", async () => {
  attachClient(client);
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const commands = client.slashCommands.map((cmd) => cmd.data.toJSON());

  try {
    console.log(`Started refreshing ${commands.length} slash commands.`);
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Successfully reloaded slash commands.");
  } catch (err) {
    console.error(err);
  }

  let channel = client.channels.cache.find(
    (x) => x.id === "934287269228081172"
  );

  channel.setName(`Currently ${client.guilds.cache.size} Servers`);

  setInterval(function () {
    channel.setName(`Currently ${client.guilds.cache.size} Servers`);
  }, 300000);

  client.user.setActivity("Coming Back Soon!!! Under Massive Rebuild", {
    type: Discord.ActivityType.Custom,
  });
});

module.exports = { client };
