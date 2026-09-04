import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginScreen } from './auth/LoginScreen'
import { RequireAuth } from './layout/AppShell'
import { Dashboard } from './layout/Dashboard'
import { StatsProvider } from './data/StatsContext'

function ProtectedDashboard() {
  return (
    <RequireAuth>
      <StatsProvider>
        <Dashboard />
      </StatsProvider>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/app" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
