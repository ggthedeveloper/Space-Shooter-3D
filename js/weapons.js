/**
 * ALIEN ASSAULT 3D - WEAPONS & SPECIAL ABILITIES
 * Ballistics, lasers, torpedoes, flak, missiles, and special superweapons
 */

import { state } from './state.js';
import { audio } from './audio.js';

const SHIP_WEAPON_CONFIG = {
  valkyrie: {
    name: "Valkyrie MK-II",
    cardTheme: "#00f0ff",
    ability: { name: "EMP BLAST", type: "emp", icon: "⚡", cooldown: 20, desc: "Disables hostiles & wipes bullets" },
    wep1: { name: "Dual Plasma", sub: "Pulse Cannon", key: "[1] PRIMARY", color: 0x00f0ff, speed: 66, dmgMult: 1.0 },
    wep2: { name: "Cutting Laser", sub: "Sustained Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00f0ff, glowColor: 0x0088ff },
    wep3: { name: "Micro-Flak", sub: "Shrapnel Scatter", key: "[3] SCATTER", color: 0xffaa00, pelletCount: 7 },
    wep4: { name: "Photon Torpedo", sub: "Antimatter Blast", key: "[4] TORPEDO", color: 0x00ffff, glowColor: 0x0088ff },
    wep5: { name: "Ion Pulse Arc", sub: "Disrupter Shock", key: "[5] TESLA", color: 0x00f0ff }
  },
  scout: {
    name: "Solar Dart",
    cardTheme: "#00ffcc",
    ability: { name: "OVERDRIVE", type: "overdrive", icon: "🔥", cooldown: 18, desc: "2x Fire Rate & +30% Speed for 5s" },
    wep1: { name: "Rapid Laser", sub: "High-Frequency Needles", key: "[1] PRIMARY", color: 0x00ffcc, speed: 85, dmgMult: 0.85, isNeedle: true },
    wep2: { name: "Needle Beam", sub: "Continuous Needle Lance", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00ffcc, glowColor: 0x00bb99 },
    wep3: { name: "Micro-Dart Scatter", sub: "Speed Flak", key: "[3] SCATTER", color: 0x00ffaa, pelletCount: 6 },
    wep4: { name: "Dart Torpedo", sub: "Fast Photon", key: "[4] TORPEDO", color: 0x00f0ff, glowColor: 0x00ffff },
    wep5: { name: "Static Needle Arc", sub: "High-Hz Shock", key: "[5] TESLA", color: 0x00ffcc }
  },
  interceptor: {
    name: "Aero Blade",
    cardTheme: "#ffd166",
    ability: { name: "LASER BARRAGE", type: "barrage", icon: "⚔️", cooldown: 15, desc: "7-Laser Fan Spray Barrage" },
    wep1: { name: "Twin Plasma", sub: "Dual Heavy Plasma", key: "[1] PRIMARY", color: 0xffaa00, speed: 72, dmgMult: 1.15 },
    wep2: { name: "Aero Beam", sub: "Thermal Slicer", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xffaa00, glowColor: 0xff8800 },
    wep3: { name: "Flak Shredder", sub: "Twin Cone Scatter", key: "[3] SCATTER", color: 0xffbb33, pelletCount: 8 },
    wep4: { name: "Magma Torpedo", sub: "Thermal Warhead", key: "[4] TORPEDO", color: 0xffaa00, glowColor: 0xff5500 },
    wep5: { name: "Aero Shock Arc", sub: "Magnetic Chain", key: "[5] TESLA", color: 0xffd166 }
  },
  assault: {
    name: "Plasma Marauder",
    cardTheme: "#ff3355",
    ability: { name: "PLASMA BURST", type: "plasma_burst", icon: "💥", cooldown: 22, desc: "Massive AoE Plasma Fireball" },
    wep1: { name: "Heavy Plasma Cannon", sub: "Colossal Slugs", key: "[1] PRIMARY", color: 0xff3355, speed: 56, dmgMult: 1.35, isHeavySlug: true },
    wep2: { name: "Molten Lance", sub: "Superheated Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xff0044, glowColor: 0xff5500 },
    wep3: { name: "Marauder Flak", sub: "10-Shot Heavy Spread", key: "[3] SCATTER", color: 0xff2244, pelletCount: 10 },
    wep4: { name: "Bunker Torpedo", sub: "High-Yield Antimatter", key: "[4] TORPEDO", color: 0xff0055, glowColor: 0xff3300 },
    wep5: { name: "Disruption Arc", sub: "Armor-Cracking Shock", key: "[5] TESLA", color: 0xff5577 }
  },
  phoenix: {
    name: "Solar Phoenix",
    cardTheme: "#ffd166",
    ability: { name: "ENERGY SHIELD", type: "shield", icon: "🛡️", cooldown: 25, desc: "Invulnerable Barrier for 4s" },
    wep1: { name: "Solar Flare", sub: "Sunburst Magma Orbs", key: "[1] PRIMARY", color: 0xffaa00, speed: 62, dmgMult: 1.25, isMagma: true },
    wep2: { name: "Prominence Ray", sub: "Radiant Amber Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xffaa00, glowColor: 0xffe066 },
    wep3: { name: "Solar Scatter", sub: "Radiance Burst", key: "[3] SCATTER", color: 0xffdd00, pelletCount: 9 },
    wep4: { name: "Supernova Orb", sub: "Miniature Star Blast", key: "[4] TORPEDO", color: 0xff8800, glowColor: 0xffea00 },
    wep5: { name: "Corona Storm", sub: "Solar Plasma Arcs", key: "[5] TESLA", color: 0xffcc00 }
  },
  guardian: {
    name: "Aegis Bastion",
    cardTheme: "#00f0ff",
    ability: { name: "ENERGY SHIELD", type: "shield", icon: "🛡️", cooldown: 25, desc: "Invulnerable Fortress Dome (4s)" },
    wep1: { name: "Shield Cannon", sub: "Defensive Pulses (+Shield)", key: "[1] PRIMARY", color: 0x00f0ff, speed: 64, dmgMult: 1.15, isShieldCannon: true },
    wep2: { name: "Aegis Beam", sub: "Coherent Barrier Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x0099ff, glowColor: 0x00f0ff },
    wep3: { name: "Barrier Flak", sub: "Repulsion Pellets", key: "[3] SCATTER", color: 0x00ccff, pelletCount: 8 },
    wep4: { name: "Aegis Torpedo", sub: "Concussive Dome", key: "[4] TORPEDO", color: 0x00f0ff, glowColor: 0x0088ff },
    wep5: { name: "Bastion Arc", sub: "Defensive Chain Shock", key: "[5] TESLA", color: 0x00f0ff }
  },
  destroyer: {
    name: "Iron Hammer",
    cardTheme: "#ff6600",
    ability: { name: "METEOR STRIKE", type: "meteor", icon: "☄️", cooldown: 24, desc: "Orbital Kinetic Missile Barrage" },
    wep1: { name: "Rail Cannon", sub: "Piercing Hyper-Slug", key: "[1] PRIMARY", color: 0xff6600, speed: 90, dmgMult: 1.6, isPiercingRail: true },
    wep2: { name: "Fusion Lance", sub: "Industrial Cutting Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xff6600, glowColor: 0xff3300 },
    wep3: { name: "Siege Flak", sub: "12-Shot Tungsten Scatter", key: "[3] SCATTER", color: 0xff5500, pelletCount: 12 },
    wep4: { name: "Bunkerbuster Torpedo", sub: "Spatial Rupture Blast", key: "[4] TORPEDO", color: 0xff3300, glowColor: 0xff7700 },
    wep5: { name: "Hammer Arc", sub: "Magnetic Shockwave", key: "[5] TESLA", color: 0xffaa00 }
  },
  phantom: {
    name: "Shadow Wraith",
    cardTheme: "#a855f7",
    ability: { name: "VOID RIFT", type: "void_rift", icon: "🌀", cooldown: 22, desc: "Summons Crushing Gravity Vortex" },
    wep1: { name: "Phase Blaster", sub: "Quantum Phasing Bolts", key: "[1] PRIMARY", color: 0xbf00ff, speed: 84, dmgMult: 1.25, isPhasing: true },
    wep2: { name: "Phase Cutter", sub: "Ultraviolet Slicer", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x9333ea, glowColor: 0xc084fc },
    wep3: { name: "Razor Shards", sub: "Obsidian Fan Spread", key: "[3] SCATTER", color: 0xd946ef, pelletCount: 8 },
    wep4: { name: "Dark Singularity", sub: "Vortex Implosion", key: "[4] TORPEDO", color: 0x7c3aed, glowColor: 0xa855f7 },
    wep5: { name: "Tesla Lightning", sub: "High-Voltage Arc", key: "[5] TESLA", color: 0xa855f7 }
  },
  nova: {
    name: "Supernova Flash",
    cardTheme: "#ffbb00",
    ability: { name: "PLASMA BURST", type: "plasma_burst", icon: "💥", cooldown: 20, desc: "Supernova Flare Detonation" },
    wep1: { name: "Nova Beam", sub: "Concentrated Thermal Lance", key: "[1] PRIMARY", color: 0xffbb00, speed: 76, dmgMult: 1.35 },
    wep2: { name: "Solar Core Beam", sub: "Continuous Sun Flare", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xffbb00, glowColor: 0xff8800 },
    wep3: { name: "Nova Scatter", sub: "Prismatic Shell Burst", key: "[3] SCATTER", color: 0xffcc22, pelletCount: 9 },
    wep4: { name: "Nova Orb", sub: "Supernova Blast", key: "[4] TORPEDO", color: 0xff9900, glowColor: 0xffdd00 },
    wep5: { name: "Solar Arc", sub: "Golden Chain Flame", key: "[5] TESLA", color: 0xffbb00 }
  },
  titan: {
    name: "Titan Behemoth",
    cardTheme: "#ff5500",
    ability: { name: "METEOR STRIKE", type: "meteor", icon: "☄️", cooldown: 24, desc: "Orbital Kinetic Missile Barrage" },
    wep1: { name: "Mega Plasma Launcher", sub: "Colossal Artillery Slugs", key: "[1] PRIMARY", color: 0xff5500, speed: 52, dmgMult: 1.5, isHeavySlug: true },
    wep2: { name: "Inferno Lance", sub: "Thermal Molten Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xff3300, glowColor: 0xff6600 },
    wep3: { name: "Cluster Artillery", sub: "11-Shot Heavy Scatter", key: "[3] SCATTER", color: 0xff4400, pelletCount: 11 },
    wep4: { name: "Bunkerbuster", sub: "Colossal Concussion", key: "[4] TORPEDO", color: 0xff2200, glowColor: 0xff7700 },
    wep5: { name: "Magnetic Shock", sub: "Concussive Wave", key: "[5] TESLA", color: 0xffaa00 }
  },
  eclipse: {
    name: "Umbra Cruiser",
    cardTheme: "#a855f7",
    ability: { name: "VOID RIFT", type: "void_rift", icon: "🌀", cooldown: 22, desc: "Spawns Gravity Vortex" },
    wep1: { name: "Dark Energy Cannon", sub: "Corrosive Umbra Bolts", key: "[1] PRIMARY", color: 0xa855f7, speed: 70, dmgMult: 1.4 },
    wep2: { name: "Umbra Slicer", sub: "Dark Matter Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x9333ea, glowColor: 0xc084fc },
    wep3: { name: "Shadow Shards", sub: "Dark Fan Spread", key: "[3] SCATTER", color: 0x8b5cf6, pelletCount: 9 },
    wep4: { name: "Umbra Torpedo", sub: "Gravitational Collapse", key: "[4] TORPEDO", color: 0x6b21a8, glowColor: 0xa855f7 },
    wep5: { name: "Void Lightning", sub: "Dark Arc Chain", key: "[5] TESLA", color: 0xa855f7 }
  },
  void_hunter: {
    name: "Abyssal Stalker",
    cardTheme: "#00ff88",
    ability: { name: "EMP BLAST", type: "emp", icon: "⚡", cooldown: 20, desc: "Abyssal EMP Burst" },
    wep1: { name: "Void Missile System", sub: "Smart Tracking Micro-Missiles", key: "[1] PRIMARY", color: 0x00ff88, speed: 74, dmgMult: 1.45, isTrackingMissile: true },
    wep2: { name: "Bio Siphon Beam", sub: "Toxic Siphon", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00ff88, glowColor: 0x05ffa1 },
    wep3: { name: "Stalker Flak", sub: "Toxic Needle Spread", key: "[3] SCATTER", color: 0x10b981, pelletCount: 9 },
    wep4: { name: "Abyssal Torpedo", sub: "Bio-Matter Blast", key: "[4] TORPEDO", color: 0x00ffcc, glowColor: 0x00ff88 },
    wep5: { name: "Emerald Arc", sub: "Bio-Electric Shock", key: "[5] TESLA", color: 0x00ff88 }
  },
  reaper: {
    name: "Cosmic Reaper",
    cardTheme: "#00ff88",
    ability: { name: "COSMIC WAVE", type: "cosmic_wave", icon: "🌌", cooldown: 28, desc: "Fullscreen Chromatic Energy Tsunami" },
    wep1: { name: "Death Ray", sub: "Antimatter Vortex", key: "[1] PRIMARY", color: 0x00ff88, speed: 78, dmgMult: 1.6, isVortex: true },
    wep2: { name: "Void Siphon", sub: "Dark Energy Siphon", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00ff88, glowColor: 0x05ffa1 },
    wep3: { name: "Nether Shards", sub: "Toxic Splinter Fan", key: "[3] SCATTER", color: 0x10b981, pelletCount: 10 },
    wep4: { name: "Gravity Torpedo", sub: "Spatial Collapse", key: "[4] TORPEDO", color: 0x00ffcc, glowColor: 0x00ff88 },
    wep5: { name: "Spectral Shock", sub: "Emerald Void Chain", key: "[5] TESLA", color: 0x00ff88 }
  },
  galaxy_guardian: {
    name: "Astral Sentinel",
    cardTheme: "#00f0ff",
    ability: { name: "ENERGY SHIELD", type: "shield", icon: "🛡️", cooldown: 25, desc: "Aegis Sanctuary Barrier (4.5s)" },
    wep1: { name: "Cosmic Pulse", sub: "Broad-Cone Wave Cannon", key: "[1] PRIMARY", color: 0x00f0ff, speed: 70, dmgMult: 1.65, isCosmicPulse: true },
    wep2: { name: "Astral Beam", sub: "Coherent Cosmic Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00f0ff, glowColor: 0x0088ff },
    wep3: { name: "Astral Flak", sub: "Prismatic Starlight Burst", key: "[3] SCATTER", color: 0x70d6ff, pelletCount: 11 },
    wep4: { name: "Cosmic Torpedo", sub: "Astral Nova Blast", key: "[4] TORPEDO", color: 0x00f0ff, glowColor: 0x00ffff },
    wep5: { name: "Sentinel Arc", sub: "Cosmic Chain Arcs", key: "[5] TESLA", color: 0x00f0ff }
  },
  celestial: {
    name: "Seraph Prime",
    cardTheme: "#ffd166",
    ability: { name: "COSMIC WAVE", type: "cosmic_wave", icon: "🌌", cooldown: 28, desc: "Divine Supernova Tsunami" },
    wep1: { name: "Celestial Beam", sub: "Divine Stellar Lance", key: "[1] PRIMARY", color: 0xffe680, speed: 86, dmgMult: 1.85 },
    wep2: { name: "Seraph Beam", sub: "Holy Radiant Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0xffd166, glowColor: 0xffffff },
    wep3: { name: "Starlight Flak", sub: "Prismatic Halo Shards", key: "[3] SCATTER", color: 0xffea75, pelletCount: 12 },
    wep4: { name: "Divine Torpedo", sub: "Starlight Supernova", key: "[4] TORPEDO", color: 0xffea75, glowColor: 0xffd166 },
    wep5: { name: "Celestial Arc", sub: "Divine Holy Chain", key: "[5] TESLA", color: 0xffe680 }
  },
  apex: {
    name: "Apex Sovereign",
    cardTheme: "#ffd166",
    ability: { name: "COSMIC WAVE", type: "cosmic_wave", icon: "🌌", cooldown: 28, desc: "Singularity Reality-Shattering Blast" },
    wep1: { name: "Omega Cannon", sub: "Reality-Shattering Singularities", key: "[1] PRIMARY", color: 0x00f0ff, speed: 82, dmgMult: 2.1, isOmegaCannon: true },
    wep2: { name: "Singularity Lance", sub: "Chrono-Wave Beam", key: "[2] BEAM", coreColor: 0xffffff, midColor: 0x00f0ff, glowColor: 0xffd166 },
    wep3: { name: "Chronos Flak", sub: "Time-Dilation Cluster", key: "[3] SCATTER", color: 0xffd166, pelletCount: 12 },
    wep4: { name: "Event Horizon", sub: "Micro-Black Hole", key: "[4] TORPEDO", color: 0x00ffff, glowColor: 0xffd166 },
    wep5: { name: "Chrono-Arc", sub: "Singularity Chain Arc", key: "[5] TESLA", color: 0x00f0ff }
  }
};

function switchWeapon(wep) {
  state.activeWeapon = wep;
  document.getElementById('wep1Card')?.classList.toggle('active', wep === 'plasma');
  document.getElementById('wep2Card')?.classList.toggle('active', wep === 'railgun');
  document.getElementById('wep3Card')?.classList.toggle('active', wep === 'flak');
  document.getElementById('wep4Card')?.classList.toggle('active', wep === 'torpedo');
  document.getElementById('wep5Card')?.classList.toggle('active', wep === 'tesla');
}

// Fullscreen
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
});


function triggerShipSpecialAbility() {
  if (state.abilityCooldown > 0 || state.hull <= 0 || !state.running || state.paused) return;
  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const ab = cfg.ability;
  if (!ab) return;

  state.abilityCooldown = ab.cooldown || 20;
  state.abilityMaxCooldown = ab.cooldown || 20;

  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  spawnFloatingText(player.position, `✨ ${ab.name} ACTIVATED!`, "#00ff88");
  triggerShake(8);

  if (ab.type === 'emp') {
    triggerEmpSingularity();
  } else if (ab.type === 'plasma_burst') {
    triggerPlasmaBurstAbility();
  } else if (ab.type === 'meteor') {
    triggerMeteorStrikeAbility();
  } else if (ab.type === 'void_rift') {
    triggerVoidRiftAbility();
  } else if (ab.type === 'overdrive') {
    triggerOverdriveAbility();
  } else if (ab.type === 'shield') {
    triggerEnergyShieldAbility();
  } else if (ab.type === 'barrage') {
    triggerLaserBarrageAbility();
  } else if (ab.type === 'cosmic_wave') {
    triggerCosmicWaveAbility();
  }

  updateAbilityUI();
}

function triggerPlasmaBurstAbility() {
  const targetPos = new THREE.Vector3(state.reticleX || 0, state.reticleY || 0, -20);
  spawnExplosionFX(targetPos, 0xff3300, 50, 3.0);
  if (audio) audio.playExplosion(2.2);

  // Damage all hostiles within AoE radius 18
  aliens.forEach(alien => {
    if (alien.mesh && alien.mesh.visible) {
      const dist = alien.mesh.position.distanceTo(targetPos);
      if (dist < 18) {
        damageAlien(alien, 380);
      }
    }
  });
}

function triggerMeteorStrikeAbility() {
  if (audio) audio.playExplosion(1.5);
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      if (!state.running) return;
      const strikePos = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 14,
        -15 - Math.random() * 25
      );
      spawnExplosionFX(strikePos, 0xff7700, 35, 2.2);
      triggerShake(6);
      if (audio) audio.playTorpedoLaunch();
      aliens.forEach(alien => {
        if (alien.mesh && alien.mesh.visible && alien.mesh.position.distanceTo(strikePos) < 10) {
          damageAlien(alien, 280);
        }
      });
    }, i * 140);
  }
}

function triggerVoidRiftAbility() {
  const riftPos = new THREE.Vector3(state.reticleX || 0, state.reticleY || 0, -22);
  spawnExplosionFX(riftPos, 0xa855f7, 40, 2.8);
  for (let step = 0; step < 5; step++) {
    setTimeout(() => {
      if (!state.running) return;
      spawnExplosionFX(riftPos, 0xd946ef, 25, 1.8);
      aliens.forEach(alien => {
        if (alien.mesh && alien.mesh.visible) {
          const d = alien.mesh.position.distanceTo(riftPos);
          if (d < 16) {
            alien.mesh.position.lerp(riftPos, 0.25);
            damageAlien(alien, 120);
          }
        }
      });
    }, step * 250);
  }
}

function triggerOverdriveAbility() {
  state.invulnTimer = Math.max(state.invulnTimer, 5.0);
  state.autoAimActive = true;
  state.autoAimTimer = 7.0;
  spawnFloatingText(player.position, "🔥 MAXIMUM OVERDRIVE (5s)!", "#ffd166");
}

function triggerEnergyShieldAbility() {
  state.invulnTimer = Math.max(state.invulnTimer, 4.5);
  state.shield = state.maxShield;
  if (player.userData && player.userData.shieldMat) {
    player.userData.shieldMat.opacity = 0.85;
  }
  spawnFloatingText(player.position, "🛡️ IMPENETRABLE BARRIER (4.5s)!", "#00f0ff");
}

function triggerLaserBarrageAbility() {
  if (audio) audio.playLaser();
  for (let i = -3; i <= 3; i++) {
    const angle = (i / 3) * 0.45;
    const dir = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle));
    fireCustomBolt(player.position.clone(), dir, 80, 0x00ff88, 140);
  }
}

function triggerCosmicWaveAbility() {
  triggerShake(18);
  if (audio) audio.playExplosion(2.5);
  spawnExplosionFX(player.position, 0x00f0ff, 60, 3.5);

  // Clear all enemy projectiles
  alienBullets.forEach(b => {
    if (b.mesh) scene.remove(b.mesh);
  });
  alienBullets.length = 0;

  // Heavy screen-wide cosmic wipe
  aliens.forEach(alien => {
    if (alien.mesh && alien.mesh.visible) {
      damageAlien(alien, 450);
    }
  });
  spawnFloatingText(player.position, "🌌 COSMIC WAVE DETONATED!", "#00ffff");
}

function fireCustomBolt(startPos, dir, speed, colorHex, dmg) {
  const geo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: colorHex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(startPos);
  scene.add(mesh);
  playerBullets.push({
    mesh,
    vx: dir.x * speed,
    vy: dir.y * speed,
    vz: dir.z * speed,
    damage: dmg,
    life: 2.2,
    pierce: 2
  });
}


function fireActiveWeapon() {
  if (state.activeWeapon === 'plasma') firePlasmaCannons();
  else if (state.activeWeapon === 'railgun') fireFusionRailgun();
  else if (state.activeWeapon === 'flak') fireFlakCannon();
  else if (state.activeWeapon === 'torpedo') firePhotonTorpedo();
  else if (state.activeWeapon === 'tesla') fireTeslaLightning();
}

function firePlasmaCannons() {
  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const wep1 = cfg.wep1;

  let boltGeo;
  if (wep1.isHeavySlug) {
    boltGeo = new THREE.SphereGeometry(0.28, 8, 8);
  } else if (wep1.isNeedle) {
    boltGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6);
    boltGeo.rotateX(Math.PI / 2);
  } else if (wep1.isMagma) {
    boltGeo = new THREE.SphereGeometry(0.25, 8, 8);
  } else if (wep1.isVortex) {
    boltGeo = new THREE.OctahedronGeometry(0.25);
  } else if (wep1.isPiercingRail) {
    boltGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6);
    boltGeo.rotateX(Math.PI / 2);
  } else if (wep1.isCosmicPulse) {
    boltGeo = new THREE.TorusGeometry(0.4, 0.08, 6, 16);
  } else if (wep1.isOmegaCannon) {
    boltGeo = new THREE.SphereGeometry(0.45, 10, 10);
  } else {
    boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6);
    boltGeo.rotateX(Math.PI / 2);
  }

  const boltMat = new THREE.MeshBasicMaterial({ color: wep1.color });

  const spawnBolt = (originPos) => {
    const mesh = new THREE.Mesh(boltGeo, boltMat);
    mesh.position.copy(originPos);
    const dir = aimTargetPoint.clone().sub(originPos).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    scene.add(mesh);
    const speed = wep1.speed || 64;
    const dmg = 1.35 * state.damageMult * (1 + (state.plasmaTier - 1) * 0.22) * (wep1.dmgMult || 1.0);
    playerBullets.push({
      mesh,
      vx: dir.x * speed,
      vy: dir.y * speed,
      vz: dir.z * speed,
      dmg,
      impactColor: wep1.color,
      isShieldCannon: !!wep1.isShieldCannon,
      isOmegaCannon: !!wep1.isOmegaCannon,
      pierce: wep1.isPiercingRail ? 4 : (wep1.isPhasing ? 2 : 1)
    });
  };

  const cannonLPos = new THREE.Vector3();
  const cannonRPos = new THREE.Vector3();
  player.userData.cannonL.getWorldPosition(cannonLPos);
  player.userData.cannonR.getWorldPosition(cannonRPos);

  spawnBolt(cannonLPos);
  spawnBolt(cannonRPos);

  if (wep1.isHeavySlug) {
    audio.playFlak();
    triggerShake(1.5);
  } else {
    audio.playLaser();
  }
}

