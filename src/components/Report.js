import React, { useEffect, useState } from "react";

function Report({ products, sales }) {
  const [savedProducts, setSavedProducts] = useState(products || []);
  const [savedSales, setSavedSales] = useState(sales || []);

  
  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    const storedSales = localStorage.getItem("sales");

    if (storedProducts) setSavedProducts(JSON.parse(storedProducts));
    if (storedSales) setSavedSales(JSON.parse(storedSales));
  }, []);

  if (!savedProducts || !savedSales) return <p>No data available.</p>;

  const reportData = savedProducts.map((p) => {
    const soldRecords = savedSales.filter((s) => s.productName === p.name);
    const totalSold = soldRecords.reduce(
      (sum, s) => sum + (s.quantitySold || 0),
      0
    );
    const totalRevenue = soldRecords.reduce(
      (sum, s) => sum + (s.total || 0),
      0
    );
    return {
      ...p,
      totalSold,
      totalRevenue,
    };
  });

  const totalProducts = savedProducts.length;
  const totalStockValue = savedProducts.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );
  const totalSales = savedSales.reduce(
    (sum, s) => sum + (s.quantitySold || 0),
    0
  );
  const totalRevenue = savedSales.reduce(
    (sum, s) => sum + (s.total || 0),
    0
  );

  return (
    <div className="report">
      <h1>Report</h1>

  
      <div className="report-summary">
        <p>
          <strong>Total Products:</strong> {totalProducts}
        </p>
        <p>
          <strong>Total Stock Value:</strong> R{totalStockValue.toFixed(2)}
        </p>
        <p>
          <strong>Total Items Sold:</strong> {totalSales}
        </p>
        <p>
          <strong>Total Revenue:</strong> R{totalRevenue.toFixed(2)}
        </p>
      </div>

      
      <table className="report-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock Left</th>
            <th>Total Sold</th>
            <th>Total Revenue (R)</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.quantity}</td>
              <td>{p.totalSold}</td>
              <td>R{p.totalRevenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Report;
