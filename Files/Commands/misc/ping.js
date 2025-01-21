module.exports = {
    name: "ping",
    description: "Ping!",
    execute(client, message, cmd, args, Discord) {
        message.channel.send("Pong!");
    },
};