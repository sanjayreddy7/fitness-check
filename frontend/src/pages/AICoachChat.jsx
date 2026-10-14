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
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AICoachChat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings ${user?.name || 'Adventurer'}! I am **Coach Nova**, your real-time fitness mentor and biomechanics guide.

Currently, you are at **Level ${user?.level || 3}** with an active **${user?.streak || 3}-day streak**! 

How can I assist your ascension today?
- Ask me for a form check on squats or pushups
- Request a scalable regression if an exercise feels too difficult
- Inquire about recovery, soreness, or post-workout nutrition
- Ask for a quick 15-minute custom routine!`,
      category: 'welcome'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickChips = [
    'How do I maintain good squat form?',
    'Pushups feel too hard, what is an easier alternative?',
    'My muscles are sore today, should I rest or stretch?',
    'Recommend a high-energy 15-minute routine',
    'What should I eat after my workout?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

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
          quickFollowUps: res.quickFollowUps
        };
        setMessages(prev => [...prev, coachMsg]);
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
              Biomechanical form optimization, regression scaling, and recovery science
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Non-Medical Safety Guardrails Active</span>
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickChips.map((chip, idx) => (
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

      {/* Chat Thread Area */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col h-[520px] shadow-2xl">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSafety = msg.category === 'safety_advisory';

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
                  className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs lg:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md rounded-tr-none'
                      : isSafety
                      ? 'bg-amber-950/60 border border-amber-500/50 text-amber-100 rounded-tl-none shadow-lg'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  {isSafety && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2 text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Safety Protocol Triggered</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Quick follow-ups if provided */}
                  {msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
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

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                <span className="ml-2 font-mono text-[11px]">Nova analyzing kinematics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3"
        >
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
