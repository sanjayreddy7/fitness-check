import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Flame,
  Award,
  HelpCircle,
  Activity,
  Heart,
  ChevronRight,
  User,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { voiceCoach } from '../services/audioService';

/**
 * Visual Biomechanical Kinematic Diagram Component
 * Renders an animated SVG biomechanical skeleton showing exact joint target angles.
 */
function BiomechanicalKinematicDiagram({ exerciseId = 'squat' }) {
  if (exerciseId === 'squat') {
    return (
      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
        <svg viewBox="0 0 160 110" className="w-36 h-24 shrink-0">
          {/* Ground Floor */}
          <line x1="10" y1="95" x2="150" y2="95" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Spine & Torso (inclined 45deg) */}
          <line x1="60" y1="25" x2="72" y2="55" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="56" cy="18" r="7" fill="#c084fc" />

          {/* Thigh (Femur) parallel to floor */}
          <line x1="72" y1="55" x2="110" y2="58" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          
          {/* Shin (Tibia) */}
          <line x1="110" y1="58" x2="105" y2="95" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
          {/* Foot */}
          <line x1="105" y1="95" x2="120" y2="95" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />

          {/* Angle Arc at Knee */}
          <path d="M 100 58 A 12 12 0 0 1 106 72" fill="none" stroke="#34d399" strokeWidth="2.5" />

          {/* Glowing Joint Nodes */}
          <circle cx="60" cy="25" r="3.5" fill="#ffffff" stroke="#a855f7" strokeWidth="2" /> {/* Shoulder */}
          <circle cx="72" cy="55" r="4.5" fill="#ffffff" stroke="#c084fc" strokeWidth="2" /> {/* Hip */}
          <circle cx="110" cy="58" r="5" fill="#34d399" stroke="#ffffff" strokeWidth="2" className="animate-ping opacity-75" /> {/* Knee */}
          <circle cx="110" cy="58" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="105" cy="95" r="4" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" /> {/* Ankle */}

          {/* Text Labels */}
          <text x="85" y="48" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">90° DEPTH</text>
        </svg>

        <div className="text-[11px] space-y-1">
          <div className="text-emerald-400 font-bold font-mono text-xs">Parallel Squat Standard</div>
          <div className="text-slate-300">• Hip crease level with knee joint</div>
          <div className="text-slate-300">• Knee flexion angle: 90° - 95°</div>
          <div className="text-slate-300">• Tripod foot pressure balanced</div>
        </div>
      </div>
    );
  }

  if (exerciseId === 'pushup') {
    return (
      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
        <svg viewBox="0 0 160 110" className="w-36 h-24 shrink-0">
          {/* Ground */}
          <line x1="10" y1="88" x2="150" y2="88" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />

          {/* Rigid Body Line (Heels to Shoulders) */}
          <line x1="25" y1="84" x2="115" y2="48" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="125" cy="44" r="6.5" fill="#c084fc" />

          {/* Upper Arm & Forearm at 90 deg */}
          <line x1="115" y1="48" x2="128" y2="68" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="128" y1="68" x2="118" y2="88" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />

          {/* Elbow Angle Arc */}
          <path d="M 122 60 A 10 10 0 0 1 124 76" fill="none" stroke="#34d399" strokeWidth="2.5" />

          {/* Joints */}
          <circle cx="25" cy="84" r="3.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" /> {/* Ankle */}
          <circle cx="70" cy="66" r="3.5" fill="#ffffff" stroke="#c084fc" strokeWidth="2" /> {/* Hip */}
          <circle cx="115" cy="48" r="4" fill="#ffffff" stroke="#a855f7" strokeWidth="2" /> {/* Shoulder */}
          <circle cx="128" cy="68" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" /> {/* Elbow */}
          <circle cx="118" cy="88" r="3.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" /> {/* Wrist */}

          <text x="75" y="38" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">90° ELBOW</text>
        </svg>

        <div className="text-[11px] space-y-1">
          <div className="text-emerald-400 font-bold font-mono text-xs">Pushup Arrow Geometry</div>
          <div className="text-slate-300">• Elbow path: 45° to torso</div>
          <div className="text-slate-300">• Chest 2 inches from floor</div>
          <div className="text-slate-300">• Zero lumbar hyperextension</div>
        </div>
      </div>
    );
  }

  if (exerciseId === 'lunge') {
    return (
      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
        <svg viewBox="0 0 160 110" className="w-36 h-24 shrink-0">
          <line x1="10" y1="95" x2="150" y2="95" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />

          {/* Upright Torso */}
          <line x1="75" y1="28" x2="75" y2="60" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="75" cy="20" r="6.5" fill="#c084fc" />

          {/* Lead Leg (90 deg) */}
          <line x1="75" y1="60" x2="108" y2="62" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="108" y1="62" x2="108" y2="95" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rear Leg (90 deg hover) */}
          <line x1="75" y1="60" x2="48" y2="82" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="82" x2="48" y2="92" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

          <circle cx="108" cy="62" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="48" cy="82" r="3.5" fill="#c084fc" stroke="#ffffff" strokeWidth="2" />

          <text x="82" y="52" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">90° FRONT</text>
        </svg>

        <div className="text-[11px] space-y-1">
          <div className="text-emerald-400 font-bold font-mono text-xs">Dual 90° Lunge Stance</div>
          <div className="text-slate-300">• Front knee stacked over midfoot</div>
          <div className="text-slate-300">• Rear knee 2 inches off deck</div>
          <div className="text-slate-300">• Drive through front heel</div>
        </div>
      </div>
    );
  }

  // Generic / Plank / Jumping Jack default
  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
      <svg viewBox="0 0 160 110" className="w-36 h-24 shrink-0">
        <line x1="10" y1="88" x2="150" y2="88" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="30" y1="80" x2="130" y2="80" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        <circle cx="138" cy="76" r="6" fill="#c084fc" />
        <circle cx="30" cy="80" r="4" fill="#06b6d4" />
        <circle cx="75" cy="80" r="4" fill="#a855f7" />
        <circle cx="122" cy="80" r="4" fill="#34d399" />
        <text x="50" y="65" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">180° RIGID</text>
      </svg>
      <div className="text-[11px] space-y-1">
        <div className="text-emerald-400 font-bold font-mono text-xs">Optimal Collinearity</div>
        <div className="text-slate-300">• Spine & hips in neutral line</div>
        <div className="text-slate-300">• Core braced under tension</div>
      </div>
    </div>
  );
}