function fireFusionRailgun() {
  const pPos = player.position.clone();
  pPos.z -= 1.0;
  const dir = aimTargetPoint.clone().sub(pPos).normalize();

  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const beamColor = cfg.wep2.midColor || 0xff00ff;

  const length = 120;
  const beamRadius = 0.18 + (state.railgunTier - 1) * 0.06;
  const beamGeo = new THREE.CylinderGeometry(beamRadius, beamRadius, length, 6);
  beamGeo.rotateX(Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({ color: beamColor, transparent: true, opacity: 0.95 });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);

  beamMesh.position.copy(pPos).addScaledVector(dir, length / 2);
  beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  scene.add(beamMesh);
  beamEffects.push({ mesh: beamMesh, life: 0.14 });

  audio.playRailgun();
  triggerShake(7);

  const ray = new THREE.Ray(pPos, dir);
  const railDmg = 4.0 * state.damageMult * (1 + (state.railgunTier - 1) * 0.3);
  for (const e of enemies) {
    if (!e.alive) continue;
    const hitDist = (e.isBoss ? 4.2 : 1.8) + (state.railgunTier - 1) * 0.2;
    const closest = new THREE.Vector3();
    ray.closestPointToPoint(e.mesh.position, closest);
    if (closest.distanceTo(e.mesh.position) < hitDist && closest.z < pPos.z) {
      damageEnemy(e, railDmg);
      spawnExplosionFX(e.mesh.position, beamColor, 8, 0.6);
    }
  }
}

