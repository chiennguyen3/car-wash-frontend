import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BranchesPage from './pages/BranchesPage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'
import CustomersPage from './pages/CustomersPage'
import ServicesPage from './pages/ServicesPage'
import TechniciansPage from './pages/TechniciansPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
function App() {
  return (
    <>
      <Navbar />
      <main id="content">
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
          {/* Các route Customer/Order/Invoice... sẽ thêm ở bước sau */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App