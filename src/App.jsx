import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ViewerPage from './pages/ViewerPage'
import AccountPage from './pages/AccountPage'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/viewer" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="/account" element={
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/viewer" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
