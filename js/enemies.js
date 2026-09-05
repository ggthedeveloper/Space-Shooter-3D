
// Bridge references
const spawnScrapDrop = (...args) => (window.spawnScrapDrop ? window.spawnScrapDrop(...args) : null);
const spawnPowerupItem = (...args) => (window.spawnPowerupItem ? window.spawnPowerupItem(...args) : null);
const addScore = (...args) => (window.addScore ? window.addScore(...args) : null);
const trackBountyProgress = (...args) => (window.trackBountyProgress ? window.trackBountyProgress(...args) : null);
const triggerArmadaOverrunEvent = (...args) => (window.triggerArmadaOverrunEvent ? window.triggerArmadaOverrunEvent(...args) : null);
const updateHostilesHUD = (...args) => (window.updateHostilesHUD ? window.updateHostilesHUD(...args) : null);
const spawnFloatingText = (...args) => (window.spawnFloatingText ? window.spawnFloatingText(...args) : null);
const spawnExplosionFX = (...args) => (window.spawnExplosionFX ? window.spawnExplosionFX(...args) : null);
const triggerShake = (...args) => (window.triggerShake ? window.triggerShake(...args) : null);

/**
 * ALIEN ASSAULT 3D - ALIEN FLEET & AI
 * Extraterrestrial bio-mechanical ships, cockpits, shields, attacks, and bosses
 */

import { state } from "./state.js";
import { audio } from "./audio.js";
import { scene, enemyBullets } from "./game.js";
import { player } from "./player.js";
import { addPlayerXP, unlockAchievement } from "./progression.js";
import { saveGameData } from "./save.js";
import { sectorCompleted } from "./sectors.js";
import { updateHUD } from "./ui.js";

// Procedural Alien Meshes & Living Cockpit
function buildRealisticAlienPilot(skinColorHex = 0x6e8b6b) {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColorHex, roughness: 0.45, metalness: 0.1 });
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x050508, roughness: 0.05, metalness: 0.9, clearcoat: 1.0 });
  const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });

  const headGroup = new THREE.Group();

  const craniumGeo = new THREE.SphereGeometry(0.28, 14, 12);
  craniumGeo.scale(0.85, 1.25, 1.35);
  const cranium = new THREE.Mesh(craniumGeo, skinMat);
  cranium.position.set(0, 0.32, -0.05);
  headGroup.add(cranium);

  const occipitalGeo = new THREE.SphereGeometry(0.22, 10, 10);
  occipitalGeo.scale(0.7, 0.9, 1.2);
  const occipital = new THREE.Mesh(occipitalGeo, skinMat);
  occipital.position.set(0, 0.42, -0.22);
  headGroup.add(occipital);

  const eyeGeo = new THREE.SphereGeometry(0.12, 10, 8);
  eyeGeo.scale(1.5, 0.75, 0.5);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.14, 0.34, 0.18);
  eyeL.rotation.set(0.2, -0.3, 0.35);
  headGroup.add(eyeL);

  const gleamL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeGlowMat);
  gleamL.position.set(-0.13, 0.36, 0.23);
  headGroup.add(gleamL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.14, 0.34, 0.18);
  eyeR.rotation.set(0.2, 0.3, -0.35);
  headGroup.add(eyeR);

  const gleamR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeGlowMat);
  gleamR.position.set(0.13, 0.36, 0.23);
  headGroup.add(gleamR);

  const jawGeo = new THREE.ConeGeometry(0.15, 0.28, 6);
  jawGeo.scale(0.9, 1.0, 0.7);
  const jaw = new THREE.Mesh(jawGeo, skinMat);
  jaw.rotation.x = Math.PI;
  jaw.position.set(0, 0.16, 0.1);
  headGroup.add(jaw);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.25, 6), skinMat);
  neck.position.set(0, 0.08, 0.0);
  group.add(neck);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.28, 0.3, 6), skinMat);
  torso.scale.set(1.3, 1.0, 0.8);
  torso.position.set(0, -0.15, 0.0);
  group.add(torso);

  group.add(headGroup);
  group.userData = { headGroup, cranium };
  return group;
}

function buildAlienSaucerWithPilot(colorIdx = 0) {
  const g = new THREE.Group();
  const glowColors = [0x39ff14, 0xff007f, 0x00f0ff, 0xffaa00];
  const glowColor = glowColors[colorIdx % glowColors.length];

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x3d4350, metalness: 0.85, roughness: 0.25 });
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.7, 0.35, 18), hullMat);
  g.add(hull);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.12, 6, 20), hullMat);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);

  const lightMat = new THREE.MeshBasicMaterial({ color: glowColor });
  const rimLights = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), lightMat);
    bulb.position.set(Math.cos(a) * 1.68, 0, Math.sin(a) * 1.68);
    rimLights.add(bulb);
  }
  g.add(rimLights);
  g.userData.rimLights = rimLights;

  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xddeeff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.4
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = 0.15;
  g.add(dome);

  const pilot = buildRealisticAlienPilot(colorIdx % 2 === 0 ? 0x6e8b6b : 0x8a7a9e);
  pilot.position.set(0, 0.22, 0.05);
  pilot.scale.set(1.4, 1.4, 1.4);
  g.add(pilot);
  g.userData.pilot = pilot;
  g.userData.color = glowColor;

  return g;
}

function buildAlienBioScout() {
  const g = new THREE.Group();
  const chitinMat = new THREE.MeshStandardMaterial({ color: 0x1f3b2b, roughness: 0.35, metalness: 0.65 });
  const veinMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0303, emissive: 0xff0044, emissiveIntensity: 0.6 });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 6), chitinMat);
  body.rotation.x = -Math.PI / 2;
  g.add(body);

  const eyeGeo = new THREE.SphereGeometry(0.14, 8, 8);
  eyeGeo.scale(1.4, 0.8, 0.8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.24, 0.18, 0.85);
  eyeL.rotation.y = -0.3;
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.x = 0.24;
  eyeR.rotation.y = 0.3;
  g.add(eyeR);

  const mandibleGeo = new THREE.ConeGeometry(0.08, 0.6, 5);
  const mandibleL = new THREE.Mesh(mandibleGeo, chitinMat);
  mandibleL.rotation.set(-Math.PI / 2, 0, -0.4);
  mandibleL.position.set(-0.2, -0.05, 1.25);
  g.add(mandibleL);

  const mandibleR = mandibleL.clone();
  mandibleR.rotation.z = 0.4;
  mandibleR.position.x = 0.2;
  g.add(mandibleR);
  g.userData.mandibleL = mandibleL;
  g.userData.mandibleR = mandibleR;

  const venomSac = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), veinMat);
  venomSac.position.set(0, 0.15, -0.7);
  g.add(venomSac);

  const wings = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.9), chitinMat);
  wings.position.set(0, 0.05, -0.1);
  g.add(wings);
  g.userData.wings = wings;

  g.userData.color = 0x39ff14;
  g.userData.shipClass = 'bioscout';
  return g;
}

