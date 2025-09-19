// backend/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');

// ✅ Ensure data folder and JSON files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(path.join(DATA_DIR, 'products.json'))) fs.writeFileSync(path.join(DATA_DIR, 'products.json'), '[]', 'utf8');
if (!fs.existsSync(path.join(DATA_DIR, 'transactions.json'))) fs.writeFileSync(path.join(DATA_DIR, 'transactions.json'), '[]', 'utf8');

// ✅ Middleware
app.use(cors({
  origin: ['https://your-vercel-frontend.vercel.app', 'http://localhost:3000'], // frontend URLs
}));
app.use(express.json());

// Serve React frontend in production
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// Helper functions
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');

// ---------------- Products API ----------------
app.get('/api/products', (req, res) => {
  try {
    res.json(readJson('products.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const products = readJson('products.json');
    const newProduct = { id: Date.now(), ...req.body, quantity: req.body.quantity || 0 };
    products.push(newProduct);
    writeJson('products.json', products);
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const products = readJson('products.json');
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      writeJson('products.json', products);
      res.json(products[index]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    let products = readJson('products.json');
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeJson('products.json', products);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ---------------- Transactions API ----------------
app.get('/api/transactions', (req, res) => {
  try {
    res.json(readJson('transactions.json'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read transactions' });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { productId, quantity, type, price } = req.body;
    const products = readJson('products.json');
    const productIndex = products.findIndex(p => p.id === parseInt(productId));

    if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });

    if (type === 'sell' && products[productIndex].quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const newTransaction = {
      id: Date.now(),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      type,
      amount: type === 'sell' ? parseInt(quantity) * price : 0,
      date: new Date().toISOString(),
    };

    const transactions = readJson('transactions.json');
    transactions.push(newTransaction);
    writeJson('transactions.json', transactions);

    // Update stock
    if (type === 'add') products[productIndex].quantity += parseInt(quantity);
    if (type === 'sell') products[productIndex].quantity -= parseInt(quantity);

    writeJson('products.json', products);
    res.json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// ---------------- React catch-all ----------------
app.get('*', (req, res) => {
  if (fs.existsSync(frontendBuildPath)) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  } else {
    res.status(404).send('Frontend not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT`);
});
