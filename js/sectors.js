/**
 * ALIEN ASSAULT 3D - SECTOR CAMPAIGN & SQUADRONS
 * Sector generation, alien waves, dynamic armada overruns, boss encounters, and warp
 */

import { state } from "./state.js";
import { audio } from "./audio.js";
import { scene, enemies, camera } from "./game.js";
import { createAlienMesh, attachAlienShield, buildLeviathanBoss, buildArmadaCommanderMesh } from "./enemies.js";
import { updateHostilesHUD, spawnExplosionFX, triggerShake, spawnFloatingText, addScore, updateHUD } from "./ui.js";
import { player } from "./player.js";
import { unlockAchievement, addPlayerXP, checkProgressionUnlocks } from "./progression.js";
import { saveGameData } from "./save.js";
import { closeStoreModal } from "./menu.js";

const SECTOR_NAMES = [
  "DEEP SPACE PERIMETER",
  "CRIMSON NEBULA DRIFT",
  "FLAGSHIP INCURSION (BOSS)",
  "GALACTIC CORE EXPANSE",
  "THE ALIEN SINGULARITY (FINAL BOSS)"
];


function loadSector(sec) {
  state.armadaOverrunActive = false;
  state.armadaOverrunDefeated = false;

  const notice = document.getElementById('waveNotice');
  const title = document.getElementById('waveNoticeTitle');
  const sub = document.getElementById('waveNoticeSub');

  const secName = SECTOR_NAMES[(sec - 1) % SECTOR_NAMES.length];
  title.textContent = `SECTOR ${sec}`;
  sub.textContent = secName;
  document.getElementById('sectorBadge').textContent = `SECTOR ${sec} · ${secName}`;

  notice.classList.add('show');
  setTimeout(() => notice.classList.remove('show'), 2200);

  if (sec >= 3) {
    unlockAchievement('deep_space');
  }


  const isBossSector = (sec % 3 === 0);
  if (isBossSector) spawnBossSector();
  else spawnSquadronSector(sec);
}


function getSectorThreat(sec) {
  if (sec === 1) return { label: 'THREAT: MODERATE', color: '#00ff88' };
  if (sec === 2) return { label: 'THREAT: SEVERE [DEFLECTOR SHIELDS]', color: '#00f0ff' };
  if (sec === 3) return { label: 'THREAT: CRITICAL [BOSS LEVIATHAN]', color: '#ff0055' };
  if (sec === 4) return { label: 'THREAT: EXTREME [ELITE ACES & SPREADS]', color: '#ffd166' };
  return { label: 'THREAT: OMEGA SINGULARITY [MAX OVERDRIVE]', color: '#a855f7' };
}


function spawnSquadronSector(sec) {
  state.bossActive = false;
  const cols = Math.min(10, 6 + Math.floor((sec - 1) * 0.8));
  const rows = Math.min(6, 3 + Math.floor((sec - 1) * 0.7));
  const gapX = Math.min(3.2, 22 / cols);
  const gapY = 2.2;
  const startX = -((cols - 1) * gapX) / 2;
  const startY = 5.2;

  const initialCount = rows * cols;
  const reinforcements = sec > 1 ? (sec * 4) : 0;
  state.sectorEnemyTotal = initialCount + reinforcements;
  state.sectorEnemiesDefeated = 0;
  state.reinforcementsRemaining = reinforcements;

  const baseScoutHp = 6 + (sec - 1) * 8;
  const baseSaucerHp = 14 + (sec - 1) * 16;
  const saucerShield = sec >= 2 ? (10 + (sec - 2) * 14) : 0;
  const scoutShield = sec >= 3 ? (8 + (sec - 3) * 10) : 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const isElite = (sec >= 3 && idx % 5 === 0);
      const mesh = createAlienMesh(sec, idx);
      const isSaucer = (mesh.userData.shipClass === 'saucer' || !mesh.userData.shipClass);
      if (isElite) {
        mesh.scale.setScalar(1.35);
      }

      const originX = startX + c * gapX;
      const originY = startY - r * gapY;
      const originZ = -36 - r * 3;

      mesh.position.set(originX, originY, originZ);
      scene.add(mesh);

      const enemyShield = isElite ? (saucerShield * 1.5 + 16) : (isSaucer ? saucerShield : scoutShield);
      const enemyHp = isElite ? (baseSaucerHp * 1.5) : (isSaucer ? baseSaucerHp : baseScoutHp);

      if (enemyShield > 0) {
        attachAlienShield(mesh, isSaucer ? 2.3 : 1.8, isElite ? 0xff00ff : 0x00e5ff);
      }

      enemies.push({
        mesh,
        originX, originY, originZ,
        alive: true,
        hp: Math.round(enemyHp),
        maxHp: Math.round(enemyHp),
        shield: Math.round(enemyShield),
        maxShield: Math.round(enemyShield),
        isSaucer,
        isElite,
        color: isElite ? 0xffd166 : (mesh.userData.color || (isSaucer ? 0x00f0ff : 0x39ff14)),
        wobble: Math.random() * Math.PI * 2,
        shootCooldown: Math.max(0.6, 2.5 - sec * 0.22) + Math.random() * 1.8,
        isDiving: false,
        diveProgress: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveFired: false
      });
    }
  }

  updateHostilesHUD();
}


