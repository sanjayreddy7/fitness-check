const { AI_PROVIDER, GEMINI_API_KEY } = require('../config/env');
const { getExercises } = require('./exerciseDatabase');

/**
 * AI Fitness Coach Service (Coach Nova)
 * Supports Google Gemini API with seamless, intelligent heuristic expert fallback.
 */

const SYSTEM_PROMPT = `You are Coach Nova, an expert AI fitness coach and physical training mentor in the AI Fitness Adventure application.
Your mission is to guide adventurers through their workouts with enthusiasm, biomechanical precision, and strict safety standards.

Safety & Medical Guidelines:
1. NEVER offer medical diagnoses or replace physical therapy/physicians.
2. If the user mentions sharp pain, joint swelling, dizziness, or chest discomfort, explicitly advise them to STOP immediately, rest, and seek medical attention.
3. When users struggle or ask for easier options, provide clear biomechanical regressions (e.g., knee pushups instead of standard pushups).
4. Keep advice positive, gamified (mentioning XP, energy levels, and adventure quests), concise, and actionable.`;

async function getCoachResponse(message, userContext = {}) {
  const normalizedMsg = (message || '').trim().toLowerCase();

  // 1. Mandatory Safety & Pain Detection Check
  if (detectPainOrInjury(normalizedMsg)) {
    return generatePainSafetyResponse(normalizedMsg);
  }

  // 2. If Gemini API key is configured and AI_PROVIDER is 'gemini', attempt Gemini API call
  if (GEMINI_API_KEY && AI_PROVIDER === 'gemini') {
    try {
      const geminiResponse = await callGeminiAPI(message, userContext);
      if (geminiResponse) {
        return {
          reply: geminiResponse,
          provider: 'gemini',
          category: 'ai_generated',
          quickFollowUps: generateQuickFollowUps(normalizedMsg)
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, transitioning seamlessly to Expert Heuristic Engine:', err.message);
    }
  }

  // 3. Fallback Heuristic Expert Engine
  const heuristic = generateHeuristicResponse(normalizedMsg, userContext);
  return {
    reply: heuristic.text,
    provider: 'heuristic_fallback',
    category: heuristic.category,
    quickFollowUps: heuristic.quickFollowUps || [
      'How is my squat form?',
      'Suggest an easier exercise',
      'How to recover faster?',
      'Recommend a 15-min quest'
    ]
  };
}

function detectPainOrInjury(text) {
  const painKeywords = [
    'pain', 'hurts', 'hurt', 'sharp pain', 'knee pop', 'shoulder impingement',
    'back strain', 'dizzy', 'faint', 'chest pain', 'sprain', 'injury', 'swollen', 'throbbing'
  ];
  return painKeywords.some(keyword => text.includes(keyword));
}

function generatePainSafetyResponse(text) {
  return {
    reply: `⚠️ **Safety First Adventurer!** 

If you are experiencing sharp pain, swelling, dizziness, or joint discomfort, **please stop exercising immediately**. 

- **Do NOT push through pain**: Genuine joint or tendon pain is a signal from your nervous system to rest and protect the joint.
- **R.I.C.E Principle**: Rest, Ice (if acute swelling), Compression, and Elevation.
- **Non-Medical Disclaimer**: I am an AI fitness coach, not a medical doctor or licensed physical therapist. If pain persists beyond 24-48 hours or radiates, please consult a qualified healthcare professional.

Would you like to switch to a gentle **Parasympathetic Breathing Flow** or take a safe **Active Recovery Rest Day**? Rest days preserve your adventure streak!`,
    provider: 'safety_guardrail',
    category: 'safety_advisory',
    quickFollowUps: [
      'Log an Active Recovery Rest Day',
      'Show gentle breathing exercises',
      'When is it safe to resume?'
    ]
  };
}

function generateHeuristicResponse(text, user = {}) {
  const level = user.level || 1;
  const streak = user.streak || 1;
  const currentClass = user.avatar || 'Adventurer';

  // Fatigue / Exhaustion
  if (text.includes('tired') || text.includes('exhausted') || text.includes('sore') || text.includes('fatigue')) {
    return {
      category: 'recovery_guidance',
      text: `Hello ${currentClass}! Fatigue is your muscles signaling that adaptation occurs during **recovery**, not just training. 

Here is my prescription for today:
1. **Active Recovery**: Instead of heavy lifting, perform 10 minutes of gentle cat-cow stretches and child's pose.
2. **Hydration**: Drink 500ml water with electrolytes to support cellular rehydration.
3. **Sleep**: Prioritize 7.5 to 8 hours of restorative sleep tonight.

In our adventure, taking a dedicated rest day gives you **Recovery XP** and keeps your **${streak}-day streak** completely safe!`,
      quickFollowUps: ['Show gentle stretching flow', 'How much protein should I eat?', 'Start 10-min mobility']
    };
  }

  // Squat Form
  if (text.includes('squat') || text.includes('leg form') || text.includes('knees')) {
    return {
      category: 'exercise_technique',
      text: `Here is the biomechanical checklist for a flawless **Bodyweight Squat**:

1. **Stance**: Feet shoulder-width apart, toes flared slightly out (10-15 degrees) to allow room for your pelvis.
2. **First Move**: Initiate by hinging your hips back slightly before bending the knees.
3. **Depth**: Lower until hip crease is level with knee joint (parallel). Keep your chest proud and eyes forward.
4. **Knee Alignment**: Keep your knees pushed out in line with your second toe—do not allow them to collapse inward.
5. **Ascent**: Drive through your entire foot (tripod foot pressure) and squeeze glutes at the top.

💡 *Pro Tip*: Use our **Camera Vision Mode**! It tracks your hip-knee-ankle angles in real time to verify your depth.`,
      quickFollowUps: ['Easier squat alternative', 'How to test pushup form?', 'Launch Camera Squat Tracker']
    };
  }

  // Pushup Form
  if (text.includes('pushup') || text.includes('push-up') || text.includes('chest')) {
    return {
      category: 'exercise_technique',
      text: `Here are the gold-standard cues for **Pushups**:

1. **Hand Placement**: Slightly wider than shoulders, fingers slightly turned out.
2. **Elbow Path**: Keep elbows at a **45-degree arrow angle** relative to your torso—never flare them out at 90 degrees (protects shoulders).
3. **Core Tension**: Squeeze your glutes and pull your ribs down to lock your body into a rigid moving plank.
4. **Depth**: Descend until your chest is approximately 2 inches off the deck.
5. **Full Lockout**: Push the floor away completely at the top, allowing your shoulder blades to spread smoothly.`,
      quickFollowUps: ['Pushups are too hard, what alternative?', 'Diamond pushups tips', 'Check my plank form']
    };
  }

  // Regressions / Easier Alternatives
  if (text.includes('easier') || text.includes('too hard') || text.includes('alternative') || text.includes('struggling') || text.includes('cannot do')) {
    return {
      category: 'exercise_regression',
      text: `Scaling an exercise is a mark of an intelligent athlete, not weakness! Here are proven regressions:

- **Can't do standard pushups?** ➡️ Try **Incline Pushups** (hands elevated on a sturdy table or wall) or **Knee Pushups**. This builds pressing strength with 40% less bodyweight load.
- **Squats hurting or too deep?** ➡️ Try **Box Squats** (sitting back lightly onto a chair and standing up) to master the hip hinge safely.
- **Jumping jacks too jarring?** ➡️ Try **Step Jacks** (stepping each foot out without the jump). Zero impact on knees.

Let me know which exercise you want me to scale down for you!`,
      quickFollowUps: ['Suggest a beginner plan', 'Show box squat tutorial', 'I want gentle cardio']
    };
  }

  // Progressions / Harder Challenges
  if (text.includes('harder') || text.includes('too easy') || text.includes('advance') || text.includes('progression')) {
    return {
      category: 'exercise_progression',
      text: `Ready to push your limits, Adventurer! Here are high-intensity progressions:

- **Squats ➡️ Jump Squats or Bulgarian Split Squats**: Explosive power and single-leg stability.
- **Pushups ➡️ Diamond Pushups or Archer Pushups**: Tremendous tricep and unilateral chest load.
- **Plank ➡️ Plank with Shoulder Taps**: Anti-rotational core stabilization.
- **Jumping Jacks ➡️ Burpee Overdrive**: Maximal heart rate elevation and conditioning.`,
      quickFollowUps: ['Recommend an Advanced Quest', 'How to do diamond pushups?', 'Show Cyber Matrix world']
    };
  }

  // Nutrition / Protein / Diet
  if (text.includes('diet') || text.includes('food') || text.includes('protein') || text.includes('nutrition') || text.includes('water')) {
    return {
      category: 'nutrition_tips',
      text: `Nutrition fuels your physical adventure! Here are the core pillars:

1. **Protein Target**: Aim for approximately 1.4 to 1.8 grams of protein per kilogram of body weight to support muscular repair.
2. **Pre-Workout Fuel**: Consume light carbohydrates (e.g., a banana, oatmeal) 45-60 minutes before training.
3. **Hydration**: Aim for 2.5 to 3.5 liters of clean water daily, adding an extra 500ml on workout days.
4. **Consistency**: Focus on whole, unprocessed foods with plenty of leafy greens and clean proteins.`,
      quickFollowUps: ['Post-workout meal ideas', 'Hydration calculator', 'How to lose body fat safely?']
    };
  }

  // Workout Recommendation
  if (text.includes('recommend') || text.includes('plan') || text.includes('what should i do') || text.includes('today')) {
    return {
      category: 'workout_recommendation',
      text: `Based on your profile (Level ${level} ${currentClass}):

I recommend embarking on the **Highland Power & Core Quest**:
- **Duration**: 20 Minutes
- **Structure**:
  1. 3 mins dynamic joint mobility (Cat-Cow + Torso Twists)
  2. 3 sets of 12 Bodyweight Squats (Camera Tracked!)
  3. 3 sets of 10 Incline or Standard Pushups
  4. 3 sets of 40s Isometric Plank
  5. 3 mins restorative Child's Pose cooldown
- **Reward**: ~85 XP + Streak Bonus!

Ready to begin? Head to the **Workouts** or **Adventure Map** tab!`,
      quickFollowUps: ['Start this workout now', 'Make it 10 minutes instead', 'Give me cardio instead']
    };
  }

  // Default Inspiring Fitness Guidance
  return {
    category: 'general_guidance',
    text: `Greetings Adventurer! I am **Coach Nova**, your real-time fitness mentor. 

Currently, you are at **Level ${level}** with an active **${streak}-day streak**. Every clean repetition you log builds long-term physical resilience, joint health, and energy.

How can I help you excel today?
- Ask me for a real-time form check on squats or pushups
- Request a personalized daily quest (15 to 45 mins)
- Scale down an exercise if it feels too demanding
- Ask about optimal nutrition, hydration, or recovery tactics!`,
    quickFollowUps: [
      'Check my squat form',
      'Suggest an easier exercise',
      'Recommend a 20-min routine',
      'Tips for active recovery'
    ]
  };
}

function generateQuickFollowUps(msg) {
  if (msg.includes('squat')) return ['Pushup form tips', 'Easier squat regression', 'Start camera workout'];
  if (msg.includes('pushup')) return ['Diamond pushups', 'Knee pushup tips', 'Check plank form'];
  return ['Help with exercise form', 'Recommend a quest', 'How to recover faster?', 'Active recovery rest'];
}

async function callGeminiAPI(message, userContext) {
  // Built-in fetch for Node 18+
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nUser Context:\nLevel: ${userContext.level || 1}, Streak: ${userContext.streak || 1}, Class: ${userContext.avatar || 'Warrior'}\n\nUser Question:\n${message}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

module.exports = {
  getCoachResponse
};
