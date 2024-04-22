const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const dbPath = '/app/db/event_management.db';

// if (fs.existsSync(dbPath)) {
//     fs.unlinkSync(dbPath);
//     console.log('Existing database file deleted.');
// }

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to Event Management database.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS components (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            state TEXT NOT NULL
        )
    `);
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            subscriber_id INTEGER NOT NULL,
            subscriber_name TEXT NOT NULL UNIQUE,
            publisher_subscribed_to_name TEXT,
            PRIMARY KEY (subscriber_id),
            FOREIGN KEY (subscriber_id) REFERENCES components(id)
        )
    `);
});

module.exports = db;