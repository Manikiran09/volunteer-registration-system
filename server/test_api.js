// Automated API Integration Test Script for VolunTrack API
const assert = require('assert').strict;

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting VolunTrack API End-to-End Integration Tests...\n');
  
  const testEmail = `vol_test_${Math.random().toString(36).substr(2, 5)}@example.com`;
  const testPassword = 'testpassword123';
  let volunteerToken = '';
  let volunteerId = '';
  let adminToken = '';
  let eventId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Register a new Volunteer
    // ----------------------------------------------------
    console.log('⏳ Test 1: Registering new volunteer...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner',
        email: testEmail,
        password: testPassword,
        skills: ['Technical Support', 'Communication'],
        availability: ['weekends'],
        bio: 'Automated test profile.'
      })
    });
    const registerData = await registerRes.json();
    assert.equal(registerRes.status, 201, 'Volunteer registration status should be 201 Created');
    assert.ok(registerData.token, 'Should return jwt token');
    assert.equal(registerData.user.status, 'pending', 'Default profile status should be pending');
    volunteerToken = registerData.token;
    volunteerId = registerData.user.id;
    console.log(`✅ Test 1 Passed: Registered volunteer with ID: ${volunteerId}`);

    // ----------------------------------------------------
    // TEST 2: Login as Admin
    // ----------------------------------------------------
    console.log('\n⏳ Test 2: Authenticating default admin...');
    const adminRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@volunteer.com',
        password: 'admin123'
      })
    });
    const adminData = await adminRes.json();
    assert.equal(adminRes.status, 200, 'Admin login status should be 200 OK');
    assert.ok(adminData.token, 'Should return admin token');
    assert.equal(adminData.user.role, 'admin', 'User role should be admin');
    adminToken = adminData.token;
    console.log('✅ Test 2 Passed: Admin authenticated successfully.');

    // ----------------------------------------------------
    // TEST 3: Admin approves the Volunteer Profile
    // ----------------------------------------------------
    console.log('\n⏳ Test 3: Admin approving volunteer status...');
    const approveRes = await fetch(`${API_URL}/volunteers/${volunteerId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    assert.equal(approveRes.status, 200, 'Status update should be 200 OK');
    assert.equal(approveData.status, 'approved', 'Volunteer status should now be approved');
    console.log('✅ Test 3 Passed: Volunteer status approved.');

    // ----------------------------------------------------
    // TEST 4: Admin schedules an Event
    // ----------------------------------------------------
    console.log('\n⏳ Test 4: Admin creating a new event...');
    const eventRes = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'API Test Event',
        description: 'Verification event created by test runner script.',
        date: '2026-08-30',
        location: 'Server Integration Cluster',
        slots: 5,
        skillsRequired: ['Technical Support']
      })
    });
    const eventData = await eventRes.json();
    assert.equal(eventRes.status, 201, 'Event creation status should be 201 Created');
    assert.ok(eventData._id, 'Should return event unique id');
    eventId = eventData._id;
    console.log(`✅ Test 4 Passed: Created event with ID: ${eventId}`);

    // ----------------------------------------------------
    // TEST 5: Approved Volunteer RSVPs/Joins Event
    // ----------------------------------------------------
    console.log('\n⏳ Test 5: Volunteer joining the event...');
    const joinRes = await fetch(`${API_URL}/events/${eventId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${volunteerToken}` }
    });
    const joinData = await joinRes.json();
    assert.equal(joinRes.status, 200, 'Join event should be 200 OK');
    console.log('✅ Test 5 Passed: Volunteer joined event.');

    // ----------------------------------------------------
    // TEST 6: Admin logs service hours for the Volunteer
    // ----------------------------------------------------
    console.log('\n⏳ Test 6: Admin logging volunteer hours...');
    const hoursRes = await fetch(`${API_URL}/volunteers/${volunteerId}/hours`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ hours: 4.5 })
    });
    const hoursData = await hoursRes.json();
    assert.equal(hoursRes.status, 200, 'Log hours should be 200 OK');
    assert.equal(hoursData.hoursLogged, 4.5, 'Volunteer hours logged should equal 4.5');
    console.log('✅ Test 6 Passed: Credited 4.5 hours to volunteer.');

    // ----------------------------------------------------
    // TEST 7: Extract CSV reports
    // ----------------------------------------------------
    console.log('\n⏳ Test 7: Exporting CSV reports...');
    const repVolsRes = await fetch(`${API_URL}/reports/volunteers`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const repVolsText = await repVolsRes.text();
    assert.equal(repVolsRes.status, 200, 'Volunteers report should be 200 OK');
    assert.ok(repVolsText.includes('Test Runner'), 'CSV report should contain volunteer name');
    
    const repEventsRes = await fetch(`${API_URL}/reports/events`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const repEventsText = await repEventsRes.text();
    assert.equal(repEventsRes.status, 200, 'Events report should be 200 OK');
    assert.ok(repEventsText.includes('API Test Event'), 'CSV report should contain event title');
    console.log('✅ Test 7 Passed: Volunteers and Events CSV reports verified.');

    // ----------------------------------------------------
    // Cleanup: Delete test event
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test event...');
    await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log('\n🎉 ALL END-TO-END API TESTS PASSED SUCCESSFULLY! (100% Functional)');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
