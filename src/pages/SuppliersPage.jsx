import { useState } from 'react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { useAppData } from '../context/AppDataContext'

export default function SuppliersPage() {
  const { suppliers, actions } = useAppData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', category: '', creditDays: '' })

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

  function handleSubmit(event) {
    event.preventDefault()
    actions.addSupplier(form)
    setForm({ code: '', name: '', category: '', creditDays: '' })
    setOpen(false)
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Suppliers" description="Approved supplier database with categories, credit days, and control-ready master data." actions={<button className="primary-button" onClick={() => setOpen(true)}>Add Supplier</button>} />
      {suppliers.length ? <DataTable columns={columns} rows={suppliers} /> : <EmptyState title="No suppliers yet" description="Mock suppliers are removed. Add your first supplier master now." action={<button className="primary-button" onClick={() => setOpen(true)}>Add Supplier</button>} />}
      <Modal open={open} title="Add Supplier" onClose={() => setOpen(false)}>
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span className="label">Code</span><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label><span className="label">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label><span className="label">Category</span><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
            <label><span className="label">Credit Days</span><input required type="number" min="0" value={form.creditDays} onChange={(e) => setForm({ ...form, creditDays: e.target.value })} /></label>
          </div>
          <div className="button-row"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" type="submit">Save Supplier</button></div>
        </form>
      </Modal>
    </div>
  )
}
