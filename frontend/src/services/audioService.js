/**
 * Procedural Web Audio Sound Engine & Spoken Voice Coach for Gamified Fitness
 * Uses standard Web Audio API and Web Speech API (0 external MP3 files needed).
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('sound_enabled') === 'false';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sound_enabled', String(!this.muted));
    return this.muted;
  }

  // Crisp rising beep on completed repetition
  playRepSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // AudioContext policy
    }
  }

  // Triumphant level-up arpeggio
  playLevelUpSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio
      const startTime = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const noteTime = startTime + i * 0.09;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    } catch (e) {}
  }

  // Quest completed chime
  playQuestCompleteSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99]; // C major chord

      chords.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      });
    } catch (e) {}
  }

  // Soft warning chime for posture breakdown
  playPostureWarning() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }
}

/**
 * Spoken Voice Coach Engine using Web Speech API (window.speechSynthesis)
 */
class VoiceCoachEngine {
  constructor() {
    this.voiceMuted = localStorage.getItem('voice_coach_enabled') === 'false';
    this.lastSpokenTimestamp = 0;
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.cachedVoice = null;
  }

  isMuted() {
    return this.voiceMuted;
  }

  toggleMute() {
    this.voiceMuted = !this.voiceMuted;
    localStorage.setItem('voice_coach_enabled', String(!this.voiceMuted));
    if (this.voiceMuted) {
      this.stop();
    }
    return this.voiceMuted;
  }

  getBestVoice() {
    if (this.cachedVoice) return this.cachedVoice;
    if (!this.isSupported) return null;

    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural or English voices
    const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];

    this.cachedVoice = preferred;
    return preferred;
  }

  speak(text, { rate = 1.05, pitch = 1.0, force = false } = {}) {
    if (!this.isSupported || this.voiceMuted || !text) return;

    try {
      if (force) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getBestVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }

  // Throttled form cue speaker to avoid speech pile-up during exercise
  speakFormCue(cueText, minIntervalMs = 2800) {
    if (this.voiceMuted || !cueText) return;
    const now = Date.now();
    if (now - this.lastSpokenTimestamp < minIntervalMs) return;

    this.lastSpokenTimestamp = now;
    // Strip emojis for cleaner speech synthesis
    const cleanText = cueText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[🔥⚠️💡✨⚡]/g, '').trim();
    this.speak(cleanText, { rate: 1.1, force: true });
  }

  speakRepCount(count, target) {
    if (this.voiceMuted) return;

    let text = `${count}`;
    if (count === target) {
      text = `Target reached! Outstanding work!`;
    } else if (count === Math.floor(target / 2)) {
      text = `Halfway there! Keep your form solid!`;
    } else if (count === target - 1) {
      text = `Final rep! Drive through it!`;
    }

    this.speak(text, { rate: 1.15, pitch: 1.05, force: true });
  }

  stop() {
    if (this.isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

export const soundEngine = new SoundEngine();
export const voiceCoach = new VoiceCoachEngine();
