export default function Topbar({ onNew }) {
  return (
    <div className="topbar">
      <div>
        <div className="page-title">Purchase Order Control System</div>
        <div className="page-sub">Compact local prototype for workflow testing</div>
      </div>
      <button className="primary-btn" onClick={onNew}>New Draft PO</button>
    </div>
  );
}
