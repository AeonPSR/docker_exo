const express = require('express');
const mysql = require('mysql');
const util = require('util'); // Used for promisifying setTimeout
const app = express();
const port = 5000;

app.use(express.json()); // Middleware to parse JSON

// Create a MySQL connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const db = mysql.createConnection(dbConfig);

// Promisify db.query for easy use with async/await
const queryAsync = util.promisify(db.query).bind(db);

// Function to check if the database is ready
async function checkDatabaseReadiness() {
  try {
    // Attempt to run a simple query to see if the database is ready
    await queryAsync('SELECT 1');
    console.log('Database is ready to accept connections.');
  } catch (err) {
    console.error('Database is not ready:', err.message);
    process.exit(1); // Exit if database is not ready
  }
}

// Initialize the database connection before starting the server
checkDatabaseReadiness().then(() => {
  console.log('Connected to database successfully.');

  // User registration endpoint
  app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Insert user into database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.warn('User already exists:', username);
          return res.status(409).json({ error: 'User already exists.' });
        }
        console.error('Failed to register user:', error.message);
        return res.status(500).json({ error: 'Failed to register user.', details: error.message });
      }
      console.log('User registered successfully:', results.insertId);
      res.status(201).json({ message: 'User registered successfully!', userId: results.insertId });
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to verify database readiness:', err.message);
  process.exit(1); // Exit if initialization fails
});
