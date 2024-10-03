const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure this file exists and is correctly set up with database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
// Middleware
app.use(bodyParser.json());

// POST /v1/signup - Sign up a new user
app.post('/v1/signup', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).send('Username, password, and email are required');
    }

    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    db.query(query, [username, password, email], (err, result) => {
        if (err) {
            return res.status(500).send('Error creating user');
        }
        res.status(201).send('User created successfully');
    });
});

// POST /v1/login - User login
app.post('/v1/login', (req, res) => {
    console.log('Login request received');
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.log('Error querying the database:', err);
            return res.status(500).send('Error logging in');
        }
        if (results.length === 0) {
            console.log('Invalid username or password');
            return res.status(400).send('Incorrect username or password');
        }
        console.log('User logged in successfully');
        res.status(200).json({
            user_id: results[0].user_id,
            username: results[0].username
        });
    });
});
// Handle 404 errors for non-existent routes
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

