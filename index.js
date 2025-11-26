import fs from "fs";
import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} from "discord.js";

import config from "./config.json" assert { type: "json" };

// Listeners
import { stickyListener } from "./commands/sticky.js";
import { arListener } from "./commands/autoresponder.js";
import { welcomeListener } from "./commands/welcome.js";

// Create bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// Load all slash commands from /commands folder
const commandFiles = fs.readdirSync("./commands");

for (const file of commandFiles) {
    const cmd = await import(`./commands/${file}`);
    if (cmd.slash) {
        client.commands.set(cmd.slash.data.name, cmd);
    }
}

// Slash command handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.slash.run(interaction, client);
    } catch (err) {
        console.log(err);
        interaction.reply({ content: "Error executing command.", ephemeral: true });
    }
});

// Message listeners (sticky + autoresponder)
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    stickyListener(message, client);
    arListener(message, client);
});

// Welcome system
client.on("guildMemberAdd", async (member) => {
    welcomeListener(member, client);
});

// Ready event
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Login
client.login(config.token);
