export default function EmptyState({ title, description, action }) {
  return (
    <div className="card empty-state stack-sm">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}
