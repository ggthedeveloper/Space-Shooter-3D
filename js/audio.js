/**
 * ALIEN ASSAULT 3D - SOUND & VOICE SYNTHESIZER ENGINE
 * Web Audio API procedural synthesizer (12 soundtracks, SFX, silenced pi-pi)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.voiceEnabled = false; // Speaking voice narration disabled per user request
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.chimeTimer = null;
    this.synthTimer = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.droneFilter = null;

    // Multi-track procedural calm space music styles: 'ambient', 'starlight', 'synthwave', 'odyssey'
    this.musicStyle = localStorage.getItem('alien_assault_music_style') || 'ambient';

    // Persistent Volume Settings
    this.bgmVolume = parseFloat(localStorage.getItem('alien_assault_bgm_vol') !== null ? localStorage.getItem('alien_assault_bgm_vol') : '0.5');
    this.sfxVolume = parseFloat(localStorage.getItem('alien_assault_sfx_vol') !== null ? localStorage.getItem('alien_assault_sfx_vol') : '0.75');
    this.isMuted = localStorage.getItem('alien_assault_muted') === 'true';
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0.0001 : this.sfxVolume * 0.75;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.isMuted ? 0.0001 : this.bgmVolume * 0.55;
      this.bgmGain.connect(this.masterGain);

      this.startEngineDrone();
      this.startCalmSpaceMusic();
    } catch(e) {
      console.warn("Audio init warning:", e);
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    localStorage.setItem('alien_assault_bgm_vol', this.bgmVolume);
    if (this.bgmGain && this.ctx) {
      const target = this.isMuted ? 0.0001 : this.bgmVolume * 0.55;
      this.bgmGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    if (!this.bgmPlaying && !this.isMuted && this.bgmVolume > 0.01 && this.ctx) {
      this.startCalmSpaceMusic();
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    localStorage.setItem('alien_assault_sfx_vol', this.sfxVolume);
    if (this.sfxGain && this.ctx) {
      const target = this.isMuted ? 0.0001 : this.sfxVolume * 0.75;
      this.sfxGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('alien_assault_muted', this.isMuted);
    this.setBgmVolume(this.bgmVolume);
    this.setSfxVolume(this.sfxVolume);
    return this.isMuted;
  }

  resume() {
    try {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    } catch(e) {}
  }

  speak(text) {
    // Speaking voice narration has been completely removed per user request.
    // Audio telemetry chimes and visual toasts provide clean tactical feedback.
    return;
  }

  setMusicStyle(style) {
    const valid = [
      'ambient', 'starlight', 'synthwave', 'odyssey', 'pulsar',
      'interstellar', 'hyperspace', 'darkmatter', 'supernova',
      'solarsun', 'andromeda', 'boss', 'auto'
    ];
    if (!valid.includes(style)) style = 'ambient';
    this.musicStyle = style;
    localStorage.setItem('alien_assault_music_style', style);
    if (this.bgmPlaying) {
      this.crossfadeToTrack(style);
    }
  }

  crossfadeToTrack(newStyle) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.7);
      setTimeout(() => {
        this.stopCalmSpaceMusic();
        this.startCalmSpaceMusic(newStyle);
        if (this.ctx && this.bgmGain) {
          const t = this.ctx.currentTime;
          const targetVol = this.isMuted ? 0.0001 : (this.bgmVolume || 0.35);
          this.bgmGain.gain.setValueAtTime(0.0001, t);
          this.bgmGain.gain.linearRampToValueAtTime(targetVol, t + 0.8);
        }
      }, 750);
    } catch(e) {
      this.stopCalmSpaceMusic();
      this.startCalmSpaceMusic(newStyle);
    }
  }

  nextTrack() {
    const list = [
      'interstellar', 'hyperspace', 'ambient', 'starlight',
      'synthwave', 'darkmatter', 'odyssey', 'supernova',
      'pulsar', 'solarsun', 'andromeda', 'boss'
    ];
    let cur = (this.musicStyle === 'auto' ? this.currentAutoTrack : this.musicStyle) || 'ambient';
    let idx = list.indexOf(cur);
    let next = list[(idx + 1) % list.length];
    if (this.musicStyle === 'auto') {
      this.currentAutoTrack = next;
      this.crossfadeToTrack(next);
    } else {
      this.setMusicStyle(next);
    }
    if (typeof syncMusicStyleUI === 'function') {
      syncMusicStyleUI(this.musicStyle === 'auto' ? this.currentAutoTrack : this.musicStyle);
    }
  }

  stopCalmSpaceMusic() {
    this.bgmPlaying = false;
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
    if (this.chimeTimer) { clearInterval(this.chimeTimer); this.chimeTimer = null; }
    if (this.synthTimer) { clearInterval(this.synthTimer); this.synthTimer = null; }
    if (this.droneOsc) {
      try { this.droneOsc.stop(); this.droneOsc.disconnect(); } catch(e) {}
      this.droneOsc = null;
    }
  }

  startEngineDrone() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, t);
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(160, t);
      this.engineGain.gain.setValueAtTime(0.08, t);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);
      this.engineOsc.start();
    } catch(e) {}
  }

  updateEngineThrust(speedRatio, boosting) {
    if (!this.engineOsc || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const baseFreq = boosting ? 145 : 65 + speedRatio * 35;
      const baseFilter = boosting ? 420 : 160 + speedRatio * 130;
      const baseVol = boosting ? 0.16 : 0.08 + speedRatio * 0.04;
      this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.08);
      this.engineFilter.frequency.setTargetAtTime(baseFilter, t, 0.08);
      this.engineGain.gain.setTargetAtTime(baseVol, t, 0.08);
    } catch(e) {}
  }

  startBeamHum() {
    if (this.beamOsc || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.beamOsc = this.ctx.createOscillator();
      this.beamGain = this.ctx.createGain();
      this.beamFilter = this.ctx.createBiquadFilter();

      this.beamOsc.type = 'sawtooth';
      this.beamOsc.frequency.setValueAtTime(260, t);
      this.beamFilter.type = 'bandpass';
      this.beamFilter.frequency.setValueAtTime(1250, t);
      this.beamFilter.Q.setValueAtTime(4.0, t);
      this.beamGain.gain.setValueAtTime(0.09, t);

      this.beamOsc.connect(this.beamFilter);
      this.beamFilter.connect(this.beamGain);
      this.beamGain.connect(this.sfxGain);
      this.beamOsc.start(t);
    } catch(e) {}
  }

  stopBeamHum() {
    if (!this.beamOsc || !this.ctx) return;
    try {
      this.beamGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      const osc = this.beamOsc;
      this.beamOsc = null;
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); } catch(e) {}
      }, 70);
    } catch(e) {}
  }

  playAlarm() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const startT = now + i * 0.22;
        osc.frequency.setValueAtTime(650, startT);
        osc.frequency.exponentialRampToValueAtTime(320, startT + 0.18);
        gain.gain.setValueAtTime(0.25, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.19);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startT);
        osc.stop(startT + 0.2);
      }
    } catch(e) {}
  }

  playPromotionFanfare() {
    if (!this.ctx || this.isMuted) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const startT = this.ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.25, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startT);
        osc.stop(startT + 0.32);
      });
    } catch(e) {}
  }

  playLaser() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.11);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.11);
    } catch(e) {}
  }

  playRailgun() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.32);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch(e) {}
  }

  playFlak() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch(e) {}
  }

  playMissileLaunch() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.25);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch(e) {}
  }

  playExplosion(intensity = 1.0) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const dur = 0.28 * intensity;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 * intensity, t);
      filter.frequency.exponentialRampToValueAtTime(45, t + dur);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * Math.min(intensity, 1.8), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    } catch(e) {}
  }

  playShieldHit() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch(e) {}
  }

  playEmpBlast() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1450, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.65);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.7);
    } catch(e) {}
  }

  playPowerup() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        gain.gain.setValueAtTime(0.12, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.15);
      });
    } catch(e) {}
  }

  playOvercharge() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.45);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch(e) {}
  }

  playAchievementChime() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0.18, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.35);
      });
    } catch(e) {}
  }

  playBeep() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.04);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch(e) {}
  }

  playCommsBeep() {
    // Disabled to completely remove repetitive irritating pi-pi sound
    return;
  }

  playTorpedoLaunch() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.28);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch(e) {}
  }

  playTeslaZap() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850 + Math.random() * 400, t);
      osc.frequency.linearRampToValueAtTime(200, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch(e) {}
  }

  playAlienShieldHit() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.08);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch(e) {}
  }

  playAlienShieldBreak() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.22);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch(e) {}
  }

  playDiveAlert() {
    // Disabled to completely remove repetitive irritating pi-pi sound
    return;
  }

  startCalmSpaceMusic(overrideStyle) {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;

    let style = overrideStyle || this.musicStyle || 'ambient';
    if (style === 'auto') {
      const list = [
        'interstellar', 'hyperspace', 'ambient', 'starlight',
        'synthwave', 'darkmatter', 'odyssey', 'supernova',
        'pulsar', 'solarsun', 'andromeda'
      ];
      this.currentAutoTrack = this.currentAutoTrack || list[Math.floor(Math.random() * list.length)];
      style = this.currentAutoTrack;
    }

    if (style === 'interstellar') {
      this.generateInterstellarJourney();
    } else if (style === 'hyperspace') {
      this.generateHyperspaceDrift();
    } else if (style === 'darkmatter') {
      this.generateDarkMatterInfiltration();
    } else if (style === 'supernova') {
      this.generateSupernovaOverdrive();
    } else if (style === 'solarsun') {
      this.generateSolarFlareSymphony();
    } else if (style === 'andromeda') {
      this.generateAndromedaRequiem();
    } else if (style === 'boss') {
      this.generateTitanIncursion();
    } else if (style === 'starlight') {
      this.generateCelestialStarlight();
    } else if (style === 'synthwave') {
      this.generateCyberneticSynthwave();
    } else if (style === 'odyssey') {
      this.generateDeepSpaceOdyssey();
    } else if (style === 'pulsar') {
      this.generateBattlePulsar();
    } else {
      this.generateCosmicAmbient();
    }
  }

  generateCosmicAmbient() {
    // 1. Deep Celestial Sub-Drone
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55.0, t); // A1 deep drone
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(110, t);
      this.droneGain.gain.setValueAtTime(0.06, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // 2. Calm Ambient Space Chords
    const chords = [
      [73.42, 110.00, 174.61, 261.63, 329.63],
      [58.27, 116.54, 146.83, 220.00, 277.18],
      [65.41, 130.81, 174.61, 220.00, 329.63],
      [65.41, 98.00, 164.81, 220.00, 293.66],
      [49.00, 98.00, 146.83, 174.61, 220.00],
      [55.00, 110.00, 164.81, 196.00, 293.66]
    ];
    const CHORD_DURATION = 6.8;

    const playAmbientChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = chords[this.bgmStep % chords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        chordNotes.forEach((freq, idx) => {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const noteGain = this.ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-3.5, now);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(3.5, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(340 + idx * 50, now);
          filter.frequency.linearRampToValueAtTime(620 + idx * 60, now + 3.2);
          filter.frequency.exponentialRampToValueAtTime(340 + idx * 50, now + CHORD_DURATION + 1.8);
          filter.Q.setValueAtTime(1.4, now);

          const maxVol = (idx === 0) ? 0.075 : 0.045 / Math.sqrt(idx);
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(maxVol, now + 2.2);
          noteGain.gain.setValueAtTime(maxVol, now + 4.5);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 2.0);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGain);

          osc1.start(now);
          osc2.start(now);

          const stopTime = now + CHORD_DURATION + 2.2;
          osc1.stop(stopTime);
          osc2.stop(stopTime);

          setTimeout(() => {
            try { osc1.disconnect(); osc2.disconnect(); filter.disconnect(); noteGain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 2.5) * 1000);
        });
      } catch(e) {}
    };

    playAmbientChord();
    this.bgmTimer = setInterval(playAmbientChord, CHORD_DURATION * 1000);

    // 3. Starlight Twinkle Chimes
    const sparkleNotes = [587.33, 659.25, 698.46, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const triggerStarChime = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const freq = sparkleNotes[Math.floor(Math.random() * sparkleNotes.length)];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, now);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 2.3);

        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 2500);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(() => {
      if (Math.random() > 0.35) {
        triggerStarChime();
        if (Math.random() > 0.6) setTimeout(triggerStarChime, 340);
      }
    }, 3000);
  }

  generateCelestialStarlight() {
    // 1. Shimmer Sub-Drone (High harmonic serene drone)
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(110.0, t); // A2 gentle shimmer
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(260, t);
      this.droneGain.gain.setValueAtTime(0.045, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // 2. Serene Celestial Chords
    const chords = [
      [82.41, 164.81, 246.94, 329.63, 493.88], // EMaj9
      [69.30, 138.59, 207.65, 329.63, 415.30], // C#m9
      [55.00, 110.00, 164.81, 220.00, 329.63], // AMaj7
      [61.74, 123.47, 185.00, 246.94, 370.00], // Badd9
      [51.91, 103.83, 155.56, 207.65, 311.13], // G#m7
      [46.25, 92.50, 138.59, 220.00, 277.18]   // F#m9
    ];
    const CHORD_DURATION = 6.0;

    const playStarlightChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = chords[this.bgmStep % chords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        chordNotes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const noteGain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500 + idx * 80, now);
          filter.frequency.linearRampToValueAtTime(800 + idx * 90, now + 2.8);
          filter.frequency.exponentialRampToValueAtTime(450 + idx * 70, now + CHORD_DURATION + 1.5);
          filter.Q.setValueAtTime(1.0, now);

          const maxVol = (idx === 0) ? 0.055 : 0.035 / Math.sqrt(idx);
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(maxVol, now + 1.8);
          noteGain.gain.setValueAtTime(maxVol, now + 4.0);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 1.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + CHORD_DURATION + 2.0);

          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); noteGain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 2.2) * 1000);
        });
      } catch(e) {}
    };

    playStarlightChord();
    this.bgmTimer = setInterval(playStarlightChord, CHORD_DURATION * 1000);

    // 3. Crystal Bell Arpeggios
    const bellPitches = [659.25, 830.61, 987.77, 1174.66, 1318.51, 1661.22];
    let bellIdx = 0;
    const triggerCrystalBell = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const freq = bellPitches[bellIdx % bellPitches.length];
        bellIdx = (bellIdx + (Math.random() > 0.4 ? 1 : 2)) % bellPitches.length;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.026, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 1.5);

        setTimeout(() => {
          try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        }, 1600);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerCrystalBell, 1400);
  }

  generateCyberneticSynthwave() {
    // 1. Rhythmic 80s Space Synth Pulse
    const bassChords = [
      { root: 110.00, notes: [110.00, 164.81, 220.00, 261.63] }, // Am
      { root: 87.31, notes: [87.31, 130.81, 174.61, 220.00] },   // F
      { root: 98.00, notes: [98.00, 146.83, 196.00, 246.94] },   // G
      { root: 82.41, notes: [82.41, 123.47, 164.81, 196.00] }    // Em
    ];
    let bassChordIndex = 0;
    let stepCount = 0;
    const STEP_MS = 145;

    // Warm Analog Synth Pad
    const playWarmSynthPad = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = bassChords[bassChordIndex % bassChords.length];
        const now = this.ctx.currentTime;
        const padDur = 4.6;

        chord.notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 2, now);
          osc.detune.setValueAtTime((idx % 2 === 0 ? -4 : 4), now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);
          filter.frequency.linearRampToValueAtTime(750, now + 2.2);
          filter.frequency.exponentialRampToValueAtTime(450, now + padDur);
          filter.Q.setValueAtTime(1.8, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.028, now + 1.2);
          gain.gain.setValueAtTime(0.028, now + 3.0);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + padDur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + padDur + 0.1);

          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (padDur + 0.2) * 1000);
        });
      } catch(e) {}
    };

    playWarmSynthPad();
    this.bgmTimer = setInterval(playWarmSynthPad, 4600);

    // Pulse Bass Step
    const playBassStep = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = bassChords[bassChordIndex % bassChords.length];
        stepCount++;
        if (stepCount % 16 === 0) bassChordIndex = (bassChordIndex + 1) % bassChords.length;

        const pattern = [1, 1.5, 2, 1.5];
        const mult = pattern[stepCount % 4];
        const freq = chord.root * mult;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);
        filter.frequency.exponentialRampToValueAtTime(90, now + 0.12);
        filter.Q.setValueAtTime(2.2, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.042, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.14);

        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 200);
      } catch(e) {}
    };

    this.synthTimer = setInterval(playBassStep, STEP_MS);
  }

  generateDeepSpaceOdyssey() {
    // 1. Ultra-Deep Planetary Sub Drone
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(43.65, t); // F0 ultra-deep drone
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(85, t);
      this.droneGain.gain.setValueAtTime(0.075, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // 2. Cinematic Deep Space Minor 9th Pads
    const chords = [
      [65.41, 130.81, 196.00, 233.08, 293.66, 392.00], // Cm9
      [51.91, 103.83, 155.56, 207.65, 261.63, 392.00], // AbMaj9
      [77.78, 155.56, 233.08, 293.66, 349.23, 440.00], // EbMaj9
      [58.27, 116.54, 174.61, 233.08, 349.23, 466.16], // Bbsus2
      [49.00, 98.00, 146.83, 196.00, 246.94, 311.13]   // Gm7
    ];
    const CHORD_DURATION = 8.2;

    const playOdysseyChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = chords[this.bgmStep % chords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        chordNotes.forEach((freq, idx) => {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const noteGain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-2.5, now);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(2.5, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220 + idx * 40, now);
          filter.frequency.linearRampToValueAtTime(540 + idx * 60, now + 4.0);
          filter.frequency.exponentialRampToValueAtTime(200 + idx * 40, now + CHORD_DURATION + 1.8);
          filter.Q.setValueAtTime(2.0, now);

          const maxVol = (idx === 0) ? 0.07 : 0.038 / Math.sqrt(idx);
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(maxVol, now + 3.0);
          noteGain.gain.setValueAtTime(maxVol, now + 5.5);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 2.0);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGain);

          osc1.start(now);
          osc2.start(now);

          const stopTime = now + CHORD_DURATION + 2.2;
          osc1.stop(stopTime);
          osc2.stop(stopTime);

          setTimeout(() => {
            try { osc1.disconnect(); osc2.disconnect(); filter.disconnect(); noteGain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 2.5) * 1000);
        });
      } catch(e) {}
    };

    playOdysseyChord();
    this.bgmTimer = setInterval(playOdysseyChord, CHORD_DURATION * 1000);

    // 3. Deep Space Radar Ping
    const triggerRadarPing = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now); // A6 sonar ping

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 2.9);

        setTimeout(() => {
          try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        }, 3000);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerRadarPing, 4200);
  }

  generateBattlePulsar() {
    // Track 5: Battle Pulsar - High-Energy Driving Space Battle Music
    const battleChords = [
      { root: 73.42, notes: [73.42, 110.00, 146.83, 174.61] }, // Dm
      { root: 65.41, notes: [65.41, 98.00, 130.81, 196.00] },   // C
      { root: 58.27, notes: [58.27, 87.31, 116.54, 174.61] },   // Bb
      { root: 65.41, notes: [65.41, 98.00, 146.83, 196.00] }    // C
    ];
    let chordIdx = 0;
    let pulseStep = 0;
    const STEP_MS = 140;

    // Searing Electronic Synth Pad
    const playBattlePad = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = battleChords[chordIdx % battleChords.length];
        const now = this.ctx.currentTime;
        const dur = 4.2;
        chord.notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 1.5, now);
          osc.detune.setValueAtTime((idx % 2 === 0 ? -5 : 5), now);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(520 + idx * 70, now);
          filter.frequency.linearRampToValueAtTime(1050 + idx * 80, now + 1.8);
          filter.frequency.exponentialRampToValueAtTime(450, now + dur);
          filter.Q.setValueAtTime(2.0, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.024, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + dur + 0.1);
          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (dur + 0.2) * 1000);
        });
      } catch(e) {}
    };

    playBattlePad();
    this.bgmTimer = setInterval(playBattlePad, 4200);

    // Fast Driving Pulse Bass
    const playPulsarStep = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = battleChords[chordIdx % battleChords.length];
        pulseStep++;
        if (pulseStep % 16 === 0) chordIdx = (chordIdx + 1) % battleChords.length;

        const pattern = [1, 1, 2, 1, 1, 1.5, 2, 1.25];
        const freq = chord.root * pattern[pulseStep % pattern.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);
        filter.frequency.exponentialRampToValueAtTime(95, now + 0.11);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.038, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.12);

        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 180);
      } catch(e) {}
    };

    this.synthTimer = setInterval(playPulsarStep, STEP_MS);
  }


  generateInterstellarJourney() {
    // Atmospheric Procedural Space Organ inspired by deep-space exploration
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(43.65, t); // F0 deep gravitational pedal
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(95, t);
      this.droneGain.gain.setValueAtTime(0.075, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // Emotional Space Organ Harmonic Chords (Am9 -> Fmaj7 -> Dm9 -> Em7 -> Cmaj9 -> Gsus4)
    const organChords = [
      [55.00, 110.00, 164.81, 220.00, 261.63, 329.63, 493.88], // Am9
      [43.65, 87.31, 130.81, 174.61, 261.63, 329.63, 392.00],  // Fmaj7
      [73.42, 110.00, 146.83, 220.00, 261.63, 349.23, 440.00], // Dm9
      [82.41, 123.47, 164.81, 246.94, 329.63, 392.00, 493.88], // Em7
      [65.41, 130.81, 196.00, 261.63, 329.63, 392.00, 523.25], // Cmaj9
      [49.00, 98.00, 146.83, 196.00, 293.66, 392.00, 440.00]   // Gsus4
    ];
    const CHORD_DURATION = 8.0;

    const playOrganChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = organChords[this.bgmStep % organChords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        chordNotes.forEach((freq, idx) => {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const osc3 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const noteGain = this.ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-2.8, now);

          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(2.8, now);

          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(freq * 2, now); // Upper harmonic rank

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320 + idx * 45, now);
          filter.frequency.linearRampToValueAtTime(740 + idx * 55, now + 3.8);
          filter.frequency.exponentialRampToValueAtTime(300 + idx * 40, now + CHORD_DURATION + 2.0);
          filter.Q.setValueAtTime(1.6, now);

          const targetVol = (idx === 0) ? 0.052 : (idx === 1 ? 0.042 : 0.026 / Math.sqrt(idx));
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(targetVol, now + 2.4); // Slow majestic build
          noteGain.gain.setValueAtTime(targetVol, now + 5.2);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 2.2);

          osc1.connect(filter);
          osc2.connect(filter);
          osc3.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGain);

          osc1.start(now);
          osc2.start(now);
          osc3.start(now);

          const stopT = now + CHORD_DURATION + 2.4;
          osc1.stop(stopT);
          osc2.stop(stopT);
          osc3.stop(stopT);

          setTimeout(() => {
            try {
              osc1.disconnect(); osc2.disconnect(); osc3.disconnect();
              filter.disconnect(); noteGain.disconnect();
            } catch(e) {}
          }, (CHORD_DURATION + 2.6) * 1000);
        });
      } catch(e) {}
    };

    playOrganChord();
    this.bgmTimer = setInterval(playOrganChord, CHORD_DURATION * 1000);

    // Clockwork Gravitational Pulsar Tick
    const triggerGravitationalTick = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(8.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.016, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.08);
        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 100);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerGravitationalTick, 1250);
  }

  generateTitanIncursion() {
    // Boss Battle: Aggressive Cinematic Brass-Synth Chords & Frantic Battle Bass
    const bossChords = [
      { root: 55.00, notes: [55.00, 82.41, 110.00, 138.59, 164.81] }, // A dim
      { root: 51.91, notes: [51.91, 77.78, 103.83, 130.81, 155.56] }, // G# dim
      { root: 49.00, notes: [49.00, 73.42, 98.00, 123.47, 146.83] },  // G dim
      { root: 58.27, notes: [58.27, 87.31, 116.54, 146.83, 174.61] }  // Bb min
    ];
    let bossChordIdx = 0;
    let bossStep = 0;
    const STEP_MS = 130;

    const playBossPad = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = bossChords[bossChordIdx % bossChords.length];
        const now = this.ctx.currentTime;
        const dur = 3.6;
        chord.notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 1.5, now);
          osc.detune.setValueAtTime(idx % 2 === 0 ? -6 : 6, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(650 + idx * 80, now);
          filter.frequency.linearRampToValueAtTime(1250 + idx * 100, now + 1.2);
          filter.frequency.exponentialRampToValueAtTime(450, now + dur);
          filter.Q.setValueAtTime(3.2, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + dur + 0.1);
          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (dur + 0.2) * 1000);
        });
      } catch(e) {}
    };

    playBossPad();
    this.bgmTimer = setInterval(playBossPad, 3600);

    const playBossBassStep = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = bossChords[bossChordIdx % bossChords.length];
        bossStep++;
        if (bossStep % 16 === 0) bossChordIdx = (bossChordIdx + 1) % bossChords.length;

        const pattern = [1, 1, 1.5, 1, 1, 1.2, 1.5, 2];
        const freq = chord.root * pattern[bossStep % pattern.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);
        filter.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        filter.Q.setValueAtTime(3.5, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.11);
        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 140);
      } catch(e) {}
    };

    this.synthTimer = setInterval(playBossBassStep, STEP_MS);
  }

  generateHyperspaceDrift() {
    // Vangelis / CS-80 Inspired Analog Hyperspace Drift
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(48.99, t); // G0 deep warm root
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(105, t);
      this.droneGain.gain.setValueAtTime(0.07, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // Lush CS-80 Pad Harmony (EbMaj9 -> Gm9 -> AbMaj7 -> Bb6 -> Cm9)
    const driftChords = [
      [77.78, 155.56, 196.00, 233.08, 293.66, 349.23], // EbMaj9
      [49.00, 98.00, 146.83, 196.00, 233.08, 293.66],  // Gm9
      [51.91, 103.83, 155.56, 207.65, 261.63, 311.13], // AbMaj7
      [58.27, 116.54, 146.83, 174.61, 233.08, 293.66], // Bb6
      [65.41, 130.81, 155.56, 196.00, 261.63, 329.63]  // Cm9
    ];
    const CHORD_DURATION = 7.8;

    const playDriftChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = driftChords[this.bgmStep % driftChords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        chordNotes.forEach((freq, idx) => {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-5.5, now);

          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(5.5, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(260 + idx * 50, now);
          filter.frequency.linearRampToValueAtTime(680 + idx * 75, now + 3.2);
          filter.frequency.exponentialRampToValueAtTime(240, now + CHORD_DURATION + 1.8);
          filter.Q.setValueAtTime(2.2, now);

          const vol = (idx === 0) ? 0.048 : (0.026 / Math.sqrt(idx + 1));
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(vol, now + 2.2);
          gain.gain.setValueAtTime(vol, now + 5.0);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 1.9);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc1.start(now);
          osc2.start(now);

          const stopT = now + CHORD_DURATION + 2.0;
          osc1.stop(stopT);
          osc2.stop(stopT);

          setTimeout(() => {
            try { osc1.disconnect(); osc2.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 2.2) * 1000);
        });
      } catch(e) {}
    };

    playDriftChord();
    this.bgmTimer = setInterval(playDriftChord, CHORD_DURATION * 1000);

    // Warm Analog Lead Portamento Echo
    const triggerDriftEcho = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const leadScale = [349.23, 392.00, 466.16, 523.25, 587.33, 698.46];
        const freq1 = leadScale[Math.floor(Math.random() * leadScale.length)];
        const freq2 = leadScale[Math.floor(Math.random() * leadScale.length)];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq1, now);
        osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.8);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.022, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 2.5);
        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 2600);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerDriftEcho, 3600);
  }

  generateDarkMatterInfiltration() {
    // Tense Void & Dark Matter Infiltration Atmospheric Soundscape
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(32.70, t); // C0 low sub-rumble
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(75, t);
      this.droneGain.gain.setValueAtTime(0.08, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    const darkChords = [
      { root: 65.41, notes: [65.41, 130.81, 155.56, 196.00, 246.94] }, // Cm(maj7)
      { root: 51.91, notes: [51.91, 103.83, 146.83, 185.00, 233.08] }, // Ab7b5
      { root: 73.42, notes: [73.42, 146.83, 174.61, 207.65, 261.63] }, // Ddim7
      { root: 49.00, notes: [49.00, 98.00, 138.59, 174.61, 220.00] }   // G7b9
    ];
    let darkIdx = 0;
    let darkStep = 0;
    const CHORD_DURATION = 6.4;

    const playDarkPad = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = darkChords[darkIdx % darkChords.length];
        darkIdx++;
        const now = this.ctx.currentTime;
        chord.notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.detune.setValueAtTime((idx % 2 === 0 ? -4 : 4), now);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(320 + idx * 60, now);
          filter.frequency.linearRampToValueAtTime(620, now + 2.5);
          filter.frequency.exponentialRampToValueAtTime(280, now + CHORD_DURATION + 1.2);
          filter.Q.setValueAtTime(3.8, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.032, now + 1.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 1.5);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + CHORD_DURATION + 1.6);
          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 1.8) * 1000);
        });
      } catch(e) {}
    };

    playDarkPad();
    this.bgmTimer = setInterval(playDarkPad, CHORD_DURATION * 1000);

    // Deep Space Telemetry Chirp (Void Radar)
    const triggerTelemetryChirp = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const chirps = [2489, 3136, 1864, 3729];
        const freq = chirps[Math.floor(Math.random() * chirps.length)];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.exponentialRampToValueAtTime(freq * 0.4, now + 0.08);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.015, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.14);
        setTimeout(() => {
          try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        }, 200);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerTelemetryChirp, 1800);

    // Staccato Void Bass Pulse
    const playDarkBass = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = darkChords[darkIdx % darkChords.length];
        darkStep++;
        const freqs = [chord.root, chord.root, chord.root * 1.5, chord.root];
        const f = freqs[darkStep % freqs.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.038, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.16);
        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 220);
      } catch(e) {}
    };

    this.synthTimer = setInterval(playDarkBass, 240);
  }

  generateSupernovaOverdrive() {
    // 138 BPM Fast-Paced Electro Combat Anthem
    const battleChords = [
      { root: 73.42, notes: [146.83, 220.00, 293.66, 349.23] }, // Dm
      { root: 87.31, notes: [174.61, 261.63, 349.23, 440.00] }, // F
      { root: 58.27, notes: [116.54, 174.61, 233.08, 293.66] }, // Bb
      { root: 65.41, notes: [130.81, 196.00, 261.63, 329.63] }  // C
    ];
    let chordIdx = 0;
    let seqStep = 0;
    const STEP_MS = 108; // 138 BPM 16th notes

    // Power Stab Synth Chords
    const playStab = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = battleChords[chordIdx % battleChords.length];
        const now = this.ctx.currentTime;
        const dur = 1.6;
        chord.notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.detune.setValueAtTime(idx % 2 === 0 ? -8 : 8, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(450, now + dur);
          filter.Q.setValueAtTime(3.0, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + dur + 0.05);
          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (dur + 0.1) * 1000);
        });
      } catch(e) {}
    };

    playStab();
    this.bgmTimer = setInterval(playStab, 1728);

    // Driving 16th-Note Electro Bass Sequence
    const playSequenceStep = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chord = battleChords[chordIdx % battleChords.length];
        seqStep++;
        if (seqStep % 16 === 0) chordIdx = (chordIdx + 1) % battleChords.length;

        const octaves = [1, 1, 2, 1, 1, 2, 1.5, 2, 1, 1, 2, 1, 1.5, 2, 1.25, 2];
        const freq = chord.root * octaves[seqStep % octaves.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(110, now + 0.09);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.042, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.10);
        setTimeout(() => {
          try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 130);
      } catch(e) {}
    };

    this.synthTimer = setInterval(playSequenceStep, STEP_MS);

    // Off-Beat Hi-Hat White Noise Energy
    const playHat = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6500, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.018, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        noise.start(now);
        setTimeout(() => {
          try { noise.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
        }, 60);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(playHat, 216);
  }

  generateSolarFlareSymphony() {
    // Uplifting Neo-Classical Solar Flare Symphony (D Lydian)
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(73.42, t); // D1 root
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(140, t);
      this.droneGain.gain.setValueAtTime(0.065, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    const solarChords = [
      [73.42, 146.83, 220.00, 277.18, 329.63, 440.00], // DMaj9
      [98.00, 196.00, 246.94, 293.66, 369.99, 440.00], // GMaj7#11
      [110.00, 220.00, 277.18, 329.63, 440.00, 493.88],// Aadd9
      [123.47, 246.94, 293.66, 369.99, 440.00, 587.33] // Bm7
    ];
    let solarIdx = 0;
    const CHORD_DURATION = 6.0;

    const playSolarPad = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = solarChords[solarIdx % solarChords.length];
        solarIdx++;
        const now = this.ctx.currentTime;
        chordNotes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350 + idx * 60, now);
          filter.frequency.linearRampToValueAtTime(780, now + 2.5);
          filter.frequency.exponentialRampToValueAtTime(320, now + CHORD_DURATION + 1.2);
          filter.Q.setValueAtTime(1.8, now);

          const vol = (idx === 0) ? 0.045 : (0.024 / Math.sqrt(idx + 1));
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(vol, now + 1.8);
          gain.gain.setValueAtTime(vol, now + 4.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 1.4);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + CHORD_DURATION + 1.5);
          setTimeout(() => {
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {}
          }, (CHORD_DURATION + 1.6) * 1000);
        });
      } catch(e) {}
    };

    playSolarPad();
    this.bgmTimer = setInterval(playSolarPad, CHORD_DURATION * 1000);

    // Shimmering High Bell Waterfall Arpeggios
    let arpIdx = 0;
    const bells = [880.00, 1108.73, 1318.51, 1661.22, 1760.00, 2217.46, 2637.02];
    const playBell = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        arpIdx++;
        const freq = bells[arpIdx % bells.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.016, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.9);
        setTimeout(() => {
          try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        }, 950);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(playBell, 420);
  }

  generateAndromedaRequiem() {
    // Ethereal Space Cathedral Vocal Choir & Andromeda Galaxy Requiem
    try {
      const t = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55.00, t); // A1 choir root
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(110, t);
      this.droneGain.gain.setValueAtTime(0.07, t);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);
      this.droneOsc.start(t);
    } catch(e) {}

    // Sacred Minor-Major Celestial Progressions (Am -> Em -> F -> C -> Dm -> E)
    const choirChords = [
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am
      [82.41, 123.47, 164.81, 246.94, 329.63],  // Em
      [87.31, 130.81, 174.61, 261.63, 349.23],  // F
      [65.41, 130.81, 196.00, 261.63, 329.63],  // C
      [73.42, 110.00, 146.83, 220.00, 293.66],  // Dm
      [82.41, 123.47, 164.81, 207.65, 329.63]   // E
    ];
    const CHORD_DURATION = 8.5;

    const playChoirChord = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted || this.bgmVolume <= 0.01) return;
      try {
        const chordNotes = choirChords[this.bgmStep % choirChords.length];
        this.bgmStep++;
        const now = this.ctx.currentTime;

        // Vowel Formant Filters mimicking human voices ('Oh' / 'Ah')
        chordNotes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const formant1 = this.ctx.createBiquadFilter();
          const formant2 = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.detune.setValueAtTime((idx % 2 === 0 ? -3 : 3), now);

          formant1.type = 'bandpass';
          formant1.frequency.setValueAtTime(550, now); // F1 ~ 550Hz vowel
          formant1.Q.setValueAtTime(4.5, now);

          formant2.type = 'bandpass';
          formant2.frequency.setValueAtTime(1050, now); // F2 ~ 1050Hz vowel
          formant2.Q.setValueAtTime(5.0, now);

          const vol = (idx === 0) ? 0.038 : (0.022 / Math.sqrt(idx + 1));
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(vol, now + 3.0); // Slow breathing swell
          gain.gain.setValueAtTime(vol, now + 5.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION + 2.0);

          osc.connect(formant1);
          osc.connect(formant2);
          formant1.connect(gain);
          formant2.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          const stopT = now + CHORD_DURATION + 2.2;
          osc.stop(stopT);

          setTimeout(() => {
            try {
              osc.disconnect(); formant1.disconnect(); formant2.disconnect(); gain.disconnect();
            } catch(e) {}
          }, (CHORD_DURATION + 2.4) * 1000);
        });
      } catch(e) {}
    };

    playChoirChord();
    this.bgmTimer = setInterval(playChoirChord, CHORD_DURATION * 1000);

    // Ethereal Glass Harmonica Overtones
    const triggerGlassChime = () => {
      if (!this.ctx || !this.bgmPlaying || this.bgmVolume <= 0.02 || this.isMuted) return;
      try {
        const glassNotes = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
        const freq = glassNotes[Math.floor(Math.random() * glassNotes.length)];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.016, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 3.6);
        setTimeout(() => {
          try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        }, 3800);
      } catch(e) {}
    };

    this.chimeTimer = setInterval(triggerGlassChime, 4500);
  }

  playCategoryMusic(category) {
    if (this.currentCategory === category && this.bgmPlaying) return;
    this.currentCategory = category;

    if (this.musicStyle !== 'auto' && this.musicStyle !== undefined) {
      // If user specifically locked to a track, preserve it unless in Boss Battle
      if (category !== 'BOSS_BATTLE') return;
    }

    let track = 'ambient';
    if (category === 'MENU') {
      const menuPool = ['ambient', 'hyperspace', 'andromeda', 'starlight'];
      track = menuPool[Math.floor(Math.random() * menuPool.length)];
    } else if (category === 'NORMAL_BATTLE') {
      const normalPool = ['synthwave', 'interstellar', 'solarsun', 'pulsar'];
      track = normalPool[Math.floor(Math.random() * normalPool.length)];
    } else if (category === 'DEEP_SPACE') {
      const deepPool = ['interstellar', 'hyperspace', 'odyssey', 'andromeda', 'darkmatter'];
      track = deepPool[Math.floor(Math.random() * deepPool.length)];
    } else if (category === 'HIGH_SECTOR') {
      const highPool = ['supernova', 'darkmatter', 'pulsar', 'interstellar'];
      track = highPool[Math.floor(Math.random() * highPool.length)];
    } else if (category === 'BOSS_BATTLE') {
      track = 'boss';
    }
    this.crossfadeToTrack(track);
  }

  // Alias for backward compatibility
  startProceduralBgm() {
    this.startCalmSpaceMusic();
  }
}

export const audio = new SoundEngine();

if (typeof window !== "undefined") {
  window.audio = audio;
  window.SoundEngine = SoundEngine;
}
