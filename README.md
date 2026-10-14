# ⚔️ AI Fitness Adventure — Intelligent Gamified Fitness & Computer Vision System

> **Final-Year Engineering Project Demonstration System**  
> *An intelligent, interactive, gamified fitness application combining on-device Computer Vision pose estimation, AI-driven adaptive workout generation, narrative RPG realms, and conversational coaching.*

---

## 🌟 Executive Summary & Problem Statement

Modern fitness applications experience user dropout rates exceeding **70% within the first three weeks**. The primary catalysts for abandonment are:
1. **Absence of Real-Time Form Correction**: Exercising at home without trainer supervision risks joint injury and poor biomechanical habits.
2. **Static & Monotonous Routines**: Fixed workout templates fail to adapt when users report high fatigue or effortless execution.
3. **Extrinsic Motivation Deficit**: Generic calorie counters lack immersive engagement and meaningful gamification.

**AI Fitness Adventure** solves these challenges by combining:
- **On-Device Computer Vision Pose Estimation**: Real-time skeletal tracking (MediaPipe 33 landmarks) calculating joint angles locally with 0 video transmission.
- **RPE-Adaptive Workout Synthesizer**: Dynamically scales volume factors (0.8x to 1.2x) based on Perceived Exertion (RPE 1–10).
- **Gamified Fantasy Realms & Quests**: 5 themed worlds, interactive waypoint maps, streak multipliers, and 12 collectible achievement trophies.
- **Coach Nova Conversational Assistant**: Dual-mode AI coach (Google Gemini 1.5 + local heuristic fallback) with non-medical safety guardrails for pain/fatigue reports.

---

## 🏗️ System Architecture & Technology Stack

```
               [ User Webcam & Browser ]
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
  [ MediaPipe Pose Engine ]     [ React 18 / Vite 5 UI ]
  • 33 3D Joint Landmarks       • Glassmorphic Dark HUD
  • Vector Angle Trig (θ)       • Dynamic Waypoint World Map
  • State Machine Debounce      • Web Audio Procedural Synth
            │                           │
            └─────────────┬─────────────┘
                          │ (REST API / JSON Web Tokens)
                          ▼
            [ Node.js / Express Server (Port 5000) ]
            ├─► /api/auth       (JWT + Bcrypt Hashing)
            ├─► /api/workouts   (RPE Adaptive Synthesizer)
            ├─► /api/adventure  (5 Themed Realms + Quests)
            ├─► /api/ai-coach   (Gemini 1.5 + Heuristic NLP)
            └─► /api/analytics  (Weekly Charts & Readiness)
                          │
                          ▼
         [ Atomic Persistent Storage Engine ]
         • Atomic file write: .tmp -> .json
         • Zero-config self-seeding (Alex Vance, Lvl 3)
```

### Technology Matrix
| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS |
| **Icons & Visuals** | Lucide React, Glassmorphism, Responsive SVG Charts |
| **Computer Vision** | MediaPipe Pose (33 Landmarks), HTML5 Canvas 2D |
| **Audio Synthesis** | Web Audio API (Zero external MP3/WAV dependencies) |
| **Backend API** | Node.js, Express 4, CORS, Dotenv |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing |
| **AI Intelligence** | Google Gemini 1.5 Flash + Rule-Based Heuristic Fallback Engine |
| **Data Persistence** | Atomic Transactional JSON Database with in-memory caching |
| **Testing** | Node.js Built-in Test Runner (`node:test`, `node:assert`) |

---

## 📐 Mathematical Biomechanics & Kinematics

### 1. 2D Euclidean Joint Angle Formula
To calculate joint flexion $\theta$ between three anatomical landmarks $A(x_1, y_1)$ [proximal], $B(x_2, y_2)$ [vertex joint], and $C(x_3, y_3)$ [distal]:

$$\theta = \left| \text{atan2}(C_y - B_y, C_x - B_x) - \text{atan2}(A_y - B_y, A_x - B_x) \right| \times \frac{180}{\pi}$$

If $\theta > 180^\circ$, then $\theta = 360^\circ - \theta$.

