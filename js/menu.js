/**
 * ALIEN ASSAULT 3D - MENUS & NAVIGATION STACK
 * Universal back stack, modals (Pilot, Store, Galaxy, Tutorial, Game Over)
 */

import { state } from './state.js';
import { audio } from './audio.js';

const NavigationStack = {
  stack: [],
  push(modalId) {
    if (!this.stack.includes(modalId)) {
      this.stack.push(modalId);
    }
  },
  back() {
    if (this.stack.length > 1) {
      const currentModalId = this.stack.pop();
      closeModalById(currentModalId);
      const prevModalId = this.stack[this.stack.length - 1];
      openModalById(prevModalId, true);
    } else if (this.stack.length === 1) {
      const currentModalId = this.stack.pop();
      closeModalById(currentModalId);
      state.paused = false;
    } else {
      closeAllModals();
      state.paused = false;
    }
  }
};

function closeModalById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function openModalById(id, isBack = false) {
  if (id === 'pilotModal') {
    openPilotRegistrationModal();
  } else if (id === 'storeModal') {
    openStoreModal(false);
  } else if (id === 'mainMenuModal') {
    openMenuModal();
  } else if (id === 'galaxyModal') {
    openGalaxyModal();
  } else if (id === 'tutorialModal') {
    openTutorialModal();
  }
}

function closeAllModals() {
  ['pilotModal', 'storeModal', 'mainMenuModal', 'galaxyModal', 'tutorialModal', 'emergencyHullModal'].forEach(id => {
    closeModalById(id);
  });
}

const menuModal = document.getElementById('mainMenuModal');
function toggleMenuModal() {
  if (document.getElementById('storeModal').classList.contains('active')) return;
  if (menuModal.classList.contains('active')) closeMenuModal();
  else openMenuModal();
}

function openMenuModal(isBack = false) {
  if (!isBack) NavigationStack.push("mainMenuModal");
  state.paused = true;
  const mp = document.getElementById('menuPilotNameVal');
  if (mp) mp.textContent = state.pilotName || 'STARFIGHTER ACE';
  document.getElementById('menuHighScoreVal').textContent = state.highScore;
  document.getElementById('menuCreditsVal').textContent = `${state.credits} CR`;
  document.getElementById('menuKillsVal').textContent = state.totalAliensKilled || 0;
  document.getElementById('menuSectorVal').textContent = `Sector ${state.highestSector || state.sector}`;
  renderAchievementsMenu();
  renderMenuRankAndBounty();
  menuModal.classList.add('active');
}

function closeMenuModal() {
  menuModal.classList.remove('active');
  state.paused = false;
}

function restartFromMenu() {
  closeMenuModal();
  startMission();
}


let currentTutorialStep = 1;
const TOTAL_TUTORIAL_STEPS = 5;
const tutorialModal = document.getElementById('tutorialModal');

function toggleTutorialModal() {
  if (tutorialModal.classList.contains('active')) closeTutorialModal();
  else openTutorialModal();
}

function openTutorialModal(isBack = false) {
  if (!isBack) NavigationStack.push("tutorialModal");
  audio.init(); audio.resume();
  state.paused = true;
  showTutorialStep(1);
  tutorialModal.classList.add('active');
}

function closeTutorialModal() {
  tutorialModal.classList.remove('active');
  state.paused = false;
  localStorage.setItem('alien_assault_tutorial_seen', 'true');
}

const TUTORIAL_TITLES = [
  'STEP 1 OF 5: PILOTING & CONTINUOUS AUTO-FIRE',
  'STEP 2 OF 5: 5-WEAPON ARSENAL & POWER UPGRADES',
  'STEP 3 OF 5: SUPER ABILITIES & COMBO OVERCHARGES',
  'STEP 4 OF 5: TACTICAL ARMORY STORE & 5 STARFIGHTERS',
  'STEP 5 OF 5: SECTOR OBJECTIVES, DIVE WAVES & BOSSES'
];

function showTutorialStep(step) {
  currentTutorialStep = Math.max(1, Math.min(TOTAL_TUTORIAL_STEPS, step));

  for (let i = 1; i <= TOTAL_TUTORIAL_STEPS; i++) {
    const stepEl = document.getElementById(`tutStep${i}`);
    const tabBtn = document.getElementById(`tutTab${i}Btn`);
    const isCurrent = (i === currentTutorialStep);
    if (stepEl) stepEl.style.display = isCurrent ? 'block' : 'none';
    if (tabBtn) tabBtn.classList.toggle('active', isCurrent);
  }

  // Update dots
  const dots = document.querySelectorAll('.tut-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', (idx + 1) === currentTutorialStep);
  });

  // Update progress bar & label
  const progressFill = document.getElementById('tutProgressFill');
  if (progressFill) progressFill.style.width = `${(currentTutorialStep / TOTAL_TUTORIAL_STEPS) * 100}%`;

  const stepLabel = document.getElementById('tutStepLabel');
  if (stepLabel) stepLabel.textContent = TUTORIAL_TITLES[currentTutorialStep - 1] || `STEP ${currentTutorialStep} OF 5`;

  const prevBtn = document.getElementById('tutPrevBtn');
  const nextBtn = document.getElementById('tutNextBtn');
  if (prevBtn) prevBtn.disabled = (currentTutorialStep === 1);
  if (nextBtn) {
    if (currentTutorialStep === TOTAL_TUTORIAL_STEPS) {
      nextBtn.textContent = 'FINISH MANUAL ▶';
    } else {
      nextBtn.textContent = 'NEXT STEP ▶';
    }
  }
}

function stepTutorial(delta) {
  if (currentTutorialStep === TOTAL_TUTORIAL_STEPS && delta > 0) {
    closeTutorialModal();
    return;
  }
  if (audio && typeof audio.playBeep === 'function') audio.playBeep();
  showTutorialStep(currentTutorialStep + delta);
}

document.getElementById('tutorialBtn')?.addEventListener('click', openTutorialModal);
document.getElementById('menuBtn').addEventListener('click', toggleMenuModal);
document.getElementById('pauseBtn').addEventListener('click', toggleMenuModal);
document.getElementById('resumeBtn').addEventListener('click', closeMenuModal);
document.getElementById('restartBtn').addEventListener('click', restartFromMenu);


function openGalaxyModal(isBack = false) {
  if (!isBack) NavigationStack.push("galaxyModal");
  state.paused = true;
  updateGalaxyModalUI();
  const modal = document.getElementById('galaxyModal');
  if (modal) modal.classList.add('active');
}

function closeGalaxyModal() {
  const modal = document.getElementById('galaxyModal');
  if (modal) modal.classList.remove('active');
  state.paused = false;
}

function openPilotRegistrationModal(isBack = false) {
  if (!isBack) NavigationStack.push("pilotModal");
  state.paused = true;
  checkProgressionUnlocks();
  const input = document.getElementById('pilotCallsignInput');
  if (input) input.value = state.pilotName || 'STARFIGHTER ACE';

  const hsEl = document.getElementById('pilotRecHighScore');
  const killsEl = document.getElementById('pilotRecKills');
  const secEl = document.getElementById('pilotRecSector');
  const credsEl = document.getElementById('pilotRecCredits');
  const livesEl = document.getElementById('pilotRecLives');

  if (hsEl) hsEl.textContent = state.highScore || 0;
  if (killsEl) killsEl.textContent = state.totalAliensKilled || 0;
  if (secEl) secEl.textContent = `Sector ${state.highestSector || 1}`;
  if (credsEl) credsEl.textContent = `${(state.credits || 0).toLocaleString()} CR`;
  if (livesEl) livesEl.textContent = state.lives || 3;

  window.pilotInspectedShip = state.shipType || 'valkyrie';
  let pilotInspectedShip = window.pilotInspectedShip;
  renderPilotShipSelectionGrid();
  updatePilotShipDetailUI(pilotInspectedShip);

  const pilotGalaxyEl = document.getElementById('pilotGalaxyName');
  const curG = GALAXIES[state.selectedGalaxy || 'cosmic'] || GALAXIES.cosmic;
  if (pilotGalaxyEl) pilotGalaxyEl.textContent = `${curG.icon} ${curG.name}`;
  const pilotBackBtn = document.getElementById('pilotBackBtn');
  if (pilotBackBtn) {
    pilotBackBtn.style.display = (NavigationStack.stack.length > 1) ? 'inline-flex' : 'none';
  }
  const pilotModal = document.getElementById('pilotModal');
  if (pilotModal) pilotModal.classList.add('active');
}

function closePilotRegistrationModal() {
  const pilotModal = document.getElementById('pilotModal');
  if (pilotModal) pilotModal.classList.remove('active');
  state.paused = false;
}

