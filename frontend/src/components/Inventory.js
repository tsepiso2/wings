import React, { useEffect, useState } from 'react';
import api from '../api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', price: '', quantity: '', imageUrl: '' });
  const [editId, setEditId] = useState(null);
  const [stockForm, setStockForm] = useState({ productId: '', quantity: '', type: 'add' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      // Make sure the backend returns an array
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
        console.error('Invalid data format:', res.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Check your backend and CORS settings.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.quantity) {
      setError('Please fill all required fields.');
      return;
    }
    const submitData = { ...formData, price: parseFloat(formData.price), quantity: parseInt(formData.quantity) };
    if (isNaN(submitData.price) || isNaN(submitData.quantity)) {
      setError('Price must be a number, Quantity must be an integer.');
      return;
    }
    try {
      if (editId) {
        await api.put(`/products/${editId}`, submitData);
        setEditId(null);
      } else {
        await api.post('/products', submitData);
      }
      setFormData({ name: '', description: '', category: '', price: '', quantity: '', imageUrl: '' });
      setError('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      imageUrl: product.imageUrl || ''
    });
    setEditId(product.id || product._id); // support _id if backend uses MongoDB
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setError('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleStockChange = async (e) => {
    e.preventDefault();
    const { productId, quantity, type } = stockForm;
    if (!productId || !quantity) {
      setError('Please select a product and enter quantity.');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive integer.');
      return;
    }
    const product = products.find(p => p.id === parseInt(productId) || p._id === productId);
    if (!product) {
      setError('Product not found.');
      return;
    }
    if (type === 'sell' && product.quantity < qty) {
      setError('Insufficient stock for sale.');
      return;
    }

    try {
      await api.post('/transactions', {
        productId: product.id || product._id,
        quantity: qty,
        type,
        price: type === 'sell' ? product.price : undefined
      });
      setStockForm({ productId: '', quantity: '', type: 'add' });
      setError('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Current Products</h3>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price (M)</th>
              <th>Quantity</th>
              <th>Actions</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isLowStock = p.quantity <= 5;
              return (
                <tr key={p.id || p._id} style={{ backgroundColor: isLowStock ? '#ffe6e6' : 'transparent' }}>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <button onClick={() => handleEdit(p)} style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id || p._id)}>Delete</button>
                  </td>
                  <td>{isLowStock && <span style={{ color: 'red', fontWeight: 'bold' }}>⚠ Low Stock!</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <h2>Stock Management</h2>
      <form onSubmit={handleStockChange}>
        <select value={stockForm.productId} onChange={e => setStockForm({ ...stockForm, productId: e.target.value })} required>
          <option value="">Select Product</option>
          {products.map(p => (
            <option key={p.id || p._id} value={p.id || p._id}>
              {p.name} (Stock: {p.quantity})
            </option>
          ))}
        </select>
        <input type="number" placeholder="Quantity" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required min="1" />
        <select value={stockForm.type} onChange={e => setStockForm({ ...stockForm, type: e.target.value })}>
          <option value="add">Add Stock</option>
          <option value="sell">Remove Stock (Sell)</option>
        </select>
        <button type="submit">Update Stock</button>
      </form>

      <h2>Product Management</h2>
      {error && <div style={{ background: '#ff6b6b', color: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '5px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <input placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
          <option value="">Category</option>
          <option value="Appetizer">Appetizer</option>
          <option value="Main">Main</option>
          <option value="Dessert">Dessert</option>
          <option value="Snack">Snack</option>
        </select>
        <input type="number" step="0.01" placeholder="Price (M)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
        <input type="number" placeholder="Initial Quantity" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
        <input placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
        <button type="submit">{editId ? 'Update' : 'Add'} Product</button>
      </form>
    </div>
  );
};

export default Inventory;
