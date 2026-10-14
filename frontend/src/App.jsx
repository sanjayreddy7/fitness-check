import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SafetyBanner from './components/SafetyBanner';
import LevelUpModal from './components/LevelUpModal';
import AchievementPopup from './components/AchievementPopup';
import Dashboard from './pages/Dashboard';
import AdventureMap from './pages/AdventureMap';
import WorkoutPlanGenerator from './pages/WorkoutPlanGenerator';
import LiveWorkoutSession from './pages/LiveWorkoutSession';
import AICoachChat from './pages/AICoachChat';
import AchievementsPage from './pages/AchievementsPage';
import ProjectDocumentation from './pages/ProjectDocumentation';
import ProfileSettings from './pages/ProfileSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthModal from './pages/AuthModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentSessionConfig, setCurrentSessionConfig] = useState({
    exercise: 'squat',
    exerciseName: 'Bodyweight Squats',
    reps: 15,
    title: 'Highland Squat Trial'
  });

  const handleStartWorkout = (config) => {
    setCurrentSessionConfig({
      exercise: config.exercise || 'squat',
      exerciseName: config.exerciseName || 'Bodyweight Squats',
      reps: config.reps || 15,
      title: config.title || 'Adventure Training Trial',
      worldId: config.worldId || 'world-1',
      nodeId: config.nodeId || null,
      questId: config.questId || null
    });
    setActiveTab('workout');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      {/* Top Banner and Navigation */}
      <div>
        <SafetyBanner />
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Tab Route Switching */}
        <main className="pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {activeTab === 'map' && (
            <AdventureMap
              setActiveTab={setActiveTab}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {activeTab === 'generator' && (
            <WorkoutPlanGenerator
              setActiveTab={setActiveTab}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {activeTab === 'workout' && (
            <LiveWorkoutSession
              sessionConfig={currentSessionConfig}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'coach' && (
            <AICoachChat />
          )}

          {activeTab === 'achievements' && (
            <AchievementsPage />
          )}

          {activeTab === 'docs' && (
            <ProjectDocumentation />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings />
          )}

          {activeTab === 'login' && (
            <Login setActiveTab={setActiveTab} />
          )}

          {activeTab === 'register' && (
            <Register setActiveTab={setActiveTab} />
          )}
        </main>
      </div>

      {/* Persistent Global Modals */}
      <LevelUpModal />
      <AchievementPopup />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 glass-panel py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AI Fitness Adventure</span>
            <span>• Final Year Engineering Demonstration System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('docs')} className="hover:text-purple-300 transition-colors">
              Viva Documentation
            </button>
            <button onClick={() => setActiveTab('coach')} className="hover:text-cyan-300 transition-colors">
              Coach Nova
            </button>
            <button onClick={() => setActiveTab('map')} className="hover:text-emerald-300 transition-colors">
              World Map
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
