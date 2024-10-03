const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure this file exists and is correctly set up with database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// POST /v1/suppliers - Add a new supplier
app.post('/v1/suppliers', (req, res) => {
    const { "Supplier Name": supplierName, "Mobile No": mobileNo, "Comapany Name": companyName } = req.body;

    // Validate required fields
    if (!supplierName || !mobileNo || !companyName) {
        return res.status(400).send('Invalid Input(s)');
    }

    // Insert Supplier into Database
    const query = 'INSERT INTO suppliers (supplier_name, mobile_no, company_name) VALUES (?, ?, ?)';
    db.query(query, [supplierName, mobileNo, companyName], (err, result) => {
        if (err) {
            console.error('Error inserting supplier:', err);
            
            // Handle Duplicate Mobile Number (since mobile_no is UNIQUE)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(403).send('Mobile number already exists');
            }

            // Handle other database errors
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
