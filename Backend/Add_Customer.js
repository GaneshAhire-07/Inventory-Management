const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure this file exists and is correctly set up with database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
// Middleware
app.use(bodyParser.json());
// POST /v1/customers - Add a new customer
app.post('/v1/customers', (req, res) => {
    const { customer_name, mobile_no } = req.body;

    // Validation for Customer Name and Mobile No
    if (!customer_name || !mobile_no) {
        return res.status(400).send('Customer Name and Mobile No are required');
    }

    const query = 'INSERT INTO customers (customer_name, mobile_no) VALUES (?, ?)';
    db.query(query, [customer_name, mobile_no], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Added Details Successfully');
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
