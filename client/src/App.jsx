import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [authChecking, setAuthChecking] = useState(true);

  // Initialize theme on load
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Verify auth session token on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          
          // Auto-navigate to dashboard if user logs in
          if (currentPage === 'home' || currentPage === 'auth') {
            setCurrentPage(data.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard');
          }
        } else {
          // Token is invalid/expired
          handleLogout();
        }
      } catch (error) {
        console.error('Session verification failed:', error);
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentPage(newUser.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Render Page Content Helper
  const renderPage = () => {
    if (authChecking) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            animation: 'glow 1.5s infinite, spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <Home user={user} setCurrentPage={setCurrentPage} />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} API_URL={API_URL} />;
      case 'volunteer-dashboard':
        if (!user || user.role !== 'volunteer') {
          setCurrentPage('home');
          return null;
        }
        return (
          <VolunteerDashboard 
            user={user} 
            token={token} 
            API_URL={API_URL} 
            onProfileUpdate={handleProfileUpdate} 
          />
        );
      case 'admin-dashboard':
        if (!user || user.role !== 'admin') {
          setCurrentPage('home');
          return null;
        }
        return <AdminDashboard token={token} API_URL={API_URL} />;
      default:
        return <Home user={user} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          &copy; {new Date().getFullYear()} VolunTrack Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
