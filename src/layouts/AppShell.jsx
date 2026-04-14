import { Bell, FilePlus2, Files, LayoutDashboard, LibraryBig, ListChecks, Settings, Truck } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { classNames } from '../lib/utils'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Purchase Orders', to: '/purchase-orders', icon: Files },
  { label: 'Approval Queue', to: '/approval-queue', icon: ListChecks },
  { label: 'Suppliers', to: '/suppliers', icon: Truck },
  { label: 'Active Jobs', to: '/active-jobs', icon: FilePlus2 },
  { label: 'Library', to: '/library', icon: LibraryBig },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function AppShell() {
  const { currentUser } = useAppData()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">NA</div>
          <div>
            <strong>PO Maker</strong>
            <p>Control System</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => classNames('nav-item', isActive && 'nav-item-active')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer card">
          <span className="eyebrow">Current role</span>
          <strong>{currentUser.role}</strong>
          <p>Draft creation only. Approval belongs to Director.</p>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          <input className="search-input" placeholder="Search PO no, job, or item" />
          <div className="topbar-right">
            <button className="secondary-button" type="button" onClick={() => navigate('/purchase-orders')}>
              New Draft
            </button>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <span>{currentUser.name}</span>
              <small>{currentUser.role}</small>
            </div>
          </div>
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
