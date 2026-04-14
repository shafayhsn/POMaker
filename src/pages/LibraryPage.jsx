import { useState } from 'react'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { useAppData } from '../context/AppDataContext'

export default function LibraryPage() {
  const { libraryItems, actions } = useAppData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', category: '', genericName: '', description: '', unit: '', lastRate: '' })

  const columns = [
    { key: 'code', header: 'Item Code' },
    { key: 'category', header: 'Category' },
    { key: 'genericName', header: 'Generic Name' },
    { key: 'description', header: 'Standard Description' },
    { key: 'unit', header: 'Unit' },
    { key: 'lastRate', header: 'Last Rate' },
  ]

  function handleSubmit(event) {
    event.preventDefault()
    actions.addLibraryItem(form)
    setForm({ code: '', category: '', genericName: '', description: '', unit: '', lastRate: '' })
    setOpen(false)
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Library" description="Reusable fabric and trim masters to speed up PO drafting and kill repeated manual writing." actions={<button className="primary-button" onClick={() => setOpen(true)}>Add Library Item</button>} />
      {libraryItems.length ? <DataTable columns={columns} rows={libraryItems} /> : <EmptyState title="Library is empty" description="Add trims, fabric, and consumables here so the team can draft faster." action={<button className="primary-button" onClick={() => setOpen(true)}>Add Library Item</button>} />}
      <Modal open={open} title="Add Library Item" onClose={() => setOpen(false)}>
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span className="label">Item Code</span><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label><span className="label">Category</span><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
            <label><span className="label">Generic Name</span><input required value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} /></label>
            <label><span className="label">Unit</span><input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
            <label><span className="label">Last Rate</span><input required value={form.lastRate} onChange={(e) => setForm({ ...form, lastRate: e.target.value })} /></label>
          </div>
          <label><span className="label">Description</span><textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="button-row"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" type="submit">Save Item</button></div>
        </form>
      </Modal>
    </div>
  )
}
