import { Helmet } from 'react-helmet'
import { Link, useSearchParams } from 'react-router-dom'

const CheckoutPage = () => {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'Premium'

  return (
    <>
      <Helmet>
        <title>Checkout - MatchMyResume</title>
        <meta name="description" content="Complete your premium subscription on MatchMyResume." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white py-20 px-4 md:px-16">
        <div className="container mx-auto max-w-xl">
          <div className="p-8 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-brand space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-white">Complete your subscription</h1>
              <p className="text-white/60">You selected: <span className="text-[#fcc636] font-medium">{plan}</span></p>
            </div>

            <div className="p-6 rounded-lg bg-[#2b2b2b] border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-white">Next steps</h2>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fcc636]/20 text-[#fcc636] flex items-center justify-center text-xs font-bold">1</span>
                  Payment integration coming soon
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fcc636]/20 text-[#fcc636] flex items-center justify-center text-xs font-bold">2</span>
                  You will receive a confirmation email
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fcc636]/20 text-[#fcc636] flex items-center justify-center text-xs font-bold">3</span>
                  Premium features unlock immediately
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/upgrade"
                className="flex-1 py-4 rounded-lg font-bold bg-[#2b2b2b] text-white border border-white/10 hover:bg-[#333] transition-all text-center"
              >
                Back to plans
              </Link>
              <button
                type="button"
                disabled
                className="flex-1 py-4 rounded-lg font-bold bg-[#fcc636]/50 text-[#2b2b2b] cursor-not-allowed opacity-70"
              >
                Proceed to payment (coming soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
