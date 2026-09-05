
// Bridge references
const getSectorThreat = (s) => (window.getSectorThreat ? window.getSectorThreat(s) : { name: "PATROL", color: "#00ff88" });
const trackBountyProgress = (...args) => (window.trackBountyProgress ? window.trackBountyProgress(...args) : null);
const unlockAchievement = (...args) => (window.unlockAchievement ? window.unlockAchievement(...args) : null);
const saveGameData = (...args) => (window.saveGameData ? window.saveGameData(...args) : null);
const checkProgressionUnlocks = (...args) => (window.checkProgressionUnlocks ? window.checkProgressionUnlocks(...args) : null);

/**
 * ALIEN ASSAULT 3D - HUD, INTERFACE & COMBAT VFX
 * Heads-up display updates, floating damage numbers, reticle crosshair, store & galaxy cards
 */

import { state, RANKS, BOUNTY_POOL, ACHIEVEMENTS_LIST } from './state.js';
import { audio } from './audio.js';

// Reticle and mouse coordinate targeting elements
const reticleEl = document.getElementById('aimReticle');
const reticleTextEl = document.getElementById('aimReticleText');

function updateAimCoordinates(clientX, clientY) {
  reticleEl.style.left = `${clientX}px`;
  reticleEl.style.top = `${clientY}px`;

  currentMouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
  currentMouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(currentMouseNDC, camera);
  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(aimPlane, hit)) {
    aimTargetPoint.copy(hit);
  }
}

window.addEventListener('mousemove', e => {
  audio.init(); audio.resume();
  updateAimCoordinates(e.clientX, e.clientY);
});
window.addEventListener('mousedown', e => {
  audio.init(); audio.resume();
  updateAimCoordinates(e.clientX, e.clientY);
  if (e.button === 0) isMouseDown = true;
  if (e.button === 2) { e.preventDefault(); isRightMouseDown = true; fireMissile(); }
});
window.addEventListener('mouseup', e => {
  if (e.button === 0) isMouseDown = false;
  if (e.button === 2) isRightMouseDown = false;
});
window.addEventListener('contextmenu', e => e.preventDefault());


