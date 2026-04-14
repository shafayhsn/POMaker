
import { useState } from "react";

export default function App() {
  const [rows, setRows] = useState([{ qty: 0, rate: 0 }]);

  const update = (i, key, value) => {
    const r = [...rows];
    r[i][key] = value;
    setRows(r);
  };

  const addRow = () => setRows([...rows, { qty: 0, rate: 0 }]);

  const total = rows.reduce((a, r) => a + r.qty * r.rate, 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>PO Builder</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Qty</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <input type="number" onChange={e => update(i, "qty", +e.target.value)} />
              </td>
              <td>
                <input type="number" onChange={e => update(i, "rate", +e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>Add Row</button>

      <h3>Total: {total}</h3>
    </div>
  );
}
