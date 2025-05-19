const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('users.db');

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    totp_secret TEXT NOT NULL
  )
`);

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in database
    db.run(
      'INSERT INTO users (username, password, totp_secret) VALUES (?, ?, ?)',
      [username, hashedPassword, secret],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate QR code
        const otpauth = authenticator.keyuri(username, '2FA-TOTP', secret);
        QRCode.toDataURL(otpauth, (err, dataUrl) => {
          if (err) {
            return res.status(500).json({ error: 'Error generating QR code' });
          }
          res.json({ qrCode: dataUrl });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
// TOTP verification endpoint
app.post('/api/register/verify', (req, res) => {
  const { username, password, token } = req.body;

  if (!username || !password || !token) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Find user and verify TOTP
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify TOTP
    const validToken = authenticator.verify({
      token,
      secret: user.totp_secret
    });

    if (!validToken) {
      return res.status(401).json({ message: 'Invalid TOTP token' });
    }

    return res.status(200).json({ message: 'TOTP verification successful' });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password, token } = req.body;

  if (!username || !password || !token) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Find user
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify TOTP
      const validToken = authenticator.verify({
        token,
        secret: user.totp_secret
      });

      if (!validToken) {
        return res.status(401).json({ error: 'Invalid TOTP token' });
      }

      res.json({ message: 'Login successful' });

    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// Export the app for testing purposes
module.exports = app;
