const { SlashCommandBuilder } = require('discord.js');
const bcrypt = require('bcrypt');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Log in to your account.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Your account username.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('password')
                .setDescription('Your account password.')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const password = interaction.options.getString('password');
        const discordId = interaction.user.id;

        db.get(
            'SELECT password_hash, rank FROM users WHERE username = ? AND discord_id = ?',
            [username, discordId],
            async (err, row) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to log in. Please try again later.', ephemeral: true });
                }
                if (!row || !(await bcrypt.compare(password, row.password_hash))) {
                    return interaction.reply({ content: 'Invalid username or password.', ephemeral: true });
                }

                // Load rank and update nickname
                const rank = row.rank;
                const guildMember = interaction.guild.members.cache.get(discordId);
                if (guildMember) {
                    try {
                        await guildMember.setNickname(`(${rank}) ${username}`);
                    } catch (nicknameErr) {
                        console.error('Error updating nickname:', nicknameErr);
                    }
                }

                interaction.reply({ content: `Successfully logged in! Welcome, ${username}.`, ephemeral: true });
            }
        );
    },
};
