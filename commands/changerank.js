const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changerank')
        .setDescription('Change the rank of a user. (Admin only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to change rank for.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('The new rank for the user.')
                .setRequired(true)
                .addChoices(
                    { name: 'User', value: 'User' },
                    { name: 'VIP', value: 'VIP' },
                    { name: 'Mod', value: 'Mod' },
                    { name: 'Admin', value: 'Admin' }
                )),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const newRank = interaction.options.getString('rank');
        const discordId = targetUser.id;

        // Verify the command issuer is an Admin
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member || !member.roles.cache.some(role => role.name === 'Admin')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Update rank in the database
        db.run(
            'UPDATE users SET rank = ? WHERE discord_id = ?',
            [newRank, discordId],
            async (err) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to change rank. Please try again later.', ephemeral: true });
                }

                interaction.reply({ content: `Successfully updated ${targetUser.username}'s rank to ${newRank}.`, ephemeral: false });
            }
        );
    },
};
