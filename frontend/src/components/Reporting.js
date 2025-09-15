import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reporting = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  }, []);

  const sales = transactions.filter(t => t.type === 'sell');
  const totalRevenue = sales.reduce((sum, t) => sum + t.amount, 0);
  const totalItemsSold = sales.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div>
      <h2>Reporting</h2>
      <div className="summary">
        <div>
          <h3>Total Revenue</h3>
          <p>M {totalRevenue}</p>
        </div>
        <div>
          <h3>Total Items Sold</h3>
          <p>{totalItemsSold}</p>
        </div>
        <div>
          <h3>Total Transactions</h3>
          <p>{transactions.length}</p>
        </div>
      </div>

      <h3>All Transactions</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Product ID</th><th>Quantity</th><th>Amount (M)</th></tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.type}</td>
              <td>{t.productId}</td>
              <td>{t.quantity}</td>
              <td>{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Sales Transactions</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Product ID</th><th>Quantity</th><th>Amount (M)</th></tr>
        </thead>
        <tbody>
          {sales.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.productId}</td>
              <td>{t.quantity}</td>
              <td>{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reporting;