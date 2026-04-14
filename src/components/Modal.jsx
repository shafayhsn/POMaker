export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card card stack-md">
        <div className="section-heading">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
