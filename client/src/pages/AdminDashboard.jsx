import React, { useState, useEffect } from 'react';
import { Users, Calendar, Award, Plus, FileText, Search, Clock, ShieldAlert, Check, X, Trash2, Download } from 'lucide-react';

export default function AdminDashboard({ token, API_URL }) {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('volunteers'); // 'volunteers', 'events', 'reports'
  
  // Search & Filter state
  const [volSearch, setVolSearch] = useState('');
  const [volStatusFilter, setVolStatusFilter] = useState('');
  const [volSkillFilter, setVolSkillFilter] = useState('');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventSlots, setEventSlots] = useState(10);
  const [eventSkills, setEventSkills] = useState([]);

  // Hours logger modal state
  const [selectedVolId, setSelectedVolId] = useState(null);
  const [hoursToLog, setHoursToLog] = useState('');

  // UI status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSkills = ["Management", "Leadership", "Technical Support", "Communication", "Teaching", "Logistics", "Food Service", "First Aid", "Event Planning", "Marketing"];

  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`${API_URL}/volunteers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVolunteers(data);
      }
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    }
  };

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

  const handleStatusChange = async (volId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/volunteers/${volId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to change status');
      
      setSuccess(`Volunteer status successfully set to ${newStatus}`);
      fetchVolunteers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const hoursVal = parseFloat(hoursToLog);
    if (isNaN(hoursVal) || hoursVal <= 0) {
      setError('Please input a valid positive number for hours.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/volunteers/${selectedVolId}/hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hours: hoursVal })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to log hours');

      setSuccess(`Logged ${hoursVal} hours successfully!`);
      setSelectedVolId(null);
      setHoursToLog('');
      fetchVolunteers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!eventTitle || !eventDescription || !eventDate || !eventLocation) {
      setError('Please fill in all core fields.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          date: eventDate,
          location: eventLocation,
          slots: eventSlots,
          skillsRequired: eventSkills
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create event');

      setSuccess(`Event "${eventTitle}" created successfully!`);
      setEventTitle('');
      setEventDescription('');
      setEventDate('');
      setEventLocation('');
      setEventSlots(10);
      setEventSkills([]);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this event? This will remove all volunteer assignments.')) return;
    
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to delete event');

      setSuccess('Event deleted successfully.');
      fetchEvents();
      fetchVolunteers(); // Sync registered events lists
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEventSkill = (skill) => {
    if (eventSkills.includes(skill)) {
      setEventSkills(eventSkills.filter(s => s !== skill));
    } else {
      setEventSkills([...eventSkills, skill]);
    }
  };

  // JWT-authenticated safe file download triggers
  const downloadReport = async (reportType) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/reports/${reportType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(`CSV Report downloaded successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate metrics
  const totalVolunteers = volunteers.length;
  const pendingApprovals = volunteers.filter(v => v.status === 'pending').length;
  const totalHours = volunteers.reduce((acc, curr) => acc + (curr.hoursLogged || 0), 0);
  const activeEventCount = events.length;

  // Filter volunteers list
  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(volSearch.toLowerCase()) || 
                          v.email.toLowerCase().includes(volSearch.toLowerCase());
    const matchesStatus = volStatusFilter === '' || v.status === volStatusFilter;
    const matchesSkill = volSkillFilter === '' || (v.skills && v.skills.includes(volSkillFilter));
    return matchesSearch && matchesStatus && matchesSkill;
  });

  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      
      {/* Alert Feedbacks */}
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

      {/* Admin stats */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{totalVolunteers}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Volunteers</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{pendingApprovals}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pending Approval</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(217, 70, 239, 0.1)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{activeEventCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Tasks</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'var(--accent-glow)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{totalHours}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Hours Logged</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          id="admin-tab-vols"
          onClick={() => setActiveTab('volunteers')}
          className="btn"
          style={{
            background: activeTab === 'volunteers' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeTab === 'volunteers' ? '#ffffff' : 'var(--text-primary)',
            border: activeTab === 'volunteers' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 24px'
          }}
        >
          <Users size={16} style={{ marginRight: '4px' }} />
          Volunteers List
        </button>
        <button
          id="admin-tab-events"
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
          Events & Schedules
        </button>
        <button
          id="admin-tab-reports"
          onClick={() => setActiveTab('reports')}
          className="btn"
          style={{
            background: activeTab === 'reports' ? 'var(--primary)' : 'var(--bg-card)',
            color: activeTab === 'reports' ? '#ffffff' : 'var(--text-primary)',
            border: activeTab === 'reports' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 24px'
          }}
        >
          <FileText size={16} style={{ marginRight: '4px' }} />
          Extract Reports
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'volunteers' && (
        <div className="animate-fade">
          
          {/* Filters Bar */}
          <div className="glass" style={{
            padding: '20px',
            marginBottom: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            background: 'var(--bg-secondary)',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                id="vol-search-bar"
                type="text"
                placeholder="Search by name or email..."
                className="form-input"
                style={{ paddingLeft: '38px', margin: 0 }}
                value={volSearch}
                onChange={(e) => setVolSearch(e.target.value)}
              />
            </div>
            
            <select
              id="vol-status-filter"
              className="form-select"
              style={{ width: '180px', margin: 0 }}
              value={volStatusFilter}
              onChange={(e) => setVolStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              id="vol-skill-filter"
              className="form-select"
              style={{ width: '180px', margin: 0 }}
              value={volSkillFilter}
              onChange={(e) => setVolSkillFilter(e.target.value)}
            >
              <option value="">All Skills</option>
              {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Volunteers Table */}
          <div className="table-container glass" style={{ background: 'var(--bg-secondary)' }}>
            <table>
              <thead>
                <tr>
                  <th>Name / Email</th>
                  <th>Status</th>
                  <th>Skills Offer</th>
                  <th>Hours Logged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No volunteers registered matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map(vol => (
                    <tr key={vol.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{vol.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{vol.email}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${vol.status}`}>{vol.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                          {vol.skills.map(s => (
                            <span key={s} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{vol.hoursLogged} hrs</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          
                          {/* Approval Quick Actions */}
                          {vol.status !== 'approved' && (
                            <button
                              id={`vol-approve-${vol.id}`}
                              onClick={() => handleStatusChange(vol.id, 'approved')}
                              className="btn btn-secondary btn-small"
                              style={{ padding: '6px', color: 'var(--success)' }}
                              title="Approve Profile"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          
                          {vol.status !== 'rejected' && (
                            <button
                              id={`vol-reject-${vol.id}`}
                              onClick={() => handleStatusChange(vol.id, 'rejected')}
                              className="btn btn-secondary btn-small"
                              style={{ padding: '6px', color: 'var(--danger)' }}
                              title="Reject / Revoke"
                            >
                              <X size={14} />
                            </button>
                          )}

                          {/* Log hours link */}
                          <button
                            id={`vol-add-hours-${vol.id}`}
                            onClick={() => setSelectedVolId(vol.id)}
                            className="btn btn-primary btn-small"
                            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          >
                            <Clock size={12} style={{ marginRight: '4px' }} /> Log Hours
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick inline hours logging modal backdrop */}
          {selectedVolId && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div className="glass-premium animate-fade" style={{
                background: 'var(--bg-secondary)',
                width: '100%',
                maxWidth: '400px',
                padding: '30px'
              }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} /> Credit Volunteer Hours
                </h3>
                
                <form onSubmit={handleLogHours}>
                  <div className="form-group">
                    <label htmlFor="log-hours-input" className="form-label">Hours to Add</label>
                    <input
                      id="log-hours-input"
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="e.g. 3.5"
                      className="form-input"
                      value={hoursToLog}
                      onChange={(e) => setHoursToLog(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      id="hours-cancel-btn"
                      type="button"
                      onClick={() => { setSelectedVolId(null); setHoursToLog(''); }}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      id="hours-submit-btn"
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Submit Hours
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'events' && (
        <div className="animate-fade" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          
          {/* Create Event Card */}
          <div className="glass" style={{ padding: '30px', background: 'var(--bg-secondary)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} style={{ color: 'var(--primary)' }} /> Schedule New Event
            </h2>
            
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="ev-title" className="form-label">Event Title</label>
                <input
                  id="ev-title"
                  type="text"
                  placeholder="e.g. Tree Planting Drive"
                  className="form-input"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ev-description" className="form-label">Description</label>
                <textarea
                  id="ev-description"
                  placeholder="Detailed guidelines about requirements, targets, and coordinator contacts..."
                  className="form-textarea"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ev-date" className="form-label">Date Scheduled</label>
                <input
                  id="ev-date"
                  type="date"
                  className="form-input"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ev-location" className="form-label">Location / Hub</label>
                <input
                  id="ev-location"
                  type="text"
                  placeholder="e.g. City Public Gardens"
                  className="form-input"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ev-slots" className="form-label">Maximum Slots (Volunteers Needed)</label>
                <input
                  id="ev-slots"
                  type="number"
                  min="1"
                  className="form-input"
                  value={eventSlots}
                  onChange={(e) => setEventSlots(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Required Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availableSkills.map(skill => {
                    const isSelected = eventSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        id={`ev-skill-tag-${skill.toLowerCase().replace(' ', '-')}`}
                        onClick={() => toggleEventSkill(skill)}
                        className="btn"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
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

              <button
                id="ev-submit-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* Active Events Schedule List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '25px' }}>Active Schedules ({activeEventCount})</h2>
            
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }} className="glass">
                <Calendar size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <h3>No active events scheduled yet.</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {events.map(ev => {
                  const filledCount = ev.registeredVolunteers ? ev.registeredVolunteers.length : 0;
                  return (
                    <div key={ev._id} className="glass" style={{ padding: '20px', background: 'var(--bg-secondary)', position: 'relative' }}>
                      <button
                        id={`delete-ev-${ev._id}`}
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="btn btn-secondary btn-small"
                        style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px', borderRadius: '50%', color: 'var(--danger)' }}
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', paddingRight: '25px', marginBottom: '6px' }}>{ev.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{ev.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <span>📅 {ev.date}</span>
                        <span>📍 {ev.location}</span>
                        <span>👥 {filledCount} / {ev.slots} Volunteers Registered</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {ev.skillsRequired.map(s => (
                          <span key={s} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'reports' && (
        <div className="animate-fade glass" style={{ padding: '40px 30px', background: 'var(--bg-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} /> CSV Report Downloader
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '35px' }}>
            Generate and extract live spreadsheet audits. The data is generated on the server and downloaded securely to your device.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '5px' }}>Volunteers Registry</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Downloads list of registered volunteers with email, status, skills, and total hours.</p>
              </div>
              <button
                id="btn-report-vols"
                onClick={() => downloadReport('volunteers')}
                className="btn btn-primary"
                style={{ padding: '10px 18px', gap: '6px' }}
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="glass" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '5px' }}>Events Summary</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Downloads summary table of all scheduled tasks, slots occupied, location, and date status.</p>
              </div>
              <button
                id="btn-report-events"
                onClick={() => downloadReport('events')}
                className="btn btn-accent"
                style={{ padding: '10px 18px', gap: '6px' }}
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
