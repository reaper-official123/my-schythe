import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

const filePath = "./data/autoresponder.json";

// Read DB
function loadAR() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath));
}

// Save DB
function saveAR(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const slash = {
    data: new SlashCommandBuilder()
        .setName("ar")
        .setDescription("Autoresponder system")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Add a new autoresponder")
                .addStringOption(o =>
                    o.setName("keyword")
                        .setDescription("Keyword to detect")
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName("response")
                        .setDescription("Response the bot will send")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("Delete an autoresponder")
                .addStringOption(o =>
                    o.setName("keyword")
                        .setDescription("Keyword to delete")
                        .setRequired(true)
                )
        ),

    async run(inter, client) {
        const sub = inter.options.getSubcommand();
        const keyword = inter.options.getString("keyword").toLowerCase();
        const channel = inter.channel;
        const AR = loadAR();

        if (!AR[channel.id]) AR[channel.id] = {};

        if (sub === "add") {
            const response = inter.options.getString("response");

            AR[channel.id][keyword] = response;
            saveAR(AR);

            const emb = new EmbedBuilder()
                .setColor("Green")
                .setTitle("Autoresponder Added")
                .setDescription(`**Keyword:** ${keyword}\n**Response:** ${response}`)
                .setFooter({ text: "Made by Reaper © gg/ncrontop" });

            return inter.reply({ embeds: [emb] });
        }

        if (sub === "delete") {
            if (!AR[channel.id][keyword])
                return inter.reply("Keyword not found.");

            delete AR[channel.id][keyword];
            saveAR(AR);

            const emb = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Autoresponder Removed")
                .setDescription(`**Keyword deleted:** ${keyword}`)
                .setFooter({ text: "Made by Reaper © gg/ncrontop" });

            return inter.reply({ embeds: [emb] });
        }
    }
};



// EVENT LISTENER
export async function arListener(message) {
    if (message.author.bot) return;

    const AR = loadAR();
    const channel = message.channel.id;

    if (!AR[channel]) return;

    const content = message.content.toLowerCase();

    for (const keyword of Object.keys(AR[channel])) {
        if (content.includes(keyword)) {

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("Autoresponder")
                .setDescription(AR[channel][keyword])
                .setFooter({ text: "Made by Reaper © gg/ncrontop" });

            return message.channel.send({ embeds: [embed] });
        }
    }
}
