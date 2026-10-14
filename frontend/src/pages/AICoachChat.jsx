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
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { voiceCoach } from '../services/audioService';

export default function AICoachChat({ setActiveTab = () => {}, onStartWorkout = () => {} }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings ${user?.name || 'Adventurer'}! I am **Coach Nova**, your real-time fitness mentor and biomechanics specialist.

Currently, you are at **Level ${user?.level || 3}** with an active **${user?.streak || 3}-day streak**!

How can I assist your physical ascension today?
- Ask me for a **biomechanical form check** on squats, pushups, or planks
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
      'My muscles are sore today, should I rest or stretch?',
      'Recommend a high-energy 15-minute routine',
      'What should I eat after my workout?'
    ],
    form: [
      'How do I maintain good squat form?',
      'Check my pushup elbow angle & cues',
      'How to keep a rigid plank line without sagging?',
      'What is the proper cadence for bicep curls?'
    ],
    regressions: [
      'Pushups feel too hard, what is an easier alternative?',
      'Squats hurt my knees, show me a safe regression',
      'Jumping jacks are too jarring, give me low-impact cardio',
      'How do I scale up to harder bodyweight movements?'
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

  // Clean up speech recognition & voice synthesis on unmount
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
    // Strip markdown formatting for cleaner audio speech
    const cleanSpeech = text
      .replace(/[*#_`>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    voiceCoach.speak(cleanSpeech, {
      force: true,
      rate: 1.05
    });

    // Reset speaking icon when done (approximate or via event)
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

        // Auto-speak if hands-free auto-speak mode is enabled
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
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col h-[560px] shadow-2xl">
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

                      {/* Direct 1-Click Launch CV Pose Tracker Button */}
                      {msg.exerciseCard.cvTrackerReady && (
                        <button
                          onClick={() => launchExerciseTracker(msg.exerciseCard.exerciseId, msg.exerciseCard.exerciseName, msg.exerciseCard.recommendedReps)}
                          className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>Launch Live CV Pose Tracker ({msg.exerciseCard.recommendedReps} Reps)</span>
                        </button>
                      )}
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

        {/* Listening Status Banner if STT active */}
        {isListening && (
          <div className="mb-2 p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening to your voice... Speak your exercise question</span>
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
