const { SlashCommandBuilder } = require('discord.js');
const btcPayment = require('../btcPayment');
const db = require('../db');

const BTC_ADDRESS = 'YOUR_CASH_APP_BTC_ADDRESS';
const PAYMENT_THRESHOLD_USD = 50;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkpayment')
        .setDescription('Verify BTC payment to upgrade to VIP.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Your registered username.')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const discordId = interaction.user.id;

        // Verify username matches the account
        db.get(
            'SELECT rank FROM users WHERE username = ? AND discord_id = ?',
            [username, discordId],
            async (err, row) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to verify account. Please try again later.', ephemeral: true });
                }

                if (!row) {
                    return interaction.reply({ content: 'No account found with the provided username.', ephemeral: true });
                }

                if (row.rank === 'VIP') {
                    return interaction.reply({ content: 'You are already a VIP.', ephemeral: true });
                }

                // Check payment
                const paymentVerified = await btcPayment.verifyPayment(BTC_ADDRESS, username, PAYMENT_THRESHOLD_USD);
                if (paymentVerified) {
                    // Update rank to VIP
                    db.run(
                        'UPDATE users SET rank = ? WHERE username = ? AND discord_id = ?',
                        ['VIP', username, discordId],
                        async (updateErr) => {
                            if (updateErr) {
                                console.error(updateErr);
                                return interaction.reply({ content: 'Failed to update rank. Please contact support.', ephemeral: true });
                            }

                            // Update nickname
                            const guildMember = interaction.guild.members.cache.get(discordId);
                            if (guildMember) {
                                try {
                                    await guildMember.setNickname(`(VIP) ${username}`);
                                } catch (nicknameErr) {
                                    console.error('Error updating nickname:', nicknameErr);
                                }
                            }

                            interaction.reply({ content: 'Payment verified! You are now a VIP.', ephemeral: true });
                        }
                    );
                } else {
                    interaction.reply({ content: 'Payment not found or not sufficient. Please try again later.', ephemeral: true });
                }
            }
        );
    },
};
