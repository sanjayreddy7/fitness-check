import React, { useState } from 'react';
import {
  Compass,
  Map as MapIcon,
  Sparkles,
  Bot,
  Trophy,
  Activity,
  Flame,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Zap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/audioService';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());

  const handleAudioToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'map', label: 'Adventure Map', icon: MapIcon },
    { id: 'generator', label: 'Workout Studio', icon: Zap },
    { id: 'workout', label: 'CV Live Vision', icon: Compass },
    { id: 'coach', label: 'AI Coach Nova', icon: Bot },
    { id: 'achievements', label: 'Badges & Lore', icon: Trophy },
    { id: 'docs', label: 'Project Viva Docs', icon: BookOpen }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                FITNESS ADVENTURE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                AI + CV
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Final Year Engineering Demonstration</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right User Bar & Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Sound Effect Toggle */}
          <button
            onClick={handleAudioToggle}
            title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all text-xs flex items-center justify-center"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User Status / Auth */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold"
                title={`${user.streak || 1}-day active streak! Streak bonus applied to XP.`}
              >
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>{user.streak || 1}d Streak</span>
              </div>

              {/* Level & XP */}
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 cursor-pointer hover:border-purple-500/40 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow">
                  L{user.level || 1}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user.name || 'Alex Vance'}</div>
                  <div className="text-[10px] font-mono text-purple-300">{user.xp || 0} XP</div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  logout();
                  setActiveTab('login');
                }}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700/60 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40'
                }`}
              >
                Register
              </button>
              <button
                onClick={async () => {
                  await demoLogin();
                  setActiveTab('dashboard');
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                title="1-click demo sign-in for evaluation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="md:hidden flex items-center justify-around gap-1 pt-3 mt-2 border-t border-slate-800/60 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold shrink-0 ${
                isActive ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
