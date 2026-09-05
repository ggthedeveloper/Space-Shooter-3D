/**
 * ALIEN ASSAULT 3D - GAME ENGINE & SIMULATION
 * Three.js scene, camera, renderer, starfield, asteroids, drones, entities, and main loop
 */

import { state } from './state.js';
import { audio } from './audio.js';
import { BOUNDS, player, keys, isMouseDown, isRightMouseDown } from './player.js';
import { buildContinuousBeam, buildWingmanDroneMesh } from './ships.js';

// Three.js Scene, Camera, Renderer & Lights
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'default' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x02050f, 1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const scene = new THREE.Scene();
// Outer space is a vacuum with no fog - all stars and planets are crystal clear
scene.fog = null;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
camera.position.set(0, 5.2, 15.5);
camera.lookAt(0, 0, -10);

scene.add(new THREE.AmbientLight(0x7585a5, 0.85));
const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
sunLight.position.set(25, 35, 20);
scene.add(sunLight);

const spaceFillLight = new THREE.DirectionalLight(0x385b88, 1.0);
spaceFillLight.position.set(-25, -20, 20);
scene.add(spaceFillLight);


// Starfield Background
const STAR_COUNT = 2400;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
const starVel = new Float32Array(STAR_COUNT);

const spectralPalette = [
  new THREE.Color(0x9db4ff),
  new THREE.Color(0xf8f9fa),
  new THREE.Color(0xfff4e8),
  new THREE.Color(0xffd2a1),
  new THREE.Color(0xff6b6b)
];

for (let i = 0; i < STAR_COUNT; i++) {
  starPos[i*3] = (Math.random() - 0.5) * 140;
  starPos[i*3+1] = (Math.random() - 0.5) * 80;
  starPos[i*3+2] = -Math.random() * 260;
  starVel[i] = 16 + Math.random() * 34;

  const col = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
  starColors[i*3] = col.r;
  starColors[i*3+1] = col.g;
  starColors[i*3+2] = col.b;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
const starMat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.95, fog: false });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);


// Raycaster & Target Aiming Plane
const raycaster = new THREE.Raycaster();
const aimPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 32);
const aimTargetPoint = new THREE.Vector3(0, 0, -32);
let currentMouseNDC = new THREE.Vector2(0, 0);

// Continuous Laser Beam & Wingman Drones
export const continuousBeam = buildContinuousBeam();
scene.add(continuousBeam);

export const droneAlpha = buildWingmanDroneMesh(0x00f0ff);
export const droneBeta = buildWingmanDroneMesh(0x00ff88);
scene.add(droneAlpha);
scene.add(droneBeta);

// Add player to scene
scene.add(player);

// Entity Collections
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let missiles = [];
let beamEffects = [];
let particles = [];
let shockwaves = [];
let powerups = [];
let scrapDrops = [];

// Wingman Drones Update & Firing
function updateWingmanDrones(dt) {
  const pPos = player.position;

  // Drone Alpha (Port / Left flank)
  if (state.dronesUnlocked >= 1 && state.hull > 0) {
    droneAlpha.visible = true;
    const targetAlphaPos = new THREE.Vector3(pPos.x - 2.8, pPos.y + 0.4, pPos.z + 0.8);
    droneAlpha.position.lerp(targetAlphaPos, Math.min(1, dt * 6.5));
    droneAlpha.rotation.z = player.rotation.z * 0.8;
    droneAlpha.rotation.x = player.rotation.x;
    droneAlpha.userData.ringMesh.rotation.z += dt * 3.5;

    droneAlpha.userData.fireTimer -= dt;
    if (droneAlpha.userData.fireTimer <= 0 && !state.warpActive && !state.paused) {
      droneAlpha.userData.fireTimer = 0.32;
      fireDroneLaser(droneAlpha, 0x00f0ff);
    }
  } else {
    droneAlpha.visible = false;
  }

  // Drone Beta (Starboard / Right flank)
  if (state.dronesUnlocked >= 2 && state.hull > 0) {
    droneBeta.visible = true;
    const targetBetaPos = new THREE.Vector3(pPos.x + 2.8, pPos.y + 0.4, pPos.z + 0.8);
    droneBeta.position.lerp(targetBetaPos, Math.min(1, dt * 6.5));
    droneBeta.rotation.z = player.rotation.z * 0.8;
    droneBeta.rotation.x = player.rotation.x;
    droneBeta.userData.ringMesh.rotation.z -= dt * 3.5;

    droneBeta.userData.fireTimer -= dt;
    if (droneBeta.userData.fireTimer <= 0 && !state.warpActive && !state.paused) {
      droneBeta.userData.fireTimer = 0.32;
      fireDroneLaser(droneBeta, 0xff00ff);
    }
  } else {
    droneBeta.visible = false;
  }
}

function fireDroneLaser(droneGroup, colorHex) {
  const dPos = droneGroup.position.clone();
  dPos.z -= 0.4;

  let target = null;
  let closestDist = 999;
  for (const e of enemies) {
    if (!e.alive || e.mesh.position.z >= dPos.z) continue;
    const d = dPos.distanceTo(e.mesh.position);
    if (d < closestDist) {
      closestDist = d;
      target = e;
    }
  }

  let dir = new THREE.Vector3(0, 0, -1);
  if (target) {
    dir = target.mesh.position.clone().sub(dPos).normalize();
  } else {
    dir = aimTargetPoint.clone().sub(dPos).normalize();
  }

  const boltGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5);
  boltGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: colorHex });
  const mesh = new THREE.Mesh(boltGeo, boltMat);
  mesh.position.copy(dPos);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  scene.add(mesh);

  const speed = 54;
  const dmg = 0.85 * state.damageMult;
  playerBullets.push({ mesh, vx: dir.x * speed, vy: dir.y * speed, vz: dir.z * speed, dmg });
}

// Destructible Asteroid Belt

// Procedural Asteroids System
let asteroids = [];
let asteroidSpawnTimer = 3.0;