function confirmPilotAndLaunch() {
  const input = document.getElementById('pilotCallsignInput');
  let name = (input && input.value ? input.value : 'STARFIGHTER ACE').trim().toUpperCase();
  if (!name) name = 'STARFIGHTER ACE';
  if (name.length > 22) name = name.slice(0, 22);

  state.pilotName = name;
  saveGameData();

  audio.init();
  audio.resume();
  audio.playPowerup();

  closePilotRegistrationModal();
  state.paused = false;
  updateHUD();
}

function openTutorialModalFromEnlist() {
  closePilotRegistrationModal();
  openTutorialModal();
}


function toggleStoreModal() {
  const storeModal = document.getElementById('storeModal');
  if (storeModal.classList.contains('active')) closeStoreModal();
  else openStoreModal(false);
}
document.getElementById('storeBtn').addEventListener('click', toggleStoreModal);

function openStoreModal(isSectorClear = false, isBack = false) {
  if (!isBack) NavigationStack.push("storeModal");
  state.paused = true;
  document.getElementById('storeCreditsVal').textContent = state.credits;
  document.getElementById('storeLivesCountText').textContent = `Current Lives: ${state.lives}`;
  document.getElementById('storeHullText').textContent = `Max: ${state.maxHull}`;
  document.getElementById('storeShieldText').textContent = `Regen: ${state.shieldRechargeRate}/s`;
  document.getElementById('storeMissileStockText').textContent = `Current: ${state.missileStock}/${state.maxMissiles}`;

  const resumeBtn = document.getElementById('resumeFromStoreBtn');
  const nextSecBtn = document.getElementById('nextSectorActionBtn');
  if (isSectorClear) {
    resumeBtn.style.display = 'none';
    nextSecBtn.style.display = 'inline-block';
    nextSecBtn.textContent = `ENGAGE SECTOR ${state.sector + 1}`;
  } else {
    resumeBtn.style.display = 'inline-block';
    nextSecBtn.style.display = 'none';
  }

  updateStoreItemButtons();
  document.getElementById('storeModal').classList.add('active');
}

function closeStoreModal() {
  document.getElementById('storeModal').classList.remove('active');
  state.paused = false;
}

function showStoreTab(tab) {
  ['Weapons', 'Systems', 'Ammo', 'Hangar'].forEach(t => {
    const btn = document.getElementById(`tab${t}Btn`);
    const content = document.getElementById(`tab${t}Content`);
    const match = (t.toLowerCase() === tab.toLowerCase());
    if (btn) btn.classList.toggle('active', match);
    if (content) content.style.display = match ? (t === 'Hangar' ? 'grid' : 'grid') : 'none';
  });
}

export {
  NavigationStack,
  closeModalById,
  openModalById,
  closeAllModals,
  toggleMenuModal,
  openMenuModal,
  closeMenuModal,
  restartFromMenu,
  toggleTutorialModal,
  openTutorialModal,
  closeTutorialModal,
  showTutorialStep,
  stepTutorial,
  openGalaxyModal,
  closeGalaxyModal,
  openPilotRegistrationModal,
  closePilotRegistrationModal,
  confirmPilotAndLaunch,
  openTutorialModalFromEnlist,
  toggleStoreModal,
  openStoreModal,
  closeStoreModal,
  showStoreTab
};

if (typeof window !== 'undefined') {
  window.NavigationStack = NavigationStack;
  window.openModalById = openModalById;
  window.closeModalById = closeModalById;
  window.closeAllModals = closeAllModals;
  window.toggleMenuModal = toggleMenuModal;
  window.openMenuModal = openMenuModal;
  window.closeMenuModal = closeMenuModal;
  window.restartFromMenu = restartFromMenu;
  window.toggleTutorialModal = toggleTutorialModal;
  window.openTutorialModal = openTutorialModal;
  window.closeTutorialModal = closeTutorialModal;
  window.showTutorialStep = showTutorialStep;
  window.stepTutorial = stepTutorial;
  window.openGalaxyModal = openGalaxyModal;
  window.closeGalaxyModal = closeGalaxyModal;
  window.openPilotRegistrationModal = openPilotRegistrationModal;
  window.closePilotRegistrationModal = closePilotRegistrationModal;
  window.confirmPilotAndLaunch = confirmPilotAndLaunch;
  window.openTutorialModalFromEnlist = openTutorialModalFromEnlist;
  window.toggleStoreModal = toggleStoreModal;
  window.openStoreModal = openStoreModal;
  window.closeStoreModal = closeStoreModal;
  window.showStoreTab = showStoreTab;
}
