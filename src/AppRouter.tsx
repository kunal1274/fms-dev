import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store'

// Layout components
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import Company from './pages/company/Company'
import Inventory from './pages/inventory/Inventory'
import Sales from './pages/sales/Sales'
import Purchase from './pages/purchase/Purchase'
import Finance from './pages/finance/Finance'
import Users from './pages/users/Users'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'

// 404 page
import NotFound from './pages/NotFound'

const AppRouter: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthLayout>
    )
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/company" element={<Company />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  )
}

export default AppRouter