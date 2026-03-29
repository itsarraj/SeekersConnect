import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

const PricingPage = () => {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'FREE (NEW)',
      description: 'Get started with no cost. Try posting your first job.',
      price: '$0',
      period: '/Monthly',
      features: [
        'Post 1 Job',
        'Basic Job Listing',
        'Access & Saved 3 Candidates',
        '5 Days Resume Visibility'
      ],
      recommended: false
    },
    {
      name: 'BASIC',
      description: 'Perfect for startups and small teams looking to post their first job.',
      price: '$19',
      period: '/Monthly',
      features: [
        'Post 1 Job',
        'Urgent & Featured Jobs',
        'Highlights Job with Colors',
        'Access & Saved 5 Candidates',
        '10 Days Resume Visibility',
        '24/7 Critical Support'
      ],
      recommended: false
    },
    {
      name: 'STANDARD',
      description: 'Ideal for growing companies with multiple hiring needs.',
      price: '$39',
      period: '/Monthly',
      features: [
        '3 Active Jobs',
        'Urgent & Featured Jobs',
        'Highlights Job with Colors',
        'Access & Saved 10 Candidates',
        '20 Days Resume Visibility',
        '24/7 Critical Support'
      ],
      recommended: true
    },
    {
      name: 'PREMIUM',
      description: 'For large enterprises with high-volume recruitment requirements.',
      price: '$59',
      period: '/Monthly',
      features: [
        '6 Active Jobs',
        'Urgent & Featured Jobs',
        'Highlights Job with Colors',
        'Access & Saved 20 Candidates',
        '30 Days Resume Visibility',
        '24/7 Critical Support'
      ],
      recommended: false
    }
  ]

  return (
    <>
      <Helmet>
        <title>Pricing Plans - MatchMyResume</title>
        <meta name="description" content="Choose the perfect plan for your recruitment needs on MatchMyResume." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white py-20 px-4 md:px-16">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-32 mb-20">
            <div className="max-w-xl space-y-4 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-white">
                Buy Premium Subscription to Post a Job
              </h1>
              <p className="text-lg text-white/60 leading-relaxed">
                Unlock advanced AI matching, featured job listings, and direct access to top-tier candidates. Choose a plan that scales with your hiring needs.
              </p>
            </div>
            
            {/* Visual Element Placeholder */}
            <div className="relative w-64 h-64 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-brand border border-white/5">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-[#fcc636] to-transparent rounded-full animate-pulse" />
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fcc636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="flex flex-wrap justify-center items-end gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className="flex flex-col items-center relative">
                {plan.recommended && (
                  <div className="px-4 py-1 bg-[#fcc636] rounded-t-lg text-[#2b2b2b] text-xs font-bold uppercase tracking-wider shadow-brand relative z-20 -mb-px">
                    Recommendation
                  </div>
                )}
                <div 
                  className={`w-full md:w-80 p-8 rounded-lg bg-[#1a1a1a] border transition-all shadow-brand flex flex-col gap-8
                    ${plan.recommended ? 'border-[#fcc636] scale-105 z-10' : 'border-white/10'}`}
                >
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white/40 tracking-widest">{plan.name}</h3>
                    <p className="text-sm text-white/70 leading-relaxed h-12">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-[#fcc636]">{plan.price}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <ul className="space-y-4 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-[#fcc636]/10 flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fcc636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => navigate('/upgrade')}
                    className={`w-full py-4 rounded-lg font-bold transition-all shadow-brand flex items-center justify-center gap-2 group
                      ${plan.recommended ? 'bg-[#fcc636] text-[#2b2b2b] hover:bg-[#e6b535]' : 'bg-[#2b2b2b] text-white border border-white/10 hover:bg-[#333]'}`}
                  >
                    Choose plan
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PricingPage