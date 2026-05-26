import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './providers/AuthProvider'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ViewerPage from './pages/ViewerPage'
import AccountPage from './pages/AccountPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/viewer" element={
            <ProtectedRoute><ViewerPage /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
