
module.exports = {
    event: "!help",
    name: 'help',
    description: "showing all available commands",
    execute(message, commands) {
        let messageText = '';
        commands.forEach(command => {
            messageText += `${command.event} - ${command.description}\n`;
        });

        message.channel.send(messageText);
    }
}