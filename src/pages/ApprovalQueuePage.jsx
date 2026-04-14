import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { purchaseOrders } from '../data/mockData'

export default function ApprovalQueuePage() {
  const queue = purchaseOrders.filter((po) => po.status === 'Draft' || po.status === 'Submitted')

  return (
    <div className="stack-lg">
      <PageHeader
        title="Director Approval Queue"
        description="This is the only place where masked suppliers can be revealed, changed, approved, and officially issued."
      />

      <div className="approval-grid">
        {queue.map((po) => (
          <article key={po.id} className="card stack-md">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{po.jobNo}</span>
                <h2>Draft Purchase Order</h2>
              </div>
              <Badge tone={po.status === 'Draft' ? 'muted' : 'warning'}>{po.status}</Badge>
            </div>
            <div className="details-grid">
              <div>
                <span className="label">Visible to merchandiser</span>
                <strong>{po.supplierMasked}</strong>
              </div>
              <div>
                <span className="label">Director view</span>
                <strong>{po.supplierName}</strong>
              </div>
              <div>
                <span className="label">Department</span>
                <strong>{po.department}</strong>
              </div>
              <div>
                <span className="label">Total</span>
                <strong>{po.total}</strong>
              </div>
            </div>
            <div className="stack-sm">
              {po.lines.map((line) => (
                <div key={line.item} className="line-preview">
                  <strong>{line.item}</strong>
                  <span>{line.description}</span>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button className="secondary-button">Change Supplier</button>
              <button className="secondary-button">Reject</button>
              <button className="primary-button">Approve & Issue</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
