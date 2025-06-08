require('dotenv').config();
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MindCare API' });
});

// Self-Assessment
router.post('/self-assessment', authenticateToken, async (req, res) => {
  // Only allow signed-in users
  if (!req.user || !req.user.uid) {
    return res.status(403).json({ error: 'Guests cannot access this feature.' });
  }
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers) || answers.length !== 10) {
    return res.status(400).json({ error: 'Invalid answers' });
  }
  // Simple scoring: sum all answers
  const total = answers.reduce((a, b) => a + b, 0);
  let result = 'Healthy';
  let alert = null;
  if (total <= 25) result = 'High Risk';
  else if (total <= 40) result = 'At Risk';
  // Check for suicidal ideation (question 9, index 8)
  if (answers[8] >= 6) {
    alert = "It looks like you're going through a very tough time. Please know that you are not alone. Would you like to speak to a counselor or contact emergency help?";
  }
  // Save to Firestore (optional, if Firestore is set up)
  try {
    const db = admin.firestore();
    await db.collection('users').doc(req.user.uid).collection('history').add({
      type: 'Self-Assessment',
      answers,
      total,
      result,
      timestamp: new Date(),
    });
  } catch (e) {
    // Firestore is optional; ignore errors for now
  }
  res.json({ result, alert });
});

