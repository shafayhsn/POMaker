import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { jobs } from '../data/mockData'

export default function ActiveJobsPage() {
  const columns = [
    { key: 'jobNo', header: 'Job No' },
    { key: 'buyer', header: 'Buyer' },
    { key: 'style', header: 'Style' },
    { key: 'merchandiser', header: 'Merchandiser' },
    { key: 'budget', header: 'Budget' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Active' ? 'success' : 'info'}>{row.status}</Badge> },
  ]

  return (
    <div className="stack-lg">
      <PageHeader title="Active Jobs" description="Every PO must be tied to a live buyer program or planning job before it can move to approval." />
      <DataTable columns={columns} rows={jobs} />
    </div>
  )
}
