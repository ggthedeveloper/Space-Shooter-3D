/**
 * ALIEN ASSAULT 3D - CAREER PROGRESSION & RANKS
 * XP accumulation, military ranks, tactical bounties, achievements, and 7-second auto-aim
 */

import { state, RANKS, BOUNTY_POOL, ACHIEVEMENTS_LIST, CALLSIGN_PRESETS } from './state.js';
import { audio } from './audio.js';

function getPlayerRank(xp) {
  let cur = RANKS[0];
  for (const r of RANKS) {
    if ((xp || 0) >= r.xpRequired) cur = r;
  }
  return cur;
}


function addPlayerXP(amount) {
  try {
    const oldRank = getPlayerRank(state.xp || 0);
    state.xp = (state.xp || 0) + amount;
    const newRank = getPlayerRank(state.xp);

    if (newRank.rank > oldRank.rank) {
      state.playerRank = newRank.rank;
      if (audio.playPromotionFanfare) audio.playPromotionFanfare();
      showAchievementToast(`PROMOTED TO ${newRank.title}!`, `Perk Unlocked: ${newRank.perk}`);
      spawnFloatingText(player.position, `⭐ PROMOTED: ${newRank.title}!`, "#ffd166");
    }
    updateHUD();
    saveGameData();
  } catch(err) {
    console.warn("XP update non-fatal error:", err);
  }
}

function trackBountyProgress(type, amount = 1) {
  if (!state.activeBounty) return;
  if (state.activeBounty.id === type) {
    state.activeBounty.current = Math.min(state.activeBounty.target, state.activeBounty.current + amount);
    if (state.activeBounty.current >= state.activeBounty.target) {
      claimActiveBounty();
    }
    updateBountyHUD();
  }
}


function claimActiveBounty() {
  const b = state.activeBounty;
  if (!b) return;
  state.credits += b.rewardCredits;
  addPlayerXP(b.rewardXP);
  audio.playPowerup();
  spawnFloatingText(player.position, `🎯 BOUNTY CLAIMED: +${b.rewardCredits} CR / +${b.rewardXP} XP!`, "#00ff88");

  const nextPool = BOUNTY_POOL.filter(item => item.id !== b.id);
  const next = nextPool[Math.floor(Math.random() * nextPool.length)] || BOUNTY_POOL[0];
  state.activeBounty = { id: next.id, target: next.target, current: 0, desc: next.desc, rewardCredits: next.rewardCredits, rewardXP: next.rewardXP };
  updateBountyHUD();
  saveGameData();
}


function unlockAchievement(id) {
  if (state.achievements && state.achievements[id]) return;
  if (!state.achievements) state.achievements = {};
  state.achievements[id] = true;
  saveGameData();
  audio.playAchievementChime();

  const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
  if (ach) {
    showAchievementToast(`${ach.icon} ${ach.title}`, ach.desc);
  }
  renderAchievementsMenu();
}


function randomizeCallsign() {
  const input = document.getElementById('pilotCallsignInput');
  if (input) {
    const pick = CALLSIGN_PRESETS[Math.floor(Math.random() * CALLSIGN_PRESETS.length)];
    input.value = pick;
    if (audio && typeof audio.playBeep === 'function') audio.playBeep();
  }
}


function checkProgressionUnlocks() {
  const highest = Math.max(state.highestSector || 1, state.sector || 1);
  if (!state.unlockedShips) state.unlockedShips = ['valkyrie'];
  if (!state.unlockedGalaxies) state.unlockedGalaxies = ['nebula'];

  // Check Ships
  Object.values(SHIP_DEFINITIONS).forEach(ship => {
    if (highest >= ship.unlockSector && !state.unlockedShips.includes(ship.id)) {
      state.unlockedShips.push(ship.id);
      spawnFloatingText(player.position, `🛸 SHIP UNLOCKED: ${ship.name.toUpperCase()}!`, "#00ff88");
      if (typeof showAchievementToast === 'function') {
        showAchievementToast({ icon: '🛸', title: 'Starfighter Unlocked', desc: `${ship.name} ready in Hangar!` });
      }
    }
  });

  // Check Galaxies
  Object.values(GALAXIES).forEach(g => {
    if (highest >= g.unlockSector && !state.unlockedGalaxies.includes(g.id)) {
      state.unlockedGalaxies.push(g.id);
      spawnFloatingText(player.position, `🌌 GALAXY DISCOVERED: ${g.name.toUpperCase()}!`, "#00f0ff");
      if (typeof showAchievementToast === 'function') {
        showAchievementToast({ icon: '🌌', title: 'Galaxy Discovered', desc: `${g.name} coordinates charted!` });
      }
    }
  });

  saveGameData();
}


function activateAutoAim(duration = 7, reason = "AUTO-AIM ENGAGED") {
  state.autoAimActive = true;
  state.autoAimTimer = 7.0; // Strictly 7 seconds duration
  audio.playPowerup();
  spawnFloatingText(player.position, `🎯 AUTO AIM: 7s!`, "#ffd166");
  triggerShake(3);
  updateHUD();
}


function quickRebootAutoAim() {
  if (state.autoAimActive) {
    spawnFloatingText(player.position, `AUTO-AIM ACTIVE (${Math.ceil(state.autoAimTimer)}s)`, "#00ff88");
  } else {
    buyAutoAimReboot();
  }
}


export {
  getPlayerRank,
  addPlayerXP,
  trackBountyProgress,
  claimActiveBounty,
  unlockAchievement,
  randomizeCallsign,
  checkProgressionUnlocks,
  activateAutoAim,
  quickRebootAutoAim
};

if (typeof window !== 'undefined') {
  window.getPlayerRank = getPlayerRank;
  window.addPlayerXP = addPlayerXP;
  window.trackBountyProgress = trackBountyProgress;
  window.claimActiveBounty = claimActiveBounty;
  window.unlockAchievement = unlockAchievement;
  window.randomizeCallsign = randomizeCallsign;
  window.checkProgressionUnlocks = checkProgressionUnlocks;
  window.activateAutoAim = activateAutoAim;
  window.quickRebootAutoAim = quickRebootAutoAim;
}
