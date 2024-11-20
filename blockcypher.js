
const axios = require('axios');
const db = require('./db');

const BLOCKCYPHER_BASE_URL = 'https://api.blockcypher.com/v1/btc/main';
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN;

module.exports = {
    async generateAddress(discordId) {
        if (!discordId) {
            console.error('Error: discordId is undefined. Ensure the user ID is passed to the function.');
            return null;
        }

        // Check if BTC address already exists for the user
        const existingAddress = await new Promise((resolve, reject) => {
            db.get('SELECT btc_address FROM transactions WHERE discord_id = ?', [discordId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.btc_address : null);
            });
        });

        if (existingAddress) {
            console.log(`Using cached BTC address for user ${discordId}: ${existingAddress}`);
            return existingAddress;
        }

        try {
            const response = await axios.post(`${BLOCKCYPHER_BASE_URL}/addrs?token=${BLOCKCYPHER_TOKEN}`);
            const btcAddress = response.data.address;

            // Insert into database
            db.run(
                'INSERT INTO transactions (discord_id, btc_address) VALUES (?, ?)',
                [discordId, btcAddress],
                (err) => {
                    if (err) {
                        console.error('Database insert error:', err);
                    }
                }
            );

            console.log(`Generated new BTC address for user ${discordId}: ${btcAddress}`);
            return btcAddress;
        } catch (error) {
            console.error('Error generating BTC address:', error);
            return null;
        }
    },

    async getBtcPriceInUsd() {
        try {
            const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
            const price = parseFloat(response.data.bpi.USD.rate.replace(',', ''));
            console.log(`Current BTC price in USD: $${price}`);
            return price;
        } catch (error) {
            console.error('Error fetching BTC price:', error);
            return null;
        }
    },

    async monitorTransactions(address) {
        try {
            const response = await axios.get(`${BLOCKCYPHER_BASE_URL}/addrs/${address}/full?token=${BLOCKCYPHER_TOKEN}`);
            return response.data.txrefs || []; // Return transactions
        } catch (error) {
            console.error('Error monitoring transactions:', error);
            return [];
        }
    },

    async verifyPayment(address, thresholdInBtc) {
        try {
            const transactions = await module.exports.monitorTransactions(address);
            for (const tx of transactions) {
                if (tx.value / 1e8 >= thresholdInBtc) {
                    return true; // Payment verified
                }
            }
            return false; // No valid payment found
        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    },
};
