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
        const detectedExerciseCard = detectExerciseCard(normalizedMsg);
        return {
          reply: geminiResponse,
          provider: 'gemini',
          category: detectedExerciseCard ? 'exercise_technique' : 'ai_generated',
          quickFollowUps: generateQuickFollowUps(normalizedMsg),
          exerciseCard: detectedExerciseCard
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
    ],
    exerciseCard: heuristic.exerciseCard || null,
    triageData: heuristic.triageData || null
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
    ],
    triageData: {
      severity: 'high',
      isEmergency: false,
      recommendedAction: 'Immediate cessation of mechanical joint loading',
      domsVsSharp: {
        doms: 'Dull, diffuse muscular ache peaking 24-48 hours post-workout across muscle bellies (normal adaptive hypertrophy response).',
        sharp: 'Stabbing sensations, localized joint popping, shooting pain, or rapid swelling (abnormal, stop immediately).'
      },
      riceProtocol: [
        'Rest: Discontinue training the affected joint or limb immediately.',
        'Ice: Apply cold compress for 15-20 mins if acute inflammation or swelling occurs.',
        'Compress: Gentle elastic wrap to support without restricting blood flow.',
        'Elevate: Keep the limb elevated above heart level when resting.'
      ],
      safeRecoveryAction: 'Active Recovery & Parasympathetic Mobility'
    }
  };
}