function fireFlakCannon() {
  const pPos = player.position.clone();
  pPos.z -= 1.0;
  const baseDir = aimTargetPoint.clone().sub(pPos).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(baseDir, up).normalize();

  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const flakCfg = cfg.wep3;

  const flakGeo = new THREE.SphereGeometry(0.18, 6, 6);
  const flakMat = new THREE.MeshBasicMaterial({ color: flakCfg.color });

  const pelletCount = (flakCfg.pelletCount || 7) + (state.flakTier - 1) * 2;
  const half = Math.floor(pelletCount / 2);
  for (let i = -half; i <= half; i++) {
    const mesh = new THREE.Mesh(flakGeo, flakMat);
    mesh.position.copy(pPos);
    const dir = baseDir.clone().addScaledVector(right, i * 0.07).normalize();
    scene.add(mesh);
    const speed = 52 + (Math.random() - 0.5) * 6;
    playerBullets.push({ mesh, vx: dir.x * speed, vy: dir.y * speed, vz: dir.z * speed, dmg: 1.15 * state.damageMult, impactColor: flakCfg.color });
  }
  audio.playFlak();
}

function firePhotonTorpedo() {
  const pPos = player.position.clone();
  pPos.z -= 0.8;
  const dir = aimTargetPoint.clone().sub(pPos).normalize();

  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const torpCfg = cfg.wep4;

  const torpGeo = new THREE.SphereGeometry(0.32, 12, 10);
  const torpMat = new THREE.MeshBasicMaterial({ color: torpCfg.color });
  const mesh = new THREE.Mesh(torpGeo, torpMat);

  const glowGeo = new THREE.SphereGeometry(0.55, 10, 8);
  const glowMat = new THREE.MeshBasicMaterial({ color: torpCfg.glowColor, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending });
  mesh.add(new THREE.Mesh(glowGeo, glowMat));

  mesh.position.copy(pPos);
  scene.add(mesh);

  audio.playTorpedoLaunch();
  triggerShake(3);

  const speed = 54;
  const baseDmg = 9.5 * state.damageMult * (1 + (state.torpedoTier - 1) * 0.35);
  const blastRadius = 5.2 + (state.torpedoTier - 1) * 0.4;

  playerBullets.push({
    mesh,
    vx: dir.x * speed,
    vy: dir.y * speed,
    vz: dir.z * speed,
    dmg: baseDmg,
    isTorpedo: true,
    blastRadius,
    torpColor: torpCfg.color
  });
}

