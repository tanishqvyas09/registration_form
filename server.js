require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS if your React runs on a separate URL/port
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create PostgreSQL client using Supabase connection string
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to Supabase PG
client.connect()
  .then(() => {
    console.log('Connected to Supabase PostgreSQL');
    // Optional: create "users" table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      );
    `;
    return client.query(createTableQuery);
  })
  .then(() => {
    console.log('Users table is ready!');
  })
  .catch((err) => console.error('PG connection error:', err));

// -- COMMENT OUT OR REMOVE THE HTML-SERVING ROUTES --
// app.get('/', (req, res) => { ... });
// app.get('/register', (req, res) => { ... });

// Registration Endpoint (POST)
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const insertQuery = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [username, email, password];

    const result = await client.query(insertQuery, values);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
