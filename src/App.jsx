import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { suppliers, jobs, libraryItems } from './data/mockData';
import { emptyLine, nextPoNo, uid } from './utils';
import { loadStore, saveStore } from './storage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PurchaseOrderTable from './components/PurchaseOrderTable';
import POEditor from './components/POEditor';
import SimpleTablePage from './components/SimpleTablePage';

const defaultState = {
  pos: [],
  selectedPoId: null,
  view: 'purchaseOrders',
};

function createDraft(existingPos) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: uid(),
    poNo: '',
    status: 'draft',
    issueDate: today,
    supplierId: '',
    supplierName: '',
    jobId: '',
    jobNo: '',
    buyer: '',
    department: '',
    taxEnabled: false,
    taxPercent: 18,
    notes: '',
    lines: [emptyLine()],
    printCount: 0,
    createdAt: Date.now(),
  };
}

export default function App() {
  const stored = loadStore();
  const [state, setState] = useState({ ...defaultState, ...stored });
  const { pos, selectedPoId, view } = state;

  useEffect(() => saveStore(state), [state]);

  const selectedPo = pos.find(p => p.id === selectedPoId);

  const dashboard = useMemo(() => {
    const approved = pos.filter(p => p.status === 'approved');
    const draft = pos.filter(p => p.status === 'draft');
    const total = pos.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
    return { approved: approved.length, draft: draft.length, count: pos.length, total };
  }, [pos]);

  const updatePo = (nextPo) => {
    const computed = computeTotals(nextPo);
    setState(s => ({
      ...s,
      pos: s.pos.map(p => p.id === computed.id ? computed : p)
    }));
  };

  const newDraft = () => {
    const po = createDraft(pos);
    const computed = computeTotals(po);
    setState(s => ({
      ...s,
      view: 'purchaseOrders',
      selectedPoId: computed.id,
      pos: [computed, ...s.pos],
    }));
  };

  const addLine = () => {
    if (!selectedPo || selectedPo.status === 'approved') return;
    updatePo({ ...selectedPo, lines: [...selectedPo.lines, emptyLine()] });
  };

  const removeLine = (idx) => {
    if (!selectedPo || selectedPo.status === 'approved') return;
    updatePo({ ...selectedPo, lines: selectedPo.lines.filter((_, i) => i !== idx) });
  };

  const approvePo = () => {
    if (!selectedPo) return;
    const approved = computeTotals({
      ...selectedPo,
      status: 'approved',
      poNo: selectedPo.poNo || nextPoNo(pos),
    });
    updatePo(approved);
  };

  const printPo = (id = selectedPoId) => {
    const po = pos.find(p => p.id === id);
    if (!po || po.status !== 'approved') return;
    const html = renderPrintableHtml(po);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    setState(s => ({
      ...s,
      pos: s.pos.map(p => p.id === po.id ? { ...p, printCount: (p.printCount || 0) + 1 } : p)
    }));
  };

  const exportPo = (id = selectedPoId) => {
    const po = pos.find(p => p.id === id);
    if (!po || po.status !== 'approved') return;
    const blob = new Blob([renderExportText(po)], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${po.poNo || 'purchase-order'}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const duplicateDraft = () => {
    if (!selectedPo) return;
    const copy = computeTotals({
      ...selectedPo,
      id: uid(),
      poNo: '',
      status: 'draft',
      printCount: 0,
      createdAt: Date.now(),
    });
    setState(s => ({
      ...s,
      selectedPoId: copy.id,
      pos: [copy, ...s.pos]
    }));
  };

  const clearData = () => {
    const ok = window.confirm('Clear all local app data?');
    if (!ok) return;
    localStorage.removeItem('po-maker-v5-store');
    setState(defaultState);
  };

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={(next) => setState(s => ({ ...s, view: next }))} />
      <main className="main-shell">
        <Topbar onNew={newDraft} />
        {view === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="stat-card"><div className="stat-label">Total POs</div><div className="stat-value">{dashboard.count}</div></div>
            <div className="stat-card"><div className="stat-label">Drafts</div><div className="stat-value">{dashboard.draft}</div></div>
            <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-value">{dashboard.approved}</div></div>
            <div className="stat-card"><div className="stat-label">Value</div><div className="stat-value">{Number(dashboard.total).toLocaleString()}</div></div>
          </div>
        )}

        {view === 'purchaseOrders' && (
          <>
            <PurchaseOrderTable pos={pos} onOpen={(id) => setState(s => ({ ...s, selectedPoId: id }))} onPrint={printPo} onExport={exportPo} />
            {selectedPo && (
              <POEditor
                po={selectedPo}
                suppliers={suppliers}
                jobs={jobs}
                libraryItems={libraryItems}
                onChange={updatePo}
                onAddLine={addLine}
                onRemoveLine={removeLine}
                onApprove={approvePo}
                onPrint={() => printPo(selectedPo.id)}
                onExport={() => exportPo(selectedPo.id)}
                onDuplicate={duplicateDraft}
              />
            )}
          </>
        )}

        {view === 'suppliers' && (
          <SimpleTablePage
            title="Suppliers"
            rows={suppliers}
            columns={[
              { key: 'name', label: 'Supplier' },
              { key: 'category', label: 'Category' },
              { key: 'taxRegistered', label: 'Tax Registered' },
              { key: 'defaultTax', label: 'Default Tax %' },
            ]}
          />
        )}

        {view === 'jobs' && (
          <SimpleTablePage
            title="Active Jobs"
            rows={jobs}
            columns={[
              { key: 'jobNo', label: 'Job No' },
              { key: 'buyer', label: 'Buyer' },
              { key: 'style', label: 'Style' },
              { key: 'department', label: 'Department' },
            ]}
          />
        )}

        {view === 'library' && (
          <SimpleTablePage
            title="Library"
            rows={libraryItems}
            columns={[
              { key: 'name', label: 'Item' },
              { key: 'category', label: 'Category' },
              { key: 'uom', label: 'UOM' },
              { key: 'spec', label: 'Spec' },
            ]}
          />
        )}

        {view === 'settings' && (
          <div className="panel">
            <div className="section-title page-space">Settings</div>
            <div className="helper">Prototype storage: browser localStorage</div>
            <div className="helper">Tax default: 18% for registered suppliers, override allowed per PO</div>
            <div className="helper">Approval rule: once approved, PO becomes locked in UI</div>
            <div className="footer-actions">
              <button className="secondary-btn" onClick={clearData}>Clear all app data</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function computeTotals(po) {
  const lines = po.lines.map(line => ({
    ...line,
    amount: Number(line.qty || 0) * Number(line.rate || 0),
  }));
  const subtotal = lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const taxAmount = po.taxEnabled ? subtotal * (Number(po.taxPercent || 0) / 100) : 0;
  const grandTotal = subtotal + taxAmount;
  return { ...po, lines, subtotal, taxAmount, grandTotal };
}

function renderExportText(po) {
  const rows = po.lines.map((line, i) => `${i + 1}. ${line.itemName} | ${line.description} | ${line.uom} | ${line.qty} | ${line.rate} | ${line.amount}`).join('\n');
  return [
    `PO No: ${po.poNo}`,
    `Status: ${po.status}`,
    `Issue Date: ${po.issueDate}`,
    `Supplier: ${po.supplierName}`,
    `Job: ${po.jobNo}`,
    '',
    rows,
    '',
    `Subtotal: ${po.subtotal}`,
    `Tax: ${po.taxAmount}`,
    `Grand Total: ${po.grandTotal}`,
    '',
    `Notes: ${po.notes || ''}`
  ].join('\n');
}

function renderPrintableHtml(po) {
  const lineRows = po.lines.map((line, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${line.itemName || ''}</td>
      <td>${line.description || ''}</td>
      <td>${line.uom || ''}</td>
      <td style="text-align:right">${line.qty || ''}</td>
      <td style="text-align:right">${line.rate || ''}</td>
      <td style="text-align:right">${line.amount || ''}</td>
    </tr>
  `).join('');

  return `
  <!doctype html>
  <html>
    <head>
      <title>${po.poNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
        .head { display:flex; justify-content:space-between; margin-bottom:14px; }
        .title { font-size:20px; font-weight:700; }
        .sub { font-size:12px; color:#555; }
        table { width:100%; border-collapse:collapse; margin-top:12px; }
        th, td { border:1px solid #bbb; padding:6px; font-size:12px; vertical-align:top; }
        .meta { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .box { border:1px solid #bbb; padding:8px; font-size:12px; }
        .totals { margin-top:10px; width:320px; margin-left:auto; }
        .totals div { display:flex; justify-content:space-between; padding:4px 0; font-size:12px; }
        .grand { font-weight:700; border-top:1px solid #222; padding-top:6px; }
      </style>
    </head>
    <body>
      <div class="head">
        <div>
          <div class="title">Nizamia Apparels - Purchase Order</div>
          <div class="sub">System Generated</div>
        </div>
        <div style="text-align:right">
          <div><strong>${po.poNo}</strong></div>
          <div class="sub">Status: ${po.status.toUpperCase()}</div>
        </div>
      </div>
      <div class="meta">
        <div class="box"><strong>Supplier</strong><br/>${po.supplierName || ''}</div>
        <div class="box"><strong>Issue Date</strong><br/>${po.issueDate || ''}</div>
        <div class="box"><strong>Job No</strong><br/>${po.jobNo || ''}</div>
        <div class="box"><strong>Department</strong><br/>${po.department || ''}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Item</th><th>Description</th><th>UOM</th><th>Qty</th><th>Rate</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>${lineRows}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><span>${po.subtotal || 0}</span></div>
        <div><span>Tax</span><span>${po.taxAmount || 0}</span></div>
        <div class="grand"><span>Grand Total</span><span>${po.grandTotal || 0}</span></div>
      </div>
      <div class="box" style="margin-top:12px;"><strong>Notes</strong><br/>${po.notes || ''}</div>
    </body>
  </html>
  `;
}
