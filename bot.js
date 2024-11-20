
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./db');
const paymentMonitor = require('./paymentMonitor');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load commands dynamically
const fs = require('fs');
const commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Start payment monitoring
    paymentMonitor(client);

    // Auto-start the web panel
    const { exec } = require('child_process');
    exec('node webPanel.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting web panel: ${error.message}`);
        }
        if (stderr) {
            console.error(`Web panel stderr: ${stderr}`);
        }
        console.log(`Web panel stdout: ${stdout}`);
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN);
