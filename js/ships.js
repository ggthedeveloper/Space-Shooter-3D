/**
 * ALIEN ASSAULT 3D - STARSHIP ARMADA & MESH BUILDERS
 * 16 Starships with full stats, 3D procedural geometries & materials
 */

import { state } from "./state.js";
import { player } from "./player.js";
import { updateWeaponDockForShip, updateAbilityUI, updateHUD } from "./ui.js";

const SHIP_DEFINITIONS = {
  // --- TIER 1: BASIC ---
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie MK-II',
    role: 'Balanced Interceptor',
    tier: 'Basic',
    unlockSector: 1,
    cost: 0,
    speed: 18,
    hull: 100,
    shield: 100,
    damage: 100,
    fireRate: 'High',
    primaryWeapon: 'Pulse Cannon',
    specialAbility: 'EMP Blast',
    desc: 'Standard fleet-issue combat interceptor with balanced maneuverability, twin pulse cannons, and EMP blast.'
  },
  scout: {
    id: 'scout',
    name: 'Solar Dart',
    role: 'Recon Scout',
    tier: 'Basic',
    unlockSector: 5,
    cost: 25000,
    speed: 24,
    hull: 80,
    shield: 90,
    damage: 95,
    fireRate: 'Ultra Fast',
    primaryWeapon: 'Rapid Laser',
    specialAbility: 'Overdrive',
    desc: 'Lightweight, ultra-agile dart scout firing high-frequency needle lasers and equipped with Overdrive.'
  },

  // --- TIER 2: ADVANCED ---
  interceptor: {
    id: 'interceptor',
    name: 'Aero Blade',
    role: 'Strike Interceptor',
    tier: 'Advanced',
    unlockSector: 10,
    cost: 75000,
    speed: 22,
    hull: 110,
    shield: 120,
    damage: 125,
    fireRate: 'High',
    primaryWeapon: 'Twin Plasma Cannons',
    specialAbility: 'Laser Barrage',
    desc: 'Aggressive twin-boom space superiority fighter armed with dual plasma cannons and 7-laser fan barrage.'
  },
  assault: {
    id: 'assault',
    name: 'Plasma Marauder',
    role: 'Heavy Assault Fighter',
    tier: 'Advanced',
    unlockSector: 15,
    cost: 150000,
    speed: 16,
    hull: 160,
    shield: 150,
    damage: 150,
    fireRate: 'Medium',
    primaryWeapon: 'Heavy Plasma Cannon',
    specialAbility: 'Plasma Burst',
    desc: 'Reinforced gunship designed to breach hostile formations with colossal plasma slugs and AoE plasma bursts.'
  },
  phoenix: {
    id: 'phoenix',
    name: 'Solar Phoenix',
    role: 'Chrono-Vanguard',
    tier: 'Advanced',
    unlockSector: 20,
    cost: 250000,
    speed: 20,
    hull: 220,
    shield: 240,
    damage: 160,
    fireRate: 'High',
    primaryWeapon: 'Solar Flare',
    specialAbility: 'Energy Shield',
    desc: 'Radiant solar cruiser equipped with sunburst magma orbs, nanite self-repair (+3 HP/s), and invulnerable energy shield.'
  },
  guardian: {
    id: 'guardian',
    name: 'Aegis Bastion',
    role: 'Fortress Gunship',
    tier: 'Advanced',
    unlockSector: 25,
    cost: 380000,
    speed: 15,
    hull: 260,
    shield: 280,
    damage: 155,
    fireRate: 'Medium',
    primaryWeapon: 'Shield Cannon',
    specialAbility: 'Energy Shield',
    desc: 'Heavily armored fortress ship. Hits regenerate player shields, and possesses an invincible defensive dome.'
  },
  destroyer: {
    id: 'destroyer',
    name: 'Iron Hammer',
    role: 'Siege Destroyer',
    tier: 'Advanced',
    unlockSector: 30,
    cost: 550000,
    speed: 14,
    hull: 300,
    shield: 240,
    damage: 190,
    fireRate: 'Slow',
    primaryWeapon: 'Rail Cannon',
    specialAbility: 'Meteor Strike',
    desc: 'Colossal railgun destroyer discharging piercing kinetic slugs that punch through multiple hostiles and orbital meteor strikes.'
  },

  // --- TIER 3: ELITE ---
  phantom: {
    id: 'phantom',
    name: 'Shadow Wraith',
    role: 'Stealth Infiltrator',
    tier: 'Elite',
    unlockSector: 40,
    cost: 800000,
    speed: 26,
    hull: 160,
    shield: 180,
    damage: 210,
    fireRate: 'Extreme',
    primaryWeapon: 'Phase Blaster',
    specialAbility: 'Void Rift',
    desc: 'Phasing stealth fighter built with razor-swept wings. Fires armor-piercing quantum bolts and tears open Void Rifts.'
  },
  nova: {
    id: 'nova',
    name: 'Supernova Flash',
    role: 'Energy Skirmisher',
    tier: 'Elite',
    unlockSector: 50,
    cost: 1200000,
    speed: 23,
    hull: 240,
    shield: 260,
    damage: 235,
    fireRate: 'High',
    primaryWeapon: 'Nova Beam',
    specialAbility: 'Plasma Burst',
    desc: 'Equipped with rotating solar focus rings and concentrated thermal nova beams that incinerate enemy squadrons.'
  },
  titan: {
    id: 'titan',
    name: 'Titan Behemoth',
    role: 'Assault Dreadnought',
    tier: 'Elite',
    unlockSector: 60,
    cost: 1600000,
    speed: 13,
    hull: 380,
    shield: 320,
    damage: 260,
    fireRate: 'Heavy',
    primaryWeapon: 'Mega Plasma Launcher',
    specialAbility: 'Meteor Strike',
    desc: 'Super-heavy battle dreadnought launching colossal plasma artillery shells and calling devastating missile strikes.'
  },
  eclipse: {
    id: 'eclipse',
    name: 'Umbra Cruiser',
    role: 'Dark Matter Battlecruiser',
    tier: 'Elite',
    unlockSector: 70,
    cost: 2200000,
    speed: 21,
    hull: 320,
    shield: 350,
    damage: 285,
    fireRate: 'High',
    primaryWeapon: 'Dark Energy Cannon',
    specialAbility: 'Void Rift',
    desc: 'Dark-matter vessel firing armor-corroding dark energy bolts and summoning swirling gravitational vortexes.'
  },
  void_hunter: {
    id: 'void_hunter',
    name: 'Abyssal Stalker',
    role: 'Bio-Hunter',
    tier: 'Elite',
    unlockSector: 80,
    cost: 2900000,
    speed: 27,
    hull: 280,
    shield: 320,
    damage: 310,
    fireRate: 'High',
    primaryWeapon: 'Void Missile System',
    specialAbility: 'EMP Blast',
    desc: 'Predatory bio-mechanical fighter armed with smart tracking void micro-missiles and EMP electromagnetic bursts.'
  },

  // --- TIER 4: LEGENDARY & ULTIMATE ---
  reaper: {
    id: 'reaper',
    name: 'Cosmic Reaper',
    role: 'Antimatter Assassin',
    tier: 'Legendary',
    unlockSector: 85,
    cost: 3800000,
    speed: 28,
    hull: 350,
    shield: 380,
    damage: 350,
    fireRate: 'Ultra',
    primaryWeapon: 'Death Ray',
    specialAbility: 'Cosmic Wave',
    desc: 'Legendary void assassin armed with a sustained antimatter death ray (+50% crits) and screen-wide Cosmic Wave attacks.'
  },
  galaxy_guardian: {
    id: 'galaxy_guardian',
    name: 'Astral Sentinel',
    role: 'Cosmic Bastion',
    tier: 'Legendary',
    unlockSector: 90,
    cost: 4800000,
    speed: 22,
    hull: 420,
    shield: 440,
    damage: 380,
    fireRate: 'High',
    primaryWeapon: 'Cosmic Pulse',
    specialAbility: 'Energy Shield',
    desc: 'Sanctuary fortress vessel with quad guardian shield pylons, wide-arc cosmic pulse cannons, and invincible shields.'
  },
  celestial: {
    id: 'celestial',
    name: 'Seraph Prime',
    role: 'Divine Flagship',
    tier: 'Legendary',
    unlockSector: 95,
    cost: 6500000,
    speed: 29,
    hull: 460,
    shield: 480,
    damage: 440,
    fireRate: 'Max',
    primaryWeapon: 'Celestial Beam',
    specialAbility: 'Cosmic Wave',
    desc: 'Divine starship with six glowing starlight wings, firing an apocalyptic celestial beam and reality-cleansing waves.'
  },
  apex: {
    id: 'apex',
    name: 'Apex Sovereign',
    role: 'Omega Dreadnought',
    tier: 'Ultimate',
    unlockSector: 100,
    cost: 9500000,
    speed: 32,
    hull: 600,
    shield: 600,
    damage: 550,
    fireRate: 'Supreme',
    primaryWeapon: 'Omega Cannon',
    specialAbility: 'Cosmic Wave',
    desc: 'The ultimate space battle flagship. Twin singularity warp rings, reality-collapsing Omega Cannon, and unstoppable firepower.'
  }
};


// Procedural 3D Starship Geometry Builders
function buildValkyrieShip() {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xd8e2ec, metalness: 0.85, roughness: 0.25 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x00b4d8, emissive: 0x0077b6, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.3 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.65, roughness: 0.1, metalness: 0.8 });
  const engineGlowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.8, 6), hullMat);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), canopyMat);
  canopy.scale.set(0.8, 0.7, 1.8);
  canopy.position.set(0, 0.22, 0.1);
  group.add(canopy);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.4, -0.8);
  wingShape.lineTo(2.2, -1.4);
  wingShape.lineTo(0, -0.6);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 });

  const wingR = new THREE.Mesh(wingGeo, accentMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.3, 0.0, 0.8);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.3;
  group.add(wingL);

  const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.1, 8), hullMat);
  cannonR.rotation.x = Math.PI / 2;
  cannonR.position.set(2.45, -0.05, 0.1);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -2.45;
  group.add(cannonL);

  const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.6, 8), hullMat);
  engR.rotation.x = Math.PI / 2;
  engR.position.set(0.38, -0.05, 1.4);
  group.add(engR);

  const engL = engR.clone();
  engL.position.x = -0.38;
  group.add(engL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 8), engineGlowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.38, -0.05, 1.85);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.38;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 2: Titan Behemoth (Heavy Armored Gunship)
function buildTitanShip() {
  const group = new THREE.Group();
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.3 });
  const blastCanopyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.1 });
  const heavyGlowMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });

  // Wide armored chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 3.2), armorMat);
  group.add(chassis);

  // Armored Cockpit Ridge
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 1.6), blastCanopyMat);
  cockpit.position.set(0, 0.45, 0.2);
  group.add(cockpit);

  // Heavy Plated Wings
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 2.0), accentMat);
  wingR.position.set(1.5, -0.05, 0.4);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.position.x = -1.5;
  group.add(wingL);

  // Heavy Dorsal Cannons
  const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.8, 8), armorMat);
  cannonR.rotation.x = Math.PI / 2;
  cannonR.position.set(1.6, 0.1, -0.4);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.6;
  group.add(cannonL);

  // Quad Thrusters
  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.1, 8), heavyGlowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.6, -0.05, 2.1);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.6;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.8, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 3: Phantom Ghost (Advanced Stealth Interceptor)
function buildPhantomShip() {
  const group = new THREE.Group();
  const stealthMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.95, roughness: 0.15 });
  const neonMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0xa855f7, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.2 });
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.6 });
  const purpleGlowMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });

  // Narrow Razor Fuselage
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.4, 5), stealthMat);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), crystalMat);
  canopy.scale.set(0.6, 0.5, 2.2);
  canopy.position.set(0, 0.16, 0.2);
  group.add(canopy);

  // Forward-Swept Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.2, 0.8);
  wingShape.lineTo(2.0, 0.3);
  wingShape.lineTo(0, -0.8);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });

  const wingR = new THREE.Mesh(wingGeo, neonMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.2, 0.0, 0.5);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.2;
  group.add(wingL);

  const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), stealthMat);
  cannonR.rotation.x = Math.PI / 2;
  cannonR.position.set(1.9, 0.0, 0.7);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.9;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.2, 8), purpleGlowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.25, 0.0, 1.9);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.25;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.1, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 4: Solar Phoenix (Chrono-Vanguard Flagship)
function buildSolarPhoenixShip() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25, emissive: 0x3d2700 });
  const darkObsidianMat = new THREE.MeshStandardMaterial({ color: 0x181822, metalness: 0.95, roughness: 0.15 });
  const solarGlowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  const thrusterGlowMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });

  // Heavy Armored Battle Fuselage
  const hullGeo = new THREE.BoxGeometry(1.4, 0.7, 3.4);
  const hull = new THREE.Mesh(hullGeo, goldMat);
  group.add(hull);

  // Dorsal Solar Crest & Cockpit
  const crestGeo = new THREE.ConeGeometry(0.55, 2.2, 5);
  crestGeo.rotateX(Math.PI / 2);
  const crest = new THREE.Mesh(crestGeo, darkObsidianMat);
  crest.position.set(0, 0.35, -0.2);
  group.add(crest);

  // Sweeping Golden Wings with Radiant Solar Energy Sails
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.8, -0.4);
  wingShape.lineTo(2.5, -1.8);
  wingShape.lineTo(0, -1.0);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 });

  const wingR = new THREE.Mesh(wingGeo, goldMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.4, 0.05, 0.6);
  group.add(wingR);

  const sailGeo = new THREE.PlaneGeometry(2.2, 1.2);
  sailGeo.rotateX(-Math.PI / 2);
  const sailR = new THREE.Mesh(sailGeo, solarGlowMat);
  sailR.position.set(1.4, 0.08, 0.4);
  group.add(sailR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.4;
  group.add(wingL);

  const sailL = sailR.clone();
  sailL.scale.x = -1;
  sailL.position.x = -1.4;
  group.add(sailL);

  // Twin Heavy Ventral Cannons
  const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.6, 8), darkObsidianMat);
  cannonR.rotation.x = Math.PI / 2;
  cannonR.position.set(1.2, -0.15, -0.2);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.2;
  group.add(cannonL);

  // Triple Fusion Thrusters
  const engGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 8);
  engGeo.rotateX(Math.PI / 2);

  const engR = new THREE.Mesh(engGeo, darkObsidianMat);
  engR.position.set(0.55, 0.0, 1.7);
  group.add(engR);

  const engL = engR.clone();
  engL.position.x = -0.55;
  group.add(engL);

  const engC = engR.clone();
  engC.position.set(0, 0.12, 1.75);
  group.add(engC);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.1, 8), thrusterGlowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.55, 0.0, 2.2);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.55;
  group.add(plumeL);

  const plumeC = plumeR.clone();
  plumeC.position.set(0, 0.12, 2.25);
  group.add(plumeC);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.9, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, plumeC, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 5: Void Reaper (Dark Matter Bio-Hybrid)
function buildVoidReaperShip() {
  const group = new THREE.Group();
  const bioCarapaceMat = new THREE.MeshStandardMaterial({ color: 0x090b14, roughness: 0.15, metalness: 0.95 });
  const voidVeinMat = new THREE.MeshStandardMaterial({ color: 0x9900ef, emissive: 0xc000ff, emissiveIntensity: 1.0, roughness: 0.2 });
  const cyanCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const voidThrusterMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });

  // Sharp Dagger Needle Fuselage
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 3.8, 4), bioCarapaceMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  group.add(nose);

  // Bio-luminescent Energy Core
  const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.32), cyanCoreMat);
  coreMesh.position.set(0, 0.14, 0.1);
  group.add(coreMesh);

  // Quad Void Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.6, 0.5);
  wingShape.lineTo(2.3, -0.8);
  wingShape.lineTo(0, -0.4);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });

  const wingR = new THREE.Mesh(wingGeo, voidVeinMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.18, 0.08, 0.3);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.18;
  group.add(wingL);

  const finGeo = new THREE.BoxGeometry(0.06, 0.8, 1.4);
  const finR = new THREE.Mesh(finGeo, bioCarapaceMat);
  finR.rotation.z = -0.35;
  finR.position.set(0.8, -0.35, 0.7);
  group.add(finR);

  const finL = finR.clone();
  finL.rotation.z = 0.35;
  finL.position.x = -0.8;
  group.add(finL);

  const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.5, 6), bioCarapaceMat);
  cannonR.rotation.x = Math.PI / 2;
  cannonR.position.set(2.4, 0.08, 0.2);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -2.4;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.4, 8), voidThrusterMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.3, 0.0, 2.0);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.3;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xc000ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR, coreMesh };
  return group;
}

// Ship 6: Apex Sovereign (Chrono-Singularity Dreadnought)
function buildApexSovereignShip() {
  const group = new THREE.Group();
  const hyperArmorMat = new THREE.MeshStandardMaterial({ color: 0x0c1426, metalness: 0.95, roughness: 0.15 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.9, roughness: 0.25, emissive: 0x4a3b00 });
  const chronoCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const thrusterPlumeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

  // Main Heavy Battle Fuselage
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.75, 3.8, 6), hyperArmorMat);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  // Twin Singularity Warp Rings
  const ringGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 20);
  const ringR = new THREE.Mesh(ringGeo, chronoCyanMat);
  ringR.position.set(1.6, 0.1, 0.4);
  ringR.rotation.y = Math.PI / 2;
  group.add(ringR);

  const ringL = ringR.clone();
  ringL.position.x = -1.6;
  group.add(ringL);

  // Swept Hyper-Wings with Gold Trim
  const wingGeo = new THREE.BoxGeometry(1.8, 0.15, 2.2);
  const wingR = new THREE.Mesh(wingGeo, goldTrimMat);
  wingR.position.set(1.4, -0.05, 0.6);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.position.x = -1.4;
  group.add(wingL);

  // Quad Heavy Quantum Cannons
  const cannonGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.8, 8);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonR1 = new THREE.Mesh(cannonGeo, hyperArmorMat);
  cannonR1.position.set(2.1, 0.1, 0.2);
  group.add(cannonR1);

  const cannonL1 = cannonR1.clone();
  cannonL1.position.x = -2.1;
  group.add(cannonL1);

  const cannonR2 = new THREE.Mesh(cannonGeo, hyperArmorMat);
  cannonR2.position.set(0.9, -0.15, 0.5);
  group.add(cannonR2);

  const cannonL2 = cannonR2.clone();
  cannonL2.position.x = -0.9;
  group.add(cannonL2);

  // Quad Thruster Plumes
  const plumeGeo = new THREE.ConeGeometry(0.2, 1.4, 8);
  plumeGeo.rotateX(-Math.PI / 2);
  const plumeR = new THREE.Mesh(plumeGeo, thrusterPlumeMat);
  plumeR.position.set(0.65, 0.0, 2.1);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.65;
  group.add(plumeL);

  const plumeR2 = plumeR.clone();
  plumeR2.position.set(1.4, 0.0, 1.8);
  plumeR2.scale.setScalar(0.8);
  group.add(plumeR2);

  const plumeL2 = plumeR2.clone();
  plumeL2.position.x = -1.4;
  group.add(plumeL2);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, plumeR2, plumeL2, ringR, ringL, shieldMesh, shieldMat, cannonL: cannonL1, cannonR: cannonR1 };
  return group;
}