function detonateTorpedo(pos, blastRadius, dmg, torpColor = 0x00ffff) {
  spawnExplosionFX(pos, torpColor, 28, 2.2);
  spawnExplosionFX(pos, 0xffaa00, 18, 1.8);
  audio.playExplosion(1.5);
  triggerShake(8);

  const shockGeo = new THREE.RingGeometry(0.4, blastRadius, 24);
  shockGeo.rotateX(-Math.PI / 2);
  const shockMat = new THREE.MeshBasicMaterial({ color: torpColor, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const shockMesh = new THREE.Mesh(shockGeo, shockMat);
  shockMesh.position.copy(pos);
  scene.add(shockMesh);
  shockwaves.push({ mesh: shockMesh, radius: 0.5, maxRadius: blastRadius, speed: 32 });

  for (const e of enemies) {
    if (!e.alive) continue;
    const dist = pos.distanceTo(e.mesh.position);
    if (dist < blastRadius) {
      const falloff = 1 - (dist / blastRadius) * 0.4;
      damageEnemy(e, dmg * falloff);
      spawnExplosionFX(e.mesh.position, torpColor, 6, 0.5);
    }
  }

  for (const a of asteroids) {
    const dist = pos.distanceTo(a.mesh.position);
    if (dist < blastRadius + a.radius) {
      damageAsteroid(a, dmg * 1.2, pos);
    }
  }
}

function fireTeslaLightning() {
  const pPos = player.position.clone();
  pPos.z -= 0.6;

  const cfg = SHIP_WEAPON_CONFIG[state.shipType] || SHIP_WEAPON_CONFIG.valkyrie;
  const arcColor = cfg.wep5.color || 0xa855f7;

  let primaryTarget = null;
  let minD = 42;
  for (const e of enemies) {
    if (!e.alive || e.mesh.position.z >= pPos.z) continue;
    const d = pPos.distanceTo(e.mesh.position);
    if (d < minD) {
      minD = d;
      primaryTarget = e;
    }
  }

  const hitTargets = [];
  const maxChains = 3 + Math.floor(state.teslaTier / 2);
  const arcDmg = 2.6 * state.damageMult * (1 + (state.teslaTier - 1) * 0.28);

  if (primaryTarget) {
    hitTargets.push(primaryTarget);
    damageEnemy(primaryTarget, arcDmg);
    spawnExplosionFX(primaryTarget.mesh.position, arcColor, 5, 0.4);

    let currentTarget = primaryTarget;
    while (hitTargets.length < maxChains) {
      let nextTarget = null;
      let nextDist = 15;
      for (const e of enemies) {
        if (!e.alive || hitTargets.includes(e)) continue;
        const d = currentTarget.mesh.position.distanceTo(e.mesh.position);
        if (d < nextDist) {
          nextDist = d;
          nextTarget = e;
        }
      }
      if (nextTarget) {
        hitTargets.push(nextTarget);
        damageEnemy(nextTarget, arcDmg * 0.85);
        spawnExplosionFX(nextTarget.mesh.position, arcColor, 4, 0.35);
        currentTarget = nextTarget;
      } else {
        break;
      }
    }

    let prevPos = pPos;
    for (const tgt of hitTargets) {
      createLightningArc(prevPos, tgt.mesh.position, arcColor);
      prevPos = tgt.mesh.position;
    }
    audio.playTeslaZap();
    triggerShake(3);
  } else {
    const arcEnd = aimTargetPoint.clone();
    createLightningArc(pPos, arcEnd, arcColor);
    audio.playTeslaZap();
  }
}

function createLightningArc(from, to, colorHex = 0xa855f7) {
  const points = [from.clone()];
  const segments = 6;
  const diff = to.clone().sub(from);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const p = from.clone().addScaledVector(diff, t);
    p.x += (Math.random() - 0.5) * 1.2;
    p.y += (Math.random() - 0.5) * 1.2;
    p.z += (Math.random() - 0.5) * 0.8;
    points.push(p);
  }
  points.push(to.clone());

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 10, 0.08, 4, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  const mesh = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(mesh);

  beamEffects.push({ mesh, life: 0.09 });
}

function fireMissile() {
  if (state.missileStock <= 0) {
    spawnFloatingText(player.position, "NO MISSILES! RESUPPLY IN DOCK [+4]", "#ff3366");
    return;
  }
  if (state.missileCooldown > 0) return;
  state.missileStock--;
  state.missileCooldown = 0.35;
  updateHUD();
  audio.playMissileLaunch();

  const missileGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.8, 6);
  missileGeo.rotateX(Math.PI / 2);
  const missileMat = new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0xff0044, emissiveIntensity: 0.8 });

  const launch = (offsetX) => {
    const mesh = new THREE.Mesh(missileGeo, missileMat);
    mesh.position.set(player.position.x + offsetX, player.position.y - 0.2, player.position.z - 0.5);
    scene.add(mesh);

    let target = null;
    let minDist = Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = e.mesh.position.distanceTo(aimTargetPoint);
      if (d < minDist) { minDist = d; target = e; }
    }

    missiles.push({ mesh, target, vel: new THREE.Vector3(offsetX * 4, 2, -18), speed: 46, life: 3.5 });
  };
  launch(-0.6);
  launch(0.6);
}