function createProceduralAsteroidGeometry(radius = 1.6) {
  const geo = new THREE.DodecahedronGeometry(radius, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const noise = 1.0 + (Math.sin(vx * 3.5) * Math.cos(vy * 3.5) * Math.sin(vz * 3.5)) * 0.28;
    pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
  }
  geo.computeVertexNormals();
  return geo;
}

function spawnAsteroid() {
  const radius = 1.1 + Math.random() * 1.5;
  const geo = createProceduralAsteroidGeometry(radius);
  const isCrystal = Math.random() < 0.4;
  const mat = new THREE.MeshStandardMaterial({
    color: isCrystal ? 0x273b4d : 0x48423a,
    roughness: 0.85,
    metalness: isCrystal ? 0.45 : 0.15,
    flatShading: true
  });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    (Math.random() - 0.5) * 36,
    (Math.random() - 0.5) * 18,
    -85 - Math.random() * 25
  );

  if (isCrystal) {
    const coreGeo = new THREE.OctahedronGeometry(radius * 0.45);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    mesh.add(new THREE.Mesh(coreGeo, coreMat));
  }

  scene.add(mesh);
  asteroids.push({
    mesh,
    radius,
    hp: radius * 6.5,
    maxHp: radius * 6.5,
    rotSpeedX: (Math.random() - 0.5) * 2.0,
    rotSpeedY: (Math.random() - 0.5) * 2.0,
    rotSpeedZ: (Math.random() - 0.5) * 2.0,
    vz: 8.0 + Math.random() * 6.0,
    vx: (Math.random() - 0.5) * 1.8,
    vy: (Math.random() - 0.5) * 1.2,
    isCrystal
  });
}

function updateAsteroids(dt) {
  if (state.warpActive || state.paused || state.hull <= 0) return;

  asteroidSpawnTimer -= dt;
  if (asteroidSpawnTimer <= 0 && asteroids.length < 5) {
    asteroidSpawnTimer = 3.2 + Math.random() * 3.5;
    spawnAsteroid();
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.mesh.position.x += a.vx * dt;
    a.mesh.position.y += a.vy * dt;
    a.mesh.position.z += a.vz * dt;
    a.mesh.rotation.x += a.rotSpeedX * dt;
    a.mesh.rotation.y += a.rotSpeedY * dt;
    a.mesh.rotation.z += a.rotSpeedZ * dt;

    const distToPlayer = a.mesh.position.distanceTo(player.position);
    if (distToPlayer < (a.radius + 1.2) && state.hull > 0 && state.invulnTimer <= 0) {
      damagePlayer(20);
      spawnExplosionFX(a.mesh.position, 0x8892b0, 8, 1.2);
      scene.remove(a.mesh);
      asteroids.splice(i, 1);
      triggerShake(7);
      continue;
    }

    if (a.mesh.position.z > 15) {
      scene.remove(a.mesh);
      asteroids.splice(i, 1);
    }
  }
}

function damageAsteroid(ast, dmg, hitPos) {
  ast.hp -= dmg;
  spawnExplosionFX(hitPos || ast.mesh.position, ast.isCrystal ? 0x00f0ff : 0xd2a679, 3, 0.4);
  if (ast.hp <= 0) {
    destroyAsteroid(ast);
  }
}

function destroyAsteroid(ast) {
  const idx = asteroids.indexOf(ast);
  if (idx !== -1) asteroids.splice(idx, 1);
  scene.remove(ast.mesh);

  spawnExplosionFX(ast.mesh.position, ast.isCrystal ? 0x00e5ff : 0x887b6e, 10, 1.4);
  audio.playExplosion(0.8);
  triggerShake(4);

  const scrapAmount = ast.isCrystal ? 50 : 25;
  state.credits += scrapAmount;
  spawnFloatingText(ast.mesh.position, `+${scrapAmount} MINERAL SCRAP!`, ast.isCrystal ? "#00f0ff" : "#ffd166");
  saveGameData();
  updateHUD();

  state.asteroidKills = (state.asteroidKills || 0) + 1;
  trackBountyProgress('asteroids', 1);
  addPlayerXP(15);
  if (state.asteroidKills >= 5) {
    unlockAchievement('asteroid_miner');
  }
}

// Intercepted Hive Radio Comms Pool

// Mission Initializer
function startMission() {
  for (const e of enemies) scene.remove(e.mesh);
  for (const b of playerBullets) scene.remove(b.mesh);
  for (const b of enemyBullets) scene.remove(b.mesh);
  for (const m of missiles) scene.remove(m.mesh);
  for (const p of particles) scene.remove(p.mesh);
  for (const s of shockwaves) scene.remove(s.mesh);
  for (const p of powerups) scene.remove(p.mesh);
  for (const sc of scrapDrops) scene.remove(sc.mesh);

  enemies.length = 0; playerBullets.length = 0; enemyBullets.length = 0; missiles.length = 0;
  particles.length = 0; shockwaves.length = 0; powerups.length = 0; scrapDrops.length = 0;

  state.score = 0;
  // Persistent scrap bank is preserved
  state.lives = 3;
  state.hull = state.maxHull;
  state.shield = state.maxShield;
  state.sector = 1;
  state.combo = 1.0;
  state.comboTimer = 0;
  state.aliensKilled = 0;
  state.damageMult = 1.0;
  state.fireRateMult = 1.0;
  state.missileStock = 6;
  state.empCharge = 100;
  state.overchargeCharge = 100;
  state.vx = 0;
  state.vy = 0;
  state.running = true;
  state.paused = false;
  state.bossActive = false;
  state.warpActive = false;
  state.sectorClearing = false;
  state.armadaOverrunActive = false;
  state.armadaOverrunDefeated = false;

  setStarship(state.shipType);
  player.position.set(0, 0, BOUNDS.playerZ);
  player.rotation.set(0, 0, 0);
  player.visible = true;

  updateHUD();
  loadSector(state.sector);
}


// Main Simulation Frame Update & Animation Loop
const clock = new THREE.Clock();
let waveTime = 0;

