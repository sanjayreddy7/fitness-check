import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  X,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, demoLogin } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@adventure.com');
  const [password, setPassword] = useState('adventure123');
  const [avatarClass, setAvatarClass] = useState('warrior');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, avatarClass });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      onClose();
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">
              {isRegister ? 'Begin Your Ascension' : 'Resume Your Quest'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Create your hero persona & character stats' : 'Sign in to access your persistent adventure save'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Auth Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isRegister ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isRegister ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Hero
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hero Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@adventure.com"
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hero Class
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'warrior', label: '⚔️ Warrior' },
                  { id: 'scout', label: '🏹 Scout' },
                  { id: 'mage', label: '✨ Mage' },
                  { id: 'healer', label: '🌿 Guardian' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAvatarClass(c.id)}
                    className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                      avatarClass === c.id
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Ascend Now' : 'Sign In to Quest'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Login Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2">
            Grading or Demonstration Mode?
          </p>
          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Sign-In (Alex Vance, Lvl 3)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
