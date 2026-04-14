import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { approvalChecks, purchaseOrders, stats } from '../data/mockData'

export default function DashboardPage() {
  const columns = [
    { key: 'poNo', header: 'PO No' },
    { key: 'jobNo', header: 'Job No' },
    { key: 'department', header: 'Department' },
    { key: 'total', header: 'Total' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={row.status === 'Issued' ? 'success' : row.status === 'Draft' ? 'muted' : 'warning'}>{row.status}</Badge>,
    },
  ]

  return (
    <div className="stack-lg">
      <PageHeader
        title="Dashboard"
        description="A control-first PO issuance system for garment sourcing. Drafts stay masked until Director approval."
        actions={<button className="primary-button">Create Draft PO</button>}
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
            {approvalChecks.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
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
            <div className="control-row"><span>Audit log</span><Badge tone="success">Always on</Badge></div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Recent purchase orders</h2>
        </div>
        <DataTable columns={columns} rows={purchaseOrders} />
      </section>
    </div>
  )
}