function detectExerciseCard(text) {
  if (text.includes('squat') || text.includes('leg form')) {
    return {
      exerciseId: 'squat',
      exerciseName: 'Bodyweight Squats',
      targetJoint: 'Knee Joint (Patellofemoral & Tibiofemoral)',
      targetAngle: '≤ 95° (Parallel Depth)',
      primaryMuscles: ['Quadriceps', 'Gluteus Maximus', 'Core Stabilizers'],
      concentricCue: 'Drive aggressively through your midfoot, extend hips, and squeeze glutes at top lockout.',
      eccentricCue: 'Hinge hips back first, push knees outward in line with second toe, keep chest proud.',
      commonFault: 'Knees caving inward (valgus collapse) or heels lifting off the floor.',
      recommendedReps: 15,
      cvTrackerReady: true
    };
  }

  if (text.includes('pushup') || text.includes('push-up') || text.includes('chest')) {
    return {
      exerciseId: 'pushup',
      exerciseName: 'Standard Pushups',
      targetJoint: 'Elbow Joint (Humeroulnar)',
      targetAngle: '≤ 90° (Chest 2 Inches from Floor)',
      primaryMuscles: ['Pectoralis Major', 'Triceps Brachii', 'Anterior Deltoids', 'Rectus Abdominis'],
      concentricCue: 'Press the floor away with maximum intent; protract shoulder blades at the top.',
      eccentricCue: 'Tuck elbows at a 45° arrow angle relative to torso; avoid 90° shoulder flaring.',
      commonFault: 'Sagging lower back (lumbar hyperextension) or incomplete chest lockout.',
      recommendedReps: 12,
      cvTrackerReady: true
    };
  }

  if (text.includes('jumping jack') || text.includes('jack') || text.includes('cardio')) {
    return {
      exerciseId: 'jumping_jack',
      exerciseName: 'Jumping Jacks',
      targetJoint: 'Shoulder Abduction & Stance Width',
      targetAngle: '≥ 135° (Overhead Abduction)',
      primaryMuscles: ['Calves (Gastrocnemius)', 'Deltoids', 'Cardiovascular Engine'],
      concentricCue: 'Spring dynamically, landing softly on the balls of your feet with knees slightly bent.',
      eccentricCue: 'Sync arm swing with foot rebound; maintain rhythmic continuous breathing.',
      commonFault: 'Stiff-legged landing causing unnecessary knee impact.',
      recommendedReps: 25,
      cvTrackerReady: true
    };
  }

  if (text.includes('curl') || text.includes('bicep') || text.includes('arm')) {
    return {
      exerciseId: 'bicep_curl',
      exerciseName: 'Bicep Curls',
      targetJoint: 'Elbow Flexion',
      targetAngle: '≤ 50° (Peak Contraction)',
      primaryMuscles: ['Biceps Brachii', 'Brachialis', 'Brachioradialis'],
      concentricCue: 'Pin elbows to ribs and rotate wrists upward to maximize bicep contraction.',
      eccentricCue: 'Lower under strict 2-3 second cadence to maximize eccentric tension.',
      commonFault: 'Swinging torso or using lower back momentum to cheat the curl.',
      recommendedReps: 12,
      cvTrackerReady: true
    };
  }

  if (text.includes('plank') || text.includes('core')) {
    return {
      exerciseId: 'plank',
      exerciseName: 'Isometric Plank',
      targetJoint: 'Spine & Pelvic Collinearity',
      targetAngle: '180° (± 15° Straight Line)',
      primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis', 'Gluteals'],
      concentricCue: 'Pull belly button toward spine and squeeze glutes into posterior pelvic tilt.',
      eccentricCue: 'Maintain level shoulders and hips parallel to the floor; breathe steadily.',
      commonFault: 'Hips drooping toward floor or piking up in a high triangle.',
      recommendedReps: 45,
      cvTrackerReady: true
    };
  }

  if (text.includes('lunge') || text.includes('split squat')) {
    return {
      exerciseId: 'lunge',
      exerciseName: 'Forward Lunges',
      targetJoint: 'Lead Knee Flexion & Hip Extension',
      targetAngle: '≤ 95° (Lead Knee Right Angle)',
      primaryMuscles: ['Quadriceps', 'Hamstrings', 'Gluteus Medius', 'Core Stabilizers'],
      concentricCue: 'Drive firmly through your lead heel, extending hips to return to upright standing position.',
      eccentricCue: 'Step forward under control; drop rear knee straight down until 2 inches above ground.',
      commonFault: 'Lead knee shooting excessively beyond toes or torso collapsing forward.',
      recommendedReps: 12,
      cvTrackerReady: true
    };
  }

  return null;
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
      exerciseCard: detectExerciseCard('squat'),
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
      exerciseCard: detectExerciseCard('pushup'),
      text: `Here are the gold-standard cues for **Pushups**:

1. **Hand Placement**: Slightly wider than shoulders, fingers slightly turned out.
2. **Elbow Path**: Keep elbows at a **45-degree arrow angle** relative to your torso—never flare them out at 90 degrees (protects shoulders).
3. **Core Tension**: Squeeze your glutes and pull your ribs down to lock your body into a rigid moving plank.
4. **Depth**: Descend until your chest is approximately 2 inches off the deck.
5. **Full Lockout**: Push the floor away completely at the top, allowing your shoulder blades to spread smoothly.`,
      quickFollowUps: ['Pushups are too hard, what alternative?', 'Diamond pushups tips', 'Check my plank form']
    };
  }

  // Lunge Form
  if (text.includes('lunge') || text.includes('split squat')) {
    return {
      category: 'exercise_technique',
      exerciseCard: detectExerciseCard('lunge'),
      text: `Here is the biomechanical checklist for **Forward & Reverse Lunges**:

1. **Stride Length**: Step forward sufficiently so both knees bend to approximately **90 degrees** at full depth.
2. **Torso Alignment**: Keep your spine upright and chest tall—resist the urge to collapse your ribcage over the lead thigh.
3. **Rear Knee Drop**: Lower your back knee vertically toward the floor until it hovers 2 inches above the surface.
4. **Drive Phase**: Drive through your lead heel and midfoot to return explosively to full standing lockout.
5. **Stability Focus**: Fix your gaze straight ahead and brace your core to prevent knee valgus wobble.

💡 *Camera Vision*: Use CV Tracker to track your lead knee flexion angle in real time!`,
      quickFollowUps: ['Easier lunge regression', 'Squats vs Lunges', 'Launch Camera Lunge Tracker']
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
  if (msg.includes('squat')) return ['Pushup form tips', 'Easier squat regression', 'Launch Camera Squat Tracker'];
  if (msg.includes('pushup')) return ['Diamond pushups', 'Knee pushup tips', 'Check plank form'];
  return ['Help with exercise form', 'Recommend a quest', 'How to recover faster?', 'Active recovery rest'];
}

async function callGeminiAPI(message, userContext) {
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
