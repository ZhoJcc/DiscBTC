const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbPath = './database.sqlite';
const initScriptPath = './init_db.sql';

if (!fs.existsSync(dbPath)) {
    console.log('Initializing database...');
    const db = new sqlite3.Database(dbPath);
    const initScript = fs.readFileSync(initScriptPath, 'utf-8');

    db.exec(initScript, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully.');
        }
        db.close();
    });
} else {
    console.log('Database already exists.');
}
module.exports = new sqlite3.Database(dbPath);
