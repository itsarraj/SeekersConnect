import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useAuth } from '../contexts/AuthContext'

const EmployerLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(formData)
      navigate('/recruiter', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <>
      <Helmet>
        <title>Employer Login - MatchMyResume</title>
        <meta name="description" content="Sign in to your employer account to manage jobs and candidates." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
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
            <h1 className="text-3xl font-bold text-white">Employer login</h1>
            <p className="text-white/60 mt-2">Sign in to manage your jobs and candidates</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.com"
                className="w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fcc636]"
                required
              />
            </div>

            <div className="text-right">
              <Link to="/reset-password" className="text-sm text-[#fcc636] hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-lg hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#2b2b2b] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/employers/signup" className="text-[#fcc636] hover:underline font-medium">
              Create employer account
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default EmployerLoginPage
