import { useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../lib/utils'

export default function DashboardPage() {
  const { purchaseOrders } = useAppData()
  const navigate = useNavigate()

  const stats = [
    { label: 'Draft POs', value: purchaseOrders.filter((po) => po.status === 'Draft').length, hint: 'Awaiting submit' },
    { label: 'Submitted', value: purchaseOrders.filter((po) => po.status === 'Submitted').length, hint: 'Waiting Director action' },
    { label: 'Issued', value: purchaseOrders.filter((po) => po.status === 'Issued').length, hint: 'Official purchase orders' },
    { label: 'Printed', value: purchaseOrders.reduce((sum, po) => sum + Number(po.printCount || 0), 0), hint: 'All logged prints' },
  ]

  const columns = [
    { key: 'poNo', header: 'PO No' },
    { key: 'jobNo', header: 'Job No' },
    { key: 'department', header: 'Department' },
    { key: 'total', header: 'Total', render: (row) => formatCurrency(Number(row.total || 0)) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={row.status === 'Issued' ? 'success' : row.status === 'Draft' ? 'muted' : row.status === 'Cancelled' ? 'danger' : 'warning'}>{row.status}</Badge>,
    },
  ]

  return (
    <div className="stack-lg">
      <PageHeader
        title="Dashboard"
        description="A control-first PO issuance system for garment sourcing. Drafts stay masked until Director approval."
        actions={<button className="primary-button" onClick={() => navigate('/purchase-orders')}>Create Draft PO</button>}
      />

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="two-col-grid">
        <div className="card">
          <div className="section-heading">
            <h2>Director approval rules</h2>
          </div>
          <ul className="rule-list">
            <li>Supplier stays masked as ******* before approval.</li>
            <li>No official PO number exists in Draft or Submitted status.</li>
            <li>Only Director can approve, issue, and unlock print.</li>
            <li>Every print increments print count automatically.</li>
          </ul>
        </div>

        <div className="card">
          <div className="section-heading">
            <h2>Control snapshot</h2>
          </div>
          <div className="stack-sm">
            <div className="control-row"><span>PO number generation</span><Badge tone="success">Director only</Badge></div>
            <div className="control-row"><span>Supplier visibility in draft</span><Badge tone="warning">Masked</Badge></div>
            <div className="control-row"><span>Print access</span><Badge tone="danger">Blocked before approval</Badge></div>
            <div className="control-row"><span>Audit trail</span><Badge tone="success">Prototype ready</Badge></div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Recent purchase orders</h2>
        </div>
        {purchaseOrders.length ? (
          <DataTable columns={columns} rows={purchaseOrders.slice(0, 5)} />
        ) : (
          <EmptyState
            title="No purchase orders yet"
            description="The mock records are cleared. Create your first draft PO to start testing the workflow."
            action={<button className="primary-button" onClick={() => navigate('/purchase-orders')}>Create First Draft</button>}
          />
        )}
      </section>
    </div>
  )
}
