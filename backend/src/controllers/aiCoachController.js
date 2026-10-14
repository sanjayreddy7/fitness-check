const db = require('../database/db');
const { getCoachResponse } = require('../services/aiCoachService');

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const user = req.user;
    const coachResult = await getCoachResponse(message, {
      id: user.id,
      name: user.name,
      level: user.level,
      streak: user.streak,
      avatar: user.avatar,
      avatarClass: user.avatarClass,
      fitnessGoals: user.fitnessGoals
    });

    // Save message pair in database
    db.addChatMessage(user.id, {
      role: 'user',
      content: message
    });

    db.addChatMessage(user.id, {
      role: 'assistant',
      content: coachResult.reply,
      provider: coachResult.provider,
      category: coachResult.category
    });

    res.json({
      success: true,
      reply: coachResult.reply,
      provider: coachResult.provider,
      category: coachResult.category,
      quickFollowUps: coachResult.quickFollowUps,
      exerciseCard: coachResult.exerciseCard || null,
      triageData: coachResult.triageData || null
    });
  } catch (err) {
    console.error('AI Coach Chat error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI coach response.',
      reply: 'Coach Nova is currently catching breath. Please try asking again shortly!'
    });
  }
}

function getChatHistory(req, res) {
  try {
    const history = db.getChatHistory(req.user.id);
    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
  }
}

function getQuickTips(req, res) {
  const tips = [
    { title: 'Squat Form Checklist', query: 'How do I perfect my bodyweight squat form?' },
    { title: 'Pushup Regressions', query: 'Pushups feel too hard, what are easier alternatives?' },
    { title: 'Feeling Sore Today', query: 'My muscles are sore today, should I rest or stretch?' },
    { title: 'Quick 15-Min Workout', query: 'Recommend a high-energy 15-minute bodyweight routine' },
    { title: 'Nutrition Fueling', query: 'What should I eat before and after my workout session?' }
  ];
  res.json({
    success: true,
    tips
  });
}

module.exports = {
  chat,
  getChatHistory,
  getQuickTips
};
