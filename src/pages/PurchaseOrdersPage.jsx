import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import { purchaseOrders } from '../data/mockData'

export default function PurchaseOrdersPage() {
  const columns = [
    { key: 'poNo', header: 'PO No' },
    { key: 'revision', header: 'Rev.' },
    { key: 'issueDate', header: 'Issue Date' },
    {
      key: 'supplierMasked',
      header: 'Supplier',
    },
    { key: 'jobNo', header: 'Job No' },
    { key: 'department', header: 'Department' },
    { key: 'total', header: 'Total' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={toneMap[row.status] || 'default'}>{row.status}</Badge>,
    },
    { key: 'createdBy', header: 'Created By' },
    { key: 'printCount', header: 'Prints' },
  ]

  return (
    <div className="stack-lg">
      <PageHeader
        title="Purchase Orders"
        description="Draft POs hide supplier identity. Only the Director can unmask, approve, and issue."
        actions={
          <div className="button-row">
            <button className="secondary-button">Export PDF</button>
            <button className="primary-button">New Draft</button>
          </div>
        }
      />

      <div className="toolbar card">
        <input className="search-input" placeholder="Filter by status, job, or department" />
        <div className="button-row">
          <button className="secondary-button">All statuses</button>
          <button className="secondary-button">Active jobs</button>
          <button className="secondary-button">This month</button>
        </div>
      </div>

      <DataTable columns={columns} rows={purchaseOrders} />

      <div className="card stack-md">
        <div className="section-heading">
          <h2>Live business rule</h2>
        </div>
        <p>
          Draft creators can prepare line items, job references, quantities, rates, and notes. Supplier remains masked as <strong>*******</strong> until Director approval.
        </p>
      </div>
    </div>
  )
}

const toneMap = {
  Draft: 'muted',
  Submitted: 'warning',
  Approved: 'info',
  Issued: 'success',
  Cancelled: 'danger',
}
