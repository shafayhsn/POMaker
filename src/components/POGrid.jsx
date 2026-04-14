export default function POGrid({ rows, updateRow }) {
  return (
    <table style={{width:"100%", borderCollapse:"collapse"}}>
      <thead>
        <tr>
          <th>Item</th><th>UOM</th><th>Qty</th><th>Rate</th><th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td><input onChange={e=>updateRow(i,"item",e.target.value)} /></td>
            <td><input onChange={e=>updateRow(i,"uom",e.target.value)} /></td>
            <td><input type="number" onChange={e=>updateRow(i,"qty",e.target.value)} /></td>
            <td><input type="number" onChange={e=>updateRow(i,"rate",e.target.value)} /></td>
            <td>{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
