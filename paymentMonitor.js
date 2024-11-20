const blockcypher = require('./blockcypher');
const db = require('./db');

module.exports = async (client) => {
    const checkPayments = async () => {
        db.all('SELECT discord_id, btc_address FROM transactions WHERE processed = 0', async (err, rows) => {
            if (err) {
                console.error('Error fetching transactions:', err);
                return;
            }

            for (const { discord_id, btc_address } of rows) {
                const btcPrice = await blockcypher.getBtcPriceInUsd();
                if (!btcPrice) {
                    console.error('Failed to fetch BTC price.');
                    continue;
                }

                const thresholdInBtc = 50 / btcPrice;
                const paymentVerified = await blockcypher.verifyPayment(btc_address, thresholdInBtc);

                if (paymentVerified) {
                    // Mark the transaction as processed
                    db.run('UPDATE transactions SET processed = 1 WHERE btc_address = ?', [btc_address]);

                    // Update user rank to VIP
                    db.run('UPDATE users SET rank = ? WHERE discord_id = ?', ['VIP', discord_id], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating user rank:', updateErr);
                            return;
                        }
                        console.log(`User ${discord_id} upgraded to VIP.`);
                    });

                    // Update nickname and notify user
                    const guildMember = client.guilds.cache
                        .map(g => g.members.cache.get(discord_id))
                        .find(m => m); // Find the member in any guild
                    if (guildMember) {
                        try {
                            await guildMember.setNickname(`(VIP) ${guildMember.user.username}`);
                        } catch (nicknameErr) {
                            console.error('Error updating nickname:', nicknameErr);
                        }
                    }

                    const user = await client.users.fetch(discord_id);
                    if (user) {
                        user.send(
                            `Thank you for your payment! Your VIP status has been activated.`
                        ).catch(err => console.error('Error notifying user:', err));
                    }
                }
            }
        });
    };

    setInterval(checkPayments, 60000); // Check every minute
};
