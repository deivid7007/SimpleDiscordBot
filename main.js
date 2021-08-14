require('dotenv').config()
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const bg = require('./bad-words-sources/bg.json');
const en = require('./bad-words-sources/en.json');

const prefix = '!';
const sentanceWordsSeparator = ' ';
const pingCommand = 'ping';
const helpCommand = 'help';
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildMemberAdd", async (member) => {
    member.guild.channels.cache.get(process.env.HELLO_MESSAGE_ON_FIRST_CONNECT_ID)
        .send(`Hi ${member.user} and welcome to the server.\nUse !help to see the available commands :)`);
});

client.on('messageCreate', async message => {
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

    switch (command) {
        case helpCommand:
            client.commands.get(helpCommand).execute(message, client.commands);
            break;
        case pingCommand:
            client.commands.get(pingCommand).execute(message);
            break;

        default:
            client.commands.get(helpCommand).execute(message, client.commands);
            break;
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);