// Sector 4–6+: Heavy Armored Spike Raider
function buildAlienArmoredRaider(colorIdx = 0) {
  const g = new THREE.Group();
  const accentColors = [0xff7700, 0xff3366, 0xffd166, 0x00f0ff];
  const col = accentColors[colorIdx % accentColors.length];

  const plateMat = new THREE.MeshStandardMaterial({ color: 0x222a36, metalness: 0.9, roughness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: col });
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

  // Heavy Angular Wedge Chassis
  const wedgeGeo = new THREE.ConeGeometry(1.1, 2.6, 4);
  wedgeGeo.rotateX(Math.PI / 2);
  wedgeGeo.rotateZ(Math.PI / 4);
  const chassis = new THREE.Mesh(wedgeGeo, plateMat);
  g.add(chassis);

  // Dual Heavy Outriggers
  const outriggerGeo = new THREE.BoxGeometry(0.35, 0.4, 2.2);
  const outR = new THREE.Mesh(outriggerGeo, plateMat);
  outR.position.set(1.4, 0, 0.2);
  g.add(outR);

  const outL = outR.clone();
  outL.position.x = -1.4;
  g.add(outL);

  // Armored Spikes Forward
  const spikeGeo = new THREE.ConeGeometry(0.12, 1.2, 5);
  spikeGeo.rotateX(Math.PI / 2);
  const spikeR = new THREE.Mesh(spikeGeo, spikeMat);
  spikeR.position.set(1.4, 0, 1.4);
  g.add(spikeR);

  const spikeL = spikeR.clone();
  spikeL.position.x = -1.4;
  g.add(spikeL);

  // Plasma Emitters
  const emitR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 6), glowMat);
  emitR.rotation.x = Math.PI / 2;
  emitR.position.set(0.7, -0.1, 0.9);
  g.add(emitR);

  const emitL = emitR.clone();
  emitL.position.x = -0.7;
  g.add(emitL);

  // Glowing Reactor Vent
  const vent = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.6), glowMat);
  vent.position.set(0, 0.3, -0.6);
  g.add(vent);

  g.userData.color = col;
  g.userData.shipClass = 'raider';
  return g;
}

// Sector 7–9+: Void Cruiser / Stealth Interceptor
function buildAlienVoidCruiser(colorIdx = 0) {
  const g = new THREE.Group();
  const purpleMat = new THREE.MeshStandardMaterial({ color: 0x160e29, metalness: 0.95, roughness: 0.15 });
  const voidGlow = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  // Sleek stealth delta hull
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.2, 3), purpleMat);
  nose.rotation.x = Math.PI / 2;
  g.add(nose);

  // Razor Swept Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.4, -0.6);
  wingShape.lineTo(2.1, -1.8);
  wingShape.lineTo(0, -0.8);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });

  const wingR = new THREE.Mesh(wingGeo, purpleMat);
  wingR.rotation.x = Math.PI / 2;
  wingR.position.set(0.2, 0.05, 0.6);
  g.add(wingR);

  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.2;
  g.add(wingL);

  // Floating Void Singularity Core
  const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), coreMat);
  coreMesh.position.set(0, 0.2, 0.1);
  g.add(coreMesh);

  // Void Fin Blades
  const finGeo = new THREE.ConeGeometry(0.08, 1.4, 4);
  finGeo.rotateX(Math.PI / 2);
  const finR = new THREE.Mesh(finGeo, voidGlow);
  finR.position.set(1.9, 0, 0.8);
  g.add(finR);

  const finL = finR.clone();
  finL.position.x = -1.9;
  g.add(finL);

  g.userData.coreMesh = coreMesh;
  g.userData.color = 0xa855f7;
  g.userData.shipClass = 'cruiser';
  return g;
}

// Sector 10+: Apex Titan Bio-Mechanical Flagship
function buildAlienApexTitan(colorIdx = 0) {
  const g = new THREE.Group();
  const chitinMat = new THREE.MeshStandardMaterial({ color: 0x0b101b, metalness: 0.95, roughness: 0.2 });
  const emeraldGlow = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const darkCoreMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });

  // Massive segmented carapace body
  const bodyGeo = new THREE.CylinderGeometry(1.2, 1.6, 3.6, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, chitinMat);
  g.add(body);

  // Dual Singularity Pods
  const podGeo = new THREE.SphereGeometry(0.55, 10, 10);
  const podR = new THREE.Mesh(podGeo, emeraldGlow);
  podR.position.set(2.0, 0.2, 0);
  g.add(podR);

  const podL = podR.clone();
  podL.position.x = -2.0;
  g.add(podL);

  // Heavy Outrigger Armor Wings
  const wingGeo = new THREE.BoxGeometry(1.2, 0.3, 2.4);
  const wingR = new THREE.Mesh(wingGeo, chitinMat);
  wingR.position.set(1.4, 0, 0.2);
  g.add(wingR);

  const wingL = wingR.clone();
  wingL.position.x = -1.4;
  g.add(wingL);

  // Pulsing central eye
  const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), darkCoreMat);
  eyeMesh.position.set(0, 0.45, 0.6);
  g.add(eyeMesh);

  // Menacing bio-spikes
  for (let i = 0; i < 4; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.2, 5), emeraldGlow);
    spike.rotation.x = -Math.PI / 2;
    spike.position.set((i - 1.5) * 0.8, -0.3, 1.8);
    g.add(spike);
  }

  g.userData.eyeMesh = eyeMesh;
  g.userData.podR = podR;
  g.userData.podL = podL;
  g.userData.color = 0x00ff88;
  g.userData.shipClass = 'titan';
  return g;
}

