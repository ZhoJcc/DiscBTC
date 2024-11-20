
# Discord Bot Project

Welcome to your powerful and feature-packed Discord bot! This bot is designed to automate user management, transactions, and provide seamless interactions. Below is a detailed list of all the awesome features and functionalities:

---

## **Core Features**

### **1. User Management**
- **Account Commands**:
  - `/register`: Create a new account.
  - `/login`: Log in to your account and load your rank/nickname.
  - `/logout`: Log out and reset your nickname.
  - `/changepassword`: Change your account password securely.
  - `/recoverpassword`: Recover your account password if forgotten.

- **Rank Management**:
  - Supports ranks: `User`, `VIP`, `Admin`, `Mod`.
  - Each rank has its own unique color.
  - Automatic nickname updates: `(Rank) Username`.
  - Commands to promote or demote ranks.

---

## **BTC Payment System**

### **2. Transaction Automation**
- **Unique BTC Address Generation**:
  - Each user receives a unique BTC address for payments.
  - Caching system minimizes API calls for repeated users.

- **Automated Payment Verification**:
  - Payments are dynamically verified using the BlockCypher API.
  - Includes retry logic to handle API rate limits with exponential backoff.

- **Manual Sweeping**:
  - Consolidate funds into your main wallet with a single command: `npm run sweep`.

### **3. Web Panel**
- **Features**:
  - Displays transaction history, BTC received per user, and total BTC.
  - Automatically refreshes every 5 minutes for real-time updates.

- **Access**:
  - Starts automatically with the bot.
  - Visit `http://localhost:3000` to view.

---

## **Ticket System**

### **4. Secure Ticket Handling**
- **Private Purchase Tickets**:
  - Only the bot, the user, and admins can view tickets.
  - Includes BTC address generation and payment instructions.

- **Custom Commands**:
  - `/createticket`: Open a new ticket.
  - `/closeticket`: Close the ticket (admins only).

---

## **Developer Features**

### **5. Seamless Command Updates**
- Run `npm run commands` to deploy or refresh all application commands dynamically.

### **6. Secure Environment Management**
- All sensitive keys and configurations (e.g., API tokens, wallet addresses) are stored in a `.env` file.

### **7. Retry Logic and Error Handling**
- Robust retry system for API calls with logging for all errors and retries.

---

## **Setup Instructions**

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file with the following keys:
   ```env
   BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
   APP_ID=YOUR_APP_ID
   GUILD_ID=YOUR_GUILD_ID
   BLOCKCYPHER_TOKEN=YOUR_BLOCKCYPHER_API_TOKEN
   MAIN_WALLET_ADDRESS=YOUR_BTC_WALLET_ADDRESS
   PORT=3000
   ```

3. Initialize the database:
   ```bash
   node db.js
   ```

4. Start the bot and web panel:
   ```bash
   node bot.js
   ```

---

## **Final Notes**
This bot is production-ready and designed with security, automation, and flexibility in mind. Feel free to extend it further or ask for additional features!

---

**Happy Discording!**
