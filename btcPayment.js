const axios = require('axios');

const BTC_PRICE_API = 'https://api.coindesk.com/v1/bpi/currentprice/USD.json';
const BLOCKCHAIN_API = 'https://api.blockcypher.com/v1/btc/main/addrs/{address}/full';

module.exports = {
    getBtcPriceInUsd: async () => {
        try {
            const response = await axios.get(BTC_PRICE_API);
            const price = response.data.bpi.USD.rate_float;
            return price;
        } catch (error) {
            console.error('Error fetching BTC price:', error);
            return null;
        }
    },
    monitorTransactions: async (btcAddress) => {
        try {
            const response = await axios.get(BLOCKCHAIN_API.replace('{address}', btcAddress));
            return response.data.txrefs || []; // Return list of transactions
        } catch (error) {
            console.error('Error monitoring transactions:', error);
            return [];
        }
    },
    verifyPayment: async (btcAddress, username, thresholdInUsd) => {
        const btcPrice = await module.exports.getBtcPriceInUsd();
        if (!btcPrice) return false;

        const thresholdInBtc = thresholdInUsd / btcPrice;

        const transactions = await module.exports.monitorTransactions(btcAddress);
        for (const tx of transactions) {
            if (tx.value / 1e8 >= thresholdInBtc) {
                console.log(`Payment verified for ${username}: ${tx.value / 1e8} BTC`);
                return true; // Payment is verified
            }
        }
        return false; // No valid payment found
    },
};