function createAlienMesh(sec, idx = 0) {
  const s = sec || state.sector || 1;
  if (s <= 10) {
    return (idx % 2 === 0) ? buildAlienSaucerWithPilot(idx) : buildAlienBioScout();
  } else if (s <= 30) {
    const pick = idx % 3;
    if (pick === 0) return buildAlienArmoredRaider(idx);
    if (pick === 1) return buildAlienSaucerWithPilot(idx);
    return buildAlienBioScout();
  } else if (s <= 60) {
    const pick = idx % 4;
    if (pick === 0) return buildAlienVoidCruiser(idx);
    if (pick === 1) return buildAlienArmoredRaider(idx);
    if (pick === 2) return buildAlienSaucerWithPilot(idx);
    return buildAlienBioScout();
  } else if (s <= 80) {
    const pick = idx % 5;
    if (pick === 0) return buildAlienApexTitan(idx);
    if (pick === 1) return buildAlienVoidCruiser(idx);
    if (pick === 2) return buildAlienArmoredRaider(idx);
    if (pick === 3) return buildAlienSaucerWithPilot(idx);
    return buildAlienBioScout();
  } else {
    // End Game Sectors 81-100+
    const pick = idx % 4;
    if (pick === 0) return buildAlienApexTitan(idx);
    if (pick === 1) return buildAlienVoidCruiser(idx);
    if (pick === 2) return buildAlienApexTitan(idx + 1);
    return buildAlienArmoredRaider(idx);
  }
}

function buildArmadaCommanderMesh() {
  const g = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1f0e24, roughness: 0.3, metalness: 0.8 });
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x3d1428, roughness: 0.4, metalness: 0.9 });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

  // Main hull chassis
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 3.8), hullMat);
  g.add(body);

  // Command Bridge
  const bridge = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 6), armorMat);
  bridge.rotation.x = -Math.PI / 2;
  bridge.position.set(0, 0.45, 0.4);
  g.add(bridge);

  // Plasma Core
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), coreMat);
  core.position.set(0, 0, -0.2);
  g.add(core);

  // Heavy Forward Prow Blades
  const prowL = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.8, 4), armorMat);
  prowL.rotation.set(Math.PI / 2, 0, 0.2);
  prowL.position.set(-1.1, 0, 1.8);
  g.add(prowL);

  const prowR = prowL.clone();
  prowR.rotation.z = -0.2;
  prowR.position.x = 1.1;
  g.add(prowR);

  // Lateral Thrusters
  const thrusterL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.8, 8), glowMat);
  thrusterL.rotation.x = Math.PI / 2;
  thrusterL.position.set(-1.3, 0, -1.9);
  g.add(thrusterL);

  const thrusterR = thrusterL.clone();
  thrusterR.position.x = 1.3;
  g.add(thrusterR);

  g.userData.color = 0xff0055;
  return g;
}

