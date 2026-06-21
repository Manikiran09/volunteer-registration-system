const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/volunteers
// @desc    Get all volunteers with filtering (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, skill, search } = req.query;
    let query = { role: 'volunteer' };

    if (status) {
      query.status = status;
    }

    let volunteers = await db.users.find(query);

    // Apply skill filter in memory if needed for fallback db compatibility
    if (skill) {
      const targetSkill = skill.toLowerCase();
      volunteers = volunteers.filter(vol => 
        vol.skills && vol.skills.some(s => s.toLowerCase() === targetSkill)
      );
    }

    // Apply search filter in memory (searches name or email)
    if (search) {
      const searchTerms = search.toLowerCase();
      volunteers = volunteers.filter(vol => 
        (vol.name && vol.name.toLowerCase().includes(searchTerms)) ||
        (vol.email && vol.email.toLowerCase().includes(searchTerms))
      );
    }

    // Format for return (omit sensitive info)
    const formatted = volunteers.map(vol => ({
      id: vol._id,
      name: vol.name,
      email: vol.email,
      status: vol.status,
      skills: vol.skills || [],
      availability: vol.availability || [],
      bio: vol.bio || '',
      hoursLogged: vol.hoursLogged || 0,
      createdAt: vol.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Fetch volunteers error:', error);
    res.status(500).json({ message: 'Server error fetching volunteers' });
  }
});

// @route   PUT /api/volunteers/profile
// @desc    Update current volunteer profile details
// @access  Private
router.post('/profile', protect, async (req, res) => {
  const { name, skills, availability, bio } = req.body;

  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (skills) updates.skills = skills;
    if (availability) updates.availability = availability;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await db.users.findByIdAndUpdate(req.user.id, updates);

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      skills: updatedUser.skills,
      availability: updatedUser.availability,
      bio: updatedUser.bio,
      hoursLogged: updatedUser.hoursLogged
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   PUT /api/volunteers/:id/status
// @desc    Update volunteer registration status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const volunteer = await db.users.findById(req.params.id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const updated = await db.users.findByIdAndUpdate(req.params.id, { status });

    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      status: updated.status,
      message: `Status successfully updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// @route   PUT /api/volunteers/:id/hours
// @desc    Log hours for a volunteer (Admin only)
// @access  Private/Admin
router.put('/:id/hours', protect, adminOnly, async (req, res) => {
  const { hours } = req.body;
  const numHours = parseFloat(hours);

  if (isNaN(numHours) || numHours <= 0) {
    return res.status(400).json({ message: 'Hours must be a positive number' });
  }

  try {
    const volunteer = await db.users.findById(req.params.id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const newHours = (volunteer.hoursLogged || 0) + numHours;
    const updated = await db.users.findByIdAndUpdate(req.params.id, { hoursLogged: newHours });

    res.json({
      id: updated._id,
      name: updated.name,
      hoursLogged: updated.hoursLogged,
      message: `Successfully logged ${numHours} hours. Total: ${updated.hoursLogged} hours.`
    });
  } catch (error) {
    console.error('Log hours error:', error);
    res.status(500).json({ message: 'Server error logging hours' });
  }
});

module.exports = router;
