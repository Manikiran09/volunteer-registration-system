const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to escape CSV values
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  // If value contains comma, quotes, or newlines, wrap it in double quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

// @route   GET /api/reports/volunteers
// @desc    Download CSV report of volunteers (Admin only)
// @access  Private/Admin
router.get('/volunteers', protect, adminOnly, async (req, res) => {
  try {
    const volunteers = await db.users.find({ role: 'volunteer' });

    // CSV Headers
    const headers = ['Volunteer ID', 'Full Name', 'Email Address', 'Status', 'Skills', 'Availability', 'Hours Logged', 'Registration Date'];
    let csvContent = headers.join(',') + '\r\n';

    // CSV Rows
    volunteers.forEach(v => {
      const skillsStr = (v.skills || []).join('; ');
      const availStr = (v.availability || []).join('; ');
      const dateStr = v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A';

      const row = [
        escapeCSV(v._id),
        escapeCSV(v.name),
        escapeCSV(v.email),
        escapeCSV(v.status),
        escapeCSV(skillsStr),
        escapeCSV(availStr),
        escapeCSV(v.hoursLogged || 0),
        escapeCSV(dateStr)
      ];
      csvContent += row.join(',') + '\r\n';
    });

    // Set headers to trigger download in browser
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteer_report_' + Date.now() + '.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Volunteer CSV report error:', error);
    res.status(500).json({ message: 'Server error generating volunteer CSV report' });
  }
});

// @route   GET /api/reports/events
// @desc    Download CSV report of events (Admin only)
// @access  Private/Admin
router.get('/events', protect, adminOnly, async (req, res) => {
  try {
    const events = await db.events.find();
    
    // CSV Headers
    const headers = ['Event ID', 'Title', 'Description', 'Date', 'Location', 'Skills Required', 'Max Slots', 'Filled Slots', 'Status'];
    let csvContent = headers.join(',') + '\r\n';

    // CSV Rows
    events.forEach(e => {
      const skillsStr = (e.skillsRequired || []).join('; ');
      const filledSlots = (e.registeredVolunteers || []).length;

      const row = [
        escapeCSV(e._id),
        escapeCSV(e.title),
        escapeCSV(e.description),
        escapeCSV(e.date),
        escapeCSV(e.location),
        escapeCSV(skillsStr),
        escapeCSV(e.slots || 10),
        escapeCSV(filledSlots),
        escapeCSV(e.status)
      ];
      csvContent += row.join(',') + '\r\n';
    });

    // Set headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=event_report_' + Date.now() + '.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Events CSV report error:', error);
    res.status(500).json({ message: 'Server error generating events CSV report' });
  }
});

module.exports = router;