// Ship 2: Scout (Solar Dart)
function buildScoutShip() {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1a2639, metalness: 0.85, roughness: 0.2 });
  const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const canopyMat = new THREE.MeshPhysicalMaterial({ color: 0x003344, roughness: 0.1, metalness: 0.8, clearcoat: 1.0 });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.4, 4), hullMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  group.add(nose);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.0, 0.4);
  wingShape.lineTo(1.8, -0.6);
  wingShape.lineTo(0, -0.3);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });

  const wingR = new THREE.Mesh(wingGeo, hullMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.12, 0.02, 0.4);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.12;
  group.add(wingL);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), canopyMat);
  cockpit.scale.set(0.8, 0.7, 1.8);
  cockpit.position.set(0, 0.16, 0.1);
  group.add(cockpit);

  const cannonGeo = new THREE.CylinderGeometry(0.025, 0.035, 1.4, 6);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(cannonGeo, trimMat);
  cannonR.position.set(0.9, 0, -0.1);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -0.9;
  group.add(cannonL);

  const plume = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.3, 8), trimMat);
  plume.rotation.x = -Math.PI / 2;
  plume.position.set(0, 0.05, 1.8);
  group.add(plume);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.3, 12, 12), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR: plume, plumeL: plume, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 3: Interceptor (Aero Blade)
function buildInterceptorShip() {
  const group = new THREE.Group();
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x1b202e, metalness: 0.9, roughness: 0.2 });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

  const pod = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 2.6), armorMat);
  group.add(pod);

  const boomR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 2.4), armorMat);
  boomR.position.set(1.3, 0, 0.2);
  group.add(boomR);

  const boomL = boomR.clone();
  boomL.position.x = -1.3;
  group.add(boomL);

  const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.2), armorMat);
  wingR.position.set(0.65, 0, 0.3);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.position.x = -0.65;
  group.add(wingL);

  const gunGeo = new THREE.CylinderGeometry(0.06, 0.09, 1.6, 8);
  gunGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(gunGeo, goldMat);
  cannonR.position.set(1.3, 0.05, -0.6);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.3;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 8), glowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(1.3, 0, 1.5);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -1.3;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 4: Assault Fighter (Plasma Marauder)
function buildAssaultShip() {
  const group = new THREE.Group();
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x241116, metalness: 0.9, roughness: 0.25 });
  const redMat = new THREE.MeshBasicMaterial({ color: 0xff3355 });
  const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });

  const prow = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.6, 5), plateMat);
  prow.rotation.x = Math.PI / 2;
  group.add(prow);

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 2.2), plateMat);
  body.position.set(0, 0, 0.5);
  group.add(body);

  const cannonGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.8, 8);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(cannonGeo, redMat);
  cannonR.position.set(1.4, -0.05, 0.2);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.4;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.3, 8), thrusterMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.65, 0, 1.8);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.65;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.8, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 6: Guardian (Aegis Bastion)
function buildGuardianShip() {
  const group = new THREE.Group();
  const shieldAlloyMat = new THREE.MeshStandardMaterial({ color: 0x0f233a, metalness: 0.9, roughness: 0.2 });
  const blueCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  const hexGeo = new THREE.CylinderGeometry(0.85, 1.4, 2.6, 6);
  hexGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(hexGeo, shieldAlloyMat);
  group.add(body);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pylon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), blueCoreMat);
    pylon.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 0.7, 0.2);
    group.add(pylon);
  }

  const gunGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.7, 8);
  gunGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(gunGeo, shieldAlloyMat);
  cannonR.position.set(1.0, 0, 0.3);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.0;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.4, 8), blueCoreMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.55, 0, 1.6);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.55;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(3.0, 16, 16), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 7: Destroyer (Iron Hammer)
