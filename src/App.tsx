import { Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BranchesPage from './pages/BranchesPage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'
import CustomersPage from './pages/CustomersPage'
import ServicesPage from './pages/ServicesPage'
import TechniciansPage from './pages/TechniciansPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ReportsPage from './pages/ReportsPage'
import InventoryPage from './pages/InventoryPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoicePrintPage from './pages/InvoicePrintPage'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isLoginRoute = location.pathname === '/login'
  const isPrintRoute = location.pathname.endsWith('/print')
  const showSidebar = Boolean(user) && !isLoginRoute && !isPrintRoute

  return (
    <div className="min-h-screen bg-bg">
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'md:pl-64' : ''}>
        {isPrintRoute ? (
          <Routes>
            <Route
              path="/invoices/:id/print"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'THU_NGAN']}>
                    <InvoicePrintPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        ) : (
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_TONG']}>
                    <BranchesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_TONG']}>
                    <UsersPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'TIEP_DON']}>
                    <CustomersPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO']}>
                    <ServicesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technicians"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'TIEP_DON']}>
                    <TechniciansPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'TIEP_DON']}>
                    <OrdersPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'TIEP_DON']}>
                    <OrderDetailPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'TIEP_DON']}>
                    <InventoryPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'THU_NGAN']}>
                    <InvoicesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN_CO_SO', 'ADMIN_TONG']}>
                    <ReportsPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        )}
      </main>
    </div>
  )
}

export default App
