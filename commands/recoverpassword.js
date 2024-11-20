const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recoverpassword')
        .setDescription('Recover your account password.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

        db.run(
            'UPDATE users SET password_hash = ? WHERE discord_id = ?',
            [hashedTempPassword, discordId],
            (err) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to recover password. Please try again later.', ephemeral: true });
                }
                interaction.user.send(`Your temporary password is: ${tempPassword}
Please change it immediately after logging in.`);
                interaction.reply({ content: 'A temporary password has been sent to your DMs.', ephemeral: true });
            }
        );
    },
};
