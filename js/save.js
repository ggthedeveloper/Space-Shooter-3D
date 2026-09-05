/**
 * ALIEN ASSAULT 3D - SAVE & PERSISTENCE
 * Career progression save/load/wipe via LocalStorage
 */

import { state, SAVE_KEY } from './state.js';
import { applyGalaxyEnvironment } from './galaxies.js';
import { checkProgressionUnlocks } from './progression.js';
import { renderAchievementsMenu } from './ui.js';

function saveGameData() {
  try {
    const data = {
      pilotName: state.pilotName || 'STARFIGHTER ACE',
      highScore: state.highScore,
      credits: state.credits,
      shipType: state.shipType,
      selectedGalaxy: state.selectedGalaxy || 'nebula',
      unlockedGalaxies: state.unlockedGalaxies || ['nebula'],
      plasmaTier: state.plasmaTier,
      railgunTier: state.railgunTier,
      flakTier: state.flakTier,
      torpedoTier: state.torpedoTier || 1,
      teslaTier: state.teslaTier || 1,
      unlockedShips: state.unlockedShips || ['valkyrie'],
      xp: state.xp || 0,
      playerRank: state.playerRank || 1,
      activeBounty: state.activeBounty,
      maxHull: state.maxHull,
      shieldRechargeRate: state.shieldRechargeRate,
      magnetRange: state.magnetRange,
      maxLives: state.maxLives,
      dronesUnlocked: state.dronesUnlocked || 0,
      achievements: state.achievements || {},
      totalAliensKilled: state.totalAliensKilled || 0,
      highestSector: Math.max(state.highestSector || 1, state.sector)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    localStorage.setItem('alien_assault_hs', state.highScore.toString());
    localStorage.setItem('alien_assault_pilot_name', state.pilotName || 'STARFIGHTER ACE');
  } catch(e) {}
}

function loadGameData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data.pilotName === 'string') state.pilotName = data.pilotName;
      if (typeof data.highScore === 'number') state.highScore = data.highScore;
      if (typeof data.credits === 'number') state.credits = data.credits;
      if (typeof data.plasmaTier === 'number') state.plasmaTier = data.plasmaTier;
      if (typeof data.railgunTier === 'number') state.railgunTier = data.railgunTier;
      if (typeof data.flakTier === 'number') state.flakTier = data.flakTier;
      if (typeof data.torpedoTier === 'number') state.torpedoTier = data.torpedoTier;
      if (typeof data.teslaTier === 'number') state.teslaTier = data.teslaTier;
      if (Array.isArray(data.unlockedShips)) state.unlockedShips = data.unlockedShips;
      if (typeof data.selectedGalaxy === 'string') state.selectedGalaxy = data.selectedGalaxy;
      if (Array.isArray(data.unlockedGalaxies)) state.unlockedGalaxies = data.unlockedGalaxies;
      if (typeof data.xp === 'number') state.xp = data.xp;
      if (typeof data.playerRank === 'number') state.playerRank = data.playerRank;
      if (data.activeBounty && typeof data.activeBounty === 'object') state.activeBounty = data.activeBounty;
      if (typeof data.maxHull === 'number') state.maxHull = data.maxHull;
      if (typeof data.shieldRechargeRate === 'number') state.shieldRechargeRate = data.shieldRechargeRate;
      if (typeof data.magnetRange === 'number') state.magnetRange = data.magnetRange;
      if (typeof data.maxLives === 'number') state.maxLives = data.maxLives;
      if (typeof data.dronesUnlocked === 'number') state.dronesUnlocked = data.dronesUnlocked;
      if (data.achievements && typeof data.achievements === 'object') state.achievements = data.achievements;
      if (typeof data.totalAliensKilled === 'number') state.totalAliensKilled = data.totalAliensKilled;
      if (typeof data.highestSector === 'number') state.highestSector = data.highestSector;
      if (data.shipType) state.shipType = data.shipType;
      if (typeof applyGalaxyEnvironment === 'function') {
        applyGalaxyEnvironment(state.selectedGalaxy || 'nebula');
      }
      if (typeof checkProgressionUnlocks === 'function') {
        checkProgressionUnlocks();
      }
    } else {
      const oldHs = localStorage.getItem('alien_assault_hs');
      if (oldHs) state.highScore = parseInt(oldHs, 10) || 0;
      const oldPilot = localStorage.getItem('alien_assault_pilot_name');
      if (oldPilot) state.pilotName = oldPilot;
      if (typeof applyGalaxyEnvironment === 'function') {
        applyGalaxyEnvironment('nebula');
      }
    }
  } catch(e) {}
}

function wipeSaveData() {
  if (confirm("Reset all saved career progress (High Score, Scrap Bank, Weapon Upgrades, Achievements)?")) {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem('alien_assault_hs');
    } catch(e) {}
    location.reload();
  }
}

export { saveGameData, loadGameData, wipeSaveData };

if (typeof window !== 'undefined') {
  window.saveGameData = saveGameData;
  window.loadGameData = loadGameData;
  window.wipeSaveData = wipeSaveData;
}