function buildLeviathanBoss() {
  const g = new THREE.Group();
  const carapaceMat = new THREE.MeshStandardMaterial({ color: 0x1c121e, metalness: 0.8, roughness: 0.3 });
  const brainMat = new THREE.MeshPhysicalMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.75, roughness: 0.2, transparent: true, opacity: 0.85 });
  const bioDomeMat = new THREE.MeshStandardMaterial({ color: 0x99aacc, transparent: true, opacity: 0.5, roughness: 0.2, metalness: 0.4 });

  const skullGeo = new THREE.ConeGeometry(2.4, 6.0, 7);
  skullGeo.scale(1.6, 1.0, 0.9);
  const skull = new THREE.Mesh(skullGeo, carapaceMat);
  skull.rotation.x = -Math.PI / 2;
  g.add(skull);

  const brainGeo = new THREE.SphereGeometry(1.5, 14, 12);
  brainGeo.scale(1.2, 0.9, 1.6);
  const brain = new THREE.Mesh(brainGeo, brainMat);
  brain.position.set(0, 0.6, -0.5);
  g.add(brain);
  g.userData.brain = brain;

  const brainDome = new THREE.Mesh(brainGeo, bioDomeMat);
  brainDome.position.set(0, 0.7, -0.5);
  brainDome.scale.set(1.28, 1.0, 1.68);
  g.add(brainDome);

  const bossEyeGeo = new THREE.SphereGeometry(0.45, 10, 8);
  bossEyeGeo.scale(1.8, 0.8, 0.6);
  const bossEyeMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, emissive: 0xff3366, emissiveIntensity: 0.8 });
  const eyeL = new THREE.Mesh(bossEyeGeo, bossEyeMat);
  eyeL.position.set(-1.6, 0.5, 1.8);
  eyeL.rotation.set(0.1, -0.4, 0.3);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.x = 1.6;
  eyeR.rotation.set(0.1, 0.4, -0.3);
  g.add(eyeR);

  const tentacles = [];
  for (let i = 0; i < 4; i++) {
    const tGroup = new THREE.Group();
    const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 3.8, 6), carapaceMat);
    tMesh.position.y = -1.9;
    tGroup.add(tMesh);
    tGroup.position.set((i - 1.5) * 1.8, -0.8, -2.8);
    tGroup.rotation.x = Math.PI / 4;
    g.add(tGroup);
    tentacles.push(tGroup);
  }
  g.userData.tentacles = tentacles;

  const turretMat = new THREE.MeshStandardMaterial({ color: 0x4a1828, metalness: 0.7, roughness: 0.3 });
  const turretL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.0, 8), turretMat);
  turretL.position.set(-3.2, 0.2, 0.5);
  g.add(turretL);

  const turretR = turretL.clone();
  turretR.position.x = 3.2;
  g.add(turretR);

  g.userData.turretL = turretL;
  g.userData.turretR = turretR;
  g.userData.color = 0xff0055;
  g.scale.set(1.4, 1.4, 1.4);
  return g;
}


function attachAlienShield(mesh, radius = 2.0, color = 0x00e5ff) {
  const shieldGeo = new THREE.SphereGeometry(radius, 14, 12);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
    blending: THREE.AdditiveBlending
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  mesh.add(shieldMesh);
  mesh.userData.shieldMesh = shieldMesh;
  mesh.userData.shieldMat = shieldMat;
}


