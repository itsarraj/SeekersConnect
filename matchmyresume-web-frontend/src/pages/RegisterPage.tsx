import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'user' // Default role
      })

      setSuccessMessage('Registration successful! Please check your email to verify your account.')
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Registration failed'
      })
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`)
    // Handle social registration logic here
  }

  return (
    <>
      <Helmet>
        <title>Register - MatchMyResume</title>
        <meta name="description" content="Create your MatchMyResume account to start your AI-powered job search journey." />
        <meta name="keywords" content="register, sign up, create account, resume matching, job search" />
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

          {/* Welcome Message */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Hello...</h1>
            <h2 className="text-5xl font-bold text-white">Register</h2>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-sm text-white block">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-gray-600'}`}
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
              />
              {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm text-white block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm text-white block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className={`w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
              />
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm text-white block">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full h-11 px-4 py-3 rounded-lg bg-[#1a1a1a] border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcc636] focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="text-center">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="text-center">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Register Button */}
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
                  'Register'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleSocialLogin('github')}
              className="p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#333] transition-colors"
              style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z" fill="#FCC636"/>
              </svg>
            </button>

            <button
              onClick={() => handleSocialLogin('linkedin')}
              className="p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#333] transition-colors"
              style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z" fill="#FCC636"/>
              </svg>
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              className="p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#333] transition-colors"
              style={{boxShadow: '2px 2px 0px 0 rgba(0,0,0,0.5)'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.8433 6.54671C15.6043 5.36501 13.9508 4.72125 12.24 4.74771C9.10936 4.74771 6.45055 6.85976 5.50253 9.70376C4.99987 11.1941 4.99987 12.808 5.50253 14.2983H5.50693C6.45934 17.1379 9.11376 19.25 12.2444 19.25C13.8604 19.25 15.2478 18.8367 16.323 18.1066V18.1036C17.5885 17.2658 18.4528 15.9475 18.7217 14.4571H12.24V9.83612H23.5588C23.6999 10.6386 23.766 11.4588 23.766 12.2745C23.766 15.9243 22.4616 19.0101 20.1921 21.1001L20.1944 21.1019C18.2058 22.9362 15.4764 23.9989 12.24 23.9989C7.70278 23.9989 3.55359 21.4415 1.51648 17.3893C-0.18551 13.9985 -0.185506 10.0037 1.51649 6.61288C3.5536 2.5563 7.70277 -0.00114446 12.24 -0.00114446C15.2207 -0.0364191 18.1 1.08355 20.2694 3.12066L16.8433 6.54671Z" fill="#FCC636"/>
              </svg>
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-white">
              Already have an account?{' '}
              <Link to="/login" className="text-[#fcc636] hover:text-[#e6b535] transition-colors font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage