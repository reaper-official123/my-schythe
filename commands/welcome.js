import { EmbedBuilder } from "discord.js";
import config from "../config.json" assert { type: "json" };

export const welcomeListener = async (member, client) => {
    try {
        const channel = member.guild.channels.cache.get(config.welcomeChannel);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("Welcome To NCR!")
            .setDescription(`hello ${member}\nWelcome to **NCR**, hope you will enjoy.`)
            .setFooter({ text: config.footer });

        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.log("Welcome error:", err);
    }
};