function damageEnemy(enemy, dmg) {
  // Void Reaper perk: +50% Crit multiplier
  if (state.shipType === 'reaper' && Math.random() < 0.35) {
    dmg *= 1.5;
    spawnFloatingText(enemy.mesh.position, "CRITICAL HIT! (1.5x)", "#c000ff");
  }

  // 1. Alien Energy Deflector Shield Absorption
  if (enemy.shield && enemy.shield > 0) {
    enemy.shield -= dmg;
    audio.playAlienShieldHit();
    if (enemy.mesh.userData.shieldMat) {
      enemy.mesh.userData.shieldMat.opacity = 0.85;
    }
    spawnFloatingText(enemy.mesh.position, `SHIELD -${Math.round(dmg * 10)}`, "#00e5ff");

    if (enemy.isBoss) {
      const curTot = Math.max(0, enemy.hp + Math.max(0, enemy.shield));
      const maxTot = enemy.maxHp + (enemy.maxShield || 0);
      const pct = Math.max(0, Math.min(100, Math.round((curTot / maxTot) * 100)));
      document.getElementById('bossMeterFill').style.width = `${pct}%`;
      document.getElementById('bossHpPercent').textContent = `${pct}%`;
    }

    if (enemy.shield <= 0) {
      enemy.shield = 0;
      if (enemy.mesh.userData.shieldMesh) enemy.mesh.userData.shieldMesh.visible = false;
      audio.playAlienShieldBreak();
      spawnExplosionFX(enemy.mesh.position, 0x00f0ff, 16, 0.9);
      spawnFloatingText(enemy.mesh.position, "SHIELD BROKEN!", "#ffd166");
    }
    return;
  }

  // 2. Hull Armor Damage
  enemy.hp -= dmg;
  spawnFloatingText(enemy.mesh.position, `-${Math.round(dmg * 10)}`, "#ffd166");

  if (enemy.isBoss) {
    const curTot = Math.max(0, enemy.hp + Math.max(0, enemy.shield || 0));
    const maxTot = enemy.maxHp + (enemy.maxShield || 0);
    const pct = Math.max(0, Math.min(100, Math.round((curTot / maxTot) * 100)));
    document.getElementById('bossMeterFill').style.width = `${pct}%`;
    document.getElementById('bossHpPercent').textContent = `${pct}%`;
  }

  if (enemy.isArmadaCommander) {
    const badge = document.getElementById('armadaCommanderHpBadge');
    if (badge) {
      const pct = Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100));
      badge.textContent = `${pct}% HP`;
    }
  }

  if (enemy.hp <= 0) {
    enemy.alive = false;
    scene.remove(enemy.mesh);
    state.aliensKilled++;
    state.totalAliensKilled = (state.totalAliensKilled || 0) + 1;
    unlockAchievement('first_kill');

    // Industry-level XP & Dynamic Bounties
    const xpReward = enemy.isBoss ? 200 : (enemy.isArmadaCommander ? 250 : (enemy.isElite ? 40 : 15));
    addPlayerXP(xpReward);
    trackBountyProgress('raiders', 1);

    if (state.activeWeapon === 'railgun') {
      state.laserKills = (state.laserKills || 0) + 1;
      if (state.laserKills >= 15) unlockAchievement('laser_kill');
    }

    if (enemy.isBoss) {
      unlockAchievement('boss_slayer');
    }

    // Armada Commander Defeat Event
    if (enemy.isArmadaCommander) {
      state.armadaOverrunActive = false;
      state.armadaOverrunDefeated = true;
      audio.playPromotionFanfare();
      triggerShake(18);
      spawnExplosionFX(enemy.mesh.position, 0xff0055, 50, 2.2);
      const armadaBounty = Math.round(1500 * Math.pow(state.sector, 1.25));
      spawnFloatingText(player.position, `🎖️ ARMADA OVERRUN REPELLED! +${armadaBounty.toLocaleString()} CR`, "#00ff88");
      state.credits = Math.max(0, state.credits + armadaBounty);
      addPlayerXP(250);
      trackBountyProgress('armada', 1);

      const commsSource = document.getElementById('commsSource');
      const commsMessage = document.getElementById('commsMessage');
      if (commsSource) commsSource.textContent = "FLEET COMMS";
      if (commsMessage) commsMessage.textContent = "Armada Commander destroyed! Sector defense perimeter secured!";
      updateHUD();
    }

    saveGameData();
    const pts = enemy.isBoss ? 4500 : (enemy.isArmadaCommander ? 3000 : (enemy.isElite ? 1200 : (enemy.isSaucer ? 320 : 150)));
    addScore(pts);
    audio.playExplosion(enemy.isBoss ? 2.5 : (enemy.isArmadaCommander ? 2.0 : (enemy.isElite ? 1.6 : 1.0)));
    spawnExplosionFX(enemy.mesh.position, enemy.color, enemy.isBoss ? 55 : (enemy.isArmadaCommander ? 45 : (enemy.isElite ? 35 : 20)), enemy.isBoss ? 2.4 : 1.0);
    triggerShake(enemy.isBoss ? 18 : (enemy.isArmadaCommander ? 14 : (enemy.isElite ? 10 : 6)));

    const scrapVal = (enemy.isBoss ? 2500 : (enemy.isArmadaCommander ? 1200 : (enemy.isElite ? 250 : (enemy.isSaucer ? 80 : 45)))) * (1 + (state.sector - 1) * 0.45);
    spawnScrapDrop(enemy.mesh.position, Math.round(scrapVal));

    if (enemy.isElite || enemy.isArmadaCommander) {
      spawnPowerupItem(enemy.mesh.position);
    } else if (Math.random() < 0.28) {
      spawnPowerupItem(enemy.mesh.position);
    }

    // Void Reaper perk: 2x EMP charge gain
    const empGain = (enemy.isSaucer ? 25 : 14) * (state.shipType === 'reaper' ? 2.0 : 1.0);
    state.empCharge = Math.min(100, state.empCharge + empGain);

    updateHostilesHUD();

    if (enemy.isBoss) {
      state.bossActive = false;
      document.getElementById('bossBarContainer').style.display = 'none';

      let bossReward = 25000;
      if (state.sector >= 80) bossReward = 1000000;
      else if (state.sector >= 60) bossReward = 500000;
      else if (state.sector >= 40) bossReward = 200000;
      else if (state.sector >= 20) bossReward = 75000;

      state.credits = Math.max(0, state.credits + bossReward);
      audio.playPromotionFanfare();
      triggerShake(22);
      spawnExplosionFX(enemy.mesh.position, 0xffd166, 60, 3.0);
      spawnFloatingText(player.position, `👑 TITAN OVERLORD DESTROYED! +${bossReward.toLocaleString()} CR`, "#ffd166");
      saveGameData();
      updateHUD();
      setTimeout(sectorCompleted, 1800);
    }
  } else {
    if (enemy.mesh.userData.brain) {
      enemy.mesh.userData.brain.scale.set(1.3, 1.3, 1.3);
      setTimeout(() => { if (enemy.mesh.userData.brain) enemy.mesh.userData.brain.scale.set(1, 1, 1); }, 80);
    }
  }
}


