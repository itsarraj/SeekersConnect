import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const TESTIMONIALS = [
  {
    company: 'TechCorp',
    quote: 'One of the best tools we highly recommend. The quality of resumes is really good. Most of our positions are closed through MatchMyResume.',
    logo: null,
  },
  {
    company: 'ScaleUp',
    quote: 'The quality of profiles is great. Compared to traditional platforms, we get the most relevant and niche profiles available.',
    logo: null,
  },
  {
    company: 'CloudNine',
    quote: 'MatchMyResume helped us make hires very quickly. We are amazed with the matching and all our stakeholders are delighted with the results.',
    logo: null,
  },
]

const FEATURES = [
  {
    title: 'Automated sourcing at scale',
    description: "Let our AI algorithms find you the right people who are open to new opportunities. Our algorithm's accuracy matches the best human recruiters, but at scale.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Immediate business impact',
    description: "Each of your recruiters sees a 2-3x increase in candidate interviews. Substantial cost savings and critical positions closed much faster.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Increased candidate engagement',
    description: 'Reach out with personalized outreach. Leverage your bandwidth to provide a world-class candidate experience and attract the best talent.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Leverage your brand',
    description: 'Employer branding is critical to attract talent. Built-in mobile-friendly, multimedia-enabled showcase for your culture and values.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

const EmployersLandingPage = () => {
  return (
    <>
      <Helmet>
        <title>For Employers - MatchMyResume</title>
        <meta name="description" content="Hire smarter with AI-powered talent matching. Source candidates at scale and close positions faster." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 md:px-16 py-24 md:py-32 border-b border-white/5">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fcc636 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <p className="text-[#fcc636] font-semibold tracking-wider uppercase text-sm mb-4">Trusted by recruiters</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Making life easy for recruiters
            </h1>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Leverage the power of AI to source talent. Get pre-matched candidates who fit your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/employers/signup"
                className="px-10 py-4 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-lg hover:bg-[#e6b535] transition-all shadow-brand"
              >
                Start hiring free
              </Link>
              <Link
                to="/employers/login"
                className="px-10 py-4 rounded-lg bg-[#1a1a1a] border border-white/20 text-white font-bold text-lg hover:bg-[#333] transition-all"
              >
                Employer login
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 md:px-16 py-20 border-b border-white/5">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.company}
                  className="p-8 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-[#fcc636]/30 transition-all"
                >
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-5 h-5 text-[#fcc636]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-[#fcc636] font-bold">{t.company}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 md:px-16 py-20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why recruiters choose us</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-6">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-[#fcc636]/10 flex items-center justify-center text-[#fcc636]">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-white/60 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-16 py-24 border-t border-white/5">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Companies are winning with MatchMyResume
            </h2>
            <p className="text-white/60 mb-10 max-w-xl mx-auto">
              Join recruiters who close positions faster with AI-matched candidates.
            </p>
            <Link
              to="/employers/signup"
              className="inline-block px-12 py-4 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-lg hover:bg-[#e6b535] transition-all shadow-brand"
            >
              Create employer account
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

export default EmployersLandingPage
