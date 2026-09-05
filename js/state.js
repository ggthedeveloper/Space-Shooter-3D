/**
 * ALIEN ASSAULT 3D - CENTRAL GAME STATE
 * Centralized state object, military ranks, bounties, and achievements
 */

export const SAVE_KEY = 'alien_assault_career_save_v1';

const state = {
  score: 0,
  highScore: 0,
  credits: 0,

  // 3 LIVES SYSTEM
  lives: 3,
  maxLives: 5,

  hull: 100,
  shield: 100,
  maxHull: 100,
  maxShield: 100,
  shieldRechargeDelay: 0,
  shieldRechargeRate: 15,

  sector: 1,
  highestSector: 1,
  combo: 1.0,
  comboTimer: 0,
  aliensKilled: 0,
  totalAliensKilled: 0,
  running: true,
  paused: false,
  bossActive: false,
  bossEntity: null,

  // Hyperspace Warp Transition
  warpActive: false,
  warpTimer: 0,
  sectorClearing: false,

  // Starship type
  shipType: 'valkyrie',

  // Weapon systems & Store tiers
  activeWeapon: 'plasma',
  plasmaTier: 1,
  railgunTier: 1,
  flakTier: 1,
  torpedoTier: 1,
  teslaTier: 1,

  fireCooldown: 0,
  plasmaRate: 0.11,
  railgunRate: 0.45,
  flakRate: 0.32,
  torpedoRate: 0.40,
  teslaRate: 0.18,

  missileStock: 6,
  maxMissiles: 8,
  missileCooldown: 0,
  empCharge: 100,

  // Selected & Unlocked Galaxies
  selectedGalaxy: 'cosmic',
  unlockedGalaxies: ['cosmic'],

  // Unlocked starships (Valkyrie unlocked initially, others unlocked by sector or coins)
  unlockedShips: ['valkyrie'],

  // Military Rank, XP Progression & Tactical Bounties
  xp: 0,
  playerRank: 1,
  activeBounty: { id: 'raiders', target: 8, current: 0, desc: "Eliminate 8 Hostile Raiders", rewardCredits: 150, rewardXP: 100 },

  // Dynamic In-Mission Armada Overrun Event
  armadaOverrunActive: false,
  armadaOverrunDefeated: false,

  // Sector Dynamic Alien Swarm Tracking
  sectorEnemyTotal: 18,
  sectorEnemiesDefeated: 0,
  reinforcementsRemaining: 0,

  damageMult: 1.0,
  fireRateMult: 1.0,
  magnetRange: 7.5,
  speed: 18,
  vx: 0,
  vy: 0,
  rollActive: false,
  rollProgress: 0,
  invulnTimer: 0,

  // Wingman Escort Drones (0 = none, 1 = Alpha, 2 = Alpha + Beta)
  dronesUnlocked: 0,

  // Hyper-Overcharge Super Weapon Mode
  overchargeCharge: 0,
  overchargeActive: false,
  overchargeTimer: 0,

  // Intercepted Hive Radio Comms
  commsTimer: 3.5,

  // Pilot Profile
  pilotName: 'STARFIGHTER ACE',

  // Tactical AI Auto-Aiming System
  autoAimActive: false,
  autoAimTimer: 0,
  flightSurvivalTimer: 0,

  // Combat Achievements Tracking
  achievements: {},
  laserKills: 0,
  asteroidKills: 0,

  screenShake: 1.0
};

const RANKS = [
  { rank: 1, title: "ENSIGN", badge: "⭐", xpRequired: 0, perk: "Standard Fleet Issue" },
  { rank: 2, title: "LIEUTENANT", badge: "🌟", xpRequired: 300, perk: "+5% Firepower Boost" },
  { rank: 3, title: "CAPTAIN", badge: "🎖️", xpRequired: 800, perk: "+10% Shield Capacity" },
  { rank: 4, title: "MAJOR", badge: "🛡️", xpRequired: 1600, perk: "+10% Flight Agility" },
  { rank: 5, title: "COMMANDER", badge: "⚡", xpRequired: 2800, perk: "+15% Scrap Salvage" },
  { rank: 6, title: "FLEET ADMIRAL", badge: "👑", xpRequired: 4500, perk: "+20% Critical Strikes" }
];

const BOUNTY_POOL = [
  { id: 'raiders', target: 8, desc: "Eliminate 8 Hostile Raiders", rewardCredits: 150, rewardXP: 100 },
  { id: 'asteroids', target: 3, desc: "Mine 3 Deep Space Asteroids", rewardCredits: 120, rewardXP: 80 },
  { id: 'combo', target: 1, desc: "Achieve a 2.5x Combat Combo", rewardCredits: 160, rewardXP: 120 },
  { id: 'emp', target: 1, desc: "Deploy Quantum EMP Singularity", rewardCredits: 140, rewardXP: 90 },
  { id: 'armada', target: 1, desc: "Repel Hostile Armada Incursion", rewardCredits: 350, rewardXP: 250 }
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_kill', icon: '🛸', title: 'First Contact', desc: 'Destroy your first extraterrestrial vessel.' },
  { id: 'laser_kill', icon: '⚡', title: 'Laser Surgeon', desc: 'Vaporize 15 alien ships with the Continuous Laser Beam.' },
  { id: 'boss_slayer', icon: '👑', title: 'Leviathan Hunter', desc: 'Defeat an Ancient Hive Leviathan flagship.' },
  { id: 'drone_squad', icon: '🤖', title: 'Fleet Commander', desc: 'Deploy both Alpha and Beta Wingman Escort Drones.' },
  { id: 'max_power', icon: '🔥', title: 'Maximum Overdrive', desc: 'Upgrade any weapon system to Level 10.' },
  { id: 'tycoon', icon: '💰', title: 'Scrap Tycoon', desc: 'Accumulate over 1,500 persistent scrap credits.' },
  { id: 'asteroid_miner', icon: '💎', title: 'Asteroid Miner', desc: 'Shatter 5 deep-space mineral asteroids.' },
  { id: 'deep_space', icon: '🌌', title: 'Deep Space Ace', desc: 'Survive and reach Sector 3 or beyond.' }
];

const CALLSIGN_PRESETS = [
  'VIPER-1', 'STARFIGHTER ACE', 'COMMANDER NOVA', 'SHADOW FALCON',
  'TITAN STRIKER', 'SOLAR PHOENIX', 'VOID REAPER', 'COSMIC CORSAIR',
  'GALAXY VALKYRIE', 'NEBULA KNIGHT', 'ECHO-9', 'ORION SENTINEL'
];

if (typeof window !== 'undefined') {
  window.state = state;
  window.RANKS = RANKS;
  window.BOUNTY_POOL = BOUNTY_POOL;
  window.ACHIEVEMENTS_LIST = ACHIEVEMENTS_LIST;
  window.CALLSIGN_PRESETS = CALLSIGN_PRESETS;
}

export { state, RANKS, BOUNTY_POOL, ACHIEVEMENTS_LIST, CALLSIGN_PRESETS };
