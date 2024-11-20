const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Log out of your account.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        db.get(
            'SELECT username FROM users WHERE discord_id = ?',
            [discordId],
            async (err, row) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to log out. Please try again later.', ephemeral: true });
                }
                if (!row) {
                    return interaction.reply({ content: 'No logged-in session found.', ephemeral: true });
                }

                const guildMember = interaction.guild.members.cache.get(discordId);
                if (guildMember) {
                    try {
                        await guildMember.setNickname(null); // Reset nickname to default
                    } catch (nicknameErr) {
                        console.error('Error resetting nickname:', nicknameErr);
                    }
                }

                interaction.reply({ content: `Successfully logged out. Goodbye, ${row.username}.`, ephemeral: true });
            }
        );
    },
};