function buildDestroyerShip() {
  const group = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x22262d, metalness: 0.95, roughness: 0.3 });
  const hazardMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const blueArcMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 4.4), ironMat);
  group.add(spine);

  const railGeo = new THREE.BoxGeometry(0.12, 0.2, 2.5);
  const railR = new THREE.Mesh(railGeo, ironMat);
  railR.position.set(0.45, 0.05, -2.0);
  group.add(railR);

  const railL = railR.clone();
  railL.position.x = -0.45;
  group.add(railL);

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 6, 16), blueArcMat);
    ring.position.set(0, 0.05, -1.8 + i * 0.8);
    group.add(ring);
  }

  const finGeo = new THREE.BoxGeometry(0.04, 0.8, 1.2);
  const finR = new THREE.Mesh(finGeo, ironMat);
  finR.rotation.z = -0.4;
  finR.position.set(0.9, 0, 0.6);
  group.add(finR);

  const finL = finR.clone();
  finL.rotation.z = 0.4;
  finL.position.x = -0.9;
  group.add(finL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.5, 8), hazardMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.45, 0, 2.4);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.45;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL: railL, cannonR: railR };
  return group;
}

// Ship 9: Nova (Supernova Flash)
function buildNovaShip() {
  const group = new THREE.Group();
  const goldAlloyMat = new THREE.MeshStandardMaterial({ color: 0x3d2904, metalness: 0.9, roughness: 0.2 });
  const radiantSunMat = new THREE.MeshBasicMaterial({ color: 0xffbb00 });
  const flareCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), goldAlloyMat);
  core.scale.set(1.4, 0.4, 2.2);
  group.add(core);

  const ringGeo = new THREE.TorusGeometry(0.9, 0.06, 8, 20);
  const ring = new THREE.Mesh(ringGeo, radiantSunMat);
  ring.position.set(0, 0.1, 0.2);
  group.add(ring);

  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), flareCoreMat);
  heart.position.set(0, 0.12, 0.2);
  group.add(heart);

  const lensGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
  lensGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(lensGeo, radiantSunMat);
  cannonR.position.set(1.5, 0, 0);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.5;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 8), radiantSunMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.45, 0, 1.8);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.45;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.7, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR, heart };
  return group;
}

// Ship 11: Eclipse (Umbra Cruiser)
function buildEclipseShip() {
  const group = new THREE.Group();
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0a0512, metalness: 0.95, roughness: 0.15 });
  const violetGlowMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.8, 3), obsidianMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.z = Math.PI / 6;
  group.add(nose);

  const wingGeo = new THREE.BoxGeometry(1.6, 0.06, 2.0);
  const wingR = new THREE.Mesh(wingGeo, obsidianMat);
  wingR.rotation.y = 0.2;
  wingR.position.set(1.1, 0, 0.4);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.rotation.y = -0.2;
  wingL.position.x = -1.1;
  group.add(wingL);

  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38), violetGlowMat);
  core.position.set(0, 0.18, 0.1);
  group.add(core);

  const gunGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.6, 6);
  gunGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(gunGeo, violetGlowMat);
  cannonR.position.set(1.7, 0, 0.1);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.7;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.4, 8), violetGlowMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.35, 0, 2.0);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.35;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.8, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR, core };
  return group;
}

// Ship 12: Void Hunter (Abyssal Stalker)
function buildVoidHunterShip() {
  const group = new THREE.Group();
  const carapaceMat = new THREE.MeshStandardMaterial({ color: 0x111c16, metalness: 0.85, roughness: 0.25 });
  const toxicMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.6, 3.2, 5), carapaceMat);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  const mGeo = new THREE.ConeGeometry(0.12, 1.6, 4);
  mGeo.rotateX(Math.PI / 2);
  const manR = new THREE.Mesh(mGeo, carapaceMat);
  manR.position.set(0.4, 0, -1.2);
  group.add(manR);

  const manL = manR.clone();
  manL.position.x = -0.4;
  group.add(manL);

  const podGeo = new THREE.BoxGeometry(0.35, 0.25, 1.4);
  const podR = new THREE.Mesh(podGeo, carapaceMat);
  podR.position.set(1.2, 0.1, 0.3);
  group.add(podR);

  const podL = podR.clone();
  podL.position.x = -1.2;
  group.add(podL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.3, 8), toxicMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.4, 0, 1.8);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.4;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(2.7, 14, 14), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL: manL, cannonR: manR };
  return group;
}

