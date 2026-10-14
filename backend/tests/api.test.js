const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');
const db = require('../src/database/db');

// We will use node's native fetch against the test server
let server;
let baseUrl;
let token;

test.before(async () => {
  process.env.NODE_ENV = 'test';
  db.resetAll();
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('1. Health Check Endpoint returns 200 and feature inventory', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'online');
  assert.ok(data.features.includes('computer_vision_pose_estimation'));
  assert.ok(data.features.includes('ai_personalized_workout_generator'));
});

test('2. Demo Login returns JWT token and Alex Vance profile', async () => {
  const res = await fetch(`${baseUrl}/api/auth/demo-login`, { method: 'POST' });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, 'alex@adventure.com');
  assert.equal(data.user.level, 3);
  token = data.token;
});

test('3. Register new user and enforce unique email', async () => {
  const testEmail = `test_${Date.now()}@fitness.com`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Elena Rostova',
      email: testEmail,
      password: 'password123',
      avatarClass: 'scout'
    })
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.name, 'Elena Rostova');

  // Duplicate attempt must return 409
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Elena Rostova',
      email: testEmail,
      password: 'password123'
    })
  });
  assert.equal(dupRes.status, 409);
});

test('4. Login validates correct credentials and rejects incorrect ones', async () => {
  const badRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@adventure.com', password: 'wrongpassword' })
  });
  assert.equal(badRes.status, 401);

  const goodRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@adventure.com', password: 'adventure123' })
  });
  assert.equal(goodRes.status, 200);
  const data = await goodRes.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
});

test('5. Plan Generator produces structured warmup, circuits, cooldown, and safety disclaimer', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fitnessLevel: 'intermediate',
      goal: 'strength',
      equipment: ['bodyweight', 'dumbbells'],
      timeMinutes: 30,
      previousFeedback: { rpe: 9, difficulty: 'too_hard' }
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.plan.warmup.length > 0);
  assert.ok(data.plan.circuits.length >= 3);
  assert.ok(data.plan.cooldown.length > 0);
  assert.ok(data.plan.safetyDisclaimer);
  // Confirms RPE fatigue adaptation scaled volume multiplier down
  assert.equal(data.plan.volumeMultiplier, 0.8);
});

test('6. Exercise Library contains Computer Vision exercises with joint angle configurations', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/exercises`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.cvSupportedCount >= 4);
  const squat = data.exercises.find(e => e.id === 'ex-squat');
  assert.ok(squat);
  assert.equal(squat.cvSupported, true);
  assert.equal(squat.cvConfig.jointAngle, 'hip-knee-ankle');
});

test('7. Adventure Worlds returns 5 themed worlds with unlock status', async () => {
  const res = await fetch(`${baseUrl}/api/adventure/worlds`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.worlds.length, 5);
  // Level 3 user should have Worlds 1, 2, 3 unlocked
  const w1 = data.worlds.find(w => w.id === 'world-1');
  assert.equal(w1.isUnlocked, true);
  const w5 = data.worlds.find(w => w.id === 'world-5');
  assert.equal(w5.isUnlocked, false); // Requires level 5
});

test('8. AI Coach provides technique cues and triggers safety protocol on pain report', async () => {
  // Normal form question
  const chatRes = await fetch(`${baseUrl}/api/ai-coach/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message: 'How do I maintain good squat form?' })
  });
  assert.equal(chatRes.status, 200);
  const chatData = await chatRes.json();
  assert.equal(chatData.success, true);
  assert.ok(chatData.reply.toLowerCase().includes('squat'));
  assert.ok(chatData.exerciseCard, 'Should return exerciseCard for squat technique query');
  assert.equal(chatData.exerciseCard.exerciseId, 'squat');

  // Safety trigger: Pain report
  const painRes = await fetch(`${baseUrl}/api/ai-coach/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message: 'I feel sharp knee pain when bending down' })
  });
  assert.equal(painRes.status, 200);
  const painData = await painRes.json();
  assert.equal(painData.category, 'safety_advisory');
  assert.ok(painData.reply.includes('Safety First'));
  assert.ok(painData.reply.includes('stop exercising immediately'));
  assert.ok(painData.triageData, 'Should return structured triageData for pain report');
  assert.ok(painData.triageData.riceProtocol.length > 0);
});

test('9. Workout Logging calculates XP, awards streak, and updates stats', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Highland Testing Trial',
      durationMinutes: 20,
      totalReps: 30,
      cvVerifiedReps: 15,
      rpe: 6,
      exercises: [{ name: 'Bodyweight Squats', sets: 3, reps: 10, cvVerified: true }]
    })
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.rewards.earnedXP > 50);
  assert.ok(data.rewards.newStreak >= 1);
});
