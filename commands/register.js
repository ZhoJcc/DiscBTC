const { SlashCommandBuilder } = require('discord.js');
const bcrypt = require('bcrypt');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a new account.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('The username for your account.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('password')
                .setDescription('The password for your account.')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const password = interaction.options.getString('password');
        const hashedPassword = await bcrypt.hash(password, 10);
        const discordId = interaction.user.id;

        // Determine rank based on whether the user is the server owner
        const guildOwnerId = interaction.guild.ownerId;
        const rank = discordId === guildOwnerId ? 'Admin' : 'User';

        db.run(
            'INSERT INTO users (discord_id, username, password_hash, rank) VALUES (?, ?, ?, ?)',
            [discordId, username, hashedPassword, rank],
            async (err) => {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return interaction.reply({ content: 'An account already exists for this Discord ID.', ephemeral: true });
                    }
                    console.error(err);
                    return interaction.reply({ content: 'Failed to register. Please try again later.', ephemeral: true });
                }

                interaction.reply({ content: `Account registered successfully! Your rank is: ${rank}`, ephemeral: true });
            }
        );
    },
};
