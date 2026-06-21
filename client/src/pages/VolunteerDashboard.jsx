import React, { useState, useEffect } from 'react';
import { Award, Calendar, CheckSquare, Settings, Info, MapPin, Clock, ExternalLink, X } from 'lucide-react';

export default function VolunteerDashboard({ user, token, API_URL, onProfileUpdate }) {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'profile'
  
  // Profile editing form state
  const [profileName, setProfileName] = useState(user.name);
  const [profileBio, setProfileBio] = useState(user.bio || '');
  const [profileSkills, setProfileSkills] = useState(user.skills || []);
  const [profileAvailability, setProfileAvailability] = useState(user.availability || []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [skillMatchOnly, setSkillMatchOnly] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSkills = ["Management", "Leadership", "Technical Support", "Communication", "Teaching", "Logistics", "Food Service", "First Aid", "Event Planning", "Marketing"];
  const availableTimes = ["weekdays", "weekends", "mornings", "afternoons", "evenings"];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const toggleSkill = (skill) => {
    if (profileSkills.includes(skill)) {
      setProfileSkills(profileSkills.filter(s => s !== skill));
    } else {
      setProfileSkills([...profileSkills, skill]);
    }
  };

  const toggleAvailability = (time) => {
    if (profileAvailability.includes(time)) {
      setProfileAvailability(profileAvailability.filter(t => t !== time));
    } else {
      setProfileAvailability([...profileAvailability, time]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (profileSkills.length === 0) {
      setError('Please select at least one skill.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/volunteers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          bio: profileBio,
          skills: profileSkills,
          availability: profileAvailability
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      onProfileUpdate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    setError('');
    setSuccess('');
    
    if (user.status !== 'approved') {
      setError('Your registration profile must be Approved by an admin before you can sign up for events.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to join event');
      }

      setSuccess('Successfully registered for the event!');
      fetchEvents();
      // Reload profile to update user.registeredEvents list
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        onProfileUpdate(profileData);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLeaveEvent = async (eventId) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel RSVP');
      }

      setSuccess('RSVP successfully cancelled.');
      fetchEvents();
      
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        onProfileUpdate(profileData);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper arrays for matching IDs
  const userRegisteredIds = (user.registeredEvents || []).map(e => e._id || e);

  // Filter events based on search query and skill matching toggles
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (skillMatchOnly) {
      const hasMatchingSkill = e.skillsRequired.some(skill => 
        user.skills && user.skills.includes(skill)
      );
      return matchesSearch && hasMatchingSkill;
    }
    
    return matchesSearch;
  });

  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      
      {/* Pending status warning banner */}
      {user.status === 'pending' && (
        <div className="glass" style={{
          padding: '20px',
          borderLeft: '4px solid var(--warning)',
          marginBottom: '30px',
          background: 'rgba(245, 158, 11, 0.05)',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-start'
        }}>
          <Info size={24} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--warning)', marginBottom: '5px' }}>Account Status: Pending Approval</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your volunteer profile is currently under review by our administrators. You can look through available tasks and matching opportunities below, but registering for event slots is locked until you are approved.
            </p>
          </div>
        </div>
      )}

      {user.status === 'rejected' && (
        <div className="glass" style={{
          padding: '20px',
          borderLeft: '4px solid var(--danger)',
          marginBottom: '30px',
          background: 'rgba(239, 68, 68, 0.05)',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-start'
        }}>
          <Info size={24} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--danger)', marginBottom: '5px' }}>Account Status: Review Rejected</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your profile verification request was rejected. Please review your listed skills and availability, or contact administration to request a profile review.
            </p>
          </div>
        </div>
      )}

      {/* Global Alerts */}
      {error && (
        <div className="glass animate-fade" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '25px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="glass animate-fade" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '25px',
          fontSize: '0.9rem'
        }}>
          {success}
        </div>
      )}

      {/* Core Statistics grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{user.hoursLogged || 0} hrs</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Service Hours Credited</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--accent-glow)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{userRegisteredIds.length}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Registered Events</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(217, 70, 239, 0.1)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{user.status === 'approved' ? 'Active' : 'Pending'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Participation Level</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          id="vol-tab-events"
          onClick={() => setActiveTab('events')}
          className="btn"
          style={{
            background: activeTab === 'events' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeTab === 'events' ? '#ffffff' : 'var(--text-primary)',
            border: activeTab === 'events' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 24px'
          }}
        >
          <Calendar size={16} style={{ marginRight: '4px' }} />
          Events & Opportunities
        </button>
        <button
          id="vol-tab-profile"
          onClick={() => setActiveTab('profile')}
          className="btn"
          style={{
            background: activeTab === 'profile' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeTab === 'profile' ? '#ffffff' : 'var(--text-primary)',
            border: activeTab === 'profile' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 24px'
          }}
        >
          <Settings size={16} style={{ marginRight: '4px' }} />
          Manage Profile
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'events' ? (
        <div className="animate-fade">
          
          {/* Registered Events */}
          {userRegisteredIds.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px' }}>Your Upcoming Assignments</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {events.filter(e => userRegisteredIds.includes(e._id.toString())).map(event => (
                  <div key={event._id} className="glass" style={{ padding: '24px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                    <button
                      id={`cancel-rsvp-${event._id}`}
                      onClick={() => handleLeaveEvent(event._id)}
                      className="btn btn-secondary btn-small"
                      style={{ position: 'absolute', top: '20px', right: '20px', padding: '6px', borderRadius: '50%' }}
                      title="Cancel RSVP"
                    >
                      <X size={14} />
                    </button>
                    
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', paddingRight: '24px', marginBottom: '8px' }}>{event.title}</h3>
                    
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{event.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{event.location}</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {event.skillsRequired.map(skill => (
                        <span key={skill} style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Available Events */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px' }}>Available Volunteer Tasks</h2>
            
            {/* Search Box / Filters */}
            <div className="glass" style={{
              padding: '20px',
              marginBottom: '35px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)'
            }}>
              <input
                id="event-search-input"
                type="text"
                placeholder="Search events by title or location..."
                className="form-input"
                style={{ flex: 1, minWidth: '280px', margin: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <label id="skill-match-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
                <input
                  id="skill-match-checkbox"
                  type="checkbox"
                  checked={skillMatchOnly}
                  onChange={(e) => setSkillMatchOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Match my skills ({user.skills ? user.skills.length : 0} loaded)
              </label>
            </div>

            {/* Events Showcase */}
            {filteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                <h3>No available events matching your criteria.</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Try clearing filters or search terms.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredEvents.map(event => {
                  const hasJoined = userRegisteredIds.includes(event._id.toString());
                  const filledCount = event.registeredVolunteers ? event.registeredVolunteers.length : 0;
                  const isFull = filledCount >= event.slots;
                  
                  // Skill Match Counter
                  const matchingSkills = event.skillsRequired.filter(s => user.skills && user.skills.includes(s));
                  
                  return (
                    <div key={event._id} className="glass animate-fade" style={{
                      padding: '30px',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '30px',
                      alignItems: 'center',
                      background: hasJoined ? 'rgba(99, 102, 241, 0.02)' : 'var(--bg-secondary)',
                      borderLeft: matchingSkills.length > 0 ? '4px solid var(--accent)' : '1px solid var(--border-color)'
                    }}>
                      <div>
                        {matchingSkills.length > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                            <CheckSquare size={10} /> Skill Match ({matchingSkills.length})
                          </div>
                        )}
                        
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{event.title}</h3>
                        
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.6' }}>
                          {event.description}
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '15px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} />{event.date}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} />{event.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} />{filledCount} / {event.slots} slots filled</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {event.skillsRequired.map(skill => {
                            const isMatch = user.skills && user.skills.includes(skill);
                            return (
                              <span key={skill} style={{
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                background: isMatch ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
                                color: isMatch ? 'var(--accent)' : 'var(--text-muted)',
                                border: isMatch ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                                fontWeight: isMatch ? '600' : '400'
                              }}>
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        {hasJoined ? (
                          <button
                            id={`leave-btn-${event._id}`}
                            onClick={() => handleLeaveEvent(event._id)}
                            className="btn btn-secondary"
                            style={{ minWidth: '130px' }}
                          >
                            Cancel RSVP
                          </button>
                        ) : (
                          <button
                            id={`join-btn-${event._id}`}
                            onClick={() => handleJoinEvent(event._id)}
                            className="btn btn-primary"
                            style={{ minWidth: '130px' }}
                            disabled={isFull || user.status !== 'approved'}
                          >
                            {isFull ? 'Event Full' : 'Join Event'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Profile Editing Tab */
        <div className="glass animate-fade" style={{ padding: '40px 30px', background: 'var(--bg-secondary)', maxWidth: '700px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} /> Update Profile Settings
          </h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="prof-name" className="form-label">Full Name</label>
              <input
                id="prof-name"
                type="text"
                className="form-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-bio" className="form-label">Biography</label>
              <textarea
                id="prof-bio"
                className="form-textarea"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Update Skills (Select at least one)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableSkills.map(skill => {
                  const isSelected = profileSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      id={`prof-skill-tag-${skill.toLowerCase().replace(' ', '-')}`}
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
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Update Availability (Select at least one)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableTimes.map(time => {
                  const isSelected = profileAvailability.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      id={`prof-avail-tag-${time}`}
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

            <button
              id="prof-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 30px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
