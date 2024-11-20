const axios = require('axios');
const db = require('./db');

const BLOCKCYPHER_BASE_URL = 'https://api.blockcypher.com/v1/btc/main';
const BLOCKCYPHER_TOKEN = 'process.env.BLOCKCYPHER_TOKEN';
const MAIN_WALLET_ADDRESS = 'process.env.MAIN_WALLET_ADDRESS';

const sweepFunds = async () => {
    try {
        db.all('SELECT btc_address FROM transactions WHERE processed = 1', async (err, rows) => {
            if (err) {
                console.error('Error fetching addresses for sweeping:', err);
                return;
            }

            const addresses = rows.map(row => row.btc_address);
            if (addresses.length === 0) {
                console.log('No addresses to sweep.');
                return;
            }

            const response = await axios.post(
                `${BLOCKCYPHER_BASE_URL}/txs/new?token=${BLOCKCYPHER_TOKEN}`,
                {
                    inputs: addresses.map(address => ({ addresses: [address] })),
                    outputs: [{ addresses: [MAIN_WALLET_ADDRESS], value: 0 }], // Value will be calculated automatically
                }
            );

            console.log('Sweeping transaction created:', response.data.tx);
        });
    } catch (error) {
        console.error('Error sweeping funds:', error);
    }
};

if (require.main === module) {
    sweepFunds();
}

module.exports = sweepFunds;
