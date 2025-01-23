require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

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
    // Optional: Create "users" table if it doesn't exist
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

// Serve a simple HTML form on GET /register
app.get('/register', (req, res) => {
  const formHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Registration Form</title>
      </head>
      <body>
        <h1>Register Here</h1>
        <form action="/register" method="POST">
          <label for="username">Username:</label>
          <input type="text" name="username" id="username" required />
          <br><br>
          
          <label for="email">Email:</label>
          <input type="email" name="email" id="email" required />
          <br><br>
          
          <label for="password">Password:</label>
          <input type="password" name="password" id="password" required />
          <br><br>
          
          <button type="submit">Register</button>
        </form>
      </body>
    </html>
  `;
  res.send(formHTML);
});

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

// Home Page with a Button Linking to /register
app.get('/', (req, res) => {
  const homeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Home Page</title>
      </head>
      <body>
        <h1>Welcome to Our Registration App</h1>
        <button onclick="window.location.href='/register'">Go to Registration</button>
      </body>
    </html>
  `;
  res.send(homeHTML);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
