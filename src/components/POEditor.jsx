import { emptyLine, money } from '../utils';

export default function POEditor({
  po,
  suppliers,
  jobs,
  libraryItems,
  onChange,
  onAddLine,
  onRemoveLine,
  onApprove,
  onPrint,
  onExport,
  onDuplicate,
}) {
  const supplier = suppliers.find(s => String(s.id) === String(po.supplierId));
  const supplierMasked = po.status === 'draft' ? '******' : (supplier?.name || '');
  const subtotal = po.lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const taxAmt = po.taxEnabled ? subtotal * (Number(po.taxPercent || 0) / 100) : 0;
  const grand = subtotal + taxAmt;

  const handleLine = (idx, field, value) => {
    const lines = [...po.lines];
    lines[idx][field] = value;

    if (field === 'itemId') {
      const item = libraryItems.find(i => String(i.id) === String(value));
      lines[idx].itemName = item ? `${item.name}${item.code ? ` - ${item.code}` : ''}${item.shade ? ` - ${item.shade}` : ''}` : '';
      lines[idx].description = item?.spec || '';
      lines[idx].uom = item?.uom || '';
      lines[idx].rate = item?.lastRate || '';
    }

    lines[idx].amount = Number(lines[idx].qty || 0) * Number(lines[idx].rate || 0);
    onChange({ ...po, lines });
  };

  const setField = (field, value) => onChange({ ...po, [field]: value });

  return (
    <div className="editor-wrap">
      <div className="panel compact-gap">
        <div className="row-grid four">
          <div>
            <label>Issue Date</label>
            <input type="date" value={po.issueDate} disabled={po.status === 'approved'} onChange={(e) => setField('issueDate', e.target.value)} />
          </div>
          <div>
            <label>Job</label>
            <select value={po.jobId} disabled={po.status === 'approved'} onChange={(e) => {
              const job = jobs.find(j => String(j.id) === e.target.value);
              onChange({ ...po, jobId: e.target.value, jobNo: job?.jobNo || '', buyer: job?.buyer || '', department: job?.department || '' });
            }}>
              <option value="">Select job</option>
              {jobs.map(job => <option key={job.id} value={job.id}>{job.jobNo} - {job.buyer} - {job.style}</option>)}
            </select>
          </div>
          <div>
            <label>Department</label>
            <input value={po.department} disabled />
          </div>
          <div>
            <label>Supplier</label>
            <select value={po.supplierId} disabled={po.status === 'approved'} onChange={(e) => {
              const sp = suppliers.find(s => String(s.id) === e.target.value);
              onChange({
                ...po,
                supplierId: e.target.value,
                supplierName: sp?.name || '',
                taxEnabled: sp ? !!sp.taxRegistered : po.taxEnabled,
                taxPercent: sp?.defaultTax ?? po.taxPercent,
              });
            }}>
              <option value="">Select supplier</option>
              {suppliers.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
            <div className="helper">Shown as: {supplierMasked}</div>
          </div>
        </div>

        <div className="row-grid four second-row">
          <div>
            <label>Status</label>
            <input value={po.status.toUpperCase()} disabled />
          </div>
          <div>
            <label>PO No</label>
            <input value={po.poNo || 'Will generate on approval'} disabled />
          </div>
          <div>
            <label>Sales Tax</label>
            <div className="inline-toggle">
              <button className={po.taxEnabled ? 'mini-btn active' : 'mini-btn'} disabled={po.status === 'approved'} onClick={() => setField('taxEnabled', true)}>ON</button>
              <button className={!po.taxEnabled ? 'mini-btn active' : 'mini-btn'} disabled={po.status === 'approved'} onClick={() => setField('taxEnabled', false)}>OFF</button>
            </div>
          </div>
          <div>
            <label>Tax %</label>
            <input type="number" value={po.taxPercent} disabled={po.status === 'approved' || !po.taxEnabled} onChange={(e) => setField('taxPercent', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-head">
          <div className="section-title">PO Builder</div>
          {po.status !== 'approved' && <button className="secondary-btn" onClick={onAddLine}>Add Row</button>}
        </div>
        <table className="grid-table editor-table">
          <thead>
            <tr>
              <th style={{width:'22%'}}>Item</th>
              <th>Description / Spec</th>
              <th style={{width:'8%'}}>UOM</th>
              <th style={{width:'8%'}}>Qty</th>
              <th style={{width:'10%'}}>Rate</th>
              <th style={{width:'10%'}}>Amount</th>
              <th style={{width:'6%'}}></th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((line, idx) => (
              <tr key={line.lineId}>
                <td>
                  <select value={line.itemId} disabled={po.status === 'approved'} onChange={(e) => handleLine(idx, 'itemId', e.target.value)}>
                    <option value="">Select item</option>
                    {libraryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}{item.code ? ` - ${item.code}` : ''}{item.shade ? ` - ${item.shade}` : ''}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea rows="2" value={line.description} disabled={po.status === 'approved'} onChange={(e) => handleLine(idx, 'description', e.target.value)} />
                </td>
                <td><input value={line.uom} disabled={po.status === 'approved'} onChange={(e) => handleLine(idx, 'uom', e.target.value)} /></td>
                <td><input type="number" value={line.qty} disabled={po.status === 'approved'} onChange={(e) => handleLine(idx, 'qty', e.target.value)} /></td>
                <td><input type="number" value={line.rate} disabled={po.status === 'approved'} onChange={(e) => handleLine(idx, 'rate', e.target.value)} /></td>
                <td className="num-cell">{money(line.amount)}</td>
                <td>
                  {po.status !== 'approved' && po.lines.length > 1 && (
                    <button className="icon-btn" onClick={() => onRemoveLine(idx)}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel compact-gap">
        <div className="row-grid two">
          <div>
            <label>Notes</label>
            <textarea rows="5" value={po.notes} disabled={po.status === 'approved'} onChange={(e) => setField('notes', e.target.value)} placeholder="Delivery instructions, finishing, payment, special notes..." />
          </div>
          <div className="totals-box">
            <div className="total-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="total-line"><span>Tax</span><strong>{money(taxAmt)}</strong></div>
            <div className="total-line grand"><span>Grand Total</span><strong>{money(grand)}</strong></div>
            <div className="helper top-gap">Supplier visible after approval only.</div>
          </div>
        </div>
      </div>

      <div className="footer-actions">
        {po.status !== 'approved' ? (
          <button className="primary-btn" onClick={onApprove}>Approve & Issue</button>
        ) : (
          <>
            <button className="secondary-btn" onClick={onPrint}>Print PO</button>
            <button className="secondary-btn" onClick={onExport}>Export PO</button>
            <button className="secondary-btn" onClick={onDuplicate}>Duplicate as Draft</button>
          </>
        )}
      </div>
    </div>
  );
}
