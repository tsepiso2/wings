import React, { useEffect, useState } from 'react';
import api from '../api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    category: '', 
    price: '', 
    quantity: '', 
    image: null,
    imagePreview: ''
  });
  const [editId, setEditId] = useState(null);
  const [stockForm, setStockForm] = useState({ productId: '', quantity: '', type: 'add' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.quantity) {
      setError('Please fill all required fields.');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('price', parseFloat(formData.price));
    submitData.append('quantity', parseInt(formData.quantity));
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      if (editId) {
        await api.put(`/products/${editId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setEditId(null);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Product added successfully!');
      }
      
      setFormData({ 
        name: '', 
        description: '', 
        category: '', 
        price: '', 
        quantity: '', 
        image: null,
        imagePreview: ''
      });
      setError('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
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
      image: null,
      imagePreview: product.imageUrl || ''
    });
    setEditId(product.id || product._id);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
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
      setSuccess('Stock updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#8B4513', marginBottom: '1.5rem' }}>Inventory Management</h1>
      
      {error && (
        <div style={{ 
          background: '#ff6b6b', 
          color: 'white', 
          padding: '1rem', 
          margin: '1rem 0', 
          borderRadius: '5px',
          display: error ? 'block' : 'none'
        }}>
          {error}
          <button 
            onClick={() => setError('')} 
            style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#4caf50', 
          color: 'white', 
          padding: '1rem', 
          margin: '1rem 0', 
          borderRadius: '5px',
          display: success ? 'block' : 'none'
        }}>
          {success}
          <button 
            onClick={() => setSuccess('')} 
            style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Product Form */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#654321', marginBottom: '1rem' }}>
            {editId ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                placeholder="Product Name" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input 
                placeholder="Description" 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <select 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select Category</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Main">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Price (M)" 
                value={formData.price} 
                onChange={e => setFormData({ ...formData, price: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="number" 
                placeholder="Initial Quantity" 
                value={formData.quantity} 
                onChange={e => setFormData({ ...formData, quantity: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Product Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ width: '100%' }}
              />
              {formData.imagePreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              style={{
                background: '#8B4513',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {editId ? 'Update' : 'Add'} Product
            </button>
            
            {editId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditId(null);
                  setFormData({ 
                    name: '', 
                    description: '', 
                    category: '', 
                    price: '', 
                    quantity: '', 
                    image: null,
                    imagePreview: ''
                  });
                }}
                style={{
                  background: '#A9A9A9',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Stock Management Form */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#654321', marginBottom: '1rem' }}>Stock Management</h2>
          
          <form onSubmit={handleStockChange}>
            <div style={{ marginBottom: '1rem' }}>
              <select 
                value={stockForm.productId} 
                onChange={e => setStockForm({ ...stockForm, productId: e.target.value })} 
                required 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} (Stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="number" 
                placeholder="Quantity" 
                value={stockForm.quantity} 
                onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} 
                required 
                min="1" 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <select 
                value={stockForm.type} 
                onChange={e => setStockForm({ ...stockForm, type: e.target.value })} 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="add">Add Stock</option>
                <option value="sell">Remove Stock (Sell)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              style={{
                background: '#D2691E',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Update Stock
            </button>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#654321', marginBottom: '1rem' }}>Current Products</h2>
        
        {products.length === 0 ? (
          <p>No products found. Add some products to get started.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5DEB3' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Image</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Price (M)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Quantity</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Alert</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLowStock = p.quantity <= 5;
                  return (
                    <tr key={p.id || p._id} style={{ borderBottom: '1px solid #F5DEB3', backgroundColor: isLowStock ? '#FFF8E1' : 'transparent' }}>
                      <td style={{ padding: '0.75rem' }}>
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '50px', background: '#F5DEB3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#8B4513' }}>No Image</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{p.name}</td>
                      <td style={{ padding: '0.75rem' }}>{p.description}</td>
                      <td style={{ padding: '0.75rem' }}>{p.category}</td>
                      <td style={{ padding: '0.75rem' }}>M {parseFloat(p.price).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem' }}>{p.quantity}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button 
                          onClick={() => handleEdit(p)} 
                          style={{ 
                            background: '#DAA520', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.5rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            marginRight: '0.5rem'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id || p._id)} 
                          style={{ 
                            background: '#B22222', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.5rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                          }}
                        >
                          Delete
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {isLowStock && (
                          <span style={{ color: '#B22222', fontWeight: 'bold' }}>
                            ⚠ Low Stock!
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
