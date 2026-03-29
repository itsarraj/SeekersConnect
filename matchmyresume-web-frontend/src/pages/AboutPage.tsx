import { Helmet } from 'react-helmet'

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About MatchMyResume - Our Mission & Vision</title>
        <meta name="description" content="Learn about MatchMyResume's mission to revolutionize job searching with AI-powered resume matching technology." />
        <meta name="keywords" content="about us, mission, vision, AI resume matching, job search platform" />
        <meta property="og:title" content="About MatchMyResume - Our Mission & Vision" />
        <meta property="og:description" content="Learn about MatchMyResume's mission to revolutionize job searching with AI-powered resume matching technology." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 text-white bg-[#2b2b2b]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-[#fcc636]">About MatchMyResume</h1>

          <div className="prose prose-lg max-w-none prose-invert">
            <p className="text-xl mb-6 text-white/90">
              MatchMyResume is revolutionizing the way people find jobs by leveraging cutting-edge AI technology
              to match resumes with the perfect job opportunities.
            </p>

            <h2 className="text-[#fcc636]">Our Mission</h2>
            <p className="text-white/80">
              To democratize job searching by making it easier, faster, and more effective for everyone,
              regardless of their background or experience level.
            </p>

            <h2 className="text-[#fcc636]">How We Work</h2>
            <p className="text-white/80">
              Our AI-powered platform analyzes resumes, job descriptions, and candidate preferences to create
              highly accurate matches. We understand not just keywords, but the context and nuances that make
              a candidate the perfect fit for a role.
            </p>

            <h2 className="text-[#fcc636]">Why Choose Us</h2>
            <ul className="text-white/80">
              <li>Advanced AI matching algorithms</li>
              <li>Real-time job market insights</li>
              <li>Personalized career recommendations</li>
              <li>Direct application tracking</li>
              <li>Interview preparation guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default AboutPage