function triggerEmpSingularity() { triggerEmp(); }
function triggerEmp() {
  if (state.empCharge < 100) {
    spawnFloatingText(player.position, `EMP CHARGING (${Math.floor(state.empCharge)}%)`, "#ffd166");
    return;
  }
  state.empCharge = 0;
  trackBountyProgress('emp', 1);
  updateHUD();
  audio.playEmpBlast();
  audio.speak("Supernova discharged");
  triggerShake(18);

  const shockGeo = new THREE.RingGeometry(0.5, 1.2, 24);
  shockGeo.rotateX(-Math.PI / 2);
  const shockMat = new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
  const shockMesh = new THREE.Mesh(shockGeo, shockMat);
  shockMesh.position.copy(player.position);
  scene.add(shockMesh);
  shockwaves.push({ mesh: shockMesh, radius: 1, maxRadius: 45, speed: 48 });

  for (const b of enemyBullets) {
    spawnExplosionFX(b.mesh.position, 0x00f0ff, 4, 0.4);
    scene.remove(b.mesh);
  }
  if (window.enemyBullets) { window.enemyBullets.length = 0; } else if (typeof enemyBullets !== 'undefined') { enemyBullets.length = 0; }

  for (const e of enemies) {
    if (!e.alive) continue;
    damageEnemy(e, 8.5 * state.damageMult);
    spawnExplosionFX(e.mesh.position, 0xffd166, 12, 0.8);
  }

  for (const a of asteroids) {
    damageAsteroid(a, 18);
  }
}


