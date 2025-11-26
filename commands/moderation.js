import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const slash = {
    data: new SlashCommandBuilder()
        .setName("moderation")
        .setDescription("Basic moderation commands.")
        .addSubcommand(sub =>
            sub.setName("maachuda")
            .setDescription("Ban a user.")
            .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
            .addStringOption(o => o.setName("reason").setDescription("Reason"))
        )
        .addSubcommand(sub =>
            sub.setName("fuckoff")
            .setDescription("Kick a user.")
            .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
            .addStringOption(o => o.setName("reason").setDescription("Reason"))
        )
        .addSubcommand(sub =>
            sub.setName("soja")
            .setDescription("Timeout a user.")
            .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
            .addIntegerOption(o => o.setName("minutes").setDescription("Time in minutes").setRequired(true))
            .addStringOption(o => o.setName("reason").setDescription("Reason"))
        )
        .addSubcommand(sub =>
            sub.setName("warn")
            .setDescription("Warn a user.")
            .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
            .addStringOption(o => o.setName("reason").setDescription("Reason"))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async run(inter, client) {
        const sub = inter.options.getSubcommand();
        const user = inter.options.getUser("user");
        const member = await inter.guild.members.fetch(user.id).catch(() => null);
        const reason = inter.options.getString("reason") || "No reason provided";

        const embed = (title, color) =>
            new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(`User: **${user.tag}**\nReason: **${reason}**`)
                .setFooter({ text: "Made by Reaper © gg/ncrontop" });

        if (!member) return inter.reply("User not found.");

        switch (sub) {
            case "maachuda":
                await member.ban({ reason });
                return inter.reply({ embeds: [embed("User Banned", "Red")] });

            case "fuckoff":
                await member.kick(reason);
                return inter.reply({ embeds: [embed("User Kicked", "Orange")] });

            case "soja":
                const minutes = inter.options.getInteger("minutes");
                await member.timeout(minutes * 60 * 1000, reason);
                return inter.reply({ embeds: [embed("User Timed Out", "Blue")] });

            case "warn":
                return inter.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Yellow")
                            .setTitle("Warning Added")
                            .setDescription(`User: **${user.tag}**\nReason: **${reason}**`)
                            .setFooter({ text: "Made by Reaper © gg/ncrontop" })
                    ]
                });
        }
    }
};
