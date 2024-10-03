const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Assumed database connection
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// POST /v2/purchases - Create a new purchase order
app.post('/v2/purchases', (req, res) => {
    const { Date, Supplier_Name, Input_Products } = req.body;

    // Validate required fields
    if (!Date || !Supplier_Name || !Input_Products || !Array.isArray(Input_Products) || Input_Products.length === 0) {
        return res.status(400).send('Incorrect input');
    }

    // Assuming `suppliers` and `products` are tables in the database
    // Fetch supplier details (assume supplier data is already in DB)
    const supplierQuery = 'SELECT * FROM suppliers WHERE supplier_name = ?';
    db.query(supplierQuery, [Supplier_Name], (err, supplierResult) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        
        if (supplierResult.length === 0) {
            return res.status(404).send('Supplier not found');
        }

        const supplier = supplierResult[0];
        const Bill_No = Math.floor(Math.random() * 10000); // Generate a random bill number

        // Prepare response data
        let outputProducts = [];
        let promises = [];

        Input_Products.forEach((product, index) => {
            // Check for product details in the database
            const productQuery = 'SELECT * FROM products WHERE product_name = ?';
            promises.push(new Promise((resolve, reject) => {
                db.query(productQuery, [product.Product_Names], (productErr, productResult) => {
                    if (productErr) {
                        reject('Error retrieving product');
                    }
                    
                    if (productResult.length === 0) {
                        reject('Product not found');
                    }

                    const productData = productResult[0];
                    const Net_Amount = product.Quantity * productData.product_price;

                    outputProducts.push({
                        Sr_No: index + 1,
                        Product_id: productData.product_id,
                        Quantity: product.Quantity,
                        Price: productData.product_price,
                        Net_Amount: Net_Amount
                    });

                    resolve();
                });
            }));
        });

        // Wait for all promises to complete
        Promise.all(promises)
            .then(() => {
                res.status(200).json({
                    Supplier_Name: supplier.supplier_name,
                    "Mobile No": supplier.mobile_no,
                    "Company Name": supplier.company_name,
                    Bill_No: Bill_No,
                    Output_Products: outputProducts
                });
            })
            .catch(error => {
                res.status(500).send(error);
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