function update(dt) {
  dt *= (state.timeScale !== undefined ? state.timeScale : 1.0);

  // Ability Cooldown Timer
  if (state.abilityCooldown > 0) {
    state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    updateAbilityUI();
  }

  // Starfield parallax + Warp acceleration
  const starAttr = starField.geometry.attributes.position;
  const warpMult = state.warpActive ? 12.0 : (state.rollActive ? 3.0 : 1.0);
  for (let i = 0; i < STAR_COUNT; i++) {
    let z = starAttr.getZ(i) + starVel[i] * dt * warpMult;
    if (z > 20) z = -260;
    starAttr.setZ(i, z);
  }
  starAttr.needsUpdate = true;

  // Gentle 3D nebula cloud drift
  if (nebulaCloudGroup) {
    nebulaCloudGroup.rotation.z += dt * 0.015;
  }

  // Warp Camera Tunnel Zoom
  if (state.warpActive) {
    state.warpTimer -= dt;
    const warpProgress = 1 - (state.warpTimer / 2.8);
    camera.fov = 60 + Math.sin(warpProgress * Math.PI) * 22;
    camera.updateProjectionMatrix();

    if (state.warpTimer <= 0) {
      state.warpActive = false;
      camera.fov = 60;
      camera.updateProjectionMatrix();
      openStoreModal(true); // Open store for next sector
    }
  }

  if (!state.running || state.paused) return;
  waveTime += dt;

  // Combo decay
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    document.getElementById('comboBarFill').style.width = `${(state.comboTimer / 3.5) * 100}%`;
    document.getElementById('comboMultiplier').textContent = `${state.combo.toFixed(1)}x`;
  } else {
    state.combo = 1.0;
    document.getElementById('comboBarFill').style.width = `0%`;
    document.getElementById('comboMultiplier').textContent = `1.0x`;
  }

  // Shields recharge
  if (state.shieldRechargeDelay > 0) {
    state.shieldRechargeDelay -= dt;
  } else if (state.shield < state.maxShield && state.hull > 0) {
    state.shield = Math.min(state.maxShield, state.shield + state.shieldRechargeRate * dt);
    updateHUD();
  }

  // Flight Survival Timer for Auto-Aim Surge (Every 45s of combat flight)
  if (state.running && !state.paused && !state.warpActive && state.hull > 0) {
    state.flightSurvivalTimer = (state.flightSurvivalTimer || 0) + dt;
    if (state.flightSurvivalTimer >= 45) {
      state.flightSurvivalTimer = 0;
      activateAutoAim(7, "SURVIVAL TIME SURGE");
    }
  }

  // Tactical AI Auto-Aim Countdown
  if (state.autoAimActive) {
    state.autoAimTimer -= dt;
    if (state.autoAimTimer <= 0) {
      state.autoAimActive = false;
      state.autoAimTimer = 0;
      spawnFloatingText(player.position, "AUTO-AIM DEPLETED", "#8da4cf");
      audio.speak("Auto-aim offline.");
      reticleEl.classList.remove('locked-auto');
      updateHUD();
    }
  }

  // Solar Phoenix Nanite Auto-Repair (Passive Hull Healing)
  if (state.shipType === 'phoenix' && state.hull > 0 && state.hull < state.maxHull && !state.warpActive && !state.paused) {
    state.hull = Math.min(state.maxHull, state.hull + 3.0 * dt);
    updateHUD();
  }

  // Flight Steering
  let targetVx = 0;
  let targetVy = 0;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) targetVx -= state.speed;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) targetVx += state.speed;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) targetVy += state.speed;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) targetVy -= state.speed;

  if (touchAxes.x !== 0 || touchAxes.y !== 0) {
    targetVx += touchAxes.x * state.speed;
    targetVy += touchAxes.y * state.speed;
  }

  state.vx += (targetVx - state.vx) * Math.min(1, dt * 10);
  state.vy += (targetVy - state.vy) * Math.min(1, dt * 10);

  player.position.x += state.vx * dt;
  player.position.y += state.vy * dt;
  player.position.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, player.position.x));
  player.position.y = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, player.position.y));

  // Dynamic Tilt Banking
  const targetRoll = -state.vx * 0.04;
  const targetPitch = state.vy * 0.03;

  if (state.rollActive) {
    state.rollProgress += dt * 5.0;
    player.rotation.z = targetRoll + state.rollProgress * Math.PI * 2;
    if (state.rollProgress >= 1.0) { state.rollActive = false; player.rotation.z = targetRoll; }
  } else {
    player.rotation.z += (targetRoll - player.rotation.z) * Math.min(1, dt * 8);
  }
  player.rotation.x += (targetPitch - player.rotation.x) * Math.min(1, dt * 8);

  // Cannons pivot towards aim point
  if (player.userData.cannonL && player.userData.cannonR) {
    const aimVector = aimTargetPoint.clone().sub(player.position).normalize();
    const aimYaw = Math.atan2(aimVector.x, -aimVector.z);
    player.userData.cannonL.rotation.y = aimYaw * 0.6;
    player.userData.cannonR.rotation.y = aimYaw * 0.6;
  }

  playerPointLight.position.copy(player.position);
  camera.position.x += (player.position.x * 0.35 - camera.position.x) * Math.min(1, dt * 4);
  camera.position.y += (7.5 + player.position.y * 0.25 - camera.position.y) * Math.min(1, dt * 4);

  const speedRatio = Math.hypot(state.vx, state.vy) / state.speed;
  audio.updateEngineThrust(speedRatio, state.rollActive);

  // Dynamic Thruster Plumes & Bio-Core Animation
  const plumeScale = 0.85 + Math.random() * 0.35 + (speedRatio * 0.4);
  if (player.userData.plumeR) player.userData.plumeR.scale.set(1, plumeScale, 1);
  if (player.userData.plumeL) player.userData.plumeL.scale.set(1, plumeScale, 1);
  if (player.userData.plumeC) player.userData.plumeC.scale.set(1, plumeScale, 1);
  if (player.userData.coreMesh) player.userData.coreMesh.rotation.y += dt * 4;

  // Invulnerability Golden Shield Shimmer
  if (state.invulnTimer > 0) {
    state.invulnTimer -= dt;
    player.visible = Math.floor(clock.elapsedTime * 18) % 2 === 0;
    if (player.userData.shieldMat) player.userData.shieldMat.opacity = 0.65;
  } else {
    player.visible = true;
    if (player.userData.shieldMat && state.hull > 0 && !player.userData.shieldHit) {
      player.userData.shieldMat.opacity = 0.0;
    }
  }

  // Update Autonomous Wingman Drones, Asteroids, and Intercepted Comms
  updateWingmanDrones(dt);
  updateAsteroids(dt);
  updateComms(dt);

  // Hyper-Overcharge Timer
  if (state.overchargeActive) {
    state.overchargeTimer -= dt;
    if (state.overchargeTimer <= 0) {
      state.overchargeActive = false;
      spawnFloatingText(player.position, "OVERCHARGE DEPLETED", "#8da4cf");
      updateHUD();
    }
  }

  // Continuous High-Energy Laser Beam System
  const isContinuousLaser = (state.activeWeapon === 'railgun' && state.running && !state.paused && !state.warpActive && state.hull > 0);
  if (isContinuousLaser) {
    audio.startBeamHum();
    continuousBeam.visible = true;

    const pPos = player.position.clone();
    pPos.z -= 0.6;
    const dir = aimTargetPoint.clone().sub(pPos).normalize();
    let beamLength = 140;

    // Raycast against enemies & asteroids to find contact impact point
    const ray = new THREE.Ray(pPos, dir);
    const overchargeScale = state.overchargeActive ? 2.8 : 1.0;
    const tierScale = (1.0 + (state.railgunTier - 1) * 0.28) * overchargeScale;

    // Continuous Beam Damage per Second (3x under Hyper-Overcharge)
    const beamDps = 28 * state.damageMult * (1 + (state.railgunTier - 1) * 0.35) * (state.overchargeActive ? 3.0 : 1.0);
    const frameDmg = beamDps * dt;

    let closestHitEnemy = null;
    let closestHitDist = beamLength;
    let closestHitPos = null;

    for (const e of enemies) {
      if (!e.alive) continue;
      const hitDist = (e.isBoss ? 4.5 : 2.2) * Math.max(1, tierScale * 0.85);
      const closest = new THREE.Vector3();
      ray.closestPointToPoint(e.mesh.position, closest);
      if (closest.distanceTo(e.mesh.position) < hitDist && closest.z < pPos.z) {
        const distFromPlayer = pPos.distanceTo(closest);
        if (distFromPlayer < closestHitDist) {
          closestHitDist = distFromPlayer;
          closestHitEnemy = e;
          closestHitPos = closest.clone();
        }
        damageEnemy(e, frameDmg);
      }
    }

    // Laser cuts and shatters tumbling Asteroids
    let closestHitAsteroid = null;
    for (const a of asteroids) {
      const closest = new THREE.Vector3();
      ray.closestPointToPoint(a.mesh.position, closest);
      if (closest.distanceTo(a.mesh.position) < (a.radius + 1.4) * Math.max(1, tierScale * 0.8) && closest.z < pPos.z) {
        const distFromPlayer = pPos.distanceTo(closest);
        if (distFromPlayer < closestHitDist) {
          closestHitDist = distFromPlayer;
          closestHitAsteroid = a;
          closestHitPos = closest.clone();
        }
        damageAsteroid(a, frameDmg * 1.5, closest);
      }
    }

    const hitAny = (closestHitEnemy !== null || closestHitAsteroid !== null);
    if (hitAny && closestHitPos) {
      beamLength = Math.max(2, closestHitDist);
    }

    const endPoint = pPos.clone().addScaledVector(dir, beamLength);
    continuousBeam.position.copy(pPos);
    continuousBeam.lookAt(endPoint);

    // Dynamic thickness & corona intensity scaling based on Power Tier & Hyper-Overcharge
    continuousBeam.userData.coreMesh.scale.set(tierScale, tierScale, beamLength);
    const shipBeamCfg = (SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie).wep2;
    const isOvercharge = state.overchargeActive;
    const beamMidColor = isOvercharge ? 0x00f0ff : shipBeamCfg.midColor;
    const beamGlowColor = isOvercharge ? 0x0088ff : shipBeamCfg.glowColor;

    continuousBeam.userData.midMat.color.setHex(beamMidColor);
    continuousBeam.userData.glowMat.color.setHex(beamGlowColor);

    const pulse = (state.overchargeActive ? 0.85 : 0.6) + Math.sin(clock.elapsedTime * (state.overchargeActive ? 40.0 : 28.0)) * 0.15;
    continuousBeam.userData.glowMat.opacity = pulse;

    // Contact Plasma Impact Orb & Rings visibly blazing on the alien
    if (hitAny && closestHitPos) {
      continuousBeam.userData.impactMesh.visible = true;
      continuousBeam.userData.impactRingMesh.visible = true;

      // Position in local coordinates of continuousBeam
      continuousBeam.userData.impactMesh.position.set(0, 0, beamLength);
      continuousBeam.userData.impactRingMesh.position.set(0, 0, beamLength);

      const impactScale = (state.overchargeActive ? 2.5 : 1.3) * (1.0 + Math.sin(clock.elapsedTime * 35.0) * 0.2);
      continuousBeam.userData.impactMesh.scale.setScalar(impactScale);
      continuousBeam.userData.impactRingMesh.scale.setScalar(impactScale * 1.35);
      continuousBeam.userData.impactRingMesh.rotation.z += dt * 12;

      continuousBeam.userData.impactMat.color.setHex(isOvercharge ? 0x00ffff : 0xffffff);
      continuousBeam.userData.impactRingMat.color.setHex(beamMidColor);

      // Continuous sizzling sparks exploding from the alien
      if (Math.random() < 0.8) {
        spawnExplosionFX(closestHitPos, beamMidColor, isOvercharge ? 5 : 3, isOvercharge ? 0.8 : 0.45);
      }
      if (Math.random() < (state.overchargeActive ? 0.4 : 0.18)) {
        triggerShake(state.overchargeActive ? 4 : 2);
      }
    } else {
      continuousBeam.userData.impactMesh.visible = false;
      continuousBeam.userData.impactRingMesh.visible = false;
    }
  } else {
    audio.stopBeamHum();
    continuousBeam.visible = false;
    if (continuousBeam.userData.impactMesh) continuousBeam.userData.impactMesh.visible = false;
    if (continuousBeam.userData.impactRingMesh) continuousBeam.userData.impactRingMesh.visible = false;
  }

  // Firing logic for projectile weapons (Plasma & Flak)
  if (state.fireCooldown > 0) state.fireCooldown -= dt;
  if (state.missileCooldown > 0) state.missileCooldown -= dt;

  // Continuous Automatic Firing for Weapons
  if (state.activeWeapon !== 'railgun' && state.fireCooldown <= 0 && state.hull > 0 && !state.warpActive && !state.paused) {
    fireActiveWeapon();
    let rate = state.plasmaRate;
    if (state.activeWeapon === 'flak') rate = state.flakRate;
    else if (state.activeWeapon === 'torpedo') rate = state.torpedoRate;
    else if (state.activeWeapon === 'tesla') rate = state.teslaRate;
    state.fireCooldown = rate / state.fireRateMult;
  }

  // Player Bullets
  for (const b of playerBullets) {
    b.mesh.position.x += b.vx * dt;
    b.mesh.position.y += b.vy * dt;
    b.mesh.position.z += b.vz * dt;
  }
  playerBullets = playerBullets.filter(b => {
    if (b.mesh.position.z < -90 || Math.abs(b.mesh.position.x) > 35 || Math.abs(b.mesh.position.y) > 30) {
      if (b.isTorpedo) {
        detonateTorpedo(b.mesh.position, b.blastRadius * 0.75, b.dmg * 0.6, b.torpColor || 0x00ffff);
      }
      scene.remove(b.mesh);
      return false;
    }

    // Check collision with Asteroids
    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const a = asteroids[ai];
      if (b.mesh.position.distanceTo(a.mesh.position) < a.radius + (b.isTorpedo ? 1.0 : 0.6)) {
        if (b.isTorpedo) {
          detonateTorpedo(b.mesh.position, b.blastRadius, b.dmg, b.torpColor || 0x00ffff);
        } else {
          damageAsteroid(a, b.dmg, b.mesh.position);
        }
        scene.remove(b.mesh);
        return false;
      }
    }

    return true;
  });

  // Railgun Beams Fade
  for (const bm of beamEffects) {
    bm.life -= dt;
    bm.mesh.material.opacity = Math.max(0, bm.life / 0.14);
  }
  beamEffects = beamEffects.filter(bm => {
    if (bm.life <= 0) { scene.remove(bm.mesh); return false; }
    return true;
  });

  // Homing Missiles
  for (const m of missiles) {
    m.life -= dt;
    if (m.target && m.target.alive) {
      const desiredDir = m.target.mesh.position.clone().sub(m.mesh.position).normalize();
      m.vel.lerp(desiredDir.multiplyScalar(m.speed), dt * 6.5);
    } else {
      let newTarget = null;
      let minDist = Infinity;
      for (const e of enemies) {
        if (!e.alive) continue;
        const d = m.mesh.position.distanceTo(e.mesh.position);
        if (d < minDist) { minDist = d; newTarget = e; }
      }
      m.target = newTarget;
    }
    m.mesh.position.addScaledVector(m.vel, dt);
    m.mesh.lookAt(m.mesh.position.clone().add(m.vel));
    if (Math.random() < 0.45) spawnExplosionFX(m.mesh.position, 0x8899aa, 1, 0.4);
  }
  missiles = missiles.filter(m => {
    if (m.life <= 0 || m.mesh.position.z < -90) { scene.remove(m.mesh); return false; }
    return true;
  });

  // Enemy Bullets
  for (const b of enemyBullets) {
    if (b.isHoming && b.homingTimer > 0) {
      b.homingTimer -= dt;
      const targetDir = player.position.clone().sub(b.mesh.position).normalize();
      const currentDir = new THREE.Vector3(b.vx, b.vy, b.vz).normalize();
      currentDir.lerp(targetDir, dt * 2.8).normalize();
      const speed = b.speed || 18;
      b.vx = currentDir.x * speed;
      b.vy = currentDir.y * speed;
      b.vz = currentDir.z * speed;
      if (Math.random() < 0.3) {
        spawnExplosionFX(b.mesh.position, 0xa855f7, 1, 0.3);
      }
    }
    b.mesh.position.x += b.vx * dt;
    b.mesh.position.y += b.vy * dt;
    b.mesh.position.z += b.vz * dt;
    if (b.mesh.position.distanceTo(player.position) < 1.35) {
      damagePlayer(b.dmg || 15);
      b.mesh.position.z = 9999;
    }
  }
  enemyBullets = enemyBullets.filter(b => {
    if (b.mesh.position.z > 25 || b.mesh.position.z > 9000) { scene.remove(b.mesh); return false; }
    return true;
  });

  // Shockwaves
  for (const s of shockwaves) {
    s.radius += s.speed * dt;
    s.mesh.scale.set(s.radius, s.radius, s.radius);
    s.mesh.material.opacity = Math.max(0, 1 - s.radius / s.maxRadius);
  }
  shockwaves = shockwaves.filter(s => {
    if (s.radius >= s.maxRadius) { scene.remove(s.mesh); return false; }
    return true;
  });

  // Energy Scrap Magnetism
  for (const sc of scrapDrops) {
    sc.mesh.rotation.x += dt * 3;
    sc.mesh.rotation.y += dt * 3;
    sc.mesh.position.z += 8 * dt;

    const dist = sc.mesh.position.distanceTo(player.position);
    if (dist < state.magnetRange) {
      const pull = player.position.clone().sub(sc.mesh.position).normalize().multiplyScalar(18 * dt);
      sc.mesh.position.add(pull);
    }
    if (dist < 1.3) {
      state.credits += sc.val;
      saveGameData();
      spawnFloatingText(player.position, `+${sc.val} CR`, "#ffd166");
      scene.remove(sc.mesh);
      sc.collected = true;
      updateHUD();
    }
  }
  scrapDrops = scrapDrops.filter(sc => !sc.collected && sc.mesh.position.z < 25);

  // Powerups Magnetism
  for (const p of powerups) {
    p.mesh.rotation.y += dt * 3;
    p.mesh.position.z += 8 * dt;
    const dist = p.mesh.position.distanceTo(player.position);
    if (dist < state.magnetRange) {
      const pull = player.position.clone().sub(p.mesh.position).normalize().multiplyScalar(15 * dt);
      p.mesh.position.add(pull);
    }
    if (dist < 1.3) {
      collectPowerup(p);
      scene.remove(p.mesh);
      p.collected = true;
    }
  }
  powerups = powerups.filter(p => !p.collected && p.mesh.position.z < 25);

  // Enemy AI & Living Alien Gaze Tracking
  const formationSway = Math.sin(waveTime * 1.1) * 3.5;
  const formationApproach = Math.min(waveTime * 0.45, 18);

  for (const e of enemies) {
    if (!e.alive) continue;

    if (e.isBoss) {
      e.mesh.position.x = Math.sin(waveTime * 0.7) * 4.5;
      e.mesh.position.z = -32 + Math.cos(waveTime * 0.5) * 4.0;
      e.mesh.rotation.y = Math.sin(waveTime * 0.6) * 0.15;

      if (e.mesh.userData.tentacles) {
        e.mesh.userData.tentacles.forEach((t, i) => {
          t.rotation.z = Math.sin(waveTime * 3.0 + i) * 0.35;
          t.rotation.x = Math.PI / 4 + Math.cos(waveTime * 2.5 + i) * 0.25;
        });
      }

      if (e.mesh.userData.brain) {
        const pulse = 1.0 + Math.sin(waveTime * 5.0) * 0.08;
        e.mesh.userData.brain.scale.set(1.2 * pulse, 0.9 * pulse, 1.6 * pulse);
      }

      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        const sec = state.sector;
        const bossSpeed = 22 + (sec - 3) * 3;
        // 1. Dual heavy plasma cannons
        enemyFire(e.mesh.position.clone().add(new THREE.Vector3(-3.4, 0, 1)), player.position, bossSpeed, 18, 0xff0033);
        enemyFire(e.mesh.position.clone().add(new THREE.Vector3(3.4, 0, 1)), player.position, bossSpeed, 18, 0xff0033);

        // 2. Multi-shot fan spreads
        if (Math.random() < 0.65) {
          enemyFireSpread(e.mesh.position.clone().add(new THREE.Vector3(0, -1, 1)), player.position, bossSpeed + 2, 16);
        }

        // 3. Homing bio-plasma orb attack
        if (Math.random() < 0.4) {
          enemyFireHomingOrb(e.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 1)), player.position, 18, 25);
        }

        e.attackTimer = Math.max(0.7, 1.3 - (sec - 3) * 0.15);
      }
    } else if (e.isArmadaCommander) {
      e.mesh.position.x = Math.sin(waveTime * 0.9) * 5.0;
      e.mesh.position.y = 3.5 + Math.sin(waveTime * 1.5) * 0.8;
      e.mesh.position.z = -30 + Math.cos(waveTime * 0.7) * 3.5;
      e.mesh.rotation.y = Math.sin(waveTime * 0.8) * 0.2;
      e.mesh.rotation.z = Math.sin(waveTime * 0.9) * -0.15;

      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        const commanderSpeed = 25;
        enemyFire(e.mesh.position.clone().add(new THREE.Vector3(-1.2, 0, 1)), player.position, commanderSpeed, 20, 0xff0055);
        enemyFire(e.mesh.position.clone().add(new THREE.Vector3(1.2, 0, 1)), player.position, commanderSpeed, 20, 0xff0055);
        if (Math.random() < 0.5) {
          enemyFireSpread(e.mesh.position, player.position, commanderSpeed + 2, 16);
        }
        e.attackTimer = 1.0;
      }
    } else {
      if (e.isSaucer) {
        e.mesh.rotation.y += dt * 1.5;
        if (e.mesh.userData.rimLights) e.mesh.userData.rimLights.rotation.y += dt * 2.5;

        // Realistic Alien Pilot Head Tracks Player Craft
        if (e.mesh.userData.pilot && e.mesh.userData.pilot.userData.headGroup) {
          const head = e.mesh.userData.pilot.userData.headGroup;
          const toPlayer = player.position.clone().sub(e.mesh.position);
          head.rotation.y = Math.atan2(toPlayer.x, toPlayer.z) * 0.7;
          head.rotation.x = -toPlayer.y * 0.04;

          const breath = 1.0 + Math.sin(waveTime * 3.0 + e.wobble) * 0.04;
          e.mesh.userData.pilot.userData.cranium.scale.set(0.85 * breath, 1.25 * breath, 1.35 * breath);
        }
      } else {
        if (e.mesh.userData.mandibleL && e.mesh.userData.mandibleR) {
          const snap = Math.sin(waveTime * 6.0) * 0.2;
          e.mesh.userData.mandibleL.rotation.z = -0.4 + snap;
          e.mesh.userData.mandibleR.rotation.z = 0.4 - snap;
        }
        if (e.mesh.userData.wings) e.mesh.userData.wings.rotation.z = Math.sin(waveTime * 14.0) * 0.15;
      }

      // Dynamic Evasive Dive-Bomb Strafe Scaling
      const diveBaseChance = (0.015 + (state.sector - 1) * 0.014) * dt;
      if (!e.isDiving && Math.random() < diveBaseChance && e.mesh.position.z < -14) {
        e.isDiving = true;
        e.diveProgress = 0;
        e.diveStartX = e.mesh.position.x;
        e.diveStartY = e.mesh.position.y;
        e.diveFired = false;
        audio.playDiveAlert();
      }

      if (e.isDiving) {
        const diveSpeed = 0.9 + (state.sector - 1) * 0.22;
        e.diveProgress += dt * diveSpeed;
        e.mesh.position.z = THREE.MathUtils.lerp(e.originZ, player.position.z + 5, e.diveProgress);
        e.mesh.position.x = THREE.MathUtils.lerp(e.diveStartX, player.position.x, e.diveProgress * 0.85) + Math.sin(e.diveProgress * Math.PI * 4) * 1.6;
        e.mesh.position.y = THREE.MathUtils.lerp(e.diveStartY, player.position.y, e.diveProgress * 0.85) + Math.cos(e.diveProgress * Math.PI * 4) * 0.8;
        e.mesh.rotation.z = Math.sin(e.diveProgress * Math.PI * 4) * 1.2;

        if (!e.diveFired && e.diveProgress >= 0.35) {
          e.diveFired = true;
          if (e.isElite || (e.isSaucer && state.sector >= 3)) {
            enemyFireSpread(e.mesh.position, player.position, 26, 16);
          } else {
            enemyFire(e.mesh.position, player.position, 24, 15);
          }
        }

        if (e.diveProgress >= 1.0) e.isDiving = false;
      } else {
        const evasiveOsc = state.sector >= 3 ? Math.sin(waveTime * 3.5 + e.wobble) * (0.4 + (state.sector - 3) * 0.3) : 0;
        const bobY = Math.sin(waveTime * 2.2 + e.wobble) * 0.25;
        e.mesh.position.x = e.originX + formationSway + evasiveOsc;
        e.mesh.position.y = e.originY + bobY;
        e.mesh.position.z = e.originZ + formationApproach;
      }

      // Firing Cadence Scaling by Sector
      e.shootCooldown -= dt;
      if (e.shootCooldown <= 0) {
        const bulletSpeed = 20 + (state.sector - 1) * 2.5;
        if (e.isElite) {
          if (Math.random() < 0.5) enemyFireSpread(e.mesh.position, player.position, bulletSpeed + 2, 16);
          else enemyFireHomingOrb(e.mesh.position, player.position, 18, 22);
          e.shootCooldown = Math.max(1.1, 2.3 - state.sector * 0.2) + Math.random() * 1.2;
        } else if (e.isSaucer && state.sector >= 3 && Math.random() < 0.45) {
          enemyFireSpread(e.mesh.position, player.position, bulletSpeed, 14);
          e.shootCooldown = Math.max(1.3, 2.7 - state.sector * 0.2) + Math.random() * 1.4;
        } else {
          enemyFire(e.mesh.position, player.position, bulletSpeed, 14);
          e.shootCooldown = Math.max(1.1, 3.0 - state.sector * 0.25) + Math.random() * 1.8;
        }
      }

      if (e.mesh.position.distanceTo(player.position) < 1.4) {
        damagePlayer(35);
        damageEnemy(e, 10);
      }
    }
  }

  // Bullet Collisions
  for (const b of playerBullets) {
    if (b.mesh.position.z < -9000) continue;
    for (const e of enemies) {
      if (!e.alive) continue;
      const hitDist = e.isBoss ? 4.0 : (e.isSaucer ? 1.8 : 1.2);
      if (b.mesh.position.distanceTo(e.mesh.position) < hitDist) {
        if (b.isTorpedo) {
          detonateTorpedo(b.mesh.position, b.blastRadius, b.dmg, b.torpColor || 0x00ffff);
          b.mesh.position.z = -9999;
          scene.remove(b.mesh);
          break;
        } else {
          damageEnemy(e, b.dmg);
          spawnExplosionFX(b.mesh.position, b.impactColor || 0x00f0ff, 6, 0.45);
          if (b.isShieldCannon) {
            state.shield = Math.min(state.maxShield, state.shield + 2.5);
            updateHUD();
          }
          if (b.isOmegaCannon) {
            spawnExplosionFX(b.mesh.position, 0x00f0ff, 25, 2.0);
            triggerShake(4);
          }
        }
        if (b.pierce && b.pierce > 1) {
          b.pierce--;
        } else {
          b.mesh.position.z = -9999;
          scene.remove(b.mesh);
          break;
        }
      }
    }
  }

  // Missile Collisions
  for (const m of missiles) {
    if (m.life <= 0) continue;
    for (const e of enemies) {
      if (!e.alive) continue;
      const hitDist = e.isBoss ? 4.2 : 1.8;
      if (m.mesh.position.distanceTo(e.mesh.position) < hitDist) {
        damageEnemy(e, 8.0 * state.damageMult);
        m.life = -1;
        scene.remove(m.mesh);
        spawnExplosionFX(m.mesh.position, 0xff3366, 24, 1.6);
        audio.playExplosion(1.2);
        triggerShake(6);
        break;
      }
    }
    if (m.life <= 0) continue;
    for (const a of asteroids) {
      if (m.mesh.position.distanceTo(a.mesh.position) < a.radius + 0.8) {
        damageAsteroid(a, 12 * state.damageMult, m.mesh.position);
        m.life = -1;
        scene.remove(m.mesh);
        spawnExplosionFX(m.mesh.position, 0xff3366, 20, 1.4);
        audio.playExplosion(1.0);
        triggerShake(5);
        break;
      }
    }
  }

  // Particles
  for (const p of particles) {
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.mesh.rotation.x += p.rotX * dt;
    p.mesh.rotation.y += p.rotY * dt;
    p.life -= dt;
    p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
  }
  particles = particles.filter(p => {
    if (p.life <= 0) { scene.remove(p.mesh); return false; }
    return true;
  });

  // Crosshair Alien Lock & Auto-Aiming Detection
  let hoveredAlien = null;
  let minHoverDist = Infinity;

  if (state.autoAimActive) {
    // TACTICAL AI AUTO-AIM: Scan all alive enemies in front of player and lock onto closest threat
    let closestThreat = null;
    let minThreatDist = Infinity;
    for (const e of enemies) {
      if (!e.alive || e.mesh.position.z >= player.position.z) continue;
      const d = player.position.distanceTo(e.mesh.position);
      if (d < minThreatDist) {
        minThreatDist = d;
        closestThreat = e;
      }
    }
    if (closestThreat) {
      hoveredAlien = closestThreat;
      reticleEl.classList.add('locked-auto');
      reticleEl.classList.add('locked');
      const shieldTxt = (hoveredAlien.shield > 0) ? ` | ${Math.ceil(hoveredAlien.shield * 10)} SHIELD` : '';
      const eliteTxt = hoveredAlien.isElite ? '⚡ ELITE ' : '';
      reticleTextEl.textContent = `🎯 AUTO-AIM: ${eliteTxt}(${Math.ceil(hoveredAlien.hp * 10)} HP${shieldTxt}) [${Math.ceil(state.autoAimTimer)}s]`;
      aimTargetPoint.lerp(hoveredAlien.mesh.position, Math.min(1, dt * 26));

      // Visual holographic targeting lock tracer sparks
      if (Math.random() < 0.28) {
        spawnExplosionFX(hoveredAlien.mesh.position, 0xffd166, 2, 0.45);
      }
    } else {
      reticleEl.classList.add('locked-auto');
      reticleTextEl.textContent = `🎯 AUTO-AIM: SCANNING... [${Math.ceil(state.autoAimTimer)}s]`;
    }
  } else {
    // MANUAL RAYCAST AIMING
    reticleEl.classList.remove('locked-auto');
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = raycaster.ray.distanceToPoint(e.mesh.position);
      const lockRadius = e.isBoss ? 6.0 : 2.6;
      if (d < lockRadius && d < minHoverDist && e.mesh.position.z < player.position.z) {
        minHoverDist = d;
        hoveredAlien = e;
      }
    }

    if (hoveredAlien) {
      reticleEl.classList.add('locked');
      const shieldTxt = (hoveredAlien.shield > 0) ? ` | ${Math.ceil(hoveredAlien.shield * 10)} SHIELD` : '';
      const eliteTxt = hoveredAlien.isElite ? '⚡ ELITE ' : '';
      reticleTextEl.textContent = `${eliteTxt}LOCKED (${Math.ceil(hoveredAlien.hp * 10)} HP${shieldTxt})`;
      aimTargetPoint.lerp(hoveredAlien.mesh.position, Math.min(1, dt * 18));
    } else {
      reticleEl.classList.remove('locked');
      reticleTextEl.textContent = `MANUAL FREE-AIM`;
    }
  }

  // Dynamic Reinforcements Spawning & Armada Overrun Incursion
  if (!state.warpActive && !state.paused && !state.sectorClearing && state.hull > 0) {
    if (state.sector >= 2 && !state.bossActive && !state.armadaOverrunActive && !state.armadaOverrunDefeated) {
      const activeCount = enemies.filter(e => e.alive && !e.isBoss).length;
      if (activeCount <= 3 && Math.random() < 0.05) {
        triggerArmadaOverrunEvent();
      }
    }

    if ((state.reinforcementsRemaining || 0) > 0) {
      const activeCount = enemies.filter(e => e.alive && !e.isBoss).length;
      if (activeCount <= 4) {
        const batch = Math.min(state.reinforcementsRemaining, 6);
        state.reinforcementsRemaining -= batch;
        spawnReinforcementWave(batch);
        spawnFloatingText(player.position, "REINFORCEMENTS WARPING IN!", "#ff0055");
      }
    }
  }

  // Sector Cleared Check
  if (enemies.length > 0 && enemies.every(e => !e.alive) && (state.reinforcementsRemaining || 0) <= 0 && !state.bossActive && !state.sectorClearing) {
    sectorCompleted();
  }
}


