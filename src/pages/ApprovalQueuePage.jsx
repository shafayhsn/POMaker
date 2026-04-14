import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../lib/utils'

export default function ApprovalQueuePage() {
  const { purchaseOrders, actions } = useAppData()
  const queue = purchaseOrders.filter((po) => po.status === 'Draft' || po.status === 'Submitted')

  return (
    <div className="stack-lg">
      <PageHeader
        title="Director Approval Queue"
        description="This is the only place where masked suppliers can be revealed, changed, approved, and officially issued."
      />

      {queue.length ? (
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
                  <strong>{formatCurrency(Number(po.total || 0))}</strong>
                </div>
              </div>
              <div className="stack-sm">
                {po.lines.map((line, index) => (
                  <div key={`${line.item}-${index}`} className="line-preview">
                    <strong>{line.item}</strong>
                    <span>{line.description}</span>
                  </div>
                ))}
              </div>
              <div className="button-row">
                {po.status === 'Draft' ? <button className="secondary-button" onClick={() => actions.submitDraft(po.id)}>Submit</button> : null}
                <button className="secondary-button" onClick={() => actions.rejectPO(po.id)}>Reject</button>
                <button className="primary-button" onClick={() => actions.approvePO(po.id)}>Approve & Issue</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Approval queue is empty"
          description="No submitted or draft records are waiting for Director action right now."
        />
      )}
    </div>
  )
}
