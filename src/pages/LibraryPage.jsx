import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import { libraryItems } from '../data/mockData'

export default function LibraryPage() {
  const columns = [
    { key: 'code', header: 'Item Code' },
    { key: 'category', header: 'Category' },
    { key: 'genericName', header: 'Generic Name' },
    { key: 'description', header: 'Standard Description' },
    { key: 'unit', header: 'Unit' },
    { key: 'lastRate', header: 'Last Rate' },
  ]

  return (
    <div className="stack-lg">
      <PageHeader title="Library" description="Reusable fabric and trim masters to speed up PO drafting and kill repeated manual writing." actions={<button className="primary-button">Add Library Item</button>} />
      <DataTable columns={columns} rows={libraryItems} />
    </div>
  )
}
