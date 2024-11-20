
const axios = require('axios');
const db = require('./db');

const BLOCKCYPHER_BASE_URL = 'https://api.blockcypher.com/v1/btc/main';
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN;

module.exports = {
    async generateAddress(discordId) {
        try {
            // Check if a BTC address already exists for the user
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

            const MAX_RETRIES = 3;
            let attempt = 0;

            while (attempt < MAX_RETRIES) {
                try {
                    const response = await axios.post(`${BLOCKCYPHER_BASE_URL}/addrs?token=${BLOCKCYPHER_TOKEN}`);
                    const btcAddress = response.data.address;

                    // Cache the new address in the database
                    db.run('INSERT INTO transactions (discord_id, btc_address) VALUES (?, ?)', [discordId, btcAddress]);

                    console.log(`Generated new BTC address for user ${discordId}: ${btcAddress}`);
                    return btcAddress;
                } catch (error) {
                    if (error.response?.status === 429) {
                        console.error(`Rate limit exceeded. Retrying in ${2 ** attempt} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));
                        attempt++;
                    } else {
                        throw error;
                    }
                }
            }

            console.error('Failed to generate BTC address after retries.');
            return null;
        } catch (error) {
            console.error('Error generating BTC address:', error);
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
