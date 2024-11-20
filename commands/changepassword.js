const { SlashCommandBuilder } = require('discord.js');
const bcrypt = require('bcrypt');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changepassword')
        .setDescription('Change your account password.')
        .addStringOption(option => 
            option.setName('current_password')
                .setDescription('Your current password.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('new_password')
                .setDescription('Your new password.')
                .setRequired(true)),
    async execute(interaction) {
        const currentPassword = interaction.options.getString('current_password');
        const newPassword = interaction.options.getString('new_password');
        const discordId = interaction.user.id;

        db.get(
            'SELECT password_hash FROM users WHERE discord_id = ?',
            [discordId],
            async (err, row) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to change password. Please try again later.', ephemeral: true });
                }
                if (!row || !(await bcrypt.compare(currentPassword, row.password_hash))) {
                    return interaction.reply({ content: 'Current password is incorrect.', ephemeral: true });
                }

                const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                db.run(
                    'UPDATE users SET password_hash = ? WHERE discord_id = ?',
                    [hashedNewPassword, discordId],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return interaction.reply({ content: 'Failed to update password. Please try again later.', ephemeral: true });
                        }
                        interaction.reply({ content: 'Password updated successfully!', ephemeral: true });
                    }
                );
            }
        );
    },
};
