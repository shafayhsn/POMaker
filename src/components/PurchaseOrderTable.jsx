import { money } from '../utils';

export default function PurchaseOrderTable({ pos, onOpen, onPrint, onExport }) {
  if (!pos.length) {
    return <div className="empty-box">No purchase orders yet.</div>;
  }

  return (
    <div className="panel">
      <table className="grid-table">
        <thead>
          <tr>
            <th>PO No</th>
            <th>Status</th>
            <th>Issue Date</th>
            <th>Supplier</th>
            <th>Job</th>
            <th>Department</th>
            <th>Total</th>
            <th>Prints</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pos.map((po) => (
            <tr key={po.id}>
              <td>{po.poNo || 'Draft'}</td>
              <td><span className={`chip ${po.status}`}>{po.status}</span></td>
              <td>{po.issueDate}</td>
              <td>{po.status === 'draft' ? '******' : po.supplierName}</td>
              <td>{po.jobNo}</td>
              <td>{po.department}</td>
              <td>{money(po.grandTotal)}</td>
              <td>{po.printCount || 0}</td>
              <td className="action-cell">
                <button className="text-btn" onClick={() => onOpen(po.id)}>Open</button>
                <button className="text-btn" disabled={po.status !== 'approved'} onClick={() => onPrint(po.id)}>Print</button>
                <button className="text-btn" disabled={po.status !== 'approved'} onClick={() => onExport(po.id)}>Export</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
