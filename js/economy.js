/**
 * ALIEN ASSAULT 3D - ECONOMY & TACTICAL UPGRADES
 * Scrap drops, credit purchases, 40,000 CR extra life, 20,000 CR hull repair, and armory upgrades
 */

import { state } from './state.js';
import { audio } from './audio.js';

function spawnScrapDrop(pos, val) {
  const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffaa00, emissiveIntensity: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);
  scrapDrops.push({ mesh, val });
}

function spawnPowerupItem(pos) {
  const types = ['repair', 'shield', 'missile', 'damage', 'autoaim'];
  const type = types[Math.floor(Math.random() * types.length)];
  const colors = { repair: 0x00ff88, shield: 0x00f0ff, missile: 0xff3366, damage: 0xffd166, autoaim: 0xffaa00 };
  const geo = new THREE.OctahedronGeometry(0.48, 0);
  const mat = new THREE.MeshStandardMaterial({ color: colors[type], emissive: colors[type], emissiveIntensity: 0.85 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);
  powerups.push({ mesh, type, color: colors[type] });
}

function collectPowerup(item) {
  audio.playPowerup();
  spawnExplosionFX(item.mesh.position, item.color, 12, 0.6);

  if (item.type === 'repair') {
    state.hull = Math.min(state.maxHull, state.hull + 35);
    spawnFloatingText(player.position, "+HULL RESTORED", "#00ff88");
  } else if (item.type === 'shield') {
    state.shield = state.maxShield;
    spawnFloatingText(player.position, "SHIELDS FULL", "#00f0ff");
  } else if (item.type === 'missile') {
    state.missileStock = Math.min(state.maxMissiles, state.missileStock + 4);
    spawnFloatingText(player.position, "+4 MISSILES", "#ff3366");
  } else if (item.type === 'damage') {
    state.damageMult += 0.15;
    spawnFloatingText(player.position, "+15% OVERDRIVE!", "#ffd166");
  } else if (item.type === 'autoaim') {
    activateAutoAim(7, "TARGETING CHIP");
  }
  updateHUD();
}

// 3 LIVES RESPAWN PROTOCOL

function buyWingmanDrone(slot) {
  if (slot === 1 && state.credits >= 350 && state.dronesUnlocked < 1) {
    state.credits -= 350;
    state.dronesUnlocked = 1;
    audio.playPowerup();
    audio.speak("Wingman Escort Drone Alpha deployed to port flank.");
    spawnFloatingText(player.position, "DRONE ALPHA DEPLOYED!", "#00f0ff");
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  } else if (slot === 2 && state.credits >= 600 && state.dronesUnlocked === 1) {
    state.credits -= 600;
    state.dronesUnlocked = 2;
    audio.playPowerup();
    audio.speak("Wingman Escort Drone Beta deployed. Dual wingman formation locked.");
    spawnFloatingText(player.position, "DRONE BETA DEPLOYED!", "#ff00ff");
    unlockAchievement('drone_squad');
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyWeaponUpgrade(type) {
  quickUpgrade(type);
}

function quickUpgrade(type) {
  audio.init(); audio.resume();
  let cost = 0;
  const maxTier = 10;

  if (type === 'plasma') {
    cost = state.plasmaTier * 150;
    if (state.plasmaTier >= maxTier) return;
    if (state.credits < cost) {
      spawnFloatingText(player.position, `NEED ${cost} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.plasmaTier++;
    state.damageMult *= 1.22;
    spawnFloatingText(player.position, `⚡ PLASMA OVERCHARGED! (Lv. ${state.plasmaTier})`, "#00f0ff");
  } else if (type === 'railgun') {
    cost = state.railgunTier * 200;
    if (state.railgunTier >= maxTier) return;
    if (state.credits < cost) {
      spawnFloatingText(player.position, `NEED ${cost} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.railgunTier++;
    spawnFloatingText(player.position, `⚡ LASER BEAM POWER Lv. ${state.railgunTier}!`, "#ff00ff");
  } else if (type === 'flak') {
    cost = state.flakTier * 180;
    if (state.flakTier >= maxTier) return;
    if (state.credits < cost) {
      spawnFloatingText(player.position, `NEED ${cost} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.flakTier++;
    spawnFloatingText(player.position, `⚡ FLAK SCATTER POWER Lv. ${state.flakTier}!`, "#ffd166");
  } else if (type === 'torpedo') {
    cost = state.torpedoTier * 220;
    if (state.torpedoTier >= maxTier) return;
    if (state.credits < cost) {
      spawnFloatingText(player.position, `NEED ${cost} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.torpedoTier++;
    spawnFloatingText(player.position, `⚡ PHOTON TORPEDO POWER Lv. ${state.torpedoTier}!`, "#00ffff");
  } else if (type === 'tesla') {
    cost = state.teslaTier * 240;
    if (state.teslaTier >= maxTier) return;
    if (state.credits < cost) {
      spawnFloatingText(player.position, `NEED ${cost} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.teslaTier++;
    spawnFloatingText(player.position, `⚡ TESLA ARC POWER Lv. ${state.teslaTier}!`, "#a855f7");
  }

  if (state.plasmaTier >= 10 || state.railgunTier >= 10 || state.flakTier >= 10 || state.torpedoTier >= 10 || state.teslaTier >= 10) {
    unlockAchievement('max_power');
  }

  audio.playPowerup();
  audio.speak(`${type === 'railgun' ? 'Laser beam' : (type === 'torpedo' ? 'Photon Torpedo' : (type === 'tesla' ? 'Tesla Arc' : type))} power increased`);
  saveGameData();
  updateStoreItemButtons();
  updateHUD();
}


function buyExtraLife() {
  const LIFE_COST = 40000;
  if ((state.credits || 0) < LIFE_COST) {
    if (audio && typeof audio.playDeflect === 'function') audio.playDeflect();
    spawnFloatingText(player ? player.position : { x: 0, y: 0, z: 0 }, "INSUFFICIENT CREDITS (NEED 40,000 CR)!", "#ff3366");
    return;
  }

  state.credits -= LIFE_COST;
  state.lives = (state.lives || 0) + 1;
  state.maxLives = Math.max(state.maxLives || 5, state.lives);

  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  if (audio && typeof audio.speak === 'function') audio.speak("Reserve starfighter deployed to fleet reserves.");
  spawnFloatingText(player ? player.position : { x: 0, y: 0, z: 0 }, `+1 EXTRA LIFE ACQUIRED! (${state.lives} TOTAL)`, "#00ff88");

  saveGameData();
  updateStoreItemButtons();
  updateHUD();

  const pilotRecLives = document.getElementById('pilotRecLives');
  if (pilotRecLives) pilotRecLives.textContent = state.lives;
  const pilotRecCredits = document.getElementById('pilotRecCredits');
  if (pilotRecCredits) pilotRecCredits.textContent = `${(state.credits || 0).toLocaleString()} CR`;
}


function buyExtraLifeFromPilotModal() {
  buyExtraLife();
}


function buyLifeAndContinueFromGameOver() {
  const LIFE_COST = 40000;
  if ((state.credits || 0) < LIFE_COST) {
    if (audio && typeof audio.playDeflect === 'function') audio.playDeflect();
    alert(`Insufficient credits! 40,000 CR required to deploy emergency reserve starfighter (You have ${(state.credits || 0).toLocaleString()} CR).`);
    return;
  }

  state.credits -= LIFE_COST;
  state.lives = 1;
  state.maxLives = Math.max(state.maxLives || 5, state.lives);
  state.hull = state.maxHull;
  state.shield = state.maxShield;
  state.invulnTimer = 4.0;
  state.paused = false;

  const gameOverModal = document.getElementById('gameOverModal');
  if (gameOverModal) gameOverModal.classList.remove('active');

  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  if (audio && typeof audio.playCategoryMusic === 'function') audio.playCategoryMusic('NORMAL_BATTLE');

  spawnFloatingText(player ? player.position : { x: 0, y: 0, z: 0 }, "EMERGENCY STARFIGHTER DEPLOYED (+1 LIFE)! -40,000 CR", "#00ff88");
  saveGameData();
  updateHUD();
}


function buyHullUpgrade() {
  if (state.credits >= 250) {
    state.credits -= 250;
    state.maxHull += 35;
    state.hull = state.maxHull;
    audio.playPowerup();
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyShieldUpgrade() {
  if (state.credits >= 200) {
    state.credits -= 200;
    state.shieldRechargeRate = Math.round(state.shieldRechargeRate * 1.4);
    audio.playPowerup();
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyMagnetUpgrade() {
  if (state.credits >= 150) {
    state.credits -= 150;
    state.magnetRange *= 1.8;
    audio.playPowerup();
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyMissiles() {
  if (state.credits >= 100 && state.missileStock < state.maxMissiles) {
    state.credits -= 100;
    state.missileStock = Math.min(state.maxMissiles, state.missileStock + 4);
    audio.playPowerup();
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyEmpCharge() {
  if (state.credits >= 250 && state.empCharge < 100) {
    state.credits -= 250;
    state.empCharge = 100;
    audio.playPowerup();
    audio.speak("Supernova armed");
    saveGameData();
    updateStoreItemButtons();
    updateHUD();
  }
}


function buyAutoAimReboot() {
  if (state.credits < 120) {
    spawnFloatingText(player.position, "NEED 120 CR TO REBOOT!", "#ff3366");
    return;
  }
  state.credits -= 120;
  saveGameData();
  activateAutoAim(7, "MANUAL OVERDRIVE REBOOT");
}


function handleHangarShipAction(type) {
  selectStarship(type);
}


function selectStarship(type) {
  if (audio) { audio.init(); audio.resume(); }
  checkProgressionUnlocks();
  const def = SHIP_DEFINITIONS[type] || SHIP_DEFINITIONS.valkyrie;
  if (!state.unlockedShips) state.unlockedShips = ['valkyrie'];

  if (state.shipType === type && state.unlockedShips.includes(type)) {
    return;
  }

  if (!state.unlockedShips.includes(type)) {
    const cost = def.cost || 0;
    if (state.credits < cost) {
      if (typeof audio.playDeflect === 'function') audio.playDeflect();
      spawnFloatingText(player.position, `LOCKED - REACH SECTOR ${def.unlockSector} OR ${cost.toLocaleString()} CR!`, "#ff3366");
      return;
    }
    state.credits -= cost;
    state.unlockedShips.push(type);
    saveGameData();
    spawnFloatingText(player.position, `${def.name.toUpperCase()} UNLOCKED!`, "#ffd166");
  }

  setStarship(type);
  saveGameData();
  updateStoreItemButtons();
  if (typeof audio.playPowerup === 'function') audio.playPowerup();
  spawnFloatingText(player.position, `${def.name.toUpperCase()} EQUIPPED!`, "#00ff88");
}


function equipPilotShip(shipId) {
  setStarship(shipId);
  saveGameData();
  if (audio && typeof audio.playBeep === 'function') audio.playBeep();
  renderPilotShipSelectionGrid();
  updatePilotShipDetailUI(shipId);
}


function buyAndEquipPilotShip(shipId) {
  const ship = SHIP_DEFINITIONS[shipId];
  if (!ship) return;
  if ((state.credits || 0) < ship.cost) {
    if (audio && typeof audio.playDeflect === 'function') audio.playDeflect();
    return;
  }
  state.credits -= ship.cost;
  if (!state.unlockedShips) state.unlockedShips = ['valkyrie'];
  if (!state.unlockedShips.includes(shipId)) {
    state.unlockedShips.push(shipId);
  }
  setStarship(shipId);
  saveGameData();
  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  
  const credsEl = document.getElementById('pilotRecCredits');
  if (credsEl) credsEl.textContent = `${state.credits || 0} CR`;
  
  renderPilotShipSelectionGrid();
  updatePilotShipDetailUI(shipId);
  updateHUD();
}


function getEmergencyRepairCost() {
  const s = state.sector || 1;
  if (s <= 10) return 10000;
  if (s <= 20) return 25000;
  if (s <= 30) return 50000;
  if (s <= 50) return 100000;
  if (s <= 75) return 200000;
  if (s <= 100) return 350000;
  return 500000;
}


function triggerEmergencyHullProtocol() {
  if (state.emergencyHullUsed || state.hull <= 0) return;
  const existingToast = document.getElementById('criticalHullToast');
  if (existingToast) return;

  if (audio && typeof audio.playAlarm === 'function') audio.playAlarm();

  const toast = document.createElement('div');
  toast.id = 'criticalHullToast';
  toast.className = 'critical-hull-toast';
  toast.title = 'Click to repair hull for 20,000 credits';
  toast.innerHTML = `
    <div style="font-size: 26px; line-height: 1; animation: pulse 0.8s infinite;">🚨</div>
    <div style="display: flex; flex-direction: column; text-align: left;">
      <div style="font-size: 11px; font-weight: 800; color: #ff3366; letter-spacing: 1px;">⚠️ CRITICAL HULL (≤ 20%)</div>
      <div style="font-size: 10px; color: #fff; font-weight: 700; margin: 1px 0;">CLICK TO REPAIR: <span style="color: #00ff88;">+55% HP</span></div>
      <div style="font-size: 9.5px; color: #ffd166; font-weight: 800;">PRICE: 20,000 CR</div>
    </div>
    <button style="background: linear-gradient(180deg, #00ff88, #00bb66); color: #081024; font-weight: 800; border: none; padding: 6px 12px; border-radius: 4px; font-size: 10.5px; cursor: pointer; box-shadow: 0 0 10px rgba(0,255,136,0.5); pointer-events: none;">REPAIR 🛡️</button>
  `;

  toast.onclick = () => {
    confirmCriticalHullRepair20k();
  };

  const container = document.getElementById('ui-overlay') || document.body;
  container.appendChild(toast);

  // Automatically vanish and remove after animation finishes (7 seconds)
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.remove();
    }
  }, 7000);
}


function confirmCriticalHullRepair20k() {
  const toast = document.getElementById('criticalHullToast');
  const COST = 20000;
  if ((state.credits || 0) < COST) {
    if (audio && typeof audio.playDeflect === 'function') audio.playDeflect();
    spawnFloatingText(player.position, `INSUFFICIENT CREDITS (NEED 20,000 CR)!`, "#ff3366");
    if (toast) {
      toast.style.borderColor = '#ff3366';
      toast.style.boxShadow = '0 0 24px rgba(255,51,102,0.9)';
    }
    return;
  }

  state.credits -= COST;
  state.emergencyHullUsed = true;
  const heal = Math.round(state.maxHull * 0.55);
  state.hull = Math.min(state.maxHull, state.hull + heal);

  if (toast && toast.parentNode) toast.remove();
  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  spawnFloatingText(player.position, `HULL RESTORED (+${heal} HP)! -20,000 CR`, "#00ff88");
  saveGameData();
  updateHUD();
}


function confirmEmergencyHullRepair() {
  confirmCriticalHullRepair20k();
}


function dismissEmergencyHullModal() {
  const toast = document.getElementById('criticalHullToast');
  if (toast && toast.parentNode) toast.remove();
  const modal = document.getElementById('emergencyHullModal');
  if (modal) modal.classList.remove('active');
}


export {
  spawnScrapDrop,
  spawnPowerupItem,
  collectPowerup,
  buyWingmanDrone,
  buyWeaponUpgrade,
  quickUpgrade,
  buyExtraLife,
  buyExtraLifeFromPilotModal,
  buyLifeAndContinueFromGameOver,
  buyHullUpgrade,
  buyShieldUpgrade,
  buyMagnetUpgrade,
  buyMissiles,
  buyEmpCharge,
  buyAutoAimReboot,
  handleHangarShipAction,
  selectStarship,
  equipPilotShip,
  buyAndEquipPilotShip,
  getEmergencyRepairCost,
  triggerEmergencyHullProtocol,
  confirmCriticalHullRepair20k,
  confirmEmergencyHullRepair,
  dismissEmergencyHullModal
};

if (typeof window !== 'undefined') {
  window.spawnScrapDrop = spawnScrapDrop;
  window.spawnPowerupItem = spawnPowerupItem;
  window.collectPowerup = collectPowerup;
  window.buyExtraLife = buyExtraLife;
  window.buyExtraLifeFromPilotModal = buyExtraLifeFromPilotModal;
  window.buyLifeAndContinueFromGameOver = buyLifeAndContinueFromGameOver;
  window.buyWeaponUpgrade = buyWeaponUpgrade;
  window.quickUpgrade = quickUpgrade;
  window.buyHullUpgrade = buyHullUpgrade;
  window.buyShieldUpgrade = buyShieldUpgrade;
  window.buyMagnetUpgrade = buyMagnetUpgrade;
  window.buyWingmanDrone = buyWingmanDrone;
  window.buyMissiles = buyMissiles;
  window.buyEmpCharge = buyEmpCharge;
  window.buyAutoAimReboot = buyAutoAimReboot;
  window.handleHangarShipAction = handleHangarShipAction;
  window.selectStarship = selectStarship;
  window.equipPilotShip = equipPilotShip;
  window.buyAndEquipPilotShip = buyAndEquipPilotShip;
  window.confirmCriticalHullRepair20k = confirmCriticalHullRepair20k;
  window.confirmEmergencyHullRepair = confirmEmergencyHullRepair;
  window.dismissEmergencyHullModal = dismissEmergencyHullModal;
  window.triggerEmergencyHullProtocol = triggerEmergencyHullProtocol;
}
