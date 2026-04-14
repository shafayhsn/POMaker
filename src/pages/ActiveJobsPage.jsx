import { useState } from 'react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { useAppData } from '../context/AppDataContext'

export default function ActiveJobsPage() {
  const { jobs, actions } = useAppData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ jobNo: '', buyer: '', style: '', merchandiser: '', budget: '', status: 'Active' })

  const columns = [
    { key: 'jobNo', header: 'Job No' },
    { key: 'buyer', header: 'Buyer' },
    { key: 'style', header: 'Style' },
    { key: 'merchandiser', header: 'Merchandiser' },
    { key: 'budget', header: 'Budget' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Active' ? 'success' : 'info'}>{row.status}</Badge> },
  ]

  function handleSubmit(event) {
    event.preventDefault()
    actions.addJob(form)
    setForm({ jobNo: '', buyer: '', style: '', merchandiser: '', budget: '', status: 'Active' })
    setOpen(false)
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Active Jobs" description="Every PO must be tied to a live buyer program or planning job before it can move to approval." actions={<button className="primary-button" onClick={() => setOpen(true)}>Add Job</button>} />
      {jobs.length ? <DataTable columns={columns} rows={jobs} /> : <EmptyState title="No active jobs yet" description="Add the buyer jobs you want the team to issue POs against." action={<button className="primary-button" onClick={() => setOpen(true)}>Add Job</button>} />}
      <Modal open={open} title="Add Active Job" onClose={() => setOpen(false)}>
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span className="label">Job No</span><input required value={form.jobNo} onChange={(e) => setForm({ ...form, jobNo: e.target.value })} /></label>
            <label><span className="label">Buyer</span><input required value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} /></label>
            <label><span className="label">Style</span><input required value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} /></label>
            <label><span className="label">Merchandiser</span><input required value={form.merchandiser} onChange={(e) => setForm({ ...form, merchandiser: e.target.value })} /></label>
            <label><span className="label">Budget</span><input required value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></label>
            <label><span className="label">Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Planning</option></select></label>
          </div>
          <div className="button-row"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" type="submit">Save Job</button></div>
        </form>
      </Modal>
    </div>
  )
}