// Ship 14: Galaxy Guardian (Astral Sentinel)
function buildGalaxyGuardianShip() {
  const group = new THREE.Group();
  const sapphireMat = new THREE.MeshStandardMaterial({ color: 0x071b30, metalness: 0.95, roughness: 0.15 });
  const astralCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  const citadel = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 3.4, 8), sapphireMat);
  citadel.rotation.x = Math.PI / 2;
  group.add(citadel);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const pylon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), astralCyanMat);
    pylon.position.set(Math.cos(a) * 1.9, Math.sin(a) * 0.8, 0.4);
    group.add(pylon);
  }

  const wingGeo = new THREE.BoxGeometry(1.8, 0.12, 2.4);
  const wingR = new THREE.Mesh(wingGeo, sapphireMat);
  wingR.position.set(1.6, 0, 0.3);
  group.add(wingR);

  const wingL = wingR.clone();
  wingL.position.x = -1.6;
  group.add(wingL);

  const gunGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.6, 8);
  gunGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(gunGeo, astralCyanMat);
  cannonR.position.set(1.8, 0.05, -0.2);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.8;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.5, 8), astralCyanMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.65, 0, 2.0);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.65;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 16), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR };
  return group;
}

// Ship 15: Celestial (Seraph Prime)
function buildCelestialShip() {
  const group = new THREE.Group();
  const ivoryGoldMat = new THREE.MeshStandardMaterial({ color: 0x2d2410, metalness: 0.95, roughness: 0.15, emissive: 0x4a3b00 });
  const starlightMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 4.2, 8), ivoryGoldMat);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  for (let pair = 0; pair < 3; pair++) {
    const span = 2.4 - pair * 0.4;
    const wingGeo = new THREE.BoxGeometry(span, 0.05, 1.2);
    const wingR = new THREE.Mesh(wingGeo, starlightMat);
    wingR.position.set(span * 0.5 + 0.3, pair * 0.12 - 0.1, pair * 0.9);
    group.add(wingR);

    const wingL = wingR.clone();
    wingL.position.x = -(span * 0.5 + 0.3);
    group.add(wingL);
  }

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 8, 24), haloMat);
  halo.rotation.x = Math.PI / 3;
  halo.position.set(0, 0.5, 0.6);
  group.add(halo);

  const gunGeo = new THREE.CylinderGeometry(0.06, 0.09, 1.8, 8);
  gunGeo.rotateX(Math.PI / 2);
  const cannonR = new THREE.Mesh(gunGeo, starlightMat);
  cannonR.position.set(1.5, 0, -0.4);
  group.add(cannonR);

  const cannonL = cannonR.clone();
  cannonL.position.x = -1.5;
  group.add(cannonL);

  const plumeR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.6, 8), haloMat);
  plumeR.rotation.x = -Math.PI / 2;
  plumeR.position.set(0.4, 0, 2.2);
  group.add(plumeR);

  const plumeL = plumeR.clone();
  plumeL.position.x = -0.4;
  group.add(plumeL);

  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffea75, transparent: true, opacity: 0.0, wireframe: true });
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(3.3, 16, 16), shieldMat);
  group.add(shieldMesh);

  group.userData = { plumeR, plumeL, shieldMesh, shieldMat, cannonL, cannonR, halo };
  return group;
}

// Master Player Container

function buildContinuousBeam() {
  const group = new THREE.Group();

  // 1. Ultra-Luminous Solid Laser Core (width 0.32, length 1 along +Z forward)
  const coreGeo = new THREE.CylinderGeometry(0.32, 0.32, 1, 10);
  coreGeo.rotateX(Math.PI / 2);
  coreGeo.translate(0, 0, 0.5);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. High-Intensity Mid Plasma Sheath (width 0.72, length 1 along +Z forward)
  const midGeo = new THREE.CylinderGeometry(0.72, 0.72, 1, 10);
  midGeo.rotateX(Math.PI / 2);
  midGeo.translate(0, 0, 0.5);
  const midMat = new THREE.MeshBasicMaterial({
    color: 0xff00cc,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending
  });
  const midMesh = new THREE.Mesh(midGeo, midMat);
  group.add(midMesh);

  // 3. Wide Radiant Outer Corona Halo (width 1.4, length 1 along +Z forward)
  const glowGeo = new THREE.CylinderGeometry(1.4, 1.4, 1, 10);
  glowGeo.rotateX(Math.PI / 2);
  glowGeo.translate(0, 0, 0.5);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  group.add(glowMesh);

  // 4. Muzzle Flare Emitter at Starfighter Nose
  const emitterGeo = new THREE.SphereGeometry(0.85, 12, 10);
  const emitterMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  });
  const emitterMesh = new THREE.Mesh(emitterGeo, emitterMat);
  group.add(emitterMesh);

  // 5. Target Impact Flare Orb (positioned at contact point on alien)
  const impactGeo = new THREE.SphereGeometry(1.5, 12, 10);
  const impactMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  });
  const impactMesh = new THREE.Mesh(impactGeo, impactMat);
  impactMesh.visible = false;
  group.add(impactMesh);

  // 6. Target Impact Outer Plasma Ring
  const impactRingGeo = new THREE.RingGeometry(0.5, 2.5, 16);
  const impactRingMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const impactRingMesh = new THREE.Mesh(impactRingGeo, impactRingMat);
  impactRingMesh.visible = false;
  group.add(impactRingMesh);

  group.userData = {
    coreMesh, midMesh, glowMesh, emitterMesh, impactMesh, impactRingMesh,
    coreMat, midMat, glowMat, emitterMat, impactMat, impactRingMat
  };
  group.visible = false;
  return group;
}

