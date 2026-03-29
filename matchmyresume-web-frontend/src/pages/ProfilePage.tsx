import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/authApi'
import { bffApi, Resume } from '../services/bffApi'

const BIO_PLACEHOLDER = `## About Me
2-3 sentences about your background, interests, and what you're looking for.

## Key Skills
• Skill 1
• Skill 2
• Skill 3

## Career Goals
• Short-term goal
• Long-term goal

## Why I'm a Good Fit
What makes you stand out? Relevant experience, achievements, or motivation.`

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'settings'>('view')
  const [profileForm, setProfileForm] = useState({ name: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeSuccess, setResumeSuccess] = useState('')
  const [bio, setBio] = useState('')

  const loadResumes = async () => {
    if (!user?.id) return
    setResumeLoading(true)
    setResumeError('')
    try {
      const list = await bffApi.getResumes(user.id)
      setResumes(list)
    } catch (e) {
      setResumeError(e instanceof Error ? e.message : 'Failed to load resumes')
    } finally {
      setResumeLoading(false)
    }
  }

  useEffect(() => {
    if (user && (user.role === 'recruiter' || user.role === 'admin')) {
      navigate('/recruiter', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name })
    }
  }, [user])

  useEffect(() => {
    if (user?.id) loadResumes()
  }, [user?.id])

  useEffect(() => {
    if (user?.id && (user.role === 'user' || user.role === 'admin')) {
      bffApi.getCandidateProfile()
        .then((p) => {
          if (p) setBio(p.bio ?? '')
          else bffApi.upsertCandidateProfile({}).catch(() => {})
        })
        .catch(() => {})
    }
  }, [user?.id, user?.role])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)
    try {
      await authApi.updateProfile({ name: profileForm.name })
      if (user?.role === 'user' || user?.role === 'admin') {
        await bffApi.upsertCandidateProfile({ bio: bio.trim() })
      }
      await refreshUser()
      setProfileSuccess('Profile updated successfully')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      await authApi.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
      setPasswordSuccess('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>My Profile - MatchMyResume</title>
        <meta name="description" content="Manage your profile and resume on MatchMyResume." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white py-12 px-4 md:px-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            <div className="flex flex-col w-full lg:w-80 gap-6 p-6 rounded-3xl bg-[#1a1a1a] shadow-brand border border-white/10 shrink-0">
              <div className="flex items-center gap-3 text-[#fcc636] hover:text-[#e6b535] transition-colors cursor-pointer mb-4"
                   onClick={() => navigate('/')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M9.57 5.93018L3.5 12.0002L9.57 18.0702" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.4999 12H3.66992" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg">Back</span>
              </div>

              <div className="flex flex-col gap-3 p-4 rounded-lg bg-[#2b2b2b] border border-white/5 shadow-brand">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#fcc636] flex items-center justify-center text-[#2b2b2b] font-bold text-xl shadow-brand shrink-0">
                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-lg font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button 
                  onClick={() => setActiveTab('view')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'view' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Your Profile
                </button>
                <button 
                  onClick={() => setActiveTab('edit')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'edit' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'settings' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Settings
                </button>
              </div>

              <div className="h-px bg-white/10 my-2" />

              {user?.role === 'user' && (
                <Link
                  to="/upgrade"
                  className="w-full h-14 rounded-lg bg-[#fcc636]/10 text-[#fcc636] border border-[#fcc636]/30 font-bold shadow-brand hover:bg-[#fcc636]/20 transition-all flex items-center justify-center"
                >
                  Upgrade to Premium
                </Link>
              )}

              <div className="flex flex-col gap-3">
                <button onClick={logout} className="w-full h-14 rounded-lg bg-[#2b2b2b] text-white border border-white/10 font-bold shadow-brand hover:bg-[#333] transition-all">
                  Logout
                </button>
              </div>
            </div>

            <div className="flex-grow w-full">
              {activeTab === 'view' && (
                <div className="space-y-8 max-w-2xl">
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-4">
                    <h3 className="text-lg font-bold text-white">Name</h3>
                    <p className="text-white/80">{user?.name || '-'}</p>
                    </div>
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-4">
                    <h3 className="text-lg font-bold text-white">Email</h3>
                    <p className="text-white/80">{user?.email || '-'}</p>
                    </div>
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-4">
                      <h3 className="text-lg font-bold text-white">Bio</h3>
                      <p className="text-xs text-white/50">Used for AI matching along with your resume.</p>
                      {bio ? (
                        <p className="text-white/80 whitespace-pre-wrap">{bio}</p>
                      ) : (
                        <p className="text-white/50">No bio yet. Add one in Edit Profile.</p>
                      )}
                    </div>
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-4">
                      <h3 className="text-lg font-bold text-white">Resume</h3>
                    <p className="text-xs text-white/50">Latest resume is used when applying to jobs. Older uploads are kept in storage.</p>
                    {resumeError && <p className="text-sm text-red-400">{resumeError}</p>}
                    {resumeLoading ? (
                      <div className="w-8 h-8 border-2 border-[#fcc636] border-t-transparent rounded-full animate-spin" />
                    ) : resumes.length === 0 ? (
                      <p className="text-sm text-white/50">No resumes yet. Add one in Edit Profile.</p>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#2b2b2b] border border-white/5">
                        <p className="text-sm font-medium text-white">{resumes[0].file_name || resumes[0].title}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {resumes[0].file_size ? `${(resumes[0].file_size / 1024).toFixed(1)} KB` : ''}
                          {resumes[0].file_size ? ' · ' : ''}
                          {new Date(resumes[0].created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="p-8 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-8">
                    <h3 className="text-lg font-bold text-white">Edit your profile</h3>
                    {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
                    {profileSuccess && <p className="text-green-400 text-sm">{profileSuccess}</p>}
                    <form className="space-y-6" onSubmit={handleUpdateProfile}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Email</label>
                          <p className="h-11 px-4 py-2.5 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50">
                            {user?.email || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-6" />

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-white">Bio</label>
                            <button
                              type="button"
                              onClick={() => setBio(BIO_PLACEHOLDER)}
                              className="text-xs text-[#fcc636] hover:underline"
                            >
                              Use template
                            </button>
                          </div>
                          <p className="text-xs text-white/50">Used for AI matching along with your resume. Sections: About Me, Key Skills, Career Goals, Why I&apos;m a Good Fit</p>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder={BIO_PLACEHOLDER}
                            rows={12}
                            className="w-full px-4 py-3 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] placeholder:text-white/30 focus:border-[#fcc636] outline-none shadow-brand resize-y min-h-[200px]"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-6" />

                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">CV / Resume</h3>
                        {resumeError && <p className="text-red-400 text-sm">{resumeError}</p>}
                        {resumeSuccess && <p className="text-green-400 text-sm">{resumeSuccess}</p>}
                        <div className="space-y-2">
                          <label className="text-sm text-white">Upload resume (PDF or text, max 5MB)</label>
                          <input
                            type="file"
                            accept=".pdf,.txt,application/pdf,text/plain"
                            className="hidden"
                            id="resume-upload"
                            disabled={resumeUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !user?.id) return
                              if (file.size > 5 * 1024 * 1024) {
                                setResumeError('File too large. Maximum size is 5MB.')
                                return
                              }
                              const ext = file.name.toLowerCase().split('.').pop()
                              if (ext !== 'pdf' && ext !== 'txt' && file.type !== 'application/pdf' && file.type !== 'text/plain') {
                                setResumeError('Only PDF and text files are allowed.')
                                return
                              }
                              setResumeError('')
                              setResumeSuccess('')
                              setResumeUploading(true)
                              try {
                                await bffApi.uploadResume(user.id, file)
                                setResumeSuccess('Resume uploaded successfully')
                                await loadResumes()
                              } catch (err) {
                                setResumeError(err instanceof Error ? err.message : 'Failed to upload resume')
                              } finally {
                                setResumeUploading(false)
                              }
                              e.target.value = ''
                            }}
                          />
                          {resumeUploading ? (
                            <div className="w-full h-11 px-4 flex items-center rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] opacity-70">
                              Uploading...
                          </div>
                          ) : (
                            <label
                              htmlFor="resume-upload"
                              className="w-full h-11 px-4 flex items-center rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] shadow-brand cursor-pointer hover:border-[#fcc636] transition-all"
                            >
                              Choose file
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="pt-8">
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="w-40 h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50"
                        >
                          {profileLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="p-8 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-8">
                    <h3 className="text-lg font-bold text-white">Settings</h3>
                    
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <h4 className="text-lg font-bold text-white">Change Password</h4>
                      {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                      {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white">Current password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                            placeholder="Current password"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">New password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                            placeholder="At least 8 characters"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand"
                            required
                            minLength={8}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Confirm new password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-48 h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50"
                        >
                          {passwordLoading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
