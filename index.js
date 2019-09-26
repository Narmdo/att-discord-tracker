//Load required classes.
const { WebsocketBot } = require('att-bot-core');
const { BasicWrapper } = require('att-websockets');
//Load information from credentials and config
const { username, password, discordToken } = require("./credentials");
const { targetServers, discordPrefix } = require("./config");

const Discord = require('discord.js');

var locations = {};

const commands = {
    'where': (message, username) =>
    {
        if (!!locations[username])
        {
            message.channel.send(username + " is at " + locations[username]);
        }
        else
        {
            message.channel.send("No known location for " + username);
        }
    }
}

//Run the program
main();

async function main()
{
    const discord = new Discord.Client();

    await new Promise(resolve => 
    {
        discord.on('ready', resolve);

        discord.login(discordToken);
    });

    discord.on('message', message =>
    {
        if (message.content.length > 0 && message.content.startsWith(discordPrefix))
        {
            var trimmed = message.content.substring(discordPrefix.length).trim();

            var space = trimmed.indexOf(' ');

            if (space >= 0)
            {
                var command = trimmed.substring(0, space);

                var commandFunction = commands[command];

                if (!!commandFunction)
                {
                    commandFunction(message, trimmed.substring(space).trim());
                }            
            }
        }
    });

    //Create a new bot
    const bot = new WebsocketBot();

    //Login. Use "loginWithHash" if you're storing a hashed version of the password
    await bot.login(username, password);

    //Run the bot.
    //When any of the 'targetServers' are available, a connection is automatically created.
    await bot.run(test => targetServers.includes(test.id), async (server, connection) =>
    {
        //By default, connections simply receive commands, and emit messages.
        //To add callback support for events, we'll use the "BasicWrapper" provided by att-websockets.
        var wrapper = new BasicWrapper(connection);

        //Subscribe to "PlayerMovedChunk"
        await wrapper.subscribe("PlayerMovedChunk", data =>
        { 
            //Store the players location
            locations[data.player.username] = data.newChunk;
        });
    });
}