function triggerHyperOvercharge() {
  if (state.overchargeActive) return;
  if (state.hull <= 0 || state.warpActive || state.paused) return;
  if (state.overchargeCharge < 100) {
    spawnFloatingText(player.position, `OVERDRIVE CHARGING (${Math.floor(state.overchargeCharge)}%)`, "#00ffff");
    return;
  }
  state.overchargeCharge = 0;
  state.overchargeActive = true;
  state.overchargeTimer = 7.5;
  switchWeapon('railgun');
  audio.playOvercharge();
  audio.speak("Hyper-Overcharge maximum output engaged!");
  triggerShake(12);
  spawnFloatingText(player.position, "HYPER-OVERCHARGE ENGAGED!", "#00ffff");
  updateHUD();
}


export {
  SHIP_WEAPON_CONFIG,
  switchWeapon,
  triggerShipSpecialAbility,
  triggerPlasmaBurstAbility,
  triggerMeteorStrikeAbility,
  triggerVoidRiftAbility,
  triggerOverdriveAbility,
  triggerEnergyShieldAbility,
  triggerLaserBarrageAbility,
  triggerCosmicWaveAbility,
  fireCustomBolt,
  fireActiveWeapon,
  firePlasmaCannons,
  fireFusionRailgun,
  fireFlakCannon,
  firePhotonTorpedo,
  detonateTorpedo,
  fireTeslaLightning,
  createLightningArc,
  fireMissile,
  triggerEmp,
  triggerHyperOvercharge
};

if (typeof window !== 'undefined') {
  window.SHIP_WEAPON_CONFIG = SHIP_WEAPON_CONFIG;
  window.switchWeapon = switchWeapon;
  window.fireMissile = fireMissile;
  window.triggerEmp = triggerEmp;
  window.triggerHyperOvercharge = triggerHyperOvercharge;
  window.triggerShipSpecialAbility = triggerShipSpecialAbility;
  window.triggerPlasmaBurstAbility = triggerPlasmaBurstAbility;
  window.triggerMeteorStrikeAbility = triggerMeteorStrikeAbility;
  window.triggerVoidRiftAbility = triggerVoidRiftAbility;
  window.triggerOverdriveAbility = triggerOverdriveAbility;
  window.triggerEnergyShieldAbility = triggerEnergyShieldAbility;
  window.triggerLaserBarrageAbility = triggerLaserBarrageAbility;
  window.triggerCosmicWaveAbility = triggerCosmicWaveAbility;
}
