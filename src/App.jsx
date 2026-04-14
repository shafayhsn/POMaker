import { useEffect, useMemo, useState } from 'react'
import { jobs, libraryItems, suppliers } from './data/mockData'

const STORAGE_KEY = 'po-maker-ultimate-final'

const money = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
const uid = () => Math.random().toString(36).slice(2, 10)

function createEmptyPo() {
  return {
    id: uid(),
    poNo: '',
    status: 'draft',
    issueDate: new Date().toISOString().slice(0, 10),
    jobId: '',
    jobNo: '',
    buyer: '',
    department: '',
    supplierId: '',
    supplierName: '',
    taxEnabled: false,
    taxPercent: 18,
    notes: '',
    printCount: 0,
    lines: [createLine()],
  }
}

function createLine() {
  return {
    id: uid(),
    itemId: '',
    itemName: '',
    description: '',
    uom: '',
    qty: '',
    rate: '',
    amount: 0,
  }
}

function compute(po) {
  const lines = po.lines.map((line) => ({
    ...line,
    amount: Number(line.qty || 0) * Number(line.rate || 0),
  }))
  const subtotal = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0)
  const taxAmount = po.taxEnabled ? subtotal * (Number(po.taxPercent || 0) / 100) : 0
  return { ...po, lines, subtotal, taxAmount, grandTotal: subtotal + taxAmount }
}

function nextPoNo(pos) {
  const year = new Date().getFullYear()
  const max = pos
    .map((p) => p.poNo)
    .filter(Boolean)
    .map((p) => Number(String(p).split('-').pop()) || 0)
    .sort((a, b) => b - a)[0] || 0
  return `PO-${year}-${String(max + 1).padStart(5, '0')}`
}

