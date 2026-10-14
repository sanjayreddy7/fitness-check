import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Shield,
  Layers,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Terminal,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';

export default function ProjectDocumentation() {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      q: '1. What is the core problem statement addressed by this project?',
      a: 'Traditional fitness apps suffer from high abandonment rates (~70% within 3 weeks) due to lack of real-time form feedback, static repetitive workouts, and unengaging user experiences. This project integrates Computer Vision pose estimation for real-time form correction, an adaptive AI workout synthesizer tuned by perceived exertion (RPE), and narrative RPG gamification to promote sustained habit formation.'
    },
    {
      q: '2. How does the Computer Vision Pose Estimation engine work without sending video to a server?',
      a: 'The video stream is captured via HTML5 MediaStream (getUserMedia) directly in the client browser. MediaPipe Pose processes frames 100% locally on-device using WebAssembly/WebGL to extract 33 3D skeletal landmark coordinates (x, y, z, visibility). At no point does raw video or image data leave the client, guaranteeing HIPAA/GDPR-compliant user privacy.'
    },
    {
      q: '3. Explain the mathematical formula used to verify repetition depth and lockout.',
      a: 'Given three joint landmarks A (hip), B (knee), and C (ankle), the joint flexion angle θ is calculated using 2D vector trigonometry: θ = |atan2(Cy - By, Cx - Bx) - atan2(Ay - By, Ax - Bx)| * (180 / π). If θ > 180°, θ = 360° - θ. A repetition is validated using a finite state machine: state transitions from "UP" (angle > 160°) to "DOWN" (angle < 95°) and back to "UP", with a 500ms debounce threshold to eliminate jitter and false reps.'
    },
    {
      q: '4. How does the system handle AI Coach availability when an external LLM API key is absent?',
      a: 'The backend features a resilient dual-mode architecture. If a GEMINI_API_KEY is configured, it sends context-enriched prompts to Gemini 1.5 Flash. If no API key is provided, the request gracefully transitions to an internal Heuristic Expert Engine that parses intent, provides biomechanical cues, suggests exercise regressions, and executes mandatory safety guardrails for pain/fatigue reports without dropping the request.'
    },
    {
      q: '5. How does the Perceived Exertion (RPE) feedback mechanism adapt future workouts?',
      a: 'After completing a session, users rate their difficulty (RPE 1-10). If a user reports high fatigue (RPE ≥ 8 or "Too Hard"), the plan generator scales the volume multiplier to 0.8x and introduces restorative cues. If the session was effortless (RPE ≤ 4 or "Too Easy"), the volume multiplier scales to 1.2x with added progressive overload.'
    },
    {
      q: '6. What architectural pattern governs the persistent database layer?',
      a: 'The system uses an atomic persistent storage engine with in-memory caching and transactional file writing. Writes are saved first to a temporary file (.tmp) before an atomic filesystem rename, ensuring zero corrupted records during sudden process termination or system restarts.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Engineering Viva Companion
            </span>
            <span className="text-xs text-slate-400">Project Defense & System Architecture</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">
            AI Fitness Adventure: Technical Documentation
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mt-1">
            Comprehensive system documentation, architectural diagrams, mathematical kinematics, and viva examination defense notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">Tech Stack</span>
            <div className="text-sm font-black text-purple-300 font-mono">Full-Stack MERN / Vite</div>
          </div>
        </div>
      </div>

      {/* System Architecture Diagram Card */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-6">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>System Architecture & Data Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Frontend Tier */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Code2 className="w-4 h-4" />
              <span>1. Client & CV Engine</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>• <strong>Framework:</strong> React 18, Vite 5, Tailwind CSS</li>
              <li>• <strong>Computer Vision:</strong> MediaPipe 33-Landmark Pose Model</li>
              <li>• <strong>Local Processing:</strong> WebAssembly/WebGL on-device</li>
              <li>• <strong>State Machine:</strong> Biomechanical angle debounce counter</li>
              <li>• <strong>Procedural Audio:</strong> Web Audio API tone synthesis</li>
            </ul>
          </div>

          {/* Backend Tier */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>2. API & AI Services</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>• <strong>Runtime:</strong> Node.js & Express RESTful Server</li>
              <li>• <strong>AI Coach:</strong> Gemini 1.5 + Fallback Heuristic Engine</li>
              <li>• <strong>Plan Generator:</strong> RPE-adaptive workout synthesizer</li>
              <li>• <strong>Gamification:</strong> Non-linear XP curve & badge triggers</li>
              <li>• <strong>Security:</strong> JWT tokens & bcrypt password hashing</li>
            </ul>
          </div>

          {/* Database Tier */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>3. Data & Persistence</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>• <strong>Engine:</strong> Atomic Persistent Storage Engine</li>
              <li>• <strong>Schema:</strong> Users, Workouts, Worlds, Achievements</li>
              <li>• <strong>Reliability:</strong> Atomic rename writes (.tmp to .json)</li>
              <li>• <strong>Zero Config:</strong> Embedded, self-seeding on fresh launch</li>
              <li>• <strong>Pre-seeded:</strong> Demo profile Alex Vance (Level 3)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Biomechanical Kinematics & Mathematical Formulation */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-4">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span>Biomechanical Kinematics & Vector Formulations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-bold text-cyan-300">Joint Angle Calculation:</div>
            <code className="block p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-purple-300">
              θ = |atan2(Cy - By, Cx - Bx) - atan2(Ay - By, Ax - Bx)| * (180 / π)
            </code>
            <p className="text-slate-400 text-[11px]">
              Calculates relative angular flexion between three adjacent anatomical landmarks (e.g. Hip, Knee, Ankle for Squats).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-300">Gamified Leveling Formula:</div>
            <code className="block p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300">
              Level = 1 + floor(sqrt(Total_XP / 50))
            </code>
            <p className="text-slate-400 text-[11px]">
              Square-root progression curve ensuring early levels feel rewarding and higher tiers reflect sustained dedication.
            </p>
          </div>
        </div>
      </div>

      {/* Viva Q&A Accordion */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-4">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <span>Final Year Examination Viva Q&A (Defense Guide)</span>
        </h3>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/70"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left font-bold text-xs lg:text-sm text-white flex items-center justify-between hover:bg-slate-800/60 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen && 'rotate-180 text-cyan-400'}`} />
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
