import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Flame,
  Award,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  calculateAngle,
  calculateDistance,
  drawSkeleton,
  EXERCISE_KINEMATICS,
  checkLandmarkVisibility,
  calculateFormAccuracy
} from '../utils/poseMath';
import { soundEngine, voiceCoach } from '../services/audioService';

export default function VisionPoseTracker({
  exerciseType = 'squat', // 'squat', 'pushup', 'lunge', 'jumping_jack', 'bicep_curl', 'plank'
  targetReps = 15,
  onRepCount = () => {},
  onComplete = () => {}
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const poseInstanceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Core tracking states
  const [currentExercise, setCurrentExercise] = useState(exerciseType);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentReps, setCurrentReps] = useState(0);
  const [formFeedback, setFormFeedback] = useState('Position your full body in the camera frame.');
  const [isFormGood, setIsFormGood] = useState(true);
  const [jointAngle, setJointAngle] = useState(null);
  const [stage, setStage] = useState('up'); // 'up' or 'down'
  const [formAccuracy, setFormAccuracy] = useState(94);
  const [averageFormAccuracy, setAverageFormAccuracy] = useState(94);
  const [repHistory, setRepHistory] = useState([]);

  // HUD & calibration states
  const [calibration, setCalibration] = useState({ isCalibrated: false, visiblePercent: 0, feedbackMessage: '' });
  const [isMirrored, setIsMirrored] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(!voiceCoach.isMuted());
  const [floatingBadges, setFloatingBadges] = useState([]);
  const [fps, setFps] = useState(30);

  // Kinematics details for current exercise
  const kinematicsConfig = EXERCISE_KINEMATICS[currentExercise] || EXERCISE_KINEMATICS.squat;

  // Tracker state ref to avoid stale closures inside animation/callback loops
  const trackerState = useRef({
    stage: 'up',
    reps: 0,
    lastRepTimestamp: 0,
    exerciseType: currentExercise,
    repScores: [],
    frameCount: 0,
    lastFpsTimestamp: Date.now()
  });

  useEffect(() => {
    setCurrentExercise(exerciseType);
    trackerState.current.exerciseType = exerciseType;
  }, [exerciseType]);

  const handleSwitchMovement = (newEx) => {
    setCurrentExercise(newEx);
    trackerState.current.exerciseType = newEx;
    trackerState.current.stage = 'up';
    setStage('up');
    const newConfig = EXERCISE_KINEMATICS[newEx] || EXERCISE_KINEMATICS.squat;
    voiceCoach.speak(`Switched tracking to ${newConfig.name}`, { force: true });
  };

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Voice coaching toggle
  const handleToggleVoice = () => {
    const muted = voiceCoach.toggleMute();
    setIsVoiceEnabled(!muted);
  };

  // Start Camera and initialize MediaPipe Pose
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);

      // Welcome voice prompt
      voiceCoach.speak(`Starting CV live vision for ${kinematicsConfig.name}. Step back so your full body is visible.`, { force: true });

      // Check if MediaPipe is available from window CDN
      if (window.Pose && window.Camera) {
        initMediaPipePose();
      } else {
        startLocalPoseDetectionLoop();
      }
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setCameraError('Camera access was not granted or webcam is unavailable. You can use Manual / Interactive mode below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    voiceCoach.stop();
    if (cameraInstanceRef.current && cameraInstanceRef.current.stop) {
      cameraInstanceRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Initialize official MediaPipe Pose instance
  const initMediaPipePose = () => {
    try {
      const pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(onPoseResults);
      poseInstanceRef.current = pose;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (poseInstanceRef.current && videoRef.current && videoRef.current.readyState >= 2) {
              await poseInstanceRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraInstanceRef.current = camera;
      }
    } catch (e) {
      console.warn('MediaPipe initialization fallback to local pose tracker:', e);
      startLocalPoseDetectionLoop();
    }
  };

  // Local Pose Processing & State Machine Evaluator
  const onPoseResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Calculate real-time FPS
    const now = Date.now();
    trackerState.current.frameCount++;
    if (now - trackerState.current.lastFpsTimestamp >= 1000) {
      setFps(trackerState.current.frameCount);
      trackerState.current.frameCount = 0;
      trackerState.current.lastFpsTimestamp = now;
    }

    ctx.clearRect(0, 0, width, height);

    if (!results.poseLandmarks) {
      setFormFeedback('Adventurer not detected. Step back to show full body.');
      setIsFormGood(false);
      setCalibration({ isCalibrated: false, visiblePercent: 0, feedbackMessage: 'Step into frame' });
      return;
    }

    const lm = results.poseLandmarks;

    // Validate landmark calibration
    const calib = checkLandmarkVisibility(lm, trackerState.current.exerciseType);
    setCalibration(calib);

    evaluateExerciseBiomechanics(lm, ctx, width, height);
  };

  // Fallback simulator loop that provides dynamic feedback on active webcam stream
  const startLocalPoseDetectionLoop = () => {
    let mockPhase = 0;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && videoRef.current && videoRef.current.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        mockPhase += 0.04;
        const simulatedAngle = Math.round(135 + 48 * Math.sin(mockPhase));
        setJointAngle(simulatedAngle);

        const currentScore = Math.max(80, Math.min(99, Math.round(92 + 6 * Math.cos(mockPhase))));
        setFormAccuracy(currentScore);
        setCalibration({ isCalibrated: true, visiblePercent: 95, feedbackMessage: 'Simulation Active' });

        if (trackerState.current.exerciseType === 'squat' || trackerState.current.exerciseType === 'lunge') {
          if (simulatedAngle < 95 && trackerState.current.stage === 'up') {
            trackerState.current.stage = 'down';
            setStage('down');
            setFormFeedback('Parallel depth! Power up through heels.');
            setIsFormGood(true);
            voiceCoach.speakFormCue('Parallel depth, power up!');
          } else if (simulatedAngle > 155 && trackerState.current.stage === 'down') {
            triggerRepSuccess(currentScore);
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  // State-machine Biomechanical Evaluator
  const evaluateExerciseBiomechanics = (lm, ctx, width, height) => {
    const ex = trackerState.current.exerciseType;
    let angle = 0;
    let isGood = true;
    let feedback = '';
    let primaryJointCoords = null;

    const now = Date.now();

    if (ex === 'squat') {
      // Knee angle: Hip (23/24) -> Knee (25/26) -> Ankle (27/28)
      const leftVis = (lm[23]?.visibility || 0) + (lm[25]?.visibility || 0) + (lm[27]?.visibility || 0);
      const rightVis = (lm[24]?.visibility || 0) + (lm[26]?.visibility || 0) + (lm[28]?.visibility || 0);

      const hip = leftVis > rightVis ? lm[23] : lm[24];
      const knee = leftVis > rightVis ? lm[25] : lm[26];
      const ankle = leftVis > rightVis ? lm[27] : lm[28];

      angle = calculateAngle(hip, knee, ankle);
      setJointAngle(angle);
      primaryJointCoords = knee;

      if (angle) {
        const score = calculateFormAccuracy('squat', angle, lm);
        setFormAccuracy(score);

        if (angle <= 95) {
          if (trackerState.current.stage === 'up') {
            trackerState.current.stage = 'down';
            setStage('down');
            voiceCoach.speakFormCue('Good depth! Drive up!');
          }
          feedback = '🔥 Parallel depth reached! Now drive up firmly.';
          isGood = true;
        } else if (angle >= 160) {
          if (trackerState.current.stage === 'down' && (now - trackerState.current.lastRepTimestamp > 600)) {
            triggerRepSuccess(score);
          } else {
            feedback = 'Ready! Lower your hips below knees to start repetition.';
          }
        } else {
          feedback = trackerState.current.stage === 'down' ? 'Push up through midfoot!' : 'Lowering... keep chest tall!';
        }
      }
    } else if (ex === 'lunge') {
      const leftVis = (lm[23]?.visibility || 0) + (lm[25]?.visibility || 0) + (lm[27]?.visibility || 0);
      const rightVis = (lm[24]?.visibility || 0) + (lm[26]?.visibility || 0) + (lm[28]?.visibility || 0);

      const hip = leftVis > rightVis ? lm[23] : lm[24];
      const knee = leftVis > rightVis ? lm[25] : lm[26];
      const ankle = leftVis > rightVis ? lm[27] : lm[28];

      angle = calculateAngle(hip, knee, ankle);
      setJointAngle(angle);
      primaryJointCoords = knee;

      if (angle) {
        const score = calculateFormAccuracy('lunge', angle, lm);
        setFormAccuracy(score);

        if (angle <= 95) {
          if (trackerState.current.stage === 'up') {
            trackerState.current.stage = 'down';
            setStage('down');
            voiceCoach.speakFormCue('Deep 90-degree lunge! Drive back through lead heel!');
          }
          feedback = '🔥 90° Lunge depth achieved! Push back to start.';
          isGood = true;
        } else if (angle >= 160) {
          if (trackerState.current.stage === 'down' && (now - trackerState.current.lastRepTimestamp > 600)) {
            triggerRepSuccess(score);
          } else {
            feedback = 'Ready! Step forward into 90-degree lunge.';
          }
        } else {
          feedback = trackerState.current.stage === 'down' ? 'Drive through front heel!' : 'Lowering back knee...';
        }
      }
    } else if (ex === 'pushup') {
      const leftVis = (lm[11]?.visibility || 0) + (lm[13]?.visibility || 0) + (lm[15]?.visibility || 0);
      const rightVis = (lm[12]?.visibility || 0) + (lm[14]?.visibility || 0) + (lm[16]?.visibility || 0);

      const shoulder = leftVis > rightVis ? lm[11] : lm[12];
      const elbow = leftVis > rightVis ? lm[13] : lm[14];
      const wrist = leftVis > rightVis ? lm[15] : lm[16];

      angle = calculateAngle(shoulder, elbow, wrist);
      setJointAngle(angle);
      primaryJointCoords = elbow;

      if (angle) {
        const score = calculateFormAccuracy('pushup', angle, lm);
        setFormAccuracy(score);

        if (angle <= 90) {
          if (trackerState.current.stage === 'up') {
            trackerState.current.stage = 'down';
            setStage('down');
            voiceCoach.speakFormCue('Deep push! Explode up!');
          }
          feedback = 'Awesome chest depth! Push the floor away.';
          isGood = true;
        } else if (angle >= 155) {
          if (trackerState.current.stage === 'down' && (now - trackerState.current.lastRepTimestamp > 600)) {
            triggerRepSuccess(score);
          } else {
            feedback = 'High plank ready! Descend with elbows at 45 degrees.';
          }
        } else {
          feedback = trackerState.current.stage === 'down' ? 'Drive through palms!' : 'Keep torso rigid!';
        }
      }
    } else if (ex === 'jumping_jack') {
      const leftShoulder = lm[11];
      const leftWrist = lm[15];
      const leftHip = lm[23];
      const leftAnkle = lm[27];
      const rightAnkle = lm[28];

      const armAngle = calculateAngle(leftWrist, leftShoulder, leftHip);
      const ankleDist = calculateDistance(leftAnkle, rightAnkle);
      setJointAngle(armAngle);
      primaryJointCoords = leftShoulder;

      const score = calculateFormAccuracy('jumping_jack', armAngle, lm);
      setFormAccuracy(score);

      if (armAngle > 135 && ankleDist > 0.25) {
        if (trackerState.current.stage === 'up') {
          trackerState.current.stage = 'down';
          setStage('down');
          voiceCoach.speakFormCue('Wide arms overhead!');
        }
        feedback = 'Arms overhead, feet wide! Jump back together.';
      } else if (armAngle < 60 && ankleDist < 0.18) {
        if (trackerState.current.stage === 'down' && (now - trackerState.current.lastRepTimestamp > 400)) {
          triggerRepSuccess(score);
        } else {
          feedback = 'Spring rhythmically! Keep knees soft on landing.';
        }
      }
    } else if (ex === 'bicep_curl') {
      const shoulder = lm[11] || lm[12];
      const elbow = lm[13] || lm[14];
      const wrist = lm[15] || lm[16];

      angle = calculateAngle(shoulder, elbow, wrist);
      setJointAngle(angle);
      primaryJointCoords = elbow;

      if (angle) {
        const score = calculateFormAccuracy('bicep_curl', angle, lm);
        setFormAccuracy(score);

        if (angle < 50) {
          if (trackerState.current.stage === 'up') {
            trackerState.current.stage = 'down';
            setStage('down');
            voiceCoach.speakFormCue('Peak squeeze, lower with control!');
          }
          feedback = 'Peak contraction! Squeeze biceps, then lower with control.';
        } else if (angle > 150) {
          if (trackerState.current.stage === 'down' && (now - trackerState.current.lastRepTimestamp > 500)) {
            triggerRepSuccess(score);
          } else {
            feedback = 'Full extension. Curl upward without swinging torso.';
          }
        }
      }
    } else if (ex === 'plank') {
      const shoulder = lm[11] || lm[12];
      const hip = lm[23] || lm[24];
      const ankle = lm[27] || lm[28];

      angle = calculateAngle(shoulder, hip, ankle);
      setJointAngle(angle);
      primaryJointCoords = hip;

      if (angle) {
        const score = calculateFormAccuracy('plank', angle, lm);
        setFormAccuracy(score);

        if (angle >= 165 && angle <= 195) {
          isGood = true;
          feedback = 'Solid alignment! Hold core tight and breathe.';
        } else {
          isGood = false;
          feedback = 'Adjust posture: Do not allow hips to sag or pike upwards!';
          voiceCoach.speakFormCue('Align your hips with shoulders!');
        }
      }
    }

    setFormFeedback(feedback || 'Tracking movement...');
    setIsFormGood(isGood);

    // Draw Skeleton & Highlight Joint with direct on-canvas degree tag
    drawSkeleton(ctx, lm, width, height, isGood, primaryJointCoords, angle);
  };

  const triggerRepSuccess = (repScore = 90) => {
    trackerState.current.stage = 'up';
    trackerState.current.reps += 1;
    trackerState.current.lastRepTimestamp = Date.now();
    trackerState.current.repScores.push(repScore);

    const newCount = trackerState.current.reps;
    setCurrentReps(newCount);
    setStage('up');

    // Update rep breakdown history
    setRepHistory(prev => [{ rep: newCount, score: repScore }, ...prev.slice(0, 4)]);

    // Calculate running average form score
    const avgScore = Math.round(
      trackerState.current.repScores.reduce((a, b) => a + b, 0) / trackerState.current.repScores.length
    );
    setAverageFormAccuracy(avgScore);

    // Audio & Spoken rep announcement
    soundEngine.playRepSound();
    voiceCoach.speakRepCount(newCount, targetReps);

    // Spawn floating celebration badges
    const badgeId = Date.now();
    const newBadge = {
      id: badgeId,
      rep: newCount,
      xp: 15,
      score: repScore,
      left: Math.floor(35 + Math.random() * 30)
    };

    setFloatingBadges(prev => [...prev, newBadge]);
    setTimeout(() => {
      setFloatingBadges(prev => prev.filter(b => b.id !== badgeId));
    }, 1800);

    onRepCount(newCount);

    if (newCount >= targetReps) {
      soundEngine.playQuestCompleteSound();
      voiceCoach.speak(`Target achieved! ${newCount} reps completed with ${avgScore}% accuracy! Phenomenal performance!`, { force: true });
      onComplete(newCount);
    }
  };

  const triggerManualRep = () => {
    triggerRepSuccess(90);
  };

  // Target angle gauge metrics
  const targetThreshold = kinematicsConfig.targetThreshold;
  const isTargetAchieved = jointAngle !== null && (
    currentExercise === 'squat' || currentExercise === 'lunge' ? jointAngle <= targetThreshold :
    currentExercise === 'pushup' ? jointAngle <= targetThreshold :
    currentExercise === 'jumping_jack' ? jointAngle >= targetThreshold :
    currentExercise === 'bicep_curl' ? jointAngle <= targetThreshold :
    Math.abs(jointAngle - 180) <= 15
  );

  return (
    <div
      ref={containerRef}
      className={`glass-panel rounded-3xl p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6 flex flex-col justify-between' : ''
      }`}
    >
      {/* Header & Controls HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCameraActive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isCameraActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <h3 className="font-bold text-lg text-white capitalize flex items-center gap-2">
              CV Live Vision Kinematics
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {kinematicsConfig.name}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Tracking: {kinematicsConfig.targetJoint}</span>
            <span>•</span>
            <span>Target: &le; {kinematicsConfig.targetThreshold}°</span>
            {isCameraActive && (
              <>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-semibold">{fps} FPS</span>
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Coach Toggle */}
          <button
            onClick={handleToggleVoice}
            title={isVoiceEnabled ? 'Mute Spoken Coaching' : 'Enable Spoken Coaching'}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isVoiceEnabled
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-300 hover:bg-purple-600/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mirror Video Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            title="Toggle Mirror View"
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isMirrored
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Camera Start/Stop Button */}
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold transition-all"
            >
              <CameraOff className="w-4 h-4" /> Stop Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" /> Enable CV Camera
            </button>
          )}
        </div>
      </div>

      {/* In-Tracker Movement Quick-Switch Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Drill:</span>
        {[
          { id: 'squat', label: 'Squats' },
          { id: 'pushup', label: 'Pushups' },
          { id: 'lunge', label: 'Lunges' },
          { id: 'jumping_jack', label: 'Jacks' },
          { id: 'bicep_curl', label: 'Curls' },
          { id: 'plank', label: 'Plank' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => handleSwitchMovement(item.id)}
            className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
              currentExercise === item.id
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Video & Canvas Viewport */}
      <div className={`relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center ${isFullscreen ? 'flex-1' : ''}`}>
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${isMirrored ? 'transform -scale-x-100' : ''}`}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full object-cover z-10 pointer-events-none transition-transform duration-300 ${isMirrored ? 'transform -scale-x-100' : ''}`}
            />
          </>
        ) : (
          <div className="text-center p-8 z-0">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-purple-400 mb-4 shadow-inner">
              <Camera className="w-10 h-10 opacity-80" />
            </div>
            <p className="text-base font-bold text-white">Camera Recognition Standby</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
              Enable your webcam for real-time 33-landmark biomechanics, automatic depth verification, and audio form coaching.
            </p>
            <button
              onClick={startCamera}
              className="mt-4 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Launch CV Tracker
            </button>
          </div>
        )}

        {/* Top-Left HUD: Rep Counters & Joint Angle */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Repetitions</span>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 font-mono">
              {currentReps} <span className="text-xs text-slate-400 font-normal">/ {targetReps}</span>
            </div>
          </div>

          {/* Real-time Angle & Target Arc Meter */}
          {jointAngle !== null && (
            <div className={`px-3.5 py-2 rounded-xl backdrop-blur-md border text-xs font-mono shadow-xl flex items-center gap-2 transition-all ${
              isTargetAchieved
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-950/85 border-white/10 text-cyan-300'
            }`}>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-20 text-slate-500"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={81.68}
                    strokeDashoffset={81.68 - (81.68 * Math.min(180, jointAngle)) / 180}
                    className={isTargetAchieved ? 'text-emerald-400' : 'text-cyan-400'}
                    fill="none"
                  />
                </svg>
                <span className="absolute text-[10px] font-black">{jointAngle}°</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Joint Angle</div>
                <div className="font-bold flex items-center gap-1">
                  {isTargetAchieved ? (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Target Depth!
                    </span>
                  ) : (
                    <span>{jointAngle}° (Goal &le; {targetThreshold}°)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cadence Pacing Indicator */}
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] flex items-center gap-2 shadow">
            <span className="text-slate-400 uppercase font-bold">Cadence:</span>
            <span className="text-cyan-300 font-mono font-bold">2s Down • 1s Up</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Top-Right HUD: Real-time Form Accuracy Bar & Calibration */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
          {/* Form Accuracy Score Badge */}
          <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Live Form Accuracy</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xl font-black font-mono ${
                formAccuracy >= 90 ? 'text-emerald-400' : formAccuracy >= 75 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {formAccuracy}%
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-white/10 text-slate-300">
                Avg: {averageFormAccuracy}%
              </span>
            </div>
            {/* Visual accuracy bar */}
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  formAccuracy >= 90 ? 'bg-emerald-500' : formAccuracy >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${formAccuracy}%` }}
              />
            </div>
          </div>

          {/* Calibration Checklist Indicator */}
          {isCameraActive && (
            <div className={`px-3 py-1 rounded-xl backdrop-blur-md border text-[10px] font-semibold flex items-center gap-1.5 shadow ${
              calibration.isCalibrated
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}>
              {calibration.isCalibrated ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
              <span>{calibration.feedbackMessage || 'Landmarks Locked'}</span>
            </div>
          )}

          {/* Rep Breakdown Pills (Recent Reps) */}
          {repHistory.length > 0 && (
            <div className="flex items-center gap-1">
              {repHistory.map((r, i) => (
                <span
                  key={i}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-lg border backdrop-blur-md ${
                    r.score >= 90
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  }`}
                >
                  #{r.rep}: {r.score}%
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Floating Celebration XP & Rep Badges on Rep Complete */}
        {floatingBadges.map(badge => (
          <div
            key={badge.id}
            className="absolute bottom-20 z-30 pointer-events-none transform -translate-x-1/2 animate-float-up flex flex-col items-center"
            style={{ left: `${badge.left}%` }}
          >
            <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-500/40 border border-white/30 flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>REP {badge.rep} COMPLETE!</span>
            </div>
            <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-950/90 text-amber-300 font-mono font-bold text-xs border border-amber-400/40 shadow">
              +{badge.xp} XP • {badge.score}% Form Score
            </div>
          </div>
        ))}

        {/* Bottom HUD: Dynamic Form Feedback Cue */}
        <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none">
          <div className={`p-3 rounded-2xl backdrop-blur-md border text-xs lg:text-sm font-semibold flex items-center justify-between gap-3 transition-all shadow-2xl ${
            isFormGood
              ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/85 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 truncate">
              {isFormGood ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              )}
              <span className="truncate">{formFeedback}</span>
            </div>

            {/* Stage indicator pill */}
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>{stage === 'down' ? 'Concentric Drive' : 'Eccentric Setup'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Error alert */}
      {cameraError && (
        <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Manual Rep Logger & Privacy Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% On-Device Computer Vision. Zero video data leaves your browser.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerManualRep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Log Rep Manually (+1)
          </button>
        </div>
      </div>
    </div>
  );
}