export default function App() {
  const saved = loadState()
  const [view, setView] = useState(saved.view || 'purchaseOrders')
  const [pos, setPos] = useState(saved.pos || [])
  const [selectedId, setSelectedId] = useState(saved.selectedId || null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ view, pos, selectedId }))
  }, [view, pos, selectedId])

  const selectedPo = pos.find((po) => po.id === selectedId) || null

  const summary = useMemo(() => {
    const approved = pos.filter((po) => po.status === 'approved').length
    const draft = pos.filter((po) => po.status === 'draft').length
    const totalValue = pos.reduce((sum, po) => sum + Number(po.grandTotal || 0), 0)
    return { approved, draft, totalValue, totalPos: pos.length }
  }, [pos])

  const createDraft = () => {
    const po = compute(createEmptyPo())
    setPos((prev) => [po, ...prev])
    setSelectedId(po.id)
    setView('purchaseOrders')
  }

  const updatePo = (next) => {
    const computed = compute(next)
    setPos((prev) => prev.map((po) => (po.id === computed.id ? computed : po)))
  }

  const approvePo = () => {
    if (!selectedPo) return
    updatePo({ ...selectedPo, status: 'approved', poNo: selectedPo.poNo || nextPoNo(pos) })
  }

  const duplicateDraft = () => {
    if (!selectedPo) return
    const copy = compute({ ...selectedPo, id: uid(), status: 'draft', poNo: '', printCount: 0 })
    setPos((prev) => [copy, ...prev])
    setSelectedId(copy.id)
  }

  const addLine = () => {
    if (!selectedPo || selectedPo.status === 'approved') return
    updatePo({ ...selectedPo, lines: [...selectedPo.lines, createLine()] })
  }

  const removeLine = (id) => {
    if (!selectedPo || selectedPo.status === 'approved') return
    const lines = selectedPo.lines.filter((line) => line.id !== id)
    updatePo({ ...selectedPo, lines: lines.length ? lines : [createLine()] })
  }

  const printPo = () => {
    if (!selectedPo || selectedPo.status !== 'approved') return
    const win = window.open('', '_blank')
    win.document.write(renderPrint(selectedPo))
    win.document.close()
    win.focus()
    win.print()
    setPos((prev) => prev.map((po) => (po.id === selectedPo.id ? { ...po, printCount: (po.printCount || 0) + 1 } : po)))
  }

  const exportPo = () => {
    if (!selectedPo || selectedPo.status !== 'approved') return
    const blob = new Blob([renderExport(selectedPo)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPo.poNo}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (!window.confirm('Clear all local data?')) return
    localStorage.removeItem(STORAGE_KEY)
    setPos([])
    setSelectedId(null)
    setView('purchaseOrders')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">NA</div>
        <div className="brand-block">
          <div className="brand-name">PO Maker</div>
          <div className="brand-sub">Control System</div>
        </div>
        <nav className="nav">
          {[
            ['dashboard', 'Dashboard'],
            ['purchaseOrders', 'Purchase Orders'],
            ['suppliers', 'Suppliers'],
            ['jobs', 'Active Jobs'],
            ['library', 'Library'],
            ['settings', 'Settings'],
          ].map(([key, label]) => (
            <button key={key} className={view === key ? 'nav-item active' : 'nav-item'} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="title">Purchase Order Control System</div>
            <div className="subtitle">Compact grid-first prototype with your mock data loaded</div>
          </div>
          <button className="primary-btn" onClick={createDraft}>New Draft PO</button>
        </div>

        {view === 'dashboard' && (
          <div className="stats-grid">
            <Stat label="Total POs" value={summary.totalPos} />
            <Stat label="Drafts" value={summary.draft} />
            <Stat label="Approved" value={summary.approved} />
            <Stat label="Value" value={money(summary.totalValue)} />
          </div>
        )}

        {view === 'purchaseOrders' && (
          <>
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>PO No</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Supplier</th>
                    <th>Job</th>
                    <th>Total</th>
                    <th>Prints</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.length === 0 && (
                    <tr><td colSpan="7" className="empty">No purchase orders yet.</td></tr>
                  )}
                  {pos.map((po) => (
                    <tr key={po.id} className={selectedId === po.id ? 'selected-row' : ''} onClick={() => setSelectedId(po.id)}>
                      <td>{po.poNo || 'Draft'}</td>
                      <td><span className={`chip ${po.status}`}>{po.status}</span></td>
                      <td>{po.issueDate}</td>
                      <td>{po.status === 'draft' ? '******' : po.supplierName}</td>
                      <td>{po.jobNo || '-'}</td>
                      <td>{money(po.grandTotal)}</td>
                      <td>{po.printCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPo && (
              <div className="editor-grid">
                <div className="card">
                  <div className="section-title">PO Header</div>
                  <div className="fields four">
                    <Field label="Issue Date"><input type="date" value={selectedPo.issueDate} disabled={selectedPo.status === 'approved'} onChange={(e) => updatePo({ ...selectedPo, issueDate: e.target.value })} /></Field>
                    <Field label="Job">
                      <select value={selectedPo.jobId} disabled={selectedPo.status === 'approved'} onChange={(e) => {
                        const job = jobs.find((j) => String(j.id) === e.target.value)
                        updatePo({
                          ...selectedPo,
                          jobId: e.target.value,
                          jobNo: job?.jobNo || '',
                          buyer: job?.buyer || '',
                          department: job?.department || '',
                        })
                      }}>
                        <option value="">Select job</option>
                        {jobs.map((job) => <option key={job.id} value={job.id}>{job.jobNo} - {job.buyer}</option>)}
                      </select>
                    </Field>
                    <Field label="Department"><input value={selectedPo.department} disabled /></Field>
                    <Field label="Supplier (masked in draft)">
                      <select value={selectedPo.supplierId} disabled={selectedPo.status === 'approved'} onChange={(e) => {
                        const supplier = suppliers.find((s) => String(s.id) === e.target.value)
                        updatePo({
                          ...selectedPo,
                          supplierId: e.target.value,
                          supplierName: supplier?.name || '',
                          taxEnabled: supplier ? supplier.taxRegistered : selectedPo.taxEnabled,
                          taxPercent: supplier?.defaultTax ?? selectedPo.taxPercent,
                        })
                      }}>
                        <option value="">Select supplier</option>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="fields four compact-top">
                    <Field label="Status"><input value={selectedPo.status.toUpperCase()} disabled /></Field>
                    <Field label="PO No"><input value={selectedPo.poNo || 'Will generate on approval'} disabled /></Field>
                    <Field label="Sales Tax">
                      <div className="toggle-row">
                        <button className={selectedPo.taxEnabled ? 'mini active' : 'mini'} disabled={selectedPo.status === 'approved'} onClick={() => updatePo({ ...selectedPo, taxEnabled: true })}>ON</button>
                        <button className={!selectedPo.taxEnabled ? 'mini active' : 'mini'} disabled={selectedPo.status === 'approved'} onClick={() => updatePo({ ...selectedPo, taxEnabled: false })}>OFF</button>
                      </div>
                    </Field>
                    <Field label="Tax %"><input type="number" value={selectedPo.taxPercent} disabled={selectedPo.status === 'approved' || !selectedPo.taxEnabled} onChange={(e) => updatePo({ ...selectedPo, taxPercent: e.target.value })} /></Field>
                  </div>
                </div>

                <div className="card">
                  <div className="section-header">
                    <div className="section-title">PO Builder</div>
                    <button className="secondary-btn" disabled={selectedPo.status === 'approved'} onClick={addLine}>Add Row</button>
                  </div>
                  <table className="table editor-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description / Spec</th>
                        <th>UOM</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPo.lines.map((line) => (
                        <tr key={line.id}>
                          <td>
                            <select value={line.itemId} disabled={selectedPo.status === 'approved'} onChange={(e) => {
                              const item = libraryItems.find((i) => String(i.id) === e.target.value)
                              const lines = selectedPo.lines.map((current) => current.id === line.id ? {
                                ...current,
                                itemId: e.target.value,
                                itemName: item?.name || '',
                                description: item?.spec || '',
                                uom: item?.uom || '',
                                rate: item?.lastRate || '',
                              } : current)
                              updatePo({ ...selectedPo, lines })
                            }}>
                              <option value="">Select item</option>
                              {libraryItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                          </td>
                          <td><textarea rows="2" value={line.description} disabled={selectedPo.status === 'approved'} onChange={(e) => replaceLine(selectedPo, line.id, { description: e.target.value }, updatePo)} /></td>
                          <td><input value={line.uom} disabled={selectedPo.status === 'approved'} onChange={(e) => replaceLine(selectedPo, line.id, { uom: e.target.value }, updatePo)} /></td>
                          <td><input type="number" value={line.qty} disabled={selectedPo.status === 'approved'} onChange={(e) => replaceLine(selectedPo, line.id, { qty: e.target.value }, updatePo)} /></td>
                          <td><input type="number" value={line.rate} disabled={selectedPo.status === 'approved'} onChange={(e) => replaceLine(selectedPo, line.id, { rate: e.target.value }, updatePo)} /></td>
                          <td className="number-cell">{money(line.amount)}</td>
                          <td><button className="danger-btn" disabled={selectedPo.status === 'approved'} onClick={() => removeLine(line.id)}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card split-card">
                  <div>
                    <div className="section-title">Notes</div>
                    <textarea className="notes" rows="6" value={selectedPo.notes} disabled={selectedPo.status === 'approved'} onChange={(e) => updatePo({ ...selectedPo, notes: e.target.value })} placeholder="Delivery dates, finishing, payment terms, instructions..." />
                  </div>
                  <div className="totals-box">
                    <div className="total-row"><span>Subtotal</span><strong>{money(selectedPo.subtotal)}</strong></div>
                    <div className="total-row"><span>Tax</span><strong>{money(selectedPo.taxAmount)}</strong></div>
                    <div className="total-row grand"><span>Grand Total</span><strong>{money(selectedPo.grandTotal)}</strong></div>
                    <div className="helper">Supplier shows as ****** until approval.</div>
                  </div>
                </div>

                <div className="action-bar">
                  {selectedPo.status !== 'approved' ? (
                    <button className="primary-btn" onClick={approvePo}>Approve & Issue</button>
                  ) : (
                    <>
                      <button className="secondary-btn" onClick={printPo}>Print PO</button>
                      <button className="secondary-btn" onClick={exportPo}>Export PO</button>
                      <button className="secondary-btn" onClick={duplicateDraft}>Duplicate as Draft</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {view === 'suppliers' && <TablePage title="Suppliers" rows={suppliers} columns={['name', 'category', 'taxRegistered', 'defaultTax']} />}
        {view === 'jobs' && <TablePage title="Active Jobs" rows={jobs} columns={['jobNo', 'buyer', 'style', 'department']} />}
        {view === 'library' && <TablePage title="Library" rows={libraryItems} columns={['name', 'category', 'uom', 'spec']} />}
        {view === 'settings' && (
          <div className="card settings-card">
            <div className="section-title">Settings</div>
            <p>Default tax for registered suppliers is 18%. User can still turn tax on or off per PO.</p>
            <p>Approved POs are locked in the UI.</p>
            <button className="secondary-btn" onClick={clearData}>Clear all app data</button>
          </div>
        )}
      </main>
    </div>
  )
}

function replaceLine(po, lineId, patch, updatePo) {
  const lines = po.lines.map((line) => line.id === lineId ? { ...line, ...patch } : line)
  updatePo({ ...po, lines })
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function Field({ label, children }) {
  return <div><label>{label}</label>{children}</div>
}

function Stat({ label, value }) {
  return <div className="stat-card"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
}

function TablePage({ title, rows, columns }) {
  return (
    <div className="card">
      <div className="section-title space-bottom">{title}</div>
      <table className="table">
        <thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx}>{columns.map((col) => <td key={col}>{String(row[col])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderPrint(po) {
  const rows = po.lines.map((line, i) => `<tr><td>${i + 1}</td><td>${line.itemName}</td><td>${line.description}</td><td>${line.uom}</td><td>${line.qty}</td><td>${line.rate}</td><td>${line.amount}</td></tr>`).join('')
  return `<!doctype html><html><head><title>${po.poNo}</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #bbb;padding:6px;font-size:12px;vertical-align:top}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px}.box{border:1px solid #bbb;padding:8px;font-size:12px}</style></head><body><h2>Nizamia Apparels - Purchase Order</h2><div class="meta"><div class="box"><strong>PO No</strong><br/>${po.poNo}</div><div class="box"><strong>Issue Date</strong><br/>${po.issueDate}</div><div class="box"><strong>Supplier</strong><br/>${po.supplierName}</div><div class="box"><strong>Job</strong><br/>${po.jobNo}</div></div><table><thead><tr><th>#</th><th>Item</th><th>Description</th><th>UOM</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Subtotal:</strong> ${po.subtotal}</p><p><strong>Tax:</strong> ${po.taxAmount}</p><p><strong>Grand Total:</strong> ${po.grandTotal}</p><p><strong>Notes:</strong> ${po.notes || ''}</p></body></html>`
}

function renderExport(po) {
  return [`PO No: ${po.poNo}`, `Issue Date: ${po.issueDate}`, `Supplier: ${po.supplierName}`, `Job: ${po.jobNo}`, '', ...po.lines.map((line) => `${line.itemName} | ${line.description} | ${line.uom} | ${line.qty} | ${line.rate} | ${line.amount}`), '', `Subtotal: ${po.subtotal}`, `Tax: ${po.taxAmount}`, `Grand Total: ${po.grandTotal}`, '', `Notes: ${po.notes || ''}`].join('\n')
}