### 2. State Machine Repetition Counter
To prevent duplicate counts and sensor noise, a 2-stage state machine with temporal debounce is enforced:
- **Squats**:
  - `UP` State: Knee angle $> 160^\circ$
  - `DOWN` State: Knee angle $< 95^\circ$ (Parallel depth verified)
  - `Rep Validated`: Transition `DOWN` $\rightarrow$ `UP` with $\Delta t \ge 500\text{ ms}$.
- **Pushups**:
  - `UP` State: Elbow angle $\ge 155^\circ$
  - `DOWN` State: Elbow angle $\le 90^\circ$ (Chest depth verified)
- **Jumping Jacks**:
  - Shoulder abduction angle $> 135^\circ$ and ankle spread $> 1.25\times$ hip width $\rightarrow$ return to standing with $\Delta t \ge 400\text{ ms}$.

### 3. Non-Linear Leveling Curve
Character leveling uses an exponential progression curve:
$$\text{Level} = \left\lfloor 1 + \sqrt{\frac{\text{Total XP}}{50}} \right\rfloor$$
$$\text{XP Required for Next Level} = \text{Level}^2 \times 50$$

---

## 🎮 Gamified Adventure Realms

1. **Verdant Highlands** *(Level 1+)*: Lush ancient plains focusing on core stability, bodyweight squats, and stamina.
2. **Titan's Forge** *(Level 2+)*: Magma crucibles testing pushup progressive overload, dumbbell presses, and walking lunges.
3. **Aether Peaks** *(Level 3+)*: Floating cloud spires dedicated to high-cadence cardio endurance and jumping jacks.
4. **Sanctuary of Serenity** *(Level 4+)*: Restorative waterfalls focusing on thoracic yoga flows, hamstring mobility, and parasympathetic recovery.
5. **Cyber Matrix** *(Level 5+)*: Holographic overclocked arena for plyometric calisthenics, diamond pushups, and explosive agility.

---

## 🛡️ Safety & Privacy Guardrails

1. **100% Local On-Device CV Processing**: Webcam frames are rendered directly to HTML5 Canvas and processed locally via WebAssembly/WebGL. No video feeds or images are ever stored or transmitted over the network.
2. **Mandatory Non-Medical Disclaimer**: Disclaimers are displayed in the header and workout generator advising users that AI guidance does not constitute clinical therapy.
3. **Automatic Pain Interception**: If a user mentions keywords such as *pain*, *sharp*, *dizziness*, or *swollen* to Coach Nova, the AI immediately halts workout recommendations, delivers an urgent rest advisory, and recommends professional medical evaluation.

---

## 🚀 Quickstart & Demonstration Guide

### Prerequisites
- Node.js (v18+ or v20+ or v26+)
- Modern web browser (Chrome, Edge, Firefox, or Safari) with webcam support

### 1. Install & Verify
```bash
# In backend
cd backend
npm install
npm test

# In frontend
cd ../frontend
npm install
npm run build
```

### 2. Run the Full-Stack Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite dev server starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Demonstration Account

For examiner and professor evaluations, a pre-seeded account is available:
- **Email**: `alex@adventure.com`
- **Password**: `adventure123`
- **Current Rank**: Level 3 Aura Knight (420 XP, 3-Day Streak, 8 Sessions Logged)
- *Or click "Instant Demo Sign-In" on the login modal.*

---

## 🎓 Examination Viva Q&A Guide

**Q1: What happens if the user's browser does not have a webcam or denies permission?**  
*A: The system provides a dual-mode fallback. Users can switch to "Guided Timer Mode", which delivers rhythm pacing, interval timers, technique tips, and manual rep logging without requiring camera access.*

**Q2: How does the AI Coach handle lack of internet or missing API key?**  
*A: The backend integrates an expert heuristic natural language processing engine. If `GEMINI_API_KEY` is not present, the heuristic engine processes user queries, evaluates biomechanical form questions, scales regressions, and enforces safety guardrails without dropping requests.*

**Q3: How are audio sound effects produced without external asset files?**  
*A: The application utilizes the native browser Web Audio API `AudioContext`. Rising sine waves generate repetition beeps, and major arpeggios generate level-up fanfares procedurally with zero network latency and zero external media assets.*

---

## 👥 Authors & Academic Attribution
Developed as an advanced engineering demonstration project showcasing the intersection of **Computer Vision**, **Human-Computer Interaction (HCI)**, **Gamification**, and **Adaptive Artificial Intelligence**.
