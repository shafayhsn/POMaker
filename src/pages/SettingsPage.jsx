import PageHeader from '../components/PageHeader'
import { appSettings } from '../data/mockData'

export default function SettingsPage() {
  return (
    <div className="stack-lg">
      <PageHeader title="Settings" description="PO numbering, default terms, copy types, and company-level control rules." />

      <div className="settings-grid">
        <div className="card stack-sm">
          <span className="eyebrow">Company</span>
          <strong>{appSettings.companyName}</strong>
          <p>Visible PO format: {appSettings.visibleFormat}</p>
        </div>
        <div className="card stack-sm">
          <span className="eyebrow">Commercial defaults</span>
          <strong>{appSettings.generalPaymentTerms}</strong>
          <p>Default department: {appSettings.defaultDepartment}</p>
        </div>
        <div className="card stack-sm">
          <span className="eyebrow">Print control</span>
          <strong>{appSettings.copyTypes.join(' / ')}</strong>
          <p>Official print allowed after Director issue only.</p>
        </div>
      </div>
    </div>
  )
}
