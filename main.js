require('dotenv').config()
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const bg = require('./bad-words-sources/bg.json');
const en = require('./bad-words-sources/en.json');

const prefix = '!';
const sentanceWordsSeparator = ' ';
const pingCommand = 'ping';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    let havingBadWords = havingBadWordsInTheText(message.content);

    if (!havingBadWords) {
        checkForValidCommand(message);
    }
    else {
        message.delete()
            .then(msg => message.channel.send(`Deleted message from ${msg.author.username}, because it contains swear words!`))
            .catch(console.error);
    }
});

function havingBadWordsInTheText(text) {
    return havingBadWordsInBulgarian(text) ? true : havingBadWordsInEnglish(text);
}

function havingBadWordsInBulgarian(text) {
    let words = text.split(sentanceWordsSeparator);

    return words.some((word) => bg.includes(word));
}

function havingBadWordsInEnglish(text) {
    let words = text.split(sentanceWordsSeparator);

    return words.some((word) => en.includes(word));
}

function checkForValidCommand(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    let command = message.content.slice(prefix.length).toLowerCase();
    if (command === pingCommand) {
        client.commands.get(pingCommand).execute(message);
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);