function updateWeaponDockForShip(shipType) {
  const cfg = SHIP_WEAPON_CONFIG[shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  for (let i = 1; i <= 5; i++) {
    const card = document.getElementById(`wep${i}Card`);
    const wepData = cfg[`wep${i}`];
    if (card && wepData) {
      const keySpan = card.querySelector('.weapon-key');
      const nameDiv = card.querySelector('.weapon-name');
      const subDiv = card.querySelector('.weapon-sub');
      if (keySpan) keySpan.textContent = wepData.key;
      if (nameDiv) nameDiv.textContent = wepData.name;
      if (subDiv) subDiv.textContent = wepData.sub;
    }
  }
}


function updateBountyHUD() {
  renderMenuRankAndBounty();
}


function renderMenuRankAndBounty() {
  const rank = getPlayerRank(state.xp || 0);
  const rankValEl = document.getElementById('menuRankTitle');
  const rankPerkEl = document.getElementById('menuRankPerk');
  const rankFillEl = document.getElementById('menuRankFill');
  const rankXpEl = document.getElementById('menuRankXp');
  
  if (rankValEl) rankValEl.textContent = `${rank.badge} ${rank.title}`;
  if (rankPerkEl) rankPerkEl.textContent = `Combat Perk: ${rank.perk}`;
  
  const currentRankIdx = RANKS.findIndex(r => r.title === rank.title);
  const nextRank = RANKS[currentRankIdx + 1];
  if (nextRank) {
    const prevXP = rank.xpRequired;
    const needed = nextRank.xpRequired - prevXP;
    const progress = Math.max(0, Math.min(1, ((state.xp || 0) - prevXP) / needed));
    if (rankFillEl) rankFillEl.style.width = `${Math.round(progress * 100)}%`;
    if (rankXpEl) rankXpEl.textContent = `${state.xp || 0} / ${nextRank.xpRequired} XP`;
  } else {
    if (rankFillEl) rankFillEl.style.width = `100%`;
    if (rankXpEl) rankXpEl.textContent = `${state.xp || 0} XP (MAX RANK)`;
  }

  const bountyDescEl = document.getElementById('menuBountyDesc');
  const bountyProgressEl = document.getElementById('menuBountyProgress');
  const bountyFillEl = document.getElementById('menuBountyFill');
  const bountyRewardEl = document.getElementById('menuBountyReward');

  if (state.activeBounty) {
    const b = state.activeBounty;
    if (bountyDescEl) bountyDescEl.textContent = b.desc;
    if (bountyProgressEl) bountyProgressEl.textContent = `${b.current} / ${b.target}`;
    if (bountyRewardEl) bountyRewardEl.textContent = `+${b.rewardCredits} CR · +${b.rewardXP} XP`;
    const bPct = Math.min(100, Math.round((b.current / b.target) * 100));
    if (bountyFillEl) bountyFillEl.style.width = `${bPct}%`;
  }
}

function renderAchievementsMenu() {
  const container = document.getElementById('achievementsList');
  const countEl = document.getElementById('unlockedBadgesCount');
  if (!container) return;

  container.innerHTML = '';
  let unlockedCount = 0;
  for (const a of ACHIEVEMENTS_LIST) {
    const isUnlocked = !!(state.achievements && state.achievements[a.id]);
    if (isUnlocked) unlockedCount++;
    const div = document.createElement('div');
    div.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
    div.innerHTML = `
      <div class="achievement-icon">${isUnlocked ? a.icon : '🔒'}</div>
      <div style="flex: 1;">
        <div class="achievement-title">${a.title} ${isUnlocked ? '✓' : ''}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
    `;
    container.appendChild(div);
  }
  if (countEl) countEl.textContent = unlockedCount;
}

function updateGalaxyModalUI() {
  checkProgressionUnlocks();
  const grid = document.getElementById('galaxyGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const highest = Math.max(state.highestSector || 1, state.sector || 1);
  const selected = state.selectedGalaxy || 'nebula';

  Object.values(GALAXIES).forEach(g => {
    const isUnlocked = (state.unlockedGalaxies || ['nebula']).includes(g.id) || highest >= g.unlockSector;
    const isSelected = (selected === g.id);

    const card = document.createElement('div');
    card.className = `galaxy-card ${isSelected ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
    card.onclick = () => { selectGalaxy(g.id); };

    const bgGradient = g.id === 'nebula' ? 'linear-gradient(135deg, #031217, #064e3b, #022c22)' :
                       g.id === 'red' ? 'linear-gradient(135deg, #2d0606, #991b1b, #160303)' :
                       g.id === 'ice' ? 'linear-gradient(135deg, #042f4b, #0284c7, #010d1a)' :
                       g.id === 'dark' ? 'linear-gradient(135deg, #022014, #451a03, #000103)' :
                       g.id === 'void' ? 'linear-gradient(135deg, #1f0b38, #581c87, #0d0317)' :
                       g.id === 'destroyed' ? 'linear-gradient(135deg, #431407, #9a3412, #140700)' :
                       g.id === 'legendary' ? 'linear-gradient(135deg, #422006, #ca8a04, #120e03)' :
                       'linear-gradient(135deg, #081538, #1e3a8a, #02050f)';

    let actionBtnHtml = '';
    if (isSelected) {
      actionBtnHtml = `<button class="ship-action-btn equipped" style="margin-top: 6px;">⭐ CURRENT BATTLEFIELD</button>`;
    } else if (isUnlocked) {
      actionBtnHtml = `<button class="ship-action-btn equip" style="margin-top: 6px;" onclick="event.stopPropagation(); selectGalaxy('${g.id}')">SELECT GALAXY</button>`;
    } else {
      if (state.credits >= g.cost) {
        actionBtnHtml = `<button class="ship-action-btn buy" style="margin-top: 6px;" onclick="event.stopPropagation(); selectGalaxy('${g.id}')">💰 BUY & WARP (${g.cost.toLocaleString()} CR)</button>`;
      } else {
        actionBtnHtml = `<button class="ship-action-btn locked" style="margin-top: 6px;" disabled>🔒 SEC ${g.unlockSector} OR ${g.cost.toLocaleString()} CR</button>`;
      }
    }

    card.innerHTML = `
      <div class="galaxy-preview-box" style="background: ${bgGradient};">
        ${g.icon}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 14px; font-weight: 800; color: #fff;">${g.name}</div>
        <div style="font-size: 10px; font-weight: 700; color: ${isUnlocked ? '#00ff88' : '#ffd166'};">${isUnlocked ? 'CHARTED' : `SEC ${g.unlockSector}+`}</div>
      </div>
      <div style="font-size: 11px; font-weight: 600; color: #00f0ff;">${g.subtitle}</div>
      <div style="font-size: 10px; color: #94a3b8; line-height: 1.4; flex: 1;">${g.desc}</div>
      ${actionBtnHtml}
    `;
    grid.appendChild(card);
  });
}


let pilotInspectedShip = null;

function updatePilotShipDetailUI(shipId) {
  const container = document.getElementById('pilotShipDetailCard');
  if (!container) return;
  pilotInspectedShip = shipId || pilotInspectedShip || state.shipType || 'valkyrie';
  const ship = SHIP_DEFINITIONS[pilotInspectedShip] || SHIP_DEFINITIONS.valkyrie;
  const isUnlocked = state.unlockedShips && state.unlockedShips.includes(ship.id);
  const isEquipped = (state.shipType === ship.id);
  const canAfford = ((state.credits || 0) >= ship.cost);

  let icon = '🚀';
  if (ship.id === 'scout') icon = '⚡';
  else if (ship.id === 'interceptor') icon = '🗡️';
  else if (ship.id === 'assault') icon = '💥';
  else if (ship.id === 'phoenix') icon = '☀️';
  else if (ship.id === 'guardian') icon = '🛡️';
  else if (ship.id === 'destroyer') icon = '🔨';
  else if (ship.id === 'phantom') icon = '👻';
  else if (ship.id === 'nova') icon = '🌟';
  else if (ship.id === 'titan') icon = '🗿';
  else if (ship.id === 'eclipse') icon = '🌑';
  else if (ship.id === 'void_hunter') icon = '👾';
  else if (ship.id === 'reaper') icon = '🌌';
  else if (ship.id === 'galaxy_guardian') icon = '🌠';
  else if (ship.id === 'celestial') icon = '✨';
  else if (ship.id === 'apex') icon = '👑';

  let actionHtml = '';
  if (isEquipped) {
    actionHtml = `<div style="padding: 8px 16px; background: rgba(0,255,136,0.15); border: 1px solid #00ff88; color: #00ff88; border-radius: 6px; font-weight: 800; font-size: 11px; text-align: center;">⭐ CURRENTLY EQUIPPED FOR LAUNCH</div>`;
  } else if (isUnlocked) {
    actionHtml = `<button class="btn-primary" onclick="equipPilotShip('${ship.id}')" style="width: 100%; padding: 8px 16px; font-size: 11px; font-weight: 800; background: linear-gradient(180deg, #00f0ff, #0088cc); color: #081024; border: none; border-radius: 6px; cursor: pointer;">EQUIP STARFIGHTER (FREE) 🚀</button>`;
  } else {
    actionHtml = `
      <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <div style="font-size: 10.5px; color: #ffd166; font-weight: 700;">
          🔒 UNLOCKS AT SECTOR ${ship.unlockSector} OR PURCHASE EARLY:
        </div>
        <button class="btn-primary" onclick="buyAndEquipPilotShip('${ship.id}')" ${canAfford ? '' : 'disabled'}
          style="padding: 8px 18px; font-size: 11px; font-weight: 800; background: ${canAfford ? 'linear-gradient(180deg, #ffd166, #ffaa00)' : '#334155'}; color: ${canAfford ? '#081024' : '#94a3b8'}; border: none; border-radius: 6px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; box-shadow: ${canAfford ? '0 0 14px rgba(255,209,102,0.5)' : 'none'};">
          ${canAfford ? `BUY & EQUIP NOW (${ship.cost.toLocaleString()} CR) 💳` : `NEED ${(ship.cost - (state.credits || 0)).toLocaleString()} CR MORE`}
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 28px;">${icon}</span>
        <div>
          <div style="font-size: 13px; font-weight: 800; color: #00f0ff;">${ship.name} <span style="font-size: 9.5px; color: #ffd166; border: 1px solid rgba(255,209,102,0.4); padding: 1px 5px; border-radius: 3px;">${ship.tier}</span></div>
          <div style="font-size: 10px; color: #94a3b8;">${ship.role} &middot; <span style="color: #ffd166;">Primary: ${ship.primaryWeapon}</span> &middot; <span style="color: #00ff88;">Ability [C]: ${ship.specialAbility}</span></div>
        </div>
      </div>
      <div style="font-size: 11px; font-weight: 800; color: ${isUnlocked ? '#00ff88' : '#ffd166'};">
        ${isEquipped ? '⭐ EQUIPPED' : (isUnlocked ? '🟢 READY' : `🔒 SECTOR ${ship.unlockSector} / ${ship.cost.toLocaleString()} CR`)}
      </div>
    </div>
    <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4; margin-bottom: 8px;">${ship.desc}</div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; font-size: 9.5px; margin-bottom: 10px; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
      <div><span style="color: #64748b;">HULL:</span> <strong style="color: #00ff88;">${ship.hull}</strong></div>
      <div><span style="color: #64748b;">SHIELD:</span> <strong style="color: #00e5ff;">${ship.shield}</strong></div>
      <div><span style="color: #64748b;">DMG:</span> <strong style="color: #ff3366;">${ship.damage}%</strong></div>
      <div><span style="color: #64748b;">SPEED:</span> <strong style="color: #ffd166;">${ship.speed}</strong></div>
    </div>
    ${actionHtml}
  `;
}


function selectInitialShip(type) {
  if (!state.unlockedShips) state.unlockedShips = ['valkyrie'];
  checkProgressionUnlocks();
  pilotInspectedShip = type;
  const def = SHIP_DEFINITIONS[type] || SHIP_DEFINITIONS.valkyrie;
  
  if (state.unlockedShips.includes(type)) {
    setStarship(type);
    if (audio && typeof audio.playBeep === 'function') audio.playBeep();
    saveGameData();
  }

  // Highlight selected card
  const cards = document.querySelectorAll('.ship-select-card');
  cards.forEach(c => c.classList.remove('active'));
  const target = document.getElementById(`initShip_${type}`);
  if (target) target.classList.add('active');

  updatePilotShipDetailUI(type);
}


function renderPilotShipSelectionGrid() {
  const pilotGrid = document.getElementById('pilotShipSelectGrid');
  if (!pilotGrid) return;
  pilotGrid.innerHTML = '';
  Object.values(SHIP_DEFINITIONS).forEach(ship => {
    const isUnlocked = state.unlockedShips && state.unlockedShips.includes(ship.id);
    const isEquipped = (state.shipType === ship.id);
    const isInspected = (pilotInspectedShip === ship.id);
    const card = document.createElement('div');
    card.className = `store-card ship-select-card ${isEquipped || isInspected ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
    card.id = `initShip_${ship.id}`;
    card.onclick = () => { selectInitialShip(ship.id); };

    let icon = '🚀';
    if (ship.id === 'scout') icon = '⚡';
    else if (ship.id === 'interceptor') icon = '🗡️';
    else if (ship.id === 'assault') icon = '💥';
    else if (ship.id === 'phoenix') icon = '☀️';
    else if (ship.id === 'guardian') icon = '🛡️';
    else if (ship.id === 'destroyer') icon = '🔨';
    else if (ship.id === 'phantom') icon = '👻';
    else if (ship.id === 'nova') icon = '🌟';
    else if (ship.id === 'titan') icon = '🗿';
    else if (ship.id === 'eclipse') icon = '🌑';
    else if (ship.id === 'void_hunter') icon = '👾';
    else if (ship.id === 'reaper') icon = '🌌';
    else if (ship.id === 'galaxy_guardian') icon = '🌠';
    else if (ship.id === 'celestial') icon = '✨';
    else if (ship.id === 'apex') icon = '👑';

    const priceLabel = ship.cost >= 1000000 ? (ship.cost / 1000000).toFixed(1) + 'M' : (ship.cost / 1000) + 'K';

    card.innerHTML = `
      <div style="font-size: 22px; margin-bottom: 2px;">${icon}</div>
      <div style="font-weight: 800; font-size: 11px; color: #00e5ff;">${ship.name}</div>
      <div style="font-size: 9px; color: #9db2d9;">${ship.role}</div>
      <div style="font-size: 8.5px; color: ${isUnlocked ? '#00ff88' : '#ffd166'}; margin-top: 3px; font-weight: 700;">
        ${isEquipped ? '⭐ EQUIPPED' : (isUnlocked ? '🟢 READY' : `🔒 S${ship.unlockSector} | ${priceLabel} CR`)}
      </div>
    `;
    pilotGrid.appendChild(card);
  });
}


function updateStoreItemButtons() {
  document.getElementById('storeCreditsVal').textContent = state.credits;
  const plasmaCost = state.plasmaTier * 150;
  const railgunCost = state.railgunTier * 200;
  const flakCost = state.flakTier * 180;
  const torpCost = state.torpedoTier * 220;
  const teslaCost = state.teslaTier * 240;

  const buyPlasmaBtn = document.getElementById('buyPlasmaBtn');
  const buyRailgunBtn = document.getElementById('buyRailgunBtn');
  const buyFlakBtn = document.getElementById('buyFlakBtn');
  const buyTorpBtn = document.getElementById('buyTorpBtn');
  const buyTeslaBtn = document.getElementById('buyTeslaBtn');
  const buyLifeBtn = document.getElementById('buyLifeBtn');

  if (buyPlasmaBtn) buyPlasmaBtn.disabled = (state.plasmaTier >= 10 || state.credits < plasmaCost);
  if (buyRailgunBtn) buyRailgunBtn.disabled = (state.railgunTier >= 10 || state.credits < railgunCost);
  if (buyFlakBtn) buyFlakBtn.disabled = (state.flakTier >= 10 || state.credits < flakCost);
  if (buyTorpBtn) buyTorpBtn.disabled = (state.torpedoTier >= 10 || state.credits < torpCost);
  if (buyTeslaBtn) buyTeslaBtn.disabled = (state.teslaTier >= 10 || state.credits < teslaCost);
  if (buyLifeBtn) {
    const canAffordLife = (state.credits >= 40000);
    buyLifeBtn.disabled = !canAffordLife;
    buyLifeBtn.textContent = canAffordLife ? 'BUY +1 LIFE (40,000 CR)' : 'NEED 40,000 CR';
  }

  const plasmaCostText = document.getElementById('plasmaCostText');
  const railgunCostText = document.getElementById('railgunCostText');
  const flakCostText = document.getElementById('flakCostText');
  const torpCostText = document.getElementById('torpCostText');
  const teslaCostText = document.getElementById('teslaCostText');

  if (plasmaCostText) plasmaCostText.textContent = state.plasmaTier >= 10 ? 'MAXED' : `${plasmaCost} CR`;
  if (railgunCostText) railgunCostText.textContent = state.railgunTier >= 10 ? 'MAXED' : `${railgunCost} CR`;
  if (flakCostText) flakCostText.textContent = state.flakTier >= 10 ? 'MAXED' : `${flakCost} CR`;
  if (torpCostText) torpCostText.textContent = state.torpedoTier >= 10 ? 'MAXED' : `${torpCost} CR`;
  if (teslaCostText) teslaCostText.textContent = state.teslaTier >= 10 ? 'MAXED' : `${teslaCost} CR`;

  const plasmaTierText = document.getElementById('plasmaTierText');
  const railgunTierText = document.getElementById('railgunTierText');
  const flakTierText = document.getElementById('flakTierText');
  const torpTierText = document.getElementById('torpTierText');
  const teslaTierText = document.getElementById('teslaTierText');

  if (plasmaTierText) plasmaTierText.textContent = state.plasmaTier >= 10 ? 'MAX POWER' : `Tier ${state.plasmaTier} / 10`;
  if (railgunTierText) railgunTierText.textContent = state.railgunTier >= 10 ? 'MAX POWER' : `Tier ${state.railgunTier} / 10`;
  if (flakTierText) flakTierText.textContent = state.flakTier >= 10 ? 'MAX POWER' : `Tier ${state.flakTier} / 10`;
  if (torpTierText) torpTierText.textContent = state.torpedoTier >= 10 ? 'MAX POWER' : `Tier ${state.torpedoTier} / 10`;
  if (teslaTierText) teslaTierText.textContent = state.teslaTier >= 10 ? 'MAX POWER' : `Tier ${state.teslaTier} / 10`;
  document.getElementById('storeLivesCountText').textContent = `Current Lives: ${state.lives}`;

  // Autonomous Wingman Drone Buttons
  const buyDroneAlphaBtn = document.getElementById('buyDroneAlphaBtn');
  const buyDroneBetaBtn = document.getElementById('buyDroneBetaBtn');
  const droneAlphaStatusText = document.getElementById('droneAlphaStatusText');
  const droneBetaStatusText = document.getElementById('droneBetaStatusText');

  if (buyDroneAlphaBtn) {
    buyDroneAlphaBtn.disabled = (state.dronesUnlocked >= 1 || state.credits < 350);
    if (state.dronesUnlocked >= 1) buyDroneAlphaBtn.textContent = 'DEPLOYED';
  }
  if (droneAlphaStatusText) {
    droneAlphaStatusText.textContent = state.dronesUnlocked >= 1 ? 'ONLINE (PORT)' : 'Not Deployed';
    droneAlphaStatusText.style.color = state.dronesUnlocked >= 1 ? '#00ff88' : 'var(--primary)';
  }

  if (buyDroneBetaBtn) {
    buyDroneBetaBtn.disabled = (state.dronesUnlocked < 1 || state.dronesUnlocked >= 2 || state.credits < 600);
    if (state.dronesUnlocked >= 2) buyDroneBetaBtn.textContent = 'DEPLOYED';
    else if (state.dronesUnlocked < 1) buyDroneBetaBtn.textContent = 'LOCKED (REQ ALPHA)';
  }
  if (droneBetaStatusText) {
    droneBetaStatusText.textContent = state.dronesUnlocked >= 2 ? 'ONLINE (STARBOARD)' : (state.dronesUnlocked < 1 ? 'Locked' : 'Ready to Deploy');
    droneBetaStatusText.style.color = state.dronesUnlocked >= 2 ? '#00ff88' : 'var(--primary)';
  }

  // Update Hangar Ship Action Buttons and Active Cards
  checkProgressionUnlocks();
  // Render full 16-ship Fleet in Hangar
  const hangarGrid = document.getElementById('tabHangarContent');
  if (hangarGrid) {
    hangarGrid.innerHTML = '';
    const highest = Math.max(state.highestSector || 1, state.sector || 1);

    Object.values(SHIP_DEFINITIONS).forEach(ship => {
      const isUnlocked = state.unlockedShips && state.unlockedShips.includes(ship.id);
      const isEquipped = (state.shipType === ship.id);
      const canAfford = (state.credits >= ship.cost);

      const card = document.createElement('div');
      card.className = `ship-card ${isEquipped ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.id = `shipCard_${ship.id}`;
      card.onclick = () => { selectStarship(ship.id); };

      let icon = '🚀';
      if (ship.id === 'scout') icon = '⚡';
      else if (ship.id === 'interceptor') icon = '🗡️';
      else if (ship.id === 'assault') icon = '💥';
      else if (ship.id === 'phoenix') icon = '☀️';
      else if (ship.id === 'guardian') icon = '🛡️';
      else if (ship.id === 'destroyer') icon = '🔨';
      else if (ship.id === 'phantom') icon = '👻';
      else if (ship.id === 'nova') icon = '🌟';
      else if (ship.id === 'titan') icon = '🗿';
      else if (ship.id === 'eclipse') icon = '🌑';
      else if (ship.id === 'void_hunter') icon = '👾';
      else if (ship.id === 'reaper') icon = '🌌';
      else if (ship.id === 'galaxy_guardian') icon = '🌠';
      else if (ship.id === 'celestial') icon = '✨';
      else if (ship.id === 'apex') icon = '👑';

      let btnClass = 'locked';
      let btnText = `🔒 SEC ${ship.unlockSector} OR ${ship.cost.toLocaleString()} CR`;
      let btnDisabled = true;

      if (isEquipped) {
        btnClass = 'equipped';
        btnText = '⭐ EQUIPPED';
        btnDisabled = true;
      } else if (isUnlocked) {
        btnClass = 'equip';
        btnText = '🟢 EQUIP VESSEL';
        btnDisabled = false;
      } else if (canAfford) {
        btnClass = 'buy';
        btnText = `💰 BUY & EQUIP (${ship.cost.toLocaleString()} CR)`;
        btnDisabled = false;
      }

      card.innerHTML = `
        <div class="ship-icon">${icon}</div>
        <div class="ship-title">${ship.name}</div>
        <div class="ship-role">${ship.role} <span style="font-size: 8.5px; color: #ffd166;">(${ship.tier})</span></div>
        <div class="ship-stat-row">
          <span>Spd: ${ship.speed}</span>
          <div class="ship-stat-bar-bg"><div class="ship-stat-bar-fill" style="width: ${Math.min(100, (ship.speed / 34) * 100)}%; background: #00e5ff;"></div></div>
        </div>
        <div class="ship-stat-row">
          <span>Hull: ${ship.hull}</span>
          <div class="ship-stat-bar-bg"><div class="ship-stat-bar-fill" style="width: ${Math.min(100, (ship.hull / 600) * 100)}%; background: #00ff88;"></div></div>
        </div>
        <div class="ship-stat-row">
          <span>Shd: ${ship.shield}</span>
          <div class="ship-stat-bar-bg"><div class="ship-stat-bar-fill" style="width: ${Math.min(100, (ship.shield / 600) * 100)}%; background: #00f0ff;"></div></div>
        </div>
        <div style="font-size: 9.5px; color: #00f0ff; margin-top: 4px; font-weight: 700;">🔫 ${ship.primaryWeapon}</div>
        <div style="font-size: 9.0px; color: #ffd166; margin-top: 2px;">✨ ${ship.specialAbility}</div>
        <button class="ship-action-btn ${btnClass}" id="btnHangar_${ship.id}" ${btnDisabled ? 'disabled' : ''} onclick="event.stopPropagation(); selectStarship('${ship.id}')">${btnText}</button>
      `;
      hangarGrid.appendChild(card);
    });
  }
}


function updateAbilityUI() {
  const card = document.getElementById('abilityCard');
  const nameEl = document.getElementById('abilityNameText');
  const subEl = document.getElementById('abilitySubText');
  const barBg = document.getElementById('abilityCooldownBarBg');
  const barFill = document.getElementById('abilityCooldownBarFill');
  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const ab = cfg.ability;

  if (!card || !ab) return;
  if (nameEl) nameEl.textContent = `${ab.icon} ${ab.name}`;

  if (state.abilityCooldown > 0) {
    card.classList.remove('ready');
    const remaining = Math.ceil(state.abilityCooldown);
    if (subEl) subEl.textContent = `CD: ${remaining}s`;
    if (barBg && barFill) {
      barBg.style.display = 'block';
      const pct = Math.max(0, Math.min(100, (1 - state.abilityCooldown / (state.abilityMaxCooldown || 20)) * 100));
      barFill.style.width = `${pct}%`;
    }
  } else {
    card.classList.add('ready');
    if (subEl) subEl.textContent = 'READY [C]';
    if (barBg) barBg.style.display = 'none';
  }
}


function updateHostilesHUD() {
  const remaining = enemies.filter(e => e.alive).length + (state.reinforcementsRemaining || 0);
  const hostilesVal = document.getElementById('hostilesVal');
  if (hostilesVal) {
    hostilesVal.textContent = Math.max(0, remaining);
  }
  const threatBadge = document.getElementById('threatBadge');
  if (threatBadge) {
    const t = getSectorThreat(state.sector);
    threatBadge.textContent = t.label;
    threatBadge.style.color = t.color;
  }
}


function spawnExplosionFX(pos, colorHex, count = 18, scale = 1.0) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(0.15 * scale, 0.15 * scale, 0.15 * scale);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    const dir = new THREE.Vector3((Math.random()-0.5)*8*scale, (Math.random()-0.5)*8*scale, (Math.random()-0.5)*6*scale);
    particles.push({ mesh, vx: dir.x, vy: dir.y, vz: dir.z, rotX: Math.random()*5, rotY: Math.random()*5, life: 0.55*scale, maxLife: 0.55*scale });
  }
}


function triggerShake(intensity) {
  const scaled = intensity * state.screenShake;
  const shakeEl = document.getElementById('shakeContainer');
  let count = 6;
  const interval = setInterval(() => {
    if (count <= 0) { shakeEl.style.transform = 'translate(0px, 0px)'; clearInterval(interval); return; }
    shakeEl.style.transform = `translate(${(Math.random()-0.5)*scaled}px, ${(Math.random()-0.5)*scaled}px)`;
    count--;
  }, 35);
}


function spawnFloatingText(worldPos, text, color = "#fff") {
  const layer = document.getElementById('combatTextLayer');
  const tempV = worldPos.clone().project(camera);
  const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
  const el = document.createElement('div');
  el.className = 'combat-text';
  el.textContent = text;
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  layer.appendChild(el);
  setTimeout(() => { if (el && typeof el.remove === 'function') el.remove(); else if (el && el.parentNode) el.parentNode.removeChild(el); }, 850);
}


function updateHUD() {
  document.getElementById('hullVal').textContent = `${Math.ceil((state.hull / state.maxHull) * 100)}%`;
  document.getElementById('hullFill').style.width = `${Math.max(0, (state.hull / state.maxHull) * 100)}%`;

  document.getElementById('shieldVal').textContent = `${Math.ceil((state.shield / state.maxShield) * 100)}%`;
  document.getElementById('shieldFill').style.width = `${Math.max(0, (state.shield / state.maxShield) * 100)}%`;

  // 3 LIVES UPDATE
  const livesRow = document.getElementById('livesIconsRow');
  if (livesRow) {
    livesRow.innerHTML = '';
    for (let i = 0; i < state.lives; i++) {
      const icon = document.createElement('span');
      icon.textContent = '🚀';
      livesRow.appendChild(icon);
    }
  }
  const livesVal = document.getElementById('livesVal');
  if (livesVal) livesVal.textContent = `${state.lives}/${state.maxLives}`;

  document.getElementById('scoreVal').textContent = state.score;
  document.getElementById('creditsVal').textContent = state.credits;
  document.getElementById('missileCountText').textContent = `🚀 Missiles x${state.missileStock}`;

  const empCard = document.getElementById('empCard');
  const empText = document.getElementById('empStateText');
  if (state.empCharge >= 100) {
    empCard.classList.add('charged');
    empText.textContent = "READY! [Q]";
  } else {
    empCard.classList.remove('charged');
    empText.textContent = `EMP (${Math.floor(state.empCharge)}%)`;
  }

  if (state.bossActive && state.bossEntity) {
    const pct = Math.max(0, Math.ceil((state.bossEntity.hp / state.bossEntity.maxHp) * 100));
    document.getElementById('bossMeterFill').style.width = `${pct}%`;
    document.getElementById('bossHpPercent').textContent = `${pct}%`;
  }

  // Weapon Level Badges & Quick Upgrade Buttons
  const plasmaCost = state.plasmaTier * 150;
  const railgunCost = state.railgunTier * 200;
  const flakCost = state.flakTier * 180;

  const wep1Badge = document.getElementById('wep1Badge');
  const wep1Btn = document.getElementById('wep1UpgradeBtn');
  if (wep1Badge) wep1Badge.textContent = state.plasmaTier >= 10 ? 'MAX' : `Lv. ${state.plasmaTier}`;
  if (wep1Btn) {
    if (state.plasmaTier >= 10) {
      wep1Btn.textContent = '★ MAX PWR';
      wep1Btn.disabled = true;
    } else {
      wep1Btn.textContent = `⚡ +PWR (${plasmaCost} CR)`;
      wep1Btn.disabled = (state.credits < plasmaCost);
    }
  }

  const wep2Badge = document.getElementById('wep2Badge');
  const wep2Btn = document.getElementById('wep2UpgradeBtn');
  if (wep2Badge) wep2Badge.textContent = state.railgunTier >= 10 ? 'MAX' : `Lv. ${state.railgunTier}`;
  if (wep2Btn) {
    if (state.railgunTier >= 10) {
      wep2Btn.textContent = '★ MAX PWR';
      wep2Btn.disabled = true;
    } else {
      wep2Btn.textContent = `⚡ +PWR (${railgunCost} CR)`;
      wep2Btn.disabled = (state.credits < railgunCost);
    }
  }

  const wep3Badge = document.getElementById('wep3Badge');
  const wep3Btn = document.getElementById('wep3UpgradeBtn');
  if (wep3Badge) wep3Badge.textContent = state.flakTier >= 10 ? 'MAX' : `Lv. ${state.flakTier}`;
  if (wep3Btn) {
    if (state.flakTier >= 10) {
      wep3Btn.textContent = '★ MAX PWR';
      wep3Btn.disabled = true;
    } else {
      wep3Btn.textContent = `⚡ +PWR (${flakCost} CR)`;
      wep3Btn.disabled = (state.credits < flakCost);
    }
  }

  const torpCost = state.torpedoTier * 220;
  const wep4Badge = document.getElementById('wep4Badge');
  const wep4Btn = document.getElementById('wep4UpgradeBtn');
  if (wep4Badge) wep4Badge.textContent = state.torpedoTier >= 10 ? 'MAX' : `Lv. ${state.torpedoTier}`;
  if (wep4Btn) {
    if (state.torpedoTier >= 10) {
      wep4Btn.textContent = '★ MAX PWR';
      wep4Btn.disabled = true;
    } else {
      wep4Btn.textContent = `⚡ +PWR (${torpCost} CR)`;
      wep4Btn.disabled = (state.credits < torpCost);
    }
  }

  const teslaCost = state.teslaTier * 240;
  const wep5Badge = document.getElementById('wep5Badge');
  const wep5Btn = document.getElementById('wep5UpgradeBtn');
  if (wep5Badge) wep5Badge.textContent = state.teslaTier >= 10 ? 'MAX' : `Lv. ${state.teslaTier}`;
  if (wep5Btn) {
    if (state.teslaTier >= 10) {
      wep5Btn.textContent = '★ MAX PWR';
      wep5Btn.disabled = true;
    } else {
      wep5Btn.textContent = `⚡ +PWR (${teslaCost} CR)`;
      wep5Btn.disabled = (state.credits < teslaCost);
    }
  }

  updateHostilesHUD();

  const missileQuickBtn = document.getElementById('buyMissileQuickBtn');
  if (missileQuickBtn) {
    missileQuickBtn.disabled = (state.credits < 100 || state.missileStock >= state.maxMissiles);
  }
  // Overcharge HUD status
  const overchargeCard = document.getElementById('overchargeCard');
  const overchargeText = document.getElementById('overchargeStateText');
  if (state.overchargeActive) {
    if (overchargeCard) {
      overchargeCard.classList.add('ready');
      overchargeCard.style.background = 'linear-gradient(135deg, rgba(255, 0, 128, 0.4), rgba(0, 240, 255, 0.4))';
    }
    if (overchargeText) overchargeText.textContent = `BURST (${Math.ceil(state.overchargeTimer)}s)`;
  } else if (state.overchargeCharge >= 100) {
    if (overchargeCard) {
      overchargeCard.classList.add('ready');
      overchargeCard.style.background = '';
    }
    if (overchargeText) overchargeText.textContent = "READY! [R]";
  } else {
    if (overchargeCard) {
      overchargeCard.classList.remove('ready');
      overchargeCard.style.background = '';
    }
    if (overchargeText) overchargeText.textContent = `OVERDRIVE (${Math.floor(state.overchargeCharge)}%)`;
  }

  // Pilot Callsign & Military Rank HUD Telemetry
  const pilotNameEl = document.getElementById('pilotNameVal');
  if (pilotNameEl) pilotNameEl.textContent = state.pilotName || 'STARFIGHTER ACE';
  const pilotRankEl = document.getElementById('pilotRankVal');
  if (pilotRankEl) {
    const rank = getPlayerRank(state.xp || 0);
    pilotRankEl.textContent = `${rank.badge} ${rank.title}`;
  }

  // Tactical AI Auto-Aim Telemetry
  const autoAimCard = document.getElementById('autoAimCard');
  const autoAimText = document.getElementById('autoAimStateText');
  const autoAimSub = document.getElementById('autoAimSubText');
  const rebootBtn = document.getElementById('rebootAutoAimBtn');
  if (autoAimCard && autoAimText) {
    if (state.autoAimActive && state.autoAimTimer > 0) {
      autoAimCard.classList.add('ready');
      autoAimCard.style.borderColor = '#ffd166';
      autoAimCard.style.boxShadow = '0 0 16px rgba(255, 209, 102, 0.6)';
      autoAimText.textContent = `🎯 AUTO-AIM: ${Math.ceil(state.autoAimTimer)}s`;
      if (autoAimSub) autoAimSub.textContent = "AI Lock-On Active";
    } else {
      autoAimCard.classList.remove('ready');
      autoAimCard.style.borderColor = '';
      autoAimCard.style.boxShadow = '';
      autoAimText.textContent = "🎯 AUTO-AIM: OFF";
      if (autoAimSub) autoAimSub.textContent = "Earn via time / drops";
    }
    if (rebootBtn) rebootBtn.disabled = (state.credits < 120);
  }
}


function addScore(pts) {
  state.combo = Math.min(5.0, state.combo + 0.2);
  state.comboTimer = 3.5;
  if (state.combo >= 2.5) {
    trackBountyProgress('combo', 1);
  }
  state.score += Math.floor(pts * state.combo);
  state.empCharge = Math.min(100, state.empCharge + pts * 0.12);
  if (!state.overchargeActive) {
    state.overchargeCharge = Math.min(100, state.overchargeCharge + pts * 0.22);
  }
  if (state.score > state.highScore) {
    state.highScore = state.score;
    saveGameData();
  }
  if (state.credits >= 1500) unlockAchievement('tycoon');
  updateHUD();
}


const COMMS_MESSAGES = [
  { src: 'HIVE FREQUENCY', text: '<< Bioluminescent bio-signature detected... assemble intercept swarm... >>' },
  { src: 'FLEET COMMAND', text: 'Tactical Command: Multiple alien wings incoming! Continuous laser beam effective.' },
  { src: 'SQUADRON LEAD', text: 'Alpha Flight: Target the asteroid belt for high-purity crystal scrap!' },
  { src: 'HIVE QUEEN ECHO', text: '<< The intruder will not breach our core hive domain... >>' },
  { src: 'FLIGHT COMPUTER', text: 'Overcharge capacitors charging from combat kills. Hit [R] for Colossal Super-Beam!' },
  { src: 'FLEET COMMAND', text: 'Heavy flagship Leviathan ahead in Sector 3! Destroy its dorsal batteries!' },
  { src: 'TACTICAL RADAR', text: 'Sensors online. Deploy Escort Drones from Tactical Armory [B] for flank cover.' }
];

function updateComms(dt) {
  if (state.paused) return;
  state.commsTimer -= dt;
  if (state.commsTimer <= 0) {
    state.commsTimer = 14 + Math.random() * 10;
    const msg = COMMS_MESSAGES[Math.floor(Math.random() * COMMS_MESSAGES.length)];
    const commsBox = document.getElementById('commsBox');
    const commsSrc = document.getElementById('commsSource');
    const commsTxt = document.getElementById('commsMessage');
    if (commsBox && commsSrc && commsTxt) {
      commsSrc.textContent = msg.src;
      commsTxt.textContent = msg.text;
      commsBox.style.opacity = '1';
      audio.playCommsBeep();
      setTimeout(() => {
        if (commsBox) commsBox.style.opacity = '0.4';
      }, 7000);
    }
  }
}


function showOnScreenError(title, err) {
  console.error("Game telemetry error:", title, err);
  const el = document.getElementById('runtimeErrorBanner');
  if (el) el.remove();
}


function showAchievementToast(title, desc) {
  try {
    const toast = document.getElementById('achievementToast');
    const toastTitle = document.getElementById('achievementToastTitle');
    const toastDesc = document.getElementById('achievementToastDesc');
    if (toast && toastTitle && toastDesc) {
      toastTitle.textContent = title;
      toastDesc.textContent = desc;
      toast.style.transform = 'translateX(-50%) translateY(0px)';
      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-120px)';
      }, 3600);
    }
  } catch(e) {}
};

export {
  updateAimCoordinates,
  updateWeaponDockForShip,
  updateBountyHUD,
  renderMenuRankAndBounty,
  renderAchievementsMenu,
  updateGalaxyModalUI,
  updatePilotShipDetailUI,
  selectInitialShip,
  renderPilotShipSelectionGrid,
  updateStoreItemButtons,
  updateAbilityUI,
  updateHostilesHUD,
  spawnExplosionFX,
  triggerShake,
  spawnFloatingText,
  updateHUD,
  addScore,
  updateComms,
  showOnScreenError,
  showAchievementToast
};

if (typeof window !== 'undefined') {
  window.updateHUD = updateHUD;
  window.updateWeaponDockForShip = updateWeaponDockForShip;
  window.updateAbilityUI = updateAbilityUI;
  window.updateStoreItemButtons = updateStoreItemButtons;
  window.updateGalaxyModalUI = updateGalaxyModalUI;
  window.renderPilotShipSelectionGrid = renderPilotShipSelectionGrid;
  window.updatePilotShipDetailUI = updatePilotShipDetailUI;
  window.selectInitialShip = selectInitialShip;
  window.showAchievementToast = showAchievementToast;
  window.spawnFloatingText = spawnFloatingText;
  window.spawnExplosionFX = spawnExplosionFX;
  window.triggerShake = triggerShake;
  window.addScore = addScore;
  window.updateHostilesHUD = updateHostilesHUD;
  window.updateBountyHUD = updateBountyHUD;
  window.renderMenuRankAndBounty = renderMenuRankAndBounty;
  window.renderAchievementsMenu = renderAchievementsMenu;
}