function buildWingmanDroneMesh(primaryColor = 0x00e5ff) {
  const group = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(0.35, 12, 10);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x111625,
    metalness: 0.85,
    roughness: 0.2
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 8, 20);
  const ringMat = new THREE.MeshBasicMaterial({ color: primaryColor });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  const gunGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6);
  gunGeo.rotateX(Math.PI / 2);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x444b5d, metalness: 0.9 });
  const gunL = new THREE.Mesh(gunGeo, gunMat);
  gunL.position.set(-0.25, -0.05, -0.15);
  const gunR = new THREE.Mesh(gunGeo, gunMat);
  gunR.position.set(0.25, -0.05, -0.15);
  group.add(gunL);
  group.add(gunR);

  const eyeMat = new THREE.MeshBasicMaterial({ color: primaryColor });
  const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), eyeMat);
  eyeMesh.position.set(0, 0, -0.32);
  group.add(eyeMesh);

  group.userData = { ringMesh, gunL, gunR, fireTimer: Math.random() * 0.3 };
  group.visible = false;
  return group;
}


export let currentShipModel = null;

function setStarship(shipType) {
  const player = window.player;
  const updateWeaponDockForShip = window.updateWeaponDockForShip || (() => {});
  const updateAbilityUI = window.updateAbilityUI || (() => {});
  const updateHUD = window.updateHUD || (() => {});
  state.shipType = shipType;
  if (currentShipModel) player.remove(currentShipModel);

  const def = SHIP_DEFINITIONS[shipType] || SHIP_DEFINITIONS.valkyrie;
  state.speed = def.speed || 18;
  state.maxHull = def.hull || 100;
  state.maxShield = def.shield || 100;
  state.damageMult = (def.damage || 100) / 100;

  switch (shipType) {
    case 'scout': currentShipModel = buildScoutShip(); break;
    case 'interceptor': currentShipModel = buildInterceptorShip(); break;
    case 'assault': currentShipModel = buildAssaultShip(); break;
    case 'phoenix': currentShipModel = buildSolarPhoenixShip(); break;
    case 'guardian': currentShipModel = buildGuardianShip(); break;
    case 'destroyer': currentShipModel = buildDestroyerShip(); break;
    case 'phantom': currentShipModel = buildPhantomShip(); break;
    case 'nova': currentShipModel = buildNovaShip(); break;
    case 'titan': currentShipModel = buildTitanShip(); break;
    case 'eclipse': currentShipModel = buildEclipseShip(); break;
    case 'void_hunter': currentShipModel = buildVoidHunterShip(); break;
    case 'reaper': currentShipModel = buildVoidReaperShip(); break;
    case 'galaxy_guardian': currentShipModel = buildGalaxyGuardianShip(); break;
    case 'celestial': currentShipModel = buildCelestialShip(); break;
    case 'apex': currentShipModel = buildApexSovereignShip(); break;
    default: currentShipModel = buildValkyrieShip(); break;
  }

  player.add(currentShipModel);
  player.userData = currentShipModel.userData;
  state.hull = Math.min(state.hull, state.maxHull);
  state.shield = Math.min(state.shield, state.maxShield);

  // Update Weapon Arsenal Dock cards and ability card
  updateWeaponDockForShip(shipType);
  updateAbilityUI();
  updateHUD();
}

export {
  SHIP_DEFINITIONS,
  buildValkyrieShip,
  buildTitanShip,
  buildPhantomShip,
  buildSolarPhoenixShip,
  buildVoidReaperShip,
  buildApexSovereignShip,
  buildScoutShip,
  buildInterceptorShip,
  buildAssaultShip,
  buildGuardianShip,
  buildDestroyerShip,
  buildNovaShip,
  buildEclipseShip,
  buildVoidHunterShip,
  buildGalaxyGuardianShip,
  buildCelestialShip,
  buildContinuousBeam,
  buildWingmanDroneMesh,
  setStarship
};

if (typeof window !== 'undefined') {
  window.SHIP_DEFINITIONS = SHIP_DEFINITIONS;
  window.setStarship = setStarship;
}
