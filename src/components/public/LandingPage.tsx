import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, ArrowRight, MapPin, Users, Award, ChevronRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage, publicUser } = useRecruitment();

  return (
    <div className="min-h-screen bg-page text-primary font-sans">
      {/* Navigation */}
      <nav className="border-b border-line bg-panel/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard" className="h-10 w-auto object-contain" />
            <div className="text-left">
              <h1 className="font-bold text-lg text-primary leading-none">Uniguard</h1>
              <p className="text-[10px] text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            {publicUser ? (
              <button
                onClick={() => setActivePage('user-dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('login')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePage('signup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#AF7C28' }}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-panel-2 via-page to-amber-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-6" style={{ borderColor: 'rgba(175,124,40,0.3)', color: '#8f6420', backgroundColor: 'rgba(175,124,40,0.06)' }}>
              <Award className="w-3.5 h-3.5" style={{ color: '#AF7C28' }} />
              <span>NOW HIRING — SIA SECURITY OFFICERS</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-6">
              Build Your Career in{' '}
              <span style={{ color: '#AF7C28' }}>Professional Security</span>
            </h1>
            <p className="text-lg text-secondary leading-relaxed max-w-2xl mb-8">
              Join Uniguard's elite team of SIA-licensed security professionals. We provide 
              static guarding, mobile patrols, and event security across the UK. Create an account 
              to browse vacancies and submit your application.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'signup')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'login')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-secondary border-2 border-line hover:border-line-strong transition-all"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-panel-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Join Uniguard?</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              We're committed to professional development, competitive pay, and rewarding careers in security.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <Shield className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">SIA-Licensed Roles</h3>
              <p className="text-secondary text-sm leading-relaxed">
                All positions require valid SIA licensing. We support licence renewal and sector training for Door Supervision, Security Guarding, CCTV, and Close Protection.
              </p>
            </div>
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <MapPin className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Nationwide Deployment</h3>
              <p className="text-secondary text-sm leading-relaxed">
                From corporate headquarters in London to events across the South East, we place security officers where they're needed most with reliable shift patterns.
              </p>
            </div>
            <div className="bg-panel rounded-2xl p-8 border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <Users className="w-6 h-6" style={{ color: '#AF7C28' }} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Professional Growth</h3>
              <p className="text-secondary text-sm leading-relaxed">
                Clear progression paths from Security Officer to Team Leader and Site Supervisor. We invest in first aid, conflict management, and specialist training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-page">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Getting started is simple. Create an account, select a vacancy, and complete your application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your details to access the careers portal.' },
              { step: '02', title: 'Choose a Role', desc: 'Browse active vacancies and select the position that suits you.' },
              { step: '03', title: 'Complete Application', desc: 'Fill in the multi-step form with your personal and professional details.' },
              { step: '04', title: 'Vetting & Interview', desc: 'Our team reviews your application and arranges the next steps.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold mb-4" style={{ color: 'rgba(175,124,40,0.15)' }}>{item.step}</div>
                <h3 className="text-base font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
                {item.step !== '04' && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                    <ChevronRight className="w-5 h-5 text-faint" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-panel-2 border-y border-line">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Ready to Start Your Application?</h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto">
            Create an account today and take the first step towards a rewarding career with Uniguard Security.
          </p>
          <button
            onClick={() => setActivePage(publicUser ? 'user-dashboard' : 'signup')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#AF7C28' }}
          >
            <span>{publicUser ? 'Go to My Dashboard' : 'Create Free Account'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-panel border-t border-line py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
              <img src="/uniguardlogo.png" alt="Uniguard" className="h-8 w-auto object-contain" />
              <div className="text-left">
                <p className="font-semibold text-primary text-sm">Uniguard Security</p>
                <p className="text-xs text-secondary">Professional Security Recruitment</p>
              </div>
            </button>
            <div className="flex items-center gap-6 text-sm text-secondary">
              <span>ACS Approved Security Contractor</span>
              <span>•</span>
              <span>SIA License Verified</span>
              <span>•</span>
              <span>BS 7858 Compliant</span>
            </div>
            <p className="text-xs text-faint">© 2026 Uniguard Security Group UK. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