// Burnout Calculator
router.post('/burnout', async (req, res) => {
  const { workHours, sleepHours, motivation, exhaustion, isGuest } = req.body;
  // All fields required
  if (
    typeof workHours !== 'number' ||
    typeof sleepHours !== 'number' ||
    typeof motivation !== 'number' ||
    typeof exhaustion !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // Simple burnout risk calculation (example logic)
  // Higher work, lower sleep, lower motivation, higher exhaustion = higher risk
  let score = 0;
  score += Math.max(0, workHours - 8) * 2; // work over 8h/day increases risk
  score += Math.max(0, 7 - sleepHours) * 2; // less than 7h sleep increases risk
  score += (7 - motivation) * 2; // lower motivation increases risk
  score += exhaustion * 2; // higher exhaustion increases risk
  // Normalize to 0-100
  let percent = Math.min(100, Math.max(0, Math.round((score / 40) * 100)));
  let category = 'Low';
  if (percent >= 70) category = 'High';
  else if (percent >= 40) category = 'Moderate';
  // For signed-in users, return percentage; for guests, return category
  if (isGuest) {
    return res.json({ result: category });
  }
  // If authenticated, log to Firestore and return percent
  let uid = null;
  try {
    if (req.headers['authorization']) {
      const token = req.headers['authorization'].split(' ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    }
  } catch (e) {}
  if (uid) {
    try {
      const db = admin.firestore();
      await db.collection('users').doc(uid).collection('history').add({
        type: 'Burnout',
        workHours, sleepHours, motivation, exhaustion, percent, category,
        timestamp: new Date(),
      });
    } catch (e) {}
    return res.json({ result: percent });
  } else {
    return res.json({ result: category });
  }
});

// Stress Predictor
router.post('/stress', async (req, res) => {
  const { sleep, screen, food, exercise, mood, isGuest } = req.body;
  // Validate input
  if (
    typeof sleep !== 'number' ||
    typeof screen !== 'number' ||
    typeof food !== 'number' ||
    typeof exercise !== 'number' ||
    typeof mood !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // Simple rule-based prediction (replace with ML model if available)
  let score = 0;
  score += Math.max(0, 7 - sleep) * 2; // less sleep = more stress
  score += Math.max(0, screen - 4) * 2; // more than 4h screen = more stress
  score += (4 - food) * 2; // lower food score = more stress
  score += Math.max(0, 3 - exercise) * 2; // less than 3x/week = more stress
  score += (4 - mood) * 2; // lower mood = more stress
  let percent = Math.min(100, Math.max(0, Math.round((score / 40) * 100)));
  let category = 'Low Stress';
  if (percent >= 70) category = 'High Stress';
  else if (percent >= 40) category = 'Medium Stress';

  // Recommendations (static for now, can be dynamic)
  const recommendations = [
    { type: 'video', title: '5-Minute Breathing Exercise', url: 'https://www.youtube.com/watch?v=nmFUDkj1Aq0' },
    { type: 'article', title: 'How to Manage Stress', url: 'https://www.helpguide.org/articles/stress/stress-management.htm' },
    { type: 'music', title: 'Soothing Music for Relaxation', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04' },
    { type: 'app', title: 'Headspace Meditation', url: 'https://www.headspace.com/meditation/meditation-for-stress' }
  ];

  // For signed-in users, log to Firestore and return percent + recommendations
  let uid = null;
  try {
    if (req.headers['authorization']) {
      const token = req.headers['authorization'].split(' ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    }
  } catch (e) {}
  if (uid) {
    try {
      const db = admin.firestore();
      await db.collection('users').doc(uid).collection('history').add({
        type: 'Stress',
        sleep, screen, food, exercise, mood, percent, category,
        timestamp: new Date(),
      });
    } catch (e) {}
    return res.json({ result: percent, category, recommendations });
  } else {
    // For guests, return only category and recommendations
    return res.json({ result: category, recommendations });
  }
});

// Recommendations
router.get('/recommendations', async (req, res) => {
  // Example: Use query params to personalize (e.g., ?type=stress&level=high)
  const { type, level } = req.query;
  let recommendations = [];

  // Basic logic for demo; in production, use ML or more advanced rules
  if (type === 'stress' && level === 'high') {
    recommendations = [
      { type: 'video', title: 'Guided Meditation for Stress Relief', url: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
      { type: 'article', title: '10 Ways to Cope with Stress', url: 'https://www.verywellmind.com/tips-to-reduce-stress-3145195' },
      { type: 'music', title: 'Calm Piano Music', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04' }
    ];
  } else if (type === 'burnout' && level === 'high') {
    recommendations = [
      { type: 'video', title: 'How to Recover from Burnout', url: 'https://www.youtube.com/watch?v=hFkI69zJzLI' },
      { type: 'article', title: 'Burnout: Symptoms and Recovery', url: 'https://www.helpguide.org/articles/stress/burnout-prevention-and-recovery.htm' },
      { type: 'app', title: 'Headspace for Work Stress', url: 'https://www.headspace.com/work' }
    ];
  } else {
    recommendations = [
      { type: 'video', title: 'Mindfulness for Beginners', url: 'https://www.youtube.com/watch?v=1vx8iUvfyCY' },
      { type: 'article', title: 'Mindfulness Exercises', url: 'https://www.mindful.org/mindfulness-how-to-do-it/' },
      { type: 'music', title: 'Relaxing Nature Sounds', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4' }
    ];
  }
  res.json({ recommendations });
});

// Emergency Help
router.post('/emergency', async (req, res) => {
  // Accept: { message, location, contactConsent }
  const { message, location, contactConsent } = req.body;
  // Optionally notify emergency contact (if consent given)
  if (contactConsent) {
    // TODO: Integrate with FCM or email/SMS API to notify contact
    // For demo, just return a message
  }
  // Return helpline and nearby centers (static for now)
  const helplines = [
    { name: 'National Suicide Prevention Lifeline', phone: '1-800-273-8255' },
    { name: 'Crisis Text Line', text: 'Text HOME to 741741' }
  ];
  const centers = [
    { name: 'City Mental Health Clinic', address: '123 Main St', distance: '2.1 km', maps: 'https://maps.google.com/?q=123+Main+St' },
    { name: 'Wellness Hospital', address: '456 Wellness Ave', distance: '3.5 km', maps: 'https://maps.google.com/?q=456+Wellness+Ave' }
  ];
  res.json({
    message: 'Emergency protocol triggered',
    helplines,
    centers
  });
});

// Nearby Resources
router.get('/resources', async (req, res) => {
  // Accept: ?lat=...&lng=... or ?pincode=...
  // For demo, return static resources
  const resources = [
    { name: 'City Mental Health Clinic', address: '123 Main St', type: 'Clinic', distance: '2.1 km', maps: 'https://maps.google.com/?q=123+Main+St' },
    { name: 'Wellness Hospital', address: '456 Wellness Ave', type: 'Hospital', distance: '3.5 km', maps: 'https://maps.google.com/?q=456+Wellness+Ave' },
    { name: 'Certified Therapist - Dr. Smith', address: '789 Therapy Rd', type: 'Therapist', distance: '4.2 km', maps: 'https://maps.google.com/?q=789+Therapy+Rd' }
  ];
  res.json({ resources });
});

// Test History
router.get('/history', authenticateToken, async (req, res) => {
  // Only allow signed-in users
  if (!req.user || !req.user.uid) {
    return res.status(403).json({ error: 'Guests cannot access this feature.' });
  }
  try {
    const db = admin.firestore();
    const snap = await db.collection('users').doc(req.user.uid).collection('history').orderBy('timestamp', 'desc').get();
    const history = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ history });
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

// Initialize Firebase Admin SDK (add your service account key file to backend/config/serviceAccountKey.json)
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware to verify Firebase ID token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = router;
