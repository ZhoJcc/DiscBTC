const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Close a ticket. (Admin only)')
        .addChannelOption(option =>
            option.setName('ticket')
                .setDescription('The ticket channel to close.')
                .setRequired(true)),
    async execute(interaction) {
        const ticketChannel = interaction.options.getChannel('ticket');
        const member = interaction.guild.members.cache.get(interaction.user.id);

        // Check if the user has the Admin role
        if (!member || !member.roles.cache.some(role => role.name === 'Admin')) {
            return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
        }

        if (!ticketChannel || ticketChannel.parent?.name !== 'Tickets') {
            return interaction.reply({ content: 'The specified channel is not a valid ticket.', ephemeral: true });
        }

        // Delete the ticket channel
        await ticketChannel.delete();
        interaction.reply({ content: 'Ticket closed successfully.', ephemeral: true });
    },
};
