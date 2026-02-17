const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) return console.error(err);

        tables.forEach(table => {
            console.log(`Table: ${table.name}`);
            db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
                if (err) console.error(err);
                else {
                    columns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                    });
                }
            });

            // Sample data check
            db.all(`SELECT * FROM ${table.name} LIMIT 1`, (err, rows) => {
                if (rows && rows.length > 0) {
                    console.log(`  Sample row:`, rows[0]);
                }
            });
        });
    });
});