export default function AICoachChat({ setActiveTab = () => {}, onStartWorkout = () => {} }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings ${user?.name || 'Adventurer'}! I am **Coach Nova**, your real-time fitness mentor and biomechanics specialist.

Currently, you are at **Level ${user?.level || 3}** with an active **${user?.streak || 3}-day streak**!

How can I assist your physical ascension today?
- Ask me for a **biomechanical form check** on squats, pushups, lunges, or planks
- Request a **scalable regression** if an exercise feels too difficult
- Inquire about **muscle soreness, recovery**, or post-workout nutrition
- Request a **personalized 15-minute custom routine**!`,
      category: 'welcome'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState('all');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Categorized Prompt Library
  const promptCategories = [
    { id: 'all', label: 'All Prompts' },
    { id: 'form', label: '🏋️ Biomechanics & CV' },
    { id: 'regressions', label: '🔄 Regressions & Scaling' },
    { id: 'quests', label: '⚡ Dynamic Quests' },
    { id: 'nutrition', label: '🥗 Fuel & Recovery' }
  ];

  const categorizedChips = {
    all: [
      'How do I maintain good squat form?',
      'Pushups feel too hard, what is an easier alternative?',
      'How do I do proper forward lunges?',
      'My muscles are sore today, should I rest or stretch?',
      'Recommend a high-energy 15-minute routine',
      'What should I eat after my workout?'
    ],
    form: [
      'How do I maintain good squat form?',
      'Check my pushup elbow angle & cues',
      'How do I do proper forward lunges?',
      'How to keep a rigid plank line without sagging?',
      'What is the proper cadence for bicep curls?'
    ],
    regressions: [
      'Pushups feel too hard, what is an easier alternative?',
      'Squats hurt my knees, show me a safe regression',
      'Lunges feel unstable, give me a beginner version',
      'Jumping jacks are too jarring, give me low-impact cardio'
    ],
    quests: [
      'Recommend a high-energy 15-minute routine',
      'Give me an intense 20-minute core burner',
      'I have 10 minutes, what quick trial should I do?',
      'Recommend a mobility routine for active recovery'
    ],
    nutrition: [
      'What should I eat after my workout?',
      'How much water and electrolytes do I need daily?',
      'How much protein should I eat per kilogram?',
      'My muscles are sore today, should I rest or stretch?'
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      voiceCoach.stop();
    };
  }, []);

  // Voice Input (Speech-to-Text) using Web Speech API
  const toggleSpeechRecognition = () => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setSpeechError('Could not initialize speech recognition.');
      setIsListening(false);
    }
  };

  // Text-to-Speech: Read Coach Nova's advice aloud
  const handleSpeakMessage = (msgId, text) => {
    if (currentlySpeakingId === msgId) {
      voiceCoach.stop();
      setCurrentlySpeakingId(null);
      return;
    }

    setCurrentlySpeakingId(msgId);
    const cleanSpeech = text
      .replace(/[*#_`>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    voiceCoach.speak(cleanSpeech, {
      force: true,
      rate: 1.05
    });

    const estimatedDurationMs = (cleanSpeech.split(' ').length / 2.5) * 1000 + 1000;
    setTimeout(() => {
      setCurrentlySpeakingId(prev => (prev === msgId ? null : prev));
    }, Math.min(estimatedDurationMs, 25000));
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await api.chatWithCoach(text);
      if (res && res.reply) {
        const coachMsg = {
          id: `coach-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          category: res.category,
          provider: res.provider,
          quickFollowUps: res.quickFollowUps,
          exerciseCard: res.exerciseCard || null,
          triageData: res.triageData || null
        };

        setMessages(prev => [...prev, coachMsg]);

        if (autoSpeakEnabled) {
          handleSpeakMessage(coachMsg.id, res.reply);
        }
      }
    } catch (err) {
      console.error('AI Coach chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I had a momentary sync delay. Please ask your question again!',
          category: 'error'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const launchExerciseTracker = (exerciseId, exerciseName, recommendedReps = 15) => {
    onStartWorkout({
      exercise: exerciseId,
      exerciseName: exerciseName,
      reps: recommendedReps,
      title: `${exerciseName} CV Drill`
    });
    setActiveTab('workout');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Coach Nova</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Active AI Mentor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Biomechanical form optimization, regression scaling, and clinical safety triage
            </p>
          </div>
        </div>

        {/* Audio Toggle & Safety Badge */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
            title="Toggle Hands-Free Spoken Replies"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              autoSpeakEnabled
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {autoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Auto-Speak Voice</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Safety Guardrails Active</span>
          </div>
        </div>
      </div>

      {/* Categorized Prompt Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {promptCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedPromptCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                selectedPromptCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Action Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(categorizedChips[selectedPromptCategory] || categorizedChips.all).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-300 hover:text-white shrink-0 transition-all font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Area */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col h-[580px] shadow-2xl">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSafety = msg.category === 'safety_advisory';
            const isSpeaking = currentlySpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shrink-0 mt-1">
                    <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-xl rounded-2xl p-4 text-xs lg:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md rounded-tr-none'
                      : isSafety
                      ? 'bg-amber-950/60 border border-amber-500/50 text-amber-100 rounded-tl-none shadow-lg'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  {/* Safety Header if triggered */}
                  {isSafety && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2 text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Clinical Safety Guardrail Triggered</span>
                    </div>
                  )}

                  {/* Message Text Content */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Rich Interactive Exercise Guidance Card */}
                  {msg.exerciseCard && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                            <Activity className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">{msg.exerciseCard.exerciseName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">Target: {msg.exerciseCard.targetJoint}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs">
                          {msg.exerciseCard.targetAngle}
                        </span>
                      </div>

                      {/* Visual Biomechanical SVG Kinematic Diagram */}
                      <BiomechanicalKinematicDiagram exerciseId={msg.exerciseCard.exerciseId} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-emerald-400 font-bold uppercase text-[10px] block">Concentric Drive</span>
                          <span className="text-slate-300">{msg.exerciseCard.concentricCue}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-cyan-400 font-bold uppercase text-[10px] block">Eccentric Control</span>
                          <span className="text-slate-300">{msg.exerciseCard.eccentricCue}</span>
                        </div>
                      </div>

                      {msg.exerciseCard.commonFault && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Common Fault:</strong> {msg.exerciseCard.commonFault}</span>
                        </div>
                      )}

                      {/* Action Button Row */}
                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        {msg.exerciseCard.cvTrackerReady && (
                          <button
                            onClick={() => launchExerciseTracker(msg.exerciseCard.exerciseId, msg.exerciseCard.exerciseName, msg.exerciseCard.recommendedReps)}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                          >
                            <Camera className="w-4 h-4 text-white" />
                            <span>Launch Live CV Tracker</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleSendMessage(`What is an easier regression for ${msg.exerciseCard.exerciseName}?`)}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                          <span>Show Regression</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Structured Clinical Safety Triage Card */}
                  {msg.triageData && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-950/70 border border-amber-500/40 space-y-3 shadow-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                        <Info className="w-4 h-4 text-amber-400" />
                        <span>Symptom Triage Assessment</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30">
                          <span className="text-emerald-400 font-bold block mb-1">DOMS (Normal Soreness)</span>
                          <span className="text-slate-300">{msg.triageData.domsVsSharp.doms}</span>
                        </div>
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-rose-500/30">
                          <span className="text-rose-400 font-bold block mb-1">Sharp Joint Strain (Unsafe)</span>
                          <span className="text-slate-300">{msg.triageData.domsVsSharp.sharp}</span>
                        </div>
                      </div>

                      {/* RICE Protocol Checklist */}
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-400">R.I.C.E First-Aid Standard</span>
                        {msg.triageData.riceProtocol.map((step, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* 1-Click Active Recovery Action */}
                      <button
                        onClick={() => {
                          launchExerciseTracker('plank', 'Parasympathetic Breathing & Mobility', 3);
                        }}
                        className="w-full py-2.5 rounded-xl bg-teal-600/40 hover:bg-teal-600/60 border border-teal-500/50 text-teal-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <Heart className="w-3.5 h-3.5 text-teal-400" />
                        <span>Start Gentle Mobility Recovery (Streak Safe)</span>
                      </button>
                    </div>
                  )}

                  {/* Message Action Bar (TTS Speaker & Quick Follow-ups) */}
                  {!isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isSpeaking
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 animate-pulse" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Speak Advice</span>
                          </>
                        )}
                      </button>

                      {/* Quick follow-ups */}
                      {msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {msg.quickFollowUps.map((fu, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(fu)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 border border-slate-700 transition-colors"
                            >
                              {fu}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                <span className="ml-2 font-mono text-[11px]">Nova analyzing biomechanics & kinematics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Status Banner with Animated Equalizer Bars */}
        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div className="flex items-center gap-1 mr-1">
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1 h-5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }} />
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
              <span>Listening to voice... Speak your question clearly</span>
            </div>
            <button
              onClick={toggleSpeechRecognition}
              className="text-[11px] font-bold underline hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{speechError}</span>
            <button onClick={() => setSpeechError(null)} className="text-[11px] font-bold">Dismiss</button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2.5"
        >
          {/* Hands-free Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Stop Listening' : 'Speak Message (Hands-Free Dictation)'}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-purple-500/40'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Nova about exercise form, regressions, recovery, or workouts..."
            className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs lg:text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center gap-2 hover:scale-105"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
