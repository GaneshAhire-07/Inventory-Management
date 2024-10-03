const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Ensure this file exists and is correctly set up with database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
// Middleware
app.use(bodyParser.json());

// POST /v1/products/add - Add a new product
app.post('/v1/products/add', (req, res) => {
    const { product_id, product_name, product_qty, units, category, product_price, expiry_date } = req.body;

    // Validation for Product Details
    if (!product_id || !product_name || !product_qty || !units || !category || !product_price || !expiry_date) {
        return res.status(400).send('All product fields are required');
    }

    const query = 'INSERT INTO products (product_id, product_name, product_qty, units, category_id, product_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [product_id, product_name, product_qty, units, category, product_price, expiry_date], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(201).send('Added Product Successfully');
    });
});

// POST /v1/products - Get products by category
app.post('/v1/products', (req, res) => {
    const { Category } = req.body;

    // Validation for Category
    if (!Category) {
        return res.status(400).send('Category is required');
    }

    const query = 'SELECT * FROM products WHERE category_id = ?';
    db.query(query, [Category], (err, results) => {
        if (err) {
            console.error('Error retrieving products:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('No products found for the given category');
        }

        const response = {
            count: results.length,
            results: results.map(product => ({
                product_id: product.product_id,
                product_name: product.product_name,
                product_qty: product.product_qty,
                units: product.units,
                category: product.category_id,
                product_price: product.product_price,
                expiry_date: product.expiry_date
            }))
        };

        res.status(200).json(response);
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
