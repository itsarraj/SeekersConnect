import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useAuth } from '../contexts/AuthContext'

const EMPLOYER_SIGNUP_STORAGE_KEY = 'employerSignupData'

export interface EmployerSignupData {
  companyName: string
  role: string
  mobile: string
  companyType: 'direct' | 'agency'
}

const EmployerSignupPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyType: 'direct' as 'direct' | 'agency',
    agreeTerms: false,
    agreeNotifications: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.role.trim()) newErrors.role = 'Your role is required'
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrors({})
    if (!validateForm()) return

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'recruiter',
      })

      const signupData: EmployerSignupData = {
        companyName: formData.companyName,
        role: formData.role,
        mobile: formData.mobile,
        companyType: formData.companyType,
      }
      sessionStorage.setItem(EMPLOYER_SIGNUP_STORAGE_KEY, JSON.stringify(signupData))

      setSuccessMessage('Registration successful! Please check your email to verify your account.')
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed' })
    }
  }

  return (
    <>
      <Helmet>
        <title>Employer Sign Up - MatchMyResume</title>
        <meta name="description" content="Create your employer account to start hiring with AI-powered talent matching." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div
            className="flex items-center gap-3 text-[#fcc636] hover:text-[#e6b535] transition-colors cursor-pointer mb-8"
            onClick={() => navigate('/employers')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to For Employers</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create employer account</h1>
            <p className="text-white/60 mt-2">Start hiring with AI-matched candidates</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Company name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Amazon or CareerZen Consulting"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.companyName ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Your role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g. Talent Acquisition Specialist"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.role ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Full name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Your full name"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.fullName ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Mobile number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg bg-[#1a1a1a] border border-r-0 border-white/10 text-white/60 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="flex-1 h-12 px-4 rounded-r-lg bg-[#1a1a1a] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Work email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.com"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.email ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.password ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636] ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Company type</label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleInputChange}
                className="w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#fcc636]"
              >
                <option value="direct">Direct (hire for single company)</option>
                <option value="agency">Agency (hire for multiple companies)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-white/20 bg-[#1a1a1a] text-[#fcc636] focus:ring-[#fcc636]"
                />
                <span className="text-sm text-white/80">
                  I agree to the <Link to="/" className="text-[#fcc636] hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/" className="text-[#fcc636] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              {errors.agreeTerms && <p className="text-red-400 text-sm">{errors.agreeTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeNotifications"
                  checked={formData.agreeNotifications}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-white/20 bg-[#1a1a1a] text-[#fcc636] focus:ring-[#fcc636]"
                />
                <span className="text-sm text-white/80">
                  I agree to receive default email notifications, which I can unsubscribe from at any time.
                </span>
              </label>
            </div>

            {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}
            {errors.general && <p className="text-red-400 text-sm">{errors.general}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-lg hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#2b2b2b] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/employers/login" className="text-[#fcc636] hover:underline font-medium">
              Employer login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default EmployerSignupPage
export { EMPLOYER_SIGNUP_STORAGE_KEY }
