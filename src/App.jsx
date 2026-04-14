import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import DashboardPage from './pages/DashboardPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import SuppliersPage from './pages/SuppliersPage'
import ActiveJobsPage from './pages/ActiveJobsPage'
import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
import ApprovalQueuePage from './pages/ApprovalQueuePage'
import VerifyPOPage from './pages/VerifyPOPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/approval-queue" element={<ApprovalQueuePage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/active-jobs" element={<ActiveJobsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/verify/:code" element={<VerifyPOPage />} />
      </Route>
    </Routes>
  )
}