function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  try {
    update(dt);
  } catch (err) {
    console.warn("Update frame non-fatal:", err);
  }
  try {
    renderer.render(scene, camera);
  } catch (err) {
    console.warn("Render frame non-fatal:", err);
  }
  requestAnimationFrame(loop);
}

export {
  canvas,
  renderer,
  scene,
  camera,
  sunLight,
  spaceFillLight,
  starField,
  raycaster,
  aimPlane,
  aimTargetPoint,
  currentMouseNDC,
  enemies,
  playerBullets,
  enemyBullets,
  missiles,
  beamEffects,
  particles,
  shockwaves,
  powerups,
  scrapDrops,
  asteroids,
  updateWingmanDrones,
  fireDroneLaser,
  createProceduralAsteroidGeometry,
  spawnAsteroid,
  updateAsteroids,
  damageAsteroid,
  destroyAsteroid,
  startMission,
  update,
  loop
};

if (typeof window !== 'undefined') {
  window.canvas = canvas;
  window.renderer = renderer;
  window.aimTargetPoint = aimTargetPoint;
  window.aimPlane = aimPlane;
  window.raycaster = raycaster;
  window.currentMouseNDC = currentMouseNDC;
  window.continuousBeam = continuousBeam;
  window.droneAlpha = droneAlpha;
  window.droneBeta = droneBeta;
  window.scene = scene;
  window.camera = camera;
  window.sunLight = sunLight;
  window.spaceFillLight = spaceFillLight;
    window.starGeo = starGeo;
  window.starColors = starColors;
  window.STAR_COUNT = STAR_COUNT;
  window.enemies = enemies;
  window.playerBullets = playerBullets;
  window.enemyBullets = enemyBullets;
  window.missiles = missiles;
  window.beamEffects = beamEffects;
  window.particles = particles;
  window.shockwaves = shockwaves;
  window.powerups = powerups;
  window.scrapDrops = scrapDrops;
  window.asteroids = asteroids;
  window.startMission = startMission;
  window.loop = loop;
}
