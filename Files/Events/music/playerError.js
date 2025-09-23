module.exports = {
    name: 'music:playerError',
    once: false,
    execute({ guild, queue }) {
        console.error(`[music:playerError] Error in guild ${guild.id}:`, error);
    }
}