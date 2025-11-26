import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";

export const slash = {
    data: new SlashCommandBuilder()
        .setName("drag")
        .setDescription("Request to drag a user into your voice channel.")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User you want to drag")
                .setRequired(true)
        ),

    async run(inter, client) {
        const target = inter.options.getMember("user");
        const requester = inter.member;

        // Not in VC?
        if (!requester.voice.channel)
            return inter.reply("Bro, pehle VC join kar, phir drag karna.");

        // Target must be in VC (locked or not)
        if (!target.voice.channel)
            return inter.reply("User VC me nahi hai.");

        // Cannot drag yourself
        if (target.id === requester.id)
            return inter.reply("Apne aap ko drag thodi karega bhai.");

        // Buttons
        const allowBtn = new ButtonBuilder()
            .setCustomId("allow_drag")
            .setLabel("Allow")
            .setStyle(ButtonStyle.Success);

        const denyBtn = new ButtonBuilder()
            .setCustomId("deny_drag")
            .setLabel("Deny")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(allowBtn, denyBtn);

        const embed = new EmbedBuilder()
            .setTitle("Drag Request")
            .setDescription(`**${requester.user.tag}** wants to drag **${target.user.tag}** to their VC.\n\nDo you accept?`)
            .setColor("Blue")
            .setFooter({ text: "Made by Reaper © gg/ncrontop" });

        const reply = await inter.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const collector = reply.createMessageComponentCollector({
            time: 30000 // 30 seconds
        });

        collector.on("collect", async btn => {

            if (btn.user.id !== target.id)
                return btn.reply({ content: "Bro you’re not the target.", ephemeral: true });

            if (btn.customId === "allow_drag") {

                try {
                    await target.voice.setChannel(requester.voice.channel);
                } catch (err) {
                    return btn.reply("Drag failed due to permissions.");
                }

                collector.stop("done");

                return btn.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("Drag Accepted")
                            .setDescription(`${target} has been moved to ${requester.voice.channel}.`)
                            .setFooter({ text: "Made by Reaper © gg/ncrontop" })
                    ],
                    components: []
                });
            }

            if (btn.customId === "deny_drag") {
                collector.stop("done");

                return btn.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Drag Denied")
                            .setDescription(`${target} declined the drag request.`)
                            .setFooter({ text: "Made by Reaper © gg/ncrontop" })
                    ],
                    components: []
                });
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "done") return;

            // Time expired
            inter.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Grey")
                        .setTitle("Timeout")
                        .setDescription("No response in 30 seconds.")
                        .setFooter({ text: "Made by Reaper © gg/ncrontop" })
                ],
                components: []
            });
        });
    }
};
