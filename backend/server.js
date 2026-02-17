const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose(); // Import sqlite3

const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Database (Persistent)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Ensure table exists
    db.run(`CREATE TABLE IF NOT EXISTS food (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      category TEXT,
      quantity TEXT,
      status TEXT
    )`, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        // Schema Migration: Add missing columns if they don't exist
        const columnsToAdd = [
          { name: "phone", type: "TEXT" },
          { name: "location", type: "TEXT" },
          { name: "created_at", type: "TEXT" } // Renaming slightly for clarity or just consistent usage
        ];

        columnsToAdd.forEach(fileCol => {
          db.run(`ALTER TABLE food ADD COLUMN ${fileCol.name} ${fileCol.type}`, (err) => {
            // Ignore error if column already exists (SQLITE_ERROR: duplicate column name...)
            if (err && !err.message.includes("duplicate column name")) {
              console.error(`Error adding column ${fileCol.name}:`, err.message);
            }
          });
        });
      }
    });
  }
});


// Add food (PUBLIC)
app.post("/add-food", (req, res) => {
  const {
    source,
    category,
    quantity,
    phone,
    location,
    status
  } = req.body;

  if (!source || !category || !quantity || !phone || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const createdAt = new Date().toLocaleString();
  const sql = `INSERT INTO food (source, category, quantity, phone, location, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [source, category, quantity, phone, location, status, createdAt];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Food added successfully",
      id: this.lastID
    });
  });
});

// View food (ADMIN / PUBLIC VIEW)
app.get("/foods", (req, res) => {
  const sql = "SELECT * FROM food ORDER BY id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Rename created_at to dateTime/createdAt for frontend consistency if needed, 
    // but frontend uses createdAt or dateTime. Let's send exactly what DB has.
    // Frontend expects `createdAt` (admin.html) or `datetime` / `timestamp` logic.
    // Let's standardise the response.
    // Frontend dashboard.html uses `food.createdAt`. 
    // Frontend public.html uses `food.createdAt`.
    // Frontend admin.html uses `food.createdAt` (Wait, admin.html used `Date & Time` column but no specific key shown in my read-out earlier, wait, step 5 `loadStoredFood` in script.js for admin? No, script.js was separate file.)
    // Let's check `script.js` again? No, I have `dashboard.html` using `createdAt` (Step 57 edit attempt, Step 63 content) - NO wait, Dashboard.html Step 70 uses `food.createdAt || "N/A"`.
    // So `created_at` from DB needs to be mapped to `createdAt` or just change SQL alias.
    // Simplest: `SELECT id, source, category, quantity, phone, location, status, created_at as createdAt FROM food`

    // Actually, earlier in Step 14, server.js used `createdAt`.
    res.json(rows.map(r => ({
      ...r,
      createdAt: r.created_at // map snake_case to camelCase
    })));
  });
});

// Clean up on exit
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database closed.');
    process.exit(0);
  });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
