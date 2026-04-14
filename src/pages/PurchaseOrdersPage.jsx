import { useMemo, useState } from 'react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../lib/utils'

const blankForm = {
  issueDate: new Date().toISOString().slice(0, 10),
  supplierName: '',
  jobNo: '',
  department: '',
  notes: '',
  item: '',
  description: '',
  unit: '',
  qty: '',
  rate: '',
}

export default function PurchaseOrdersPage() {
  const { purchaseOrders, actions, jobs } = useAppData()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(blankForm)

  const columns = [
    { key: 'poNo', header: 'PO No' },
    { key: 'revision', header: 'Rev.' },
    { key: 'issueDate', header: 'Issue Date' },
    { key: 'supplierMasked', header: 'Supplier' },
    { key: 'jobNo', header: 'Job No' },
    { key: 'department', header: 'Department' },
    { key: 'total', header: 'Total', render: (row) => formatCurrency(Number(row.total || 0)) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={toneMap[row.status] || 'default'}>{row.status}</Badge>,
    },
    { key: 'createdBy', header: 'Created By' },
    { key: 'printCount', header: 'Prints' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="button-row">
          {row.status === 'Draft' ? <button className="secondary-button" onClick={() => actions.submitDraft(row.id)}>Submit</button> : null}
          <button
            className="secondary-button"
            onClick={() => exportPO(row)}
            disabled={row.status !== 'Issued'}
            title={row.status !== 'Issued' ? 'Only issued POs can be exported' : 'Export PO'}
          >
            Export
          </button>
          <button
            className="primary-button"
            onClick={() => printPO(row, actions)}
            disabled={row.status !== 'Issued'}
            title={row.status !== 'Issued' ? 'Only issued POs can be printed' : 'Print PO'}
          >
            Print
          </button>
        </div>
      ),
    },
  ]

  const filteredRows = useMemo(() => {
    if (!filter.trim()) return purchaseOrders
    const query = filter.toLowerCase()
    return purchaseOrders.filter((po) =>
      [po.poNo, po.jobNo, po.department, po.status, po.createdBy].join(' ').toLowerCase().includes(query),
    )
  }, [purchaseOrders, filter])

  function handleCreateDraft(event) {
    event.preventDefault()
    actions.createDraftPO({
      issueDate: form.issueDate,
      supplierName: form.supplierName,
      jobNo: form.jobNo,
      department: form.department,
      notes: form.notes,
      lines: [
        {
          item: form.item,
          description: form.description,
          unit: form.unit,
          qty: Number(form.qty || 0),
          rate: Number(form.rate || 0),
        },
      ],
    })
    setForm(blankForm)
    setOpen(false)
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Purchase Orders"
        description="Draft POs hide supplier identity. Only the Director can unmask, approve, and issue."
        actions={<div className="button-row"><button className="primary-button" onClick={() => setOpen(true)}>New Draft</button></div>}
      />

      <div className="toolbar card">
        <input className="search-input" placeholder="Filter by status, job, or department" value={filter} onChange={(event) => setFilter(event.target.value)} />
      </div>

      {filteredRows.length ? (
        <DataTable columns={columns} rows={filteredRows} />
      ) : (
        <EmptyState
          title="No purchase orders found"
          description="The app is now clear of mock data. Create a draft PO and test the full issue flow."
          action={<button className="primary-button" onClick={() => setOpen(true)}>Create Draft PO</button>}
        />
      )}

      <div className="card stack-md">
        <div className="section-heading">
          <h2>Live business rule</h2>
        </div>
        <p>
          Draft creators can prepare line items, job references, quantities, rates, and notes. Supplier remains masked as <strong>*******</strong> until Director approval.
        </p>
      </div>

      <Modal open={open} title="Create Draft PO" onClose={() => setOpen(false)}>
        <form className="stack-md" onSubmit={handleCreateDraft}>
          <div className="form-grid">
            <label>
              <span className="label">Issue Date</span>
              <input required type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </label>
            <label>
              <span className="label">Job No</span>
              <input list="job-options" required value={form.jobNo} onChange={(e) => setForm({ ...form, jobNo: e.target.value })} placeholder="JB-24044" />
              <datalist id="job-options">
                {jobs.map((job) => <option key={job.id} value={job.jobNo} />)}
              </datalist>
            </label>
            <label>
              <span className="label">Department</span>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Fabric Store" />
            </label>
            <label>
              <span className="label">Supplier (will be masked)</span>
              <input required value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} placeholder="Hidden until Director approval" />
            </label>
            <label>
              <span className="label">Item</span>
              <input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Poly Cotton Stretch" />
            </label>
            <label>
              <span className="label">Unit</span>
              <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Meter" />
            </label>
            <label>
              <span className="label">Qty</span>
              <input required type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            </label>
            <label>
              <span className="label">Rate</span>
              <input required type="number" min="1" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </label>
          </div>
          <label>
            <span className="label">Description</span>
            <textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            <span className="label">Notes</span>
            <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function printPO(row, actions) {
  if (row.status !== 'Issued') return
  actions.printPO(row.id)
  const html = `
    <html><head><title>PO ${row.poNo}</title></head>
    <body style="font-family: Arial, sans-serif; padding: 24px;">
      <h1>Nizamia Apparels - Purchase Order</h1>
      <p><strong>PO No:</strong> ${row.poNo}</p>
      <p><strong>Supplier:</strong> ${row.supplierName}</p>
      <p><strong>Job No:</strong> ${row.jobNo}</p>
      <p><strong>Department:</strong> ${row.department}</p>
      <p><strong>Total:</strong> ${formatCurrency(Number(row.total || 0))}</p>
      <p><strong>Verification Code:</strong> ${row.verificationCode}</p>
    </body></html>`
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}

function exportPO(row) {
  if (row.status !== 'Issued') return
  const content = [
    `PO No: ${row.poNo}`,
    `Revision: ${row.revision}`,
    `Supplier: ${row.supplierName}`,
    `Job No: ${row.jobNo}`,
    `Department: ${row.department}`,
    `Total: ${formatCurrency(Number(row.total || 0))}`,
    `Verification Code: ${row.verificationCode}`,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `PO-${row.poNo}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

const toneMap = {
  Draft: 'muted',
  Submitted: 'warning',
  Approved: 'info',
  Issued: 'success',
  Cancelled: 'danger',
}