function spawnBossSector() {
  state.bossActive = true;
  const mesh = buildLeviathanBoss();
  mesh.position.set(0, 2.5, -42);
  scene.add(mesh);

  const sec = state.sector;
  const bossHp = 280 + (sec - 3) * 120;
  const bossShield = 140 + (sec - 3) * 80;

  attachAlienShield(mesh, 6.5, 0xff0055);

  state.bossEntity = {
    mesh,
    alive: true,
    hp: bossHp,
    maxHp: bossHp,
    shield: bossShield,
    maxShield: bossShield,
    isBoss: true,
    color: 0xff0055,
    attackTimer: 1.0
  };
  enemies.push(state.bossEntity);

  const escortCount = 10 + Math.min(16, sec * 3);
  state.sectorEnemyTotal = 1 + escortCount;
  state.sectorEnemiesDefeated = 0;
  state.reinforcementsRemaining = escortCount;

  spawnBossEscorts(Math.min(6, escortCount));

  const bossBar = document.getElementById('bossBarContainer');
  bossBar.style.display = 'flex';
  document.getElementById('bossMeterFill').style.width = '100%';
  document.getElementById('bossHpPercent').textContent = '100%';

  updateHostilesHUD();
}


function spawnBossEscorts(count) {
  const sec = state.sector;
  for (let i = 0; i < count; i++) {
    const mesh = createAlienMesh(sec, i);
    const isSaucer = (mesh.userData.shipClass === 'saucer' || !mesh.userData.shipClass);
    const side = (i % 2 === 0) ? 1 : -1;
    const originX = side * (8.5 + (i * 1.8));
    const originY = 3.0 - (i * 0.8);
    const originZ = -38 - (i * 2);

    mesh.position.set(originX, originY, originZ);
    scene.add(mesh);

    const escortShield = 12 + (sec - 3) * 8;
    attachAlienShield(mesh, 2.1, 0x00f0ff);

    enemies.push({
      mesh,
      originX, originY, originZ,
      alive: true,
      hp: isSaucer ? (24 + (sec - 3) * 10) : (14 + (sec - 3) * 6),
      maxHp: isSaucer ? (24 + (sec - 3) * 10) : (14 + (sec - 3) * 6),
      shield: escortShield,
      maxShield: escortShield,
      isSaucer,
      color: mesh.userData.color || 0x39ff14,
      wobble: Math.random() * Math.PI * 2,
      shootCooldown: 1.0 + Math.random() * 1.8,
      isDiving: false,
      diveProgress: 0,
      diveStartX: 0,
      diveStartY: 0,
      diveFired: false
    });
  }
}


