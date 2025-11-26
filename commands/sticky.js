import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

const filePath = "./data/sticky.json";

// Load or create sticky data
function loadSticky() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath));
}

function saveSticky(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const slash = {
    data: new SlashCommandBuilder()
        .setName("stick")
        .setDescription("Create a sticky message that stays at the bottom.")
        .addStringOption(opt =>
            opt.setName("message")
                .setDescription("The message you want to stick")
                .setRequired(true)
        ),

    async run(inter, client) {
        const msg = inter.options.getString("message");
        const channel = inter.channel;
        const stickyDB = loadSticky();

        // Save sticky message
        stickyDB[channel.id] = {
            message: msg,
            lastMessageId: null
        };

        saveSticky(stickyDB);

        const stickyEmbed = new EmbedBuilder()
            .setColor("Purple")
            .setTitle("Sticky Message Set")
            .setDescription(msg)
            .setFooter({ text: "Made by Reaper © gg/ncrontop" });

        await inter.reply({ embeds: [stickyEmbed] });

        // Send sticky NOW
        const sent = await channel.send({ embeds: [stickyEmbed] });
        stickyDB[channel.id].lastMessageId = sent.id;
        saveSticky(stickyDB);
    }
};



// LISTENER — AUTO RESTICK
export async function stickyListener(message, client) {
    if (message.author.bot) return;

    const stickyDB = loadSticky();
    const channelData = stickyDB[message.channel.id];
    if (!channelData) return;

    try {
        // Delete old sticky
        if (channelData.lastMessageId) {
            const msg = await message.channel.messages.fetch(channelData.lastMessageId).catch(() => null);
            if (msg) await msg.delete().catch(() => {});
        }
    } catch {}

    const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle("Sticky Message")
        .setDescription(channelData.message)
        .setFooter({ text: "Made by Reaper © gg/ncrontop" });

    const newSticky = await message.channel.send({ embeds: [embed] });
    stickyDB[message.channel.id].lastMessageId = newSticky.id;
    saveSticky(stickyDB);
}
