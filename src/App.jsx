import { useState } from "react";
import POGrid from "./components/POGrid";

export default function App() {
  const [rows, setRows] = useState([{ item:"", uom:"", qty:"", rate:"", amount:0 }]);
  const [taxOn, setTaxOn] = useState(true);
  const [approved, setApproved] = useState(false);

  const updateRow = (i, field, value) => {
    const r = [...rows];
    r[i][field] = value;
    r[i].amount = (r[i].qty||0)*(r[i].rate||0);
    setRows(r);
  };

  const addRow = () => setRows([...rows,{ item:"", uom:"", qty:"", rate:"", amount:0 }]);

  const subtotal = rows.reduce((a,r)=>a+Number(r.amount||0),0);
  const tax = taxOn ? subtotal*0.18 : 0;

  return (
    <div style={{padding:20, fontFamily:"sans-serif"}}>
      <h2>PO Builder V3</h2>

      <div style={{marginBottom:10}}>
        <label>
          <input type="checkbox" checked={taxOn} onChange={()=>setTaxOn(!taxOn)} />
          Apply Tax (18%)
        </label>
      </div>

      <POGrid rows={rows} updateRow={updateRow} />

      <button onClick={addRow}>+ Add Row</button>

      <div style={{marginTop:20}}>
        <div>Subtotal: {subtotal}</div>
        <div>Tax: {tax}</div>
        <div><strong>Total: {subtotal+tax}</strong></div>
      </div>

      <div style={{marginTop:20}}>
        {!approved ? (
          <button onClick={()=>setApproved(true)}>Approve PO</button>
        ) : (
          <button>Print PO</button>
        )}
      </div>
    </div>
  );
}
