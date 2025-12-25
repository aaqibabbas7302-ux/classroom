import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <Image src="/logo.png" alt="4Achievers Junior" width={200} height={55} style={{ objectFit: 'contain' }} />
        </div>
        <nav className="landing-nav">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="nav-btn nav-btn-outline">
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="nav-btn nav-btn-primary">
                <i className="fas fa-user-plus"></i>
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="nav-btn nav-btn-primary">
              <i className="fas fa-graduation-cap"></i>
              Dashboard
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-motto">📚 Building Young Coders for a Better World! 📚</div>
        <div className="hero-logo">
          <Image src="/logo.png" alt="4Achievers Junior" width={350} height={100} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="hero-title">Your Personal AI Tutor</h1>
        <p className="hero-subtitle">
          Your personal AI-powered learning companion. Create subjects, ask questions, 
          and learn from intelligent tutors powered by cutting-edge AI technology.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="hero-cta">
              <i className="fas fa-rocket"></i>
              Start Learning Now
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="hero-cta">
            <i className="fas fa-arrow-right"></i>
            Go to Dashboard
          </Link>
        </SignedIn>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="feature-card">
          <i className="fas fa-book-open feature-icon"></i>
          <h3 className="feature-title">Multiple Subjects</h3>
          <p className="feature-desc">
            Create unlimited subjects and organize your learning journey. 
            From Mathematics to History, learn it all.
          </p>
        </div>
        <div className="feature-card">
          <i className="fas fa-robot feature-icon"></i>
          <h3 className="feature-title">AI-Powered Tutors</h3>
          <p className="feature-desc">
            Connect your n8n AI agents for personalized tutoring. 
            Get instant answers to your questions.
          </p>
        </div>
        <div className="feature-card">
          <i className="fas fa-comments feature-icon"></i>
          <h3 className="feature-title">Chat Interface</h3>
          <p className="feature-desc">
            WhatsApp-style chat experience. Natural conversations 
            with your AI teacher make learning fun.
          </p>
        </div>
        <div className="feature-card">
          <i className="fas fa-cloud feature-icon"></i>
          <h3 className="feature-title">Cloud Sync</h3>
          <p className="feature-desc">
            Your conversations are saved in the cloud. 
            Access your learning history from anywhere.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>🎓 AI Teacher - Empowering Students with AI Technology</p>
      </footer>
    </div>
  )
}
