const ms = require("ms");
const Discord = require("discord.js");
const userCooldowns = new Map();

module.exports = {
  async execute(message) {
    // console.log(message.content);
    const { client } = message;

    this.commandHandler(message, client);
    this.messageHandler(message, client);
  },

  async commandHandler(message, client) {
    const customPrefix = await getCustomPrefix(message, client);
    const { prefix } = client;

    if (customPrefix) {
      if (!message.content.startsWith(customPrefix) || message.author.bot)
        return;
    } else if (!message.content.startsWith(prefix) || message.author.bot)
      return;

    const usedPrefix = message.content.startsWith(prefix)
      ? prefix
      : customPrefix;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command =
      client.commands.get(cmd) ||
      client.commands.find((a) => a.aliases && a.aliases.includes(cmd));

    //Locks Folder Bot Owner to NaturalTwitch
    // if (
    //   command.catergory === "botowner" &&
    //   message.author.id !== "513413045251342336"
    // )
    //   return;

    try {
      command.execute(client, message, cmd, args, Discord);
      const currentDate = new Date();
      console.log(
        `[${currentDate.toLocaleString()}][Mursy Systems] ${
          message.author.tag
        } used command: ${cmd}`
      );
    } catch (e) {
      const currentDate = new Date();
      console.log(
        `[${currentDate.toLocaleString()}][Mursy Systems] ${
          message.author.tag
        } tried to use command: ${cmd} but it errored out` + e.stack
      );
    }
  },

  async messageHandler(message, client, args) {
    DMhandler(message, args);
  },
};

async function getCustomPrefix(message, client) {
  try {
    const response = await client.db.query(
      `select prefix from prefix where guild_id = $1`,
      [message.guild.id]
    );
    if (response && response.rowCount) return response.rows[0].prefix;
    return null;
  } catch (err) {
    return null;
  }
}

const DMhandler = async (message, args) => {
  if (message.inGuild() === true || message.author.bot) return;

  const dmUserReply = await getUserCache(message, args);
  const dmUserReplyTrue = await getUserCacheDm(message, args);
  try {
    if (message.author.id !== "513413045251342336") {
      const dmUser = message.author.id;
      if (!dmUserReplyTrue) {
        message.client.db.query(
          `insert into user_dm (user_id) values ($1) on conflict do nothing`,
          [message.author.id]
        );

        client.users.send(
          `${message.author.id}`,
          `Your message was successfully sent to the owner!`
        );

        message.client.users.cache
          .get(dmUser)
          .send(
            `**${message.author.username}**, Your message was successfully sent to the owner!`
          );
        message.react("✅");
      } else {
        message.react("✅");
      }

      const contactEmbed = new Discord.EmbedBuilder()
        .setAuthor({
          name: `${message.author.tag}`,
          iconURL: `${message.author.avatarURL()}`,
        })
        .addField("__New Message__", `${message.content}`)
        .setFooter(`${message.author.id}`)
        .setTimestamp();

      message.client.users
        .send("513413045251342336")
        .send({ embeds: [contactEmbed] });

      console.log(`[${message.author.tag}] ${message.content}`);
    }
  } catch (err) {}

  if (message.author.id === "513413045251342336") {
    console.log(dmUserReply);
    try {
      message.client.users.cache.get(dmUserReply).send(`${message.content}`);
    } catch (err) {}
  }
};
