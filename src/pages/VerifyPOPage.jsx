import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { purchaseOrders } from '../data/mockData'

export default function VerifyPOPage() {
  const { code } = useParams()
  const po = useMemo(() => purchaseOrders.find((item) => item.verificationCode === code), [code])

  return (
    <div className="stack-lg">
      <PageHeader title="Verify Purchase Order" description="Use QR or verification code to confirm whether a PO is valid, masked, revised, or cancelled." />

      {!po ? (
        <div className="card">
          <h2>Invalid code</h2>
          <p>No purchase order found for this verification code.</p>
        </div>
      ) : (
        <div className="card stack-md">
          <div className="section-heading">
            <h2>PO {po.poNo}</h2>
            <Badge tone={po.status === 'Issued' ? 'success' : po.status === 'Draft' ? 'muted' : 'warning'}>{po.status}</Badge>
          </div>
          <div className="details-grid">
            <div><span className="label">Verification Code</span><strong>{po.verificationCode}</strong></div>
            <div><span className="label">Supplier</span><strong>{po.status === 'Issued' ? po.supplierName : po.supplierMasked}</strong></div>
            <div><span className="label">Job No</span><strong>{po.jobNo}</strong></div>
            <div><span className="label">Print Count</span><strong>{po.printCount}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}
