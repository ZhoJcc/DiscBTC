const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

// Serve static files (e.g., Bootstrap CSS, JS)
app.use(express.static('public'));

// Endpoint for transaction data
app.get('/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', (err, rows) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Main page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BTC Transactions</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                async function fetchTransactions() {
                    const response = await fetch('/transactions');
                    const data = await response.json();
                    const tableBody = document.getElementById('transaction-table-body');
                    tableBody.innerHTML = '';
                    data.forEach(tx => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${tx.btc_address}</td>
                            <td>\${tx.discord_id}</td>
                            <td>\${tx.amount || 'Pending'}</td>
                            <td>\${tx.timestamp || 'N/A'}</td>
                            <td>\${tx.processed ? 'Yes' : 'No'}</td>
                        \`;
                        tableBody.appendChild(row);
                    });
                }

                setInterval(fetchTransactions, 300000); // Auto-refresh every 5 minutes
                window.onload = fetchTransactions;
            </script>
        </head>
        <body class="bg-light">
            <div class="container mt-4">
                <h1 class="text-center">BTC Transactions</h1>
                <table class="table table-bordered table-striped mt-3">
                    <thead class="table-dark">
                        <tr>
                            <th>BTC Address</th>
                            <th>Discord ID</th>
                            <th>Amount</th>
                            <th>Timestamp</th>
                            <th>Processed</th>
                        </tr>
                    </thead>
                    <tbody id="transaction-table-body">
                        <!-- Data will be populated here dynamically -->
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Web panel running on http://localhost:${PORT}`);
});