// Alien Weapon Projectiles
function enemyFire(pos, targetPos, speed = 22, dmg = 15, color = 0xff0055) {
  const geo = new THREE.SphereGeometry(0.2, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);
  const dir = targetPos.clone().sub(pos).normalize();
  enemyBullets.push({ mesh, vx: dir.x * speed, vy: dir.y * speed, vz: dir.z * speed, dmg, speed });
}

function enemyFireSpread(pos, targetPos, speed = 24, dmg = 14) {
  const baseDir = targetPos.clone().sub(pos).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  const angles = [-0.22, 0, 0.22];
  for (const angle of angles) {
    const dir = baseDir.clone().applyAxisAngle(up, angle).normalize();
    const geo = new THREE.SphereGeometry(0.22, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    enemyBullets.push({ mesh, vx: dir.x * speed, vy: dir.y * speed, vz: dir.z * speed, dmg, speed });
  }
}

function enemyFireHomingOrb(pos, targetPos, speed = 18, dmg = 24) {
  const geo = new THREE.SphereGeometry(0.42, 10, 10);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xc000ff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);
  const dir = targetPos.clone().sub(pos).normalize();
  enemyBullets.push({
    mesh,
    vx: dir.x * speed,
    vy: dir.y * speed,
    vz: dir.z * speed,
    dmg,
    speed,
    isHoming: true,
    homingTimer: 2.2
  });
}

export {
  buildRealisticAlienPilot,
  buildAlienSaucerWithPilot,
  buildAlienBioScout,
  buildAlienArmoredRaider,
  buildAlienVoidCruiser,
  buildAlienApexTitan,
  createAlienMesh,
  buildArmadaCommanderMesh,
  buildLeviathanBoss,
  attachAlienShield,
  damageEnemy,
  enemyFire,
  enemyFireSpread,
  enemyFireHomingOrb
};

if (typeof window !== 'undefined') {
  window.createAlienMesh = createAlienMesh;
  window.damageEnemy = damageEnemy;
  window.attachAlienShield = attachAlienShield;
}
