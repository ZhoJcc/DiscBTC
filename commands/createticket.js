const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const blockcypher = require('../blockcypher');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createticket')
        .setDescription('Create a private ticket for purchase inquiries or transactions.'),
    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;

        console.log(`Creating ticket for user: ${user.username}, ID: ${user.id}`);

        let ticketCategory = guild.channels.cache.find(
            channel => channel.name === 'Tickets' && channel.type === ChannelType.GuildCategory
        );
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: 'Tickets',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });
        }

        const channelName = `ticket-${user.username || user.id}`;
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: interaction.client.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
        });

        // Generate unique BTC address
        const btcAddress = await blockcypher.generateAddress();
        if (!btcAddress) {
            return interaction.reply({ content: 'Failed to generate a BTC address. Please try again later.', ephemeral: true });
        }

        // Save the BTC address in the database
        db.run(
            'INSERT INTO transactions (discord_id, btc_address) VALUES (?, ?)',
            [user.id, btcAddress],
            (err) => {
                if (err) {
                    console.error('Error saving BTC address:', err);
                }
            }
        );

        // Send ticket creation message with BTC address
        await ticketChannel.send(
            `Hello <@${user.id}>, your ticket has been created. Please send your payment to the following BTC address: \`${btcAddress}\`.
` +
            `Once the payment is verified, you will be upgraded to VIP.`
        );

        interaction.reply({
            content: `Ticket created: <#${ticketChannel.id}>. Only you and admins can view this ticket.`,
            ephemeral: true,
        });
    },
};
