import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, Clock, ChevronRight, ChevronLeft, ArrowRight, Info } from 'lucide-react';

export default function Auth({ onLoginSuccess, API_URL }) {
  const [isRegister, setIsRegister] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1 = Basic Info, 2 = Skills & Availability
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);

  // State feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSkills = ["Management", "Leadership", "Technical Support", "Communication", "Teaching", "Logistics", "Food Service", "First Aid", "Event Planning", "Marketing"];
  const availableTimes = ["weekdays", "weekends", "mornings", "afternoons", "evenings"];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleAvailability = (time) => {
    if (selectedAvailability.includes(time)) {
      setSelectedAvailability(selectedAvailability.filter(t => t !== time));
    } else {
      setSelectedAvailability([...selectedAvailability, time]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Please fill out all fields in Step 1.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setRegStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }

    if (selectedAvailability.length === 0) {
      setError('Please select your availability times.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          skills: selectedSkills,
          availability: selectedAvailability,
          bio: regBio
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Profile sent for review.');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-premium" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '40px 30px',
        background: 'var(--bg-secondary)',
        position: 'relative'
      }}>
        
        {/* Banner Feedback */}
        {error && (
          <div className="animate-fade" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '25px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Info size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="animate-fade" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '25px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Info size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
          <button
            id="auth-tab-login"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              color: !isRegister ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              borderBottom: !isRegister ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
              fontSize: '1.05rem',
              transition: 'var(--transition)'
            }}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            onClick={() => { setIsRegister(true); setRegStep(1); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              color: isRegister ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              borderBottom: isRegister ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
              fontSize: '1.05rem',
              transition: 'var(--transition)'
            }}
          >
            Register Profile
          </button>
        </div>

        {/* Form Body */}
        {!isRegister ? (
          /* Login Form */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Default admin login: <strong>admin@volunteer.com</strong> / <strong>admin123</strong></span>
            </div>
          </form>
        ) : (
          /* Register Flow */
          <form onSubmit={regStep === 1 ? handleNextStep : handleRegister}>
            {regStep === 1 ? (
              /* Step 1: Basic details */
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} /> Step 1: Contact Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="reg-name" className="form-label">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    className="form-input"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="john@example.com"
                    className="form-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="At least 6 characters"
                    className="form-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm-password" className="form-label">Confirm Password</label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    className="form-input"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-bio" className="form-label">Short Bio (Optional)</label>
                  <textarea
                    id="reg-bio"
                    placeholder="Tell us briefly why you would like to volunteer..."
                    className="form-textarea"
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                  />
                </div>

                <button
                  id="reg-next-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  Continue to Skills <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              /* Step 2: Skills & Availability */
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} /> Step 2: Skills & Time
                </h3>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>What skills can you offer? (Select at least one)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableSkills.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          id={`skill-tag-${skill.toLowerCase().replace(' ', '-')}`}
                          onClick={() => toggleSkill(skill)}
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            borderRadius: '20px',
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.02)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          }}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>When are you available? (Select at least one)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableTimes.map(time => {
                      const isSelected = selectedAvailability.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          id={`avail-tag-${time}`}
                          onClick={() => toggleAvailability(time)}
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            borderRadius: '20px',
                            textTransform: 'capitalize',
                            background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.02)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                          }}
                        >
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button
                    id="reg-back-btn"
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    id="reg-submit-btn"
                    type="submit"
                    className="btn btn-accent"
                    style={{ flex: 2, padding: '12px' }}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Register Profile'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