function spawnReinforcementWave(count) {
  const sec = state.sector;
  const startX = (Math.random() - 0.5) * 14;
  for (let i = 0; i < count; i++) {
    const isElite = (sec >= 4 && i === 0);
    const mesh = createAlienMesh(sec, i + 1);
    const isSaucer = (mesh.userData.shipClass === 'saucer' || !mesh.userData.shipClass);
    if (isElite) {
      mesh.scale.setScalar(1.35);
    }
    const originX = startX + (i - count / 2) * 3.2;
    const originY = 4.0 + (Math.random() - 0.5) * 2.0;
    const originZ = -55 - i * 4;

    mesh.position.set(originX, originY, originZ);
    scene.add(mesh);
    spawnExplosionFX(mesh.position, 0x00f0ff, 10, 1.2);

    const enemyShield = isElite ? (30 + sec * 10) : (sec >= 2 ? (12 + (sec - 2) * 8) : 0);
    if (enemyShield > 0) {
      attachAlienShield(mesh, 2.1, isElite ? 0xff00ff : 0x00e5ff);
    }

    enemies.push({
      mesh,
      originX, originY, originZ: -34 - (i % 3) * 3,
      alive: true,
      hp: isElite ? 65 : (isSaucer ? (18 + sec * 8) : (10 + sec * 5)),
      maxHp: isElite ? 65 : (isSaucer ? (18 + sec * 8) : (10 + sec * 5)),
      shield: enemyShield,
      maxShield: enemyShield,
      isSaucer,
      isElite,
      color: isElite ? 0xffd166 : (mesh.userData.color || 0xff0055),
      wobble: Math.random() * Math.PI * 2,
      shootCooldown: 0.6 + Math.random() * 1.5,
      isDiving: true,
      diveProgress: 0,
      diveStartX: originX,
      diveStartY: originY,
      diveFired: false
    });
  }
  updateHostilesHUD();
}


function triggerArmadaOverrunEvent() {
  if (state.armadaOverrunActive || state.armadaOverrunDefeated || state.sector < 2 || state.bossActive) return;
  state.armadaOverrunActive = true;

  if (audio.playAlarm) audio.playAlarm();
  triggerShake(12);

  const commsSource = document.getElementById('commsSource');
  const commsMessage = document.getElementById('commsMessage');
  if (commsSource) commsSource.textContent = "TACTICAL RADAR";
  if (commsMessage) commsMessage.textContent = "EMERGENCY: Hostile Armada Commander detected jumping into sector!";
  spawnFloatingText(player.position, "⚠️ HOSTILE COMMANDER WARPING IN!", "#ff0055");

  spawnArmadaCommander();
}


function spawnArmadaCommander() {
  const mesh = buildArmadaCommanderMesh();
  mesh.position.set(0, 3.5, -45);
  scene.add(mesh);

  const sec = state.sector;
  const commanderHp = 180 + sec * 45;
  const commanderShield = 90 + sec * 30;
  attachAlienShield(mesh, 4.2, 0xff0055);

  const commanderEntity = {
    mesh,
    originX: 0,
    originY: 3.5,
    originZ: -30,
    alive: true,
    hp: commanderHp,
    maxHp: commanderHp,
    shield: commanderShield,
    maxShield: commanderShield,
    isArmadaCommander: true,
    color: 0xff0055,
    attackTimer: 0.8
  };
  enemies.push(commanderEntity);

  spawnReinforcementWave(4);
  updateHostilesHUD();
}

// HYPERSPACE LEVEL CLEAR JUMP

function sectorCompleted() {
  if (state.sectorClearing) return;
  state.sectorClearing = true;
  state.warpActive = true;
  state.warpTimer = 2.8;

  audio.speak(`Sector ${state.sector} cleared. Hyperspace warp jump engaged.`);
  const sectorReward = Math.round(500 * Math.pow(state.sector, 1.25));
  addScore(1500 * state.sector);
  state.credits = Math.max(0, state.credits + sectorReward);
  addPlayerXP(100 * state.sector);
  state.armadaOverrunActive = false;
  state.highestSector = Math.max(state.highestSector || 1, state.sector + 1);
  checkProgressionUnlocks();
  saveGameData();
  spawnFloatingText(player.position, `SECTOR CLEARED! +${sectorReward.toLocaleString()} CR · +${100 * state.sector} XP`, "#ffd166");
  updateHUD();
}


function nextSector() {
  closeStoreModal();
  state.sector++;
  state.sectorClearing = false;
  camera.fov = 60;
  camera.updateProjectionMatrix();
  if (audio && (audio.musicStyle === 'auto' || Math.random() > 0.45)) {
    audio.nextTrack();
  }
  loadSector(state.sector);
}


export {
  SECTOR_NAMES,
  loadSector,
  getSectorThreat,
  spawnSquadronSector,
  spawnBossSector,
  spawnBossEscorts,
  spawnReinforcementWave,
  triggerArmadaOverrunEvent,
  spawnArmadaCommander,
  sectorCompleted,
  nextSector
};

if (typeof window !== 'undefined') {
  window.getSectorThreat = getSectorThreat;
  window.triggerArmadaOverrunEvent = triggerArmadaOverrunEvent;
  window.loadSector = loadSector;
  window.nextSector = nextSector;
  window.sectorCompleted = sectorCompleted;
}
