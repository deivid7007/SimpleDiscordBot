
module.exports = {
    name: 'ping',
    description: "when execute this command the active BOT returns pong as an answer",
    execute(message) {
        message.channel.send('pong');
    }
}