import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { suppliers } from '../data/mockData'

export default function SuppliersPage() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Supplier' },
    { key: 'category', header: 'Category' },
    { key: 'creditDays', header: 'Credit Days' },
    {
      key: 'active',
      header: 'Status',
      render: (row) => <Badge tone={row.active ? 'success' : 'danger'}>{row.active ? 'Active' : 'Inactive'}</Badge>,
    },
  ]

  return (
    <div className="stack-lg">
      <PageHeader title="Suppliers" description="Approved supplier database with categories, credit days, and control-ready master data." actions={<button className="primary-button">Add Supplier</button>} />
      <DataTable columns={columns} rows={suppliers} />
    </div>
  )
}
