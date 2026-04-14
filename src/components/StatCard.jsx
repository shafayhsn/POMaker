export default function StatCard({ label, value, hint }) {
  return (
    <div className="card stat-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </div>
  )
}
