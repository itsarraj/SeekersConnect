import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { authApi } from '../services/authApi'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isResetSuccess, setIsResetSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authApi.requestPasswordReset({ email })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setError('')
    setIsLoading(true)
    try {
      await authApi.requestPasswordReset({ email })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token')
      return
    }
    setIsLoading(true)
    try {
      await authApi.resetPassword({ token: tokenFromUrl, new_password: newPassword })
      setIsResetSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isResetSuccess) {
    return (
      <>
        <Helmet>
          <title>Password Reset - MatchMyResume</title>
        </Helmet>
        <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="text-6xl">✓</div>
            <h1 className="text-3xl font-bold text-white">Password Reset</h1>
            <p className="text-gray-300">Your password has been reset. You can now log in.</p>
            <Link
              to="/login"
              className="inline-block w-full h-14 px-4 py-3 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-base hover:bg-[#e6b535] transition-colors flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (tokenFromUrl) {
    return (
      <>
        <Helmet>
          <title>Set New Password - MatchMyResume</title>
        </Helmet>
        <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full space-y-8">
            <div className="flex items-center gap-3 text-[#fcc636] hover:text-[#e6b535] transition-colors cursor-pointer"
                 onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M9.57 5.92969L3.5 11.9997L9.57 18.0697" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.5 12H3.67004" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg">Back</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
            </div>
            <form onSubmit={handleConfirmReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); if (error) setError('') }}
                  placeholder="At least 8 characters"
                  className="w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError('') }}
                  placeholder="Confirm your new password"
                  className="w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-40 h-14 px-4 py-3 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-base hover:bg-[#e6b535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-[#2b2b2b] border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Check Your Email - MatchMyResume</title>
          <meta name="description" content="We've sent you a password reset link. Check your email to continue." />
        </Helmet>

        <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full space-y-8 text-center">
            {/* Back Button */}
            <div className="flex items-center gap-3 text-[#fcc636] hover:text-[#e6b535] transition-colors cursor-pointer justify-center"
                 onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M9.57 5.92969L3.5 11.9997L9.57 18.0697" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.5 12H3.67004" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg">Back</span>
            </div>

            <div className="space-y-6">
              <div className="text-6xl">📧</div>
              <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
              <p className="text-gray-300">
                We've sent a password reset link to <strong className="text-[#fcc636]">{email}</strong>
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Didn't receive the email?{' '}
                  <button
                    onClick={handleResend}
                    className="text-[#fcc636] hover:text-[#e6b535] transition-colors font-medium underline"
                  >
                    Resend
                  </button>
                </p>

                <Link
                  to="/login"
                  className="inline-block w-full h-14 px-4 py-3 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-base hover:bg-[#e6b535] transition-colors flex items-center justify-center"
                  style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - MatchMyResume</title>
        <meta name="description" content="Reset your MatchMyResume password to regain access to your account." />
        <meta name="keywords" content="reset password, forgot password, account recovery" />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-3 text-[#fcc636] hover:text-[#e6b535] transition-colors cursor-pointer"
               onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M9.57 5.92969L3.5 11.9997L9.57 18.0697" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.5 12H3.67004" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg">Back</span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Hello...</h1>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Reset<br />Password
            </h2>
          </div>

          {/* Request Reset Form */}
          <form onSubmit={handleRequestReset} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm text-white block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter your email address"
                className="w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent"
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
                required
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-40 h-14 px-4 py-3 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-base hover:bg-[#e6b535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#2b2b2b] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Resend Info */}
          <div className="text-center">
            <p className="text-sm text-white">
              Didn't get the email?{' '}
              <button
                onClick={handleResend}
                className="text-[#fcc636] hover:text-[#e6b535] transition-colors font-medium"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage