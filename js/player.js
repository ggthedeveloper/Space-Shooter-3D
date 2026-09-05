/**
 * ALIEN ASSAULT 3D - PLAYER CONTROLS & FLIGHT DYNAMICS
 * Starfighter group, flight boundaries, keyboard/touch input, barrel rolls, and damage
 */

import { state } from "./state.js";
import { audio } from "./audio.js";
import { toggleMenuModal, toggleStoreModal, toggleTutorialModal } from "./menu.js";
import { switchWeapon, triggerHyperOvercharge, fireMissile, triggerEmp } from "./weapons.js";
import { updateAimCoordinates, spawnFloatingText, triggerShake, spawnExplosionFX, updateHUD } from "./ui.js";
import { quickRebootAutoAim } from "./progression.js";
import { triggerEmergencyHullProtocol } from "./economy.js";
import { saveGameData } from "./save.js";

const BOUNDS = { minX: -11.5, maxX: 11.5, minY: -3.5, maxY: 6.5, playerZ: 10 };

const playerPointLight = new THREE.PointLight(0x00f0ff, 1.2, 12);
const player = new THREE.Group();
player.position.set(0, 0, BOUNDS.playerZ);
player.add(playerPointLight);

// Controls and Input Handling
const keys = {};
const inputState = { isMouseDown: false, isRightMouseDown: false };
let isMouseDown = false;
let isRightMouseDown = false;
function setMouseDown(val) { isMouseDown = val; inputState.isMouseDown = val; if (typeof window !== "undefined") window.isMouseDown = val; }
function setRightMouseDown(val) { isRightMouseDown = val; inputState.isRightMouseDown = val; if (typeof window !== "undefined") window.isRightMouseDown = val; }

window.addEventListener('keydown', e => {
  audio.init(); audio.resume();
  keys[e.key] = true;
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P' || e.key === 'm' || e.key === 'M') toggleMenuModal();
  if (e.key === 'b' || e.key === 'B') toggleStoreModal();
  if (e.key === 'h' || e.key === 'H') toggleTutorialModal();
  if (e.key === '1') switchWeapon('plasma');
  if (e.key === '2') switchWeapon('railgun');
  if (e.key === '3') switchWeapon('flak');
  if (e.key === '4') switchWeapon('torpedo');
  if (e.key === '5') switchWeapon('tesla');
  if (e.key === 'r' || e.key === 'R') triggerHyperOvercharge();
  if (e.key === 'f' || e.key === 'F') { if (state.running && !state.paused) fireMissile(); }
  if (e.key === 'q' || e.key === 'Q') triggerEmp();
  if (e.key === 'Shift') triggerBarrelRoll();
});
window.addEventListener('keyup', e => keys[e.key] = false);

window.addEventListener('wheel', e => {
  const weps = ['plasma', 'railgun', 'flak', 'torpedo', 'tesla'];
  let idx = weps.indexOf(state.activeWeapon);
  if (idx === -1) idx = 0;
  idx = e.deltaY > 0 ? (idx + 1) % weps.length : (idx - 1 + weps.length) % weps.length;
  switchWeapon(weps[idx]);
});

// Manual Aiming Coordinates

// Touch controls for mobile / tablets
const touchAxes = { x: 0, y: 0 };
let joystickTouchId = null;
const touchJoystickZone = document.getElementById('touchJoystickZone');
const touchJoystickKnob = document.getElementById('touchJoystickKnob');

const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
if (isTouchDevice && touchJoystickZone && touchJoystickKnob) {
  const touchCtrl = document.getElementById('touchControls');
  if (touchCtrl) touchCtrl.style.display = 'block';
  touchJoystickZone.addEventListener('touchstart', e => {
    e.preventDefault(); audio.init(); audio.resume();
    joystickTouchId = e.changedTouches[0].identifier;
    updateJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) updateJoystick(touch.clientX, touch.clientY);
      else updateAimCoordinates(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  const endJoystick = e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        joystickTouchId = null;
        touchAxes.x = 0; touchAxes.y = 0;
        touchJoystickKnob.style.transform = `translate(0px, 0px)`;
        break;
      }
    }
  };
  window.addEventListener('touchend', endJoystick);
  window.addEventListener('touchcancel', endJoystick);

  function updateJoystick(cx, cy) {
    const rect = touchJoystickZone.getBoundingClientRect();
    const dx = cx - (rect.left + rect.width / 2);
    const dy = cy - (rect.top + rect.height / 2);
    const dist = Math.min(45, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;
    touchJoystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    touchAxes.x = clampedX / 45;
    touchAxes.y = -clampedY / 45;
  }

  const bindTouch = (id, onDown, onUp) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); audio.init(); audio.resume(); onDown(); });
    btn.addEventListener('touchend', e => { e.preventDefault(); if (onUp) onUp(); });
  };
  bindTouch('touchFireBtn', () => isMouseDown = true, () => isMouseDown = false);
  bindTouch('touchRollBtn', () => triggerBarrelRoll());
  bindTouch('touchMissileBtn', () => fireMissile());
  bindTouch('touchEmpBtn', () => triggerEmp());
  bindTouch('touchOverchargeBtn', () => triggerHyperOvercharge());
  bindTouch('touchAutoAimBtn', () => quickRebootAutoAim());
}

function triggerBarrelRoll() {
  if (state.rollActive || state.hull <= 0) return;
  state.rollActive = true;
  state.rollProgress = 0;
  state.invulnTimer = 0.8;
  audio.playShieldHit();
  spawnFloatingText(player.position, "BARREL ROLL!", "#00e5ff");
}


function damagePlayer(amount) {
  if (state.invulnTimer > 0 || state.hull <= 0) return;
  state.shieldRechargeDelay = 3.5;
  triggerShake(10);

  if (state.shield > 0) {
    audio.playShieldHit();
    player.userData.shieldMat.opacity = 0.55;
    setTimeout(() => { player.userData.shieldMat.opacity = 0.0; }, 120);
    const shieldDmg = Math.min(state.shield, amount);
    state.shield -= shieldDmg;
    amount -= shieldDmg;
  }

  if (amount > 0) {
    state.hull = Math.max(0, state.hull - amount);
    audio.playExplosion(0.8);
    spawnExplosionFX(player.position, 0xff3366, 12, 0.8);
        if (state.hull <= 30 && state.hull > 0) {
      spawnFloatingText(player.position, "⚠️ CRITICAL! EVASIVE ROLL [SHIFT]!", "#ff0055");
    }
    if (state.hull > 0 && (state.hull / state.maxHull) <= 0.20 && !state.emergencyHullUsed && !state.emergencyModalOpen) {
      triggerEmergencyHullProtocol();
    }
  }
  updateHUD();

  // CHECK SHIP LOSS
  if (state.hull <= 0) {
    if (state.lives > 1) {
      state.lives--;
      audio.playExplosion(2.0);
      triggerShake(18);
      spawnExplosionFX(player.position, 0x00f0ff, 40, 1.8);
      state.hull = state.maxHull;
      state.shield = state.maxShield;
      state.invulnTimer = 3.5; // Golden invulnerability bubble
      player.position.set(0, 0, BOUNDS.playerZ);
      state.vx = 0; state.vy = 0;
      spawnFloatingText(player.position, `RESERVE DEPLOYED! (${state.lives} SHIPS LEFT)`, "#00f0ff");
      updateHUD();
    } else {
      state.lives = 0;
      updateHUD();
      playerDestroyed();
    }
  }
}


function playerDestroyed() {
  state.running = false;
  audio.playExplosion(2.5);
  triggerShake(22);
  spawnExplosionFX(player.position, 0x00f0ff, 60, 2.5);
  player.visible = false;

  if (state.score > state.highScore) {
    state.highScore = state.score;
  }
  saveGameData();

  setTimeout(() => {
    const gop = document.getElementById('gameOverPilotName');
    if (gop) gop.textContent = state.pilotName || 'STARFIGHTER ACE';
    const got = document.getElementById('gameOverTitle');
    const gos = document.getElementById('gameOverSubtitle');
    if (got && gos) {
      got.textContent = "MISSION FAILED";
      gos.textContent = "All reserve starfighters lost · Defense perimeter compromised.";
    }
    document.getElementById('finalScoreVal').textContent = state.score;
    document.getElementById('highScoreVal').textContent = state.highScore;
    document.getElementById('finalSectorVal').textContent = state.sector;
    document.getElementById('finalCreditsVal').textContent = `${state.credits} CR`;
    const buyLifeGameOverBtn = document.getElementById('buyLifeGameOverBtn');
    if (buyLifeGameOverBtn) {
      const canAfford = ((state.credits || 0) >= 40000);
      buyLifeGameOverBtn.disabled = !canAfford;
      buyLifeGameOverBtn.style.opacity = canAfford ? '1.0' : '0.5';
      buyLifeGameOverBtn.textContent = canAfford ? 'REINFORCE WITH +1 EXTRA LIFE & RESUME (40,000 CR) 🚀' : 'NEED 40,000 CR TO RESUME MISSION';
    }
    document.getElementById('gameOverModal').classList.add('active');
  }, 1200);
}


export {
  BOUNDS,
  playerPointLight,
  player,
  inputState,
  setMouseDown,
  setRightMouseDown,
  keys,
  isMouseDown,
  isRightMouseDown,
  touchAxes,
  joystickTouchId,
  isTouchDevice,
  triggerBarrelRoll,
  damagePlayer,
  playerDestroyed
};

if (typeof window !== 'undefined') {
  window.player = player;
  window.playerPointLight = playerPointLight;
  window.triggerBarrelRoll = triggerBarrelRoll;
  window.damagePlayer = damagePlayer;
}
