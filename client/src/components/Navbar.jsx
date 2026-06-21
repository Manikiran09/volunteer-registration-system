import React from 'react';
import { Sun, Moon, LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout, currentPage, setCurrentPage, theme, toggleTheme }) {
  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      marginBottom: '30px',
      padding: '0 20px',
      background: 'var(--bg-secondary)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Brand Logo */}
        <div 
          id="nav-logo" 
          onClick={() => setCurrentPage('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '1.4rem',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}
        >
          <span>VolunTrack</span>
          <span style={{ WebkitTextFillColor: 'initial', fontSize: '1.2rem' }}>🤝</span>
        </div>

        {/* Action Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              id="nav-btn-home"
              onClick={() => setCurrentPage('home')}
              className="btn btn-secondary btn-small"
              style={{ 
                border: currentPage === 'home' ? '1px solid var(--primary)' : '1px solid transparent',
                background: currentPage === 'home' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
              }}
            >
              Home
            </button>

            {user && (
              <button 
                id="nav-btn-dashboard"
                onClick={() => setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard')}
                className="btn btn-secondary btn-small"
                style={{ 
                  border: (currentPage === 'volunteer-dashboard' || currentPage === 'admin-dashboard') ? '1px solid var(--primary)' : '1px solid transparent',
                  background: (currentPage === 'volunteer-dashboard' || currentPage === 'admin-dashboard') ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                {user.role === 'admin' ? (
                  <>
                    <Shield size={14} style={{ marginRight: '4px' }} />
                    Admin Panel
                  </>
                ) : (
                  <>
                    <UserIcon size={14} style={{ marginRight: '4px' }} />
                    Dashboard
                  </>
                )}
              </button>
            )}
          </nav>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="btn btn-secondary btn-small"
            style={{ padding: '8px', borderRadius: '50%', minWidth: '36px', height: '36px' }}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="glass" style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.status === 'approved' ? 'var(--success)' : (user.status === 'rejected' ? 'var(--danger)' : 'var(--warning)')
                }} />
                <span>{user.name}</span>
              </div>
              
              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="btn btn-danger btn-small"
                style={{ padding: '8px', minWidth: '36px', height: '36px' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={() => setCurrentPage('auth')}
              className="btn btn-primary btn-small"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
