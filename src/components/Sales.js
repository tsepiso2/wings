import React, { useEffect, useState } from "react";

function Sales({ salesProp }) {
  const storedSales = JSON.parse(localStorage.getItem("sales")) || [];
  const [sales, setSales] = useState(storedSales);

  useEffect(() => {
    if (salesProp) {
      setSales(salesProp);
    }
  }, [salesProp]);

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  if (!sales || sales.length === 0) return <p>No sales recorded yet.</p>;

  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalProductsSold = sales.reduce((sum, s) => sum + (s.quantitySold || 0), 0);

  return (
    <div className="sales">
      <h1>Sales</h1>
      <table className="sales-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity Sold</th>
            <th>Total (R)</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{s.productName || "Unknown"}</td>
              <td>{s.quantitySold || 0}</td>
              <td>{s.total !== undefined ? `R${s.total.toFixed(2)}` : "R0.00"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Summary</h3>
      <p>🛒 Total Products Sold: {totalProductsSold}</p>
      <p>💰 Total Sales: R{totalSales.toFixed(2)}</p>
    </div>
  );
}

export default Sales;
