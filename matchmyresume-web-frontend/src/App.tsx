import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import JobsListPage from './pages/JobsListPage'
import JobDetailPage from './pages/JobDetailPage'
import AIMatchesPage from './pages/AIMatchesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import RecruiterPage from './pages/RecruiterPage'
import PricingPage from './pages/PricingPage'
import UpgradePage from './pages/UpgradePage'
import EmployersLandingPage from './pages/EmployersLandingPage'
import EmployerSignupPage from './pages/EmployerSignupPage'
import EmployerLoginPage from './pages/EmployerLoginPage'
import NotFoundPage from './pages/NotFoundPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsListPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route
                path="/ai-matches"
                element={
                  <ProtectedRoute requireAuth={true} allowedRoles={['user']}>
                    <AIMatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RecruiterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pricing"
                element={
                  <ProtectedRoute requireAuth={true} allowedRoles={['recruiter', 'admin']}>
                    <PricingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute requireAuth={true} allowedRoles={['user']}>
                    <UpgradePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employers"
                element={
                  <ProtectedRoute requireAuth={false} guestOnly={true}>
                    <EmployersLandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employers/signup"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <EmployerSignupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employers/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <EmployerLoginPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App