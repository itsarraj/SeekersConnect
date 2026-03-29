import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-base transition-colors ${isActive ? 'text-[#fcc636] font-medium hover:text-[#e6b535]' : 'text-white hover:text-[#fcc636]'}`
const navLinkClassMobile = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium transition-colors min-h-[44px] ${isActive ? 'text-[#fcc636] bg-[#1a1a1a]' : 'text-white/70 hover:text-[#fcc636] hover:bg-[#1a1a1a]/80'}`

const DROPDOWN_PANEL = 'flex flex-col justify-start items-stretch py-2 rounded-lg bg-[#2b2b2b] border border-white/10 shadow-[2px_2px_0px_0_rgba(0,0,0,0.5)] min-w-[260px]'
const DROPDOWN_ITEM = 'flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-white/80 hover:text-[#fcc636] hover:bg-white/5 rounded-lg transition-colors cursor-pointer min-h-[44px]'

const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconLogOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <path d="M3 21h18M3 10h18M3 7l9-4 9 4M5 21V10M9 21V10M13 21V10M17 21V10M21 21V10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconLayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-white/50">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mobileRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useClickOutside(mobileRef, () => setMobileOpen(false))
  useClickOutside(userMenuRef, () => setUserMenuOpen(false))

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
  }

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  return (
    <header className="navbar bg-[#2b2b2b] h-[72px] px-4 md:px-16 border-b border-white/10">
      <div className="navbar-start">
        {/* Mobile hamburger - custom dropdown */}
        <div className="relative lg:hidden" ref={mobileRef}>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="btn btn-ghost p-2 text-[#fcc636] hover:bg-[#1a1a1a]"
            aria-expanded={mobileOpen}
            aria-haspopup="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {mobileOpen && (
            <div
              className={`absolute left-0 top-full mt-2 z-50 ${DROPDOWN_PANEL}`}
              role="menu"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Navigation</p>
              </div>
              <div className="flex flex-col gap-0.5 p-2">
                <NavLink to="/" end className={navLinkClassMobile} onClick={handleNavClick}><IconSearch /><span>Start a search</span></NavLink>
                <NavLink to="/jobs" className={navLinkClassMobile} onClick={handleNavClick}><IconBriefcase /><span>Jobs list</span></NavLink>
                {(!isAuthenticated || user?.role === 'user') && (
                  <NavLink to="/ai-matches" className={navLinkClassMobile} onClick={handleNavClick}><IconSparkle /><span>AI Matches</span></NavLink>
                )}
                {!isAuthenticated && (
                  <NavLink to="/employers" className={navLinkClassMobile} onClick={handleNavClick}><IconBuilding /><span>For Employers</span></NavLink>
                )}
                {(isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin')) && (
                  <>
                    <NavLink to="/recruiter" className={navLinkClassMobile} onClick={handleNavClick}><IconLayout /><span>Dashboard</span></NavLink>
                    <NavLink to="/pricing" className={navLinkClassMobile} onClick={handleNavClick}><IconLayout /><span>Pricing</span></NavLink>
                  </>
                )}
                {(isAuthenticated && user?.role === 'user') && (
                  <NavLink to="/upgrade" className={navLinkClassMobile} onClick={handleNavClick}><IconSparkle /><span>Upgrade</span></NavLink>
                )}
              </div>
              <div className="h-px bg-white/10 mx-2" />
              <div className="flex flex-col gap-0.5 p-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-white/70 hover:text-[#fcc636] hover:bg-[#1a1a1a]/80 rounded-lg transition-colors min-h-[44px]" onClick={handleNavClick}>Login</Link>
                    <Link to="/register" className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-white/70 hover:text-[#fcc636] hover:bg-[#1a1a1a]/80 rounded-lg transition-colors min-h-[44px]" onClick={handleNavClick}>Sign up</Link>
                  </>
                ) : (
                  <>
                    <NavLink to={user?.role === 'recruiter' || user?.role === 'admin' ? '/recruiter' : '/profile'} className={navLinkClassMobile} onClick={handleNavClick}><IconUser /><span>Profile</span></NavLink>
                    <button type="button" onClick={() => { handleLogout(); handleNavClick(); }} className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors min-h-[44px]">
                      <IconLogOut /><span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <Link to="/" className="flex items-center gap-3 group ml-2">
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0">
            <circle cx="12.0143" cy="12.0143" r="12.0143" fill="#fcc636" fillOpacity="0.4" />
            <circle cx="16.9857" cy="16.9857" r="12.0143" fill="#fcc636" />
          </svg>
          <p className="text-2xl font-bold text-white">MatchMyResume</p>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-12">
          <li><NavLink to="/" end className={navLinkClass}>Start a search</NavLink></li>
          <li><NavLink to="/jobs" className={navLinkClass}>Jobs list</NavLink></li>
          {(!isAuthenticated || user?.role === 'user') && (
            <li><NavLink to="/ai-matches" className={navLinkClass}>AI Matches</NavLink></li>
          )}
          {!isAuthenticated && (
            <li><NavLink to="/employers" className={navLinkClass}>For Employers</NavLink></li>
          )}
          {(isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin')) && (
            <>
              <li><NavLink to="/recruiter" className={navLinkClass}>Dashboard</NavLink></li>
              <li><NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink></li>
            </>
          )}
          {(isAuthenticated && user?.role === 'user') && (
            <li><NavLink to="/upgrade" className={navLinkClass}>Upgrade</NavLink></li>
          )}
        </ul>
      </div>
      <div className="navbar-end gap-4">
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex justify-center items-center gap-2 min-w-[44px] min-h-[44px] pl-2 pr-3 rounded-lg bg-[#2b2b2b] border border-white/10 shadow-[2px_2px_0px_0_rgba(0,0,0,0.5)] hover:border-[#fcc636]/30 transition-all cursor-pointer"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-[#fcc636] flex items-center justify-center text-[#2b2b2b] font-bold text-sm shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium text-white/80 hidden sm:inline truncate max-w-[120px]">{user?.name || user?.email}</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={`shrink-0 text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
                <path d="M3 6.75L9 12.75L15 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </button>
            {userMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 z-[9999] ${DROPDOWN_PANEL}`}
                role="menu"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-bold text-[#fcc636] truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-white/50 truncate">{user?.email}</p>
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  <Link
                    to={user?.role === 'recruiter' || user?.role === 'admin' ? '/recruiter' : '/profile'}
                    className={DROPDOWN_ITEM}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <IconUser /><span>Profile</span>
                  </Link>
                  {user?.role === 'user' && (
                    <Link
                      to="/upgrade"
                      className={DROPDOWN_ITEM}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <IconSparkle /><span>Upgrade</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className={`${DROPDOWN_ITEM} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
                  >
                    <IconLogOut /><span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="px-5 py-2 rounded-md bg-[#1a1a1a] border border-white/10 text-base font-medium text-white hover:bg-[#333] transition-all shadow-brand">
              Log in
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-md bg-[#fcc636] text-base font-medium text-[#2b2b2b] hover:bg-[#e6b535] transition-all shadow-brand">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
