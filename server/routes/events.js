const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const events = await db.events.find();
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   POST /api/events
// @desc    Create a new event (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, date, location, skillsRequired, slots } = req.body;

  try {
    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Please provide all required event details' });
    }

    const newEvent = await db.events.create({
      title,
      description,
      date,
      location,
      skillsRequired: skillsRequired || [],
      slots: parseInt(slots) || 10,
      status: 'upcoming',
      registeredVolunteers: []
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   GET /api/events/:id
// @desc    Get a single event with populated volunteers
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Fetch event details error:', error);
    res.status(500).json({ message: 'Server error fetching event details' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { title, description, date, location, skillsRequired, slots, status } = req.body;

  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (date) updates.date = date;
    if (location) updates.location = location;
    if (skillsRequired) updates.skillsRequired = skillsRequired;
    if (slots) updates.slots = parseInt(slots);
    if (status) updates.status = status;

    const updated = await db.events.findByIdAndUpdate(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await db.events.deleteOne(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

// @route   POST /api/events/:id/join
// @desc    Join an event as volunteer
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Your account must be approved by an Admin before you can register for events.' });
    }

    // Standardize IDs for checking
    const eventIdStr = event._id.toString();
    const userIdStr = user._id.toString();

    // Check if already registered in user list
    const userEvents = user.registeredEvents.map(e => (e._id ? e._id.toString() : e.toString()));
    if (userEvents.includes(eventIdStr)) {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }

    // Check if slots are full
    const currentVolunteers = event.registeredVolunteers.map(v => (v._id ? v._id.toString() : v.toString()));
    if (currentVolunteers.length >= event.slots) {
      return res.status(400).json({ message: 'This event is full. No more slots available.' });
    }

    // Join
    const updatedVolunteers = [...currentVolunteers, userIdStr];
    await db.events.findByIdAndUpdate(req.params.id, { registeredVolunteers: updatedVolunteers });

    const updatedUserEvents = [...userEvents, eventIdStr];
    await db.users.findByIdAndUpdate(req.user.id, { registeredEvents: updatedUserEvents });

    res.json({ message: 'Successfully joined event', eventId: eventIdStr });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error joining event' });
  }
});

// @route   POST /api/events/:id/leave
// @desc    Cancel RSVP for an event
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const event = await db.events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const eventIdStr = event._id.toString();
    const userIdStr = user._id.toString();

    const userEvents = user.registeredEvents.map(e => (e._id ? e._id.toString() : e.toString()));
    const currentVolunteers = event.registeredVolunteers.map(v => (v._id ? v._id.toString() : v.toString()));

    if (!userEvents.includes(eventIdStr)) {
      return res.status(400).json({ message: 'You are not registered for this event.' });
    }

    // Leave
    const updatedVolunteers = currentVolunteers.filter(id => id !== userIdStr);
    await db.events.findByIdAndUpdate(req.params.id, { registeredVolunteers: updatedVolunteers });

    const updatedUserEvents = userEvents.filter(id => id !== eventIdStr);
    await db.users.findByIdAndUpdate(req.user.id, { registeredEvents: updatedUserEvents });

    res.json({ message: 'Successfully cancelled RSVP', eventId: eventIdStr });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ message: 'Server error cancelling RSVP' });
  }
});

module.exports = router;
