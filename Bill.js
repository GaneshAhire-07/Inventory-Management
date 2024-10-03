const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Assumed database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// POST /v1/billing/new-bill - Create a new sales bill
app.post('/v1/billing/new-bill', (req, res) => {
    const { Customer_id, Bought_Products } = req.body;

    // Validate required fields
    if (!Customer_id || !Bought_Products || !Array.isArray(Bought_Products) || Bought_Products.length === 0) {
        return res.status(400).send('Incorrect input');
    }

    // Fetch customer details
    const customerQuery = 'SELECT * FROM customers WHERE customer_id = ?';
    db.query(customerQuery, [Customer_id], (err, customerResult) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        if (customerResult.length === 0) {
            return res.status(404).send('Customer not found');
        }

        const customer = customerResult[0];
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        // Initialize bill total
        let totalAmount = 0;

        // Create a new bill
        const insertBillQuery = 'INSERT INTO bills (customer_id, total, bill_date) VALUES (?, ?, ?)';
        db.query(insertBillQuery, [Customer_id, totalAmount, currentDate], (err, billResult) => {
            if (err) {
                return res.status(500).send('Error creating bill');
            }

            const Bill_id = billResult.insertId; // Get the inserted bill's ID

            // Prepare to insert products in bill_products table
            let productSummary = [];
            let promises = [];

            Bought_Products.forEach((product, index) => {
                promises.push(new Promise((resolve, reject) => {
                    // Fetch product details
                    const productQuery = 'SELECT * FROM products WHERE product_id = ?';
                    db.query(productQuery, [product.Product_id], (productErr, productResult) => {
                        if (productErr) {
                            return reject('Error retrieving product');
                        }

                        if (productResult.length === 0) {
                            return reject('Product not found');
                        }

                        const productData = productResult[0];
                        const Net_Amount = product.Quantity * productData.product_price;
                        totalAmount += Net_Amount;

                        // Insert product into bill_products
                        const insertBillProductQuery = 'INSERT INTO bill_products (bill_id, product_id, quantity) VALUES (?, ?, ?)';
                        db.query(insertBillProductQuery, [Bill_id, product.Product_id, product.Quantity], (err) => {
                            if (err) {
                                return reject('Error inserting product into bill_products');
                            }

                            productSummary.push({
                                Product_Name: productData.product_name,
                                Quantity: product.Quantity,
                                Price: productData.product_price,
                                Net_Amount: Net_Amount
                            });

                            resolve();
                        });
                    });
                }));
            });

            // Wait for all product insertions to complete
            Promise.all(promises)
                .then(() => {
                    // Update total in bills table
                    const updateTotalQuery = 'UPDATE bills SET total = ? WHERE bill_id = ?';
                    db.query(updateTotalQuery, [totalAmount, Bill_id], (err) => {
                        if (err) {
                            return res.status(500).send('Error updating total in bill');
                        }

                        res.status(201).json({
                            Customer_Name: customer.customer_name,
                            Total: totalAmount,
                            Bill_id: Bill_id,
                            Date: currentDate,
                            Summary: productSummary
                        });
                    });
                })
                .catch(error => {
                    res.status(500).send(error);
                });
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
