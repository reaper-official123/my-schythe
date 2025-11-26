import { REST, Routes } from "discord.js";
import fs from "fs";
import config from "./config.json" assert { type: "json" };

async function loadCommands() {
    const commands = [];

    const files = fs.readdirSync("./commands");
    for (const file of files) {
        const cmd = await import(`./commands/${file}`);
        if (cmd.slash) {
            commands.push(cmd.slash.data.toJSON());
        }
    }

    return commands;
}

async function deploy() {
    const rest = new REST({ version: "10" }).setToken(config.token);
    const commands = await loadCommands();

    try {
        console.log("Deploying slash commands...");

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

        console.log("Successfully deployed!");
    } catch (err) {
        console.log("Error:", err);
    }
}

deploy();
