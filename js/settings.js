/**
 * ALIEN ASSAULT 3D - SETTINGS & AUDIO CONTROLS
 * Volume sliders, mute, calm space mode, music style selector, and fullscreen
 */

import { state } from './state.js';
import { audio } from './audio.js';

const volumeBtn = document.getElementById('volumeBtn');
const volumePopover = document.getElementById('volumePopover');
const volumeIcon = document.getElementById('volumeIcon');
const volumeLabel = document.getElementById('volumeLabel');
const hudBgmVolumeSlider = document.getElementById('hudBgmVolumeSlider');
const hudSfxVolumeSlider = document.getElementById('hudSfxVolumeSlider');
const bgmVolumeDisplay = document.getElementById('bgmVolumeDisplay');
const sfxVolumeDisplay = document.getElementById('sfxVolumeDisplay');
const quickMuteBtn = document.getElementById('quickMuteBtn');
const calmPresetBtn = document.getElementById('calmPresetBtn');
const menuBgmVolumeSlider = document.getElementById('bgmVolumeSlider');
const menuSfxVolumeSlider = document.getElementById('sfxVolumeSlider');

function updateVolumeUI() {
  const bgmPercent = Math.round(audio.bgmVolume * 100);
  const sfxPercent = Math.round(audio.sfxVolume * 100);

  if (hudBgmVolumeSlider) hudBgmVolumeSlider.value = audio.bgmVolume;
  if (menuBgmVolumeSlider) menuBgmVolumeSlider.value = audio.bgmVolume;
  if (bgmVolumeDisplay) bgmVolumeDisplay.textContent = `${bgmPercent}%`;

  if (hudSfxVolumeSlider) hudSfxVolumeSlider.value = audio.sfxVolume;
  if (menuSfxVolumeSlider) menuSfxVolumeSlider.value = audio.sfxVolume;
  if (sfxVolumeDisplay) sfxVolumeDisplay.textContent = `${sfxPercent}%`;

  if (audio.isMuted) {
    if (volumeIcon) volumeIcon.textContent = '🔇';
    if (volumeLabel) volumeLabel.textContent = 'MUTED';
    if (quickMuteBtn) {
      quickMuteBtn.textContent = '🔊 UNMUTE';
      quickMuteBtn.style.color = '#00ff88';
      quickMuteBtn.style.borderColor = '#00ff88';
    }
  } else {
    if (volumeIcon) volumeIcon.textContent = audio.bgmVolume > 0 ? '🎵' : '🔈';
    if (volumeLabel) volumeLabel.textContent = `${bgmPercent}%`;
    if (quickMuteBtn) {
      quickMuteBtn.textContent = '🔇 MUTE';
      quickMuteBtn.style.color = '#ff8fa3';
      quickMuteBtn.style.borderColor = '#ff3366';
    }
  }
}

// Initial Sync from saved values
updateVolumeUI();

if (volumeBtn) {
  volumeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.init();
    audio.resume();
    const isVisible = (volumePopover && volumePopover.style.display === 'block');
    if (volumePopover) volumePopover.style.display = isVisible ? 'none' : 'block';
  });
}

if (volumePopover) {
  volumePopover.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Close volume popover when clicking anywhere else
window.addEventListener('click', (e) => {
  if (volumePopover && volumePopover.style.display === 'block') {
    if (!volumePopover.contains(e.target) && e.target !== volumeBtn && !volumeBtn.contains(e.target)) {
      volumePopover.style.display = 'none';
    }
  }
});

// BGM Music Sliders
if (hudBgmVolumeSlider) {
  hudBgmVolumeSlider.addEventListener('input', (e) => {
    audio.init();
    audio.resume();
    audio.setBgmVolume(parseFloat(e.target.value));
    updateVolumeUI();
  });
}
if (menuBgmVolumeSlider) {
  menuBgmVolumeSlider.addEventListener('input', (e) => {
    audio.init();
    audio.resume();
    audio.setBgmVolume(parseFloat(e.target.value));
    updateVolumeUI();
  });
}

// SFX Sliders
if (hudSfxVolumeSlider) {
  hudSfxVolumeSlider.addEventListener('input', (e) => {
    audio.init();
    audio.resume();
    audio.setSfxVolume(parseFloat(e.target.value));
    updateVolumeUI();
  });
}
if (menuSfxVolumeSlider) {
  menuSfxVolumeSlider.addEventListener('input', (e) => {
    audio.init();
    audio.resume();
    audio.setSfxVolume(parseFloat(e.target.value));
    updateVolumeUI();
  });
}

// Quick Mute Toggle
if (quickMuteBtn) {
  quickMuteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.init();
    audio.resume();
    audio.toggleMute();
    updateVolumeUI();
  });
}

// Calm Preset: 75% calm music, 35% SFX
if (calmPresetBtn) {
  calmPresetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.init();
    audio.resume();
    if (audio.isMuted) audio.toggleMute();
    audio.setBgmVolume(0.75);
    audio.setSfxVolume(0.35);
    updateVolumeUI();
  });
}

// Multi-Track Music Style Selectors

const hudMusicStyleSelect = document.getElementById('hudMusicStyleSelect');
const menuMusicStyleSelect = document.getElementById('menuMusicStyleSelect');

function syncMusicStyleUI(style) {
  if (hudMusicStyleSelect) hudMusicStyleSelect.value = style;
  if (menuMusicStyleSelect) menuMusicStyleSelect.value = style;
}

if (hudMusicStyleSelect) {
  hudMusicStyleSelect.value = audio.musicStyle;
  hudMusicStyleSelect.addEventListener('change', (e) => {
    audio.init();
    audio.resume();
    audio.setMusicStyle(e.target.value);
    syncMusicStyleUI(e.target.value);
  });
}

if (menuMusicStyleSelect) {
  menuMusicStyleSelect.value = audio.musicStyle;
  menuMusicStyleSelect.addEventListener('change', (e) => {
    audio.init();
    audio.resume();
    audio.setMusicStyle(e.target.value);
    syncMusicStyleUI(e.target.value);
  });
}
document.getElementById('shakeToggleSelect').addEventListener('change', e => {
  state.screenShake = parseFloat(e.target.value);
});
document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('gameOverModal').classList.remove('active');
  startMission();
});

// Hide controls hint after 8 seconds
setTimeout(() => {
  const hint = document.getElementById('controlsHint');
  if (hint) hint.style.opacity = '0';
}, 8000);

// Automatically prompt combat tutorial on first flight
if (!localStorage.getItem('alien_assault_tutorial_seen')) {
  setTimeout(() => {
    openTutorialModal();
  }, 750);
}

// Touch Controls Handling

// Fullscreen Toggle
const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}

export { updateVolumeUI, syncMusicStyleUI };

if (typeof window !== 'undefined') {
  window.updateVolumeUI = updateVolumeUI;
  window.syncMusicStyleUI = syncMusicStyleUI;
}
