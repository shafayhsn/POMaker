export default function Sidebar({ view, setView }) {
  const items = [
    ['dashboard', 'Dashboard'],
    ['purchaseOrders', 'Purchase Orders'],
    ['suppliers', 'Suppliers'],
    ['jobs', 'Active Jobs'],
    ['library', 'Library'],
    ['settings', 'Settings'],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">PO Maker</div>
      <div className="brand-sub">V5 Production Test</div>
      <nav className="nav">
        {items.map(([key, label]) => (
          <button key={key} className={view === key ? 'nav-btn active' : 'nav-btn'} onClick={() => setView(key)}>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
