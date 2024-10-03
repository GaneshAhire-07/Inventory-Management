const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure this file exists and is correctly set up with database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
// Middleware
app.use(bodyParser.json());
// POST /v1/cashiers - Add a new cashier
app.post('/v1/cashiers', (req, res) => {
    const { Email_address } = req.body;

    if (!Email_address) {
        return res.status(400).send('Email address is required');
    }

    const query = 'INSERT INTO cashiers (email_address) VALUES (?)';
    db.query(query, [Email_address], (err, result) => {
        if (err) {
            console.error('Error inserting cashier:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(403).send('Email already exists');
            }
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ email: Email_address });
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
