import React from 'react';
import { Users, Calendar, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home({ user, setCurrentPage }) {
  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      
      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 0 60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative backdrop glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(217,70,239,0.05) 70%, transparent 100%)',
          filter: 'blur(40px)',
          zIndex: -1
        }} />

        <h1 id="hero-title" style={{
          fontSize: '3.8rem',
          fontWeight: '800',
          lineHeight: '1.1',
          marginBottom: '20px',
          background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          maxWidth: '800px'
        }}>
          Empower Communities. <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Track Your Impact.</span>
        </h1>
        
        <p id="hero-description" style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          marginBottom: '35px',
          lineHeight: '1.6'
        }}>
          VolunTrack is a professional volunteer hub that bridges community requirements with active volunteers. Log your contributions, register for tasks, and manage operations.
        </p>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {user ? (
            <button
              id="hero-dashboard-btn"
              onClick={() => setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard')}
              className="btn btn-primary"
              style={{ fontSize: '1.05rem', padding: '12px 28px' }}
            >
              Go to My Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                id="hero-register-btn"
                onClick={() => setCurrentPage('auth')}
                className="btn btn-primary"
                style={{ fontSize: '1.05rem', padding: '12px 28px' }}
              >
                Join as Volunteer <ArrowRight size={18} />
              </button>
              <button
                id="hero-login-btn"
                onClick={() => setCurrentPage('auth')}
                className="btn btn-secondary"
                style={{ fontSize: '1.05rem', padding: '12px 28px' }}
              >
                Admin Login
              </button>
            </>
          )}
        </div>
      </section>

      {/* Metrics Banner */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '80px',
        marginTop: '20px'
      }}>
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <Users size={32} style={{ color: 'var(--primary)', marginBottom: '15px' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px' }}>150+</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Registered Volunteers</p>
        </div>
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <Calendar size={32} style={{ color: 'var(--secondary)', marginBottom: '15px' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px' }}>42</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Local Events</p>
        </div>
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <Award size={32} style={{ color: 'var(--accent)', marginBottom: '15px' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px' }}>1,280</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Hours Logged</p>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.2rem',
          fontWeight: '700',
          marginBottom: '50px',
          fontFamily: 'var(--font-heading)'
        }}>How VolunTrack Works</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          
          <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <CheckCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>1. Register & Verify</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Create an account, list your availability times, and input your skills. Administrators review profiles to ensure high-quality coordination.
            </p>
          </div>

          <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(217,70,239,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary)'
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>2. RSVP to Events</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Browse upcoming activities. Our system automatically matches you to events requesting skills similar to yours, and you can secure slots with one click.
            </p>
          </div>

          <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(20,184,166,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>3. Log Hours & Extract Reports</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              After helping out, Admins approve and log your service hours. Admins can instantly extract professional CSV report audits of volunteers and event signups.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
