import { Helmet } from 'react-helmet'
import { useSearchParams } from 'react-router-dom'

const ContactPage = () => {
  const [searchParams] = useSearchParams()
  const intent = searchParams.get('intent')
  const defaultSubject = intent === 'upgrade' ? 'Upgrade to Premium - Candidate' : ''
  return (
    <>
      <Helmet>
        <title>Contact MatchMyResume - Get In Touch</title>
        <meta name="description" content="Contact MatchMyResume for support, partnerships, or questions about our AI-powered resume matching platform." />
        <meta name="keywords" content="contact, support, help, customer service, partnerships" />
        <meta property="og:title" content="Contact MatchMyResume - Get In Touch" />
        <meta property="og:description" content="Contact MatchMyResume for support, partnerships, or questions about our AI-powered resume matching platform." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 text-white bg-[#2b2b2b]">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#fcc636]">Contact Us</h1>

          <div className="card bg-[#1a1a1a] shadow-brand border border-white/10">
            <div className="card-body p-8">
              <form className="space-y-6">
                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-white/80">Name</span>
                  </label>
                  <input type="text" placeholder="Your name" className="input bg-[#2b2b2b] border-white/10 text-white focus:border-[#fcc636] focus:outline-none" />
                </div>

                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-white/80">Email</span>
                  </label>
                  <input type="email" placeholder="your@email.com" className="input bg-[#2b2b2b] border-white/10 text-white focus:border-[#fcc636] focus:outline-none" />
                </div>

                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-white/80">Subject</span>
                  </label>
                  <input type="text" placeholder="How can we help?" defaultValue={defaultSubject} className="input bg-[#2b2b2b] border-white/10 text-white focus:border-[#fcc636] focus:outline-none" />
                </div>

                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-white/80">Message</span>
                  </label>
                  <textarea
                    className="textarea bg-[#2b2b2b] border-white/10 text-white h-32 focus:border-[#fcc636] focus:outline-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <div className="form-control mt-8">
                  <button className="btn bg-[#fcc636] border-none text-[#2b2b2b] font-bold hover:bg-[#e6b535] shadow-brand">Send Message</button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-6 text-[#fcc636]">Other Ways to Reach Us</h3>
            <div className="space-y-4 text-white/70">
              <p><strong className="text-white">Email:</strong> support@matchmyresume.com</p>
              <p><strong className="text-white">Phone:</strong> +1 (555) 123-4567</p>
              <p><strong className="text-white">Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage