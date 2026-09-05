/**
 * ALIEN ASSAULT 3D - CELESTIAL GALAXIES & MAPS
 * 8 Galaxies, nebula particle lighting, and warp courses
 */

import { state } from './state.js';
import { audio } from './audio.js';

const GALAXIES = {
  nebula: {
    id: 'nebula',
    name: 'Nebula Galaxy',
    subtitle: 'Emerald & Teal Stellar Corona',
    icon: '🌌',
    unlockSector: 1,
    cost: 0,
    desc: 'Dense bio-luminescent interstellar gas cloud with emerald ionized dust and gentle starlight.',
    clearColor: 0x031217,
    sunColor: 0x66ffcc,
    sunIntensity: 1.5,
    fillColor: 0x054d40,
    fillIntensity: 1.2,
    palette: [0x66ffcc, 0x00ff88, 0x00f0ff, 0x99ffd6, 0xffffff],
    nebulaColor: 0x00ff88
  },
  red: {
    id: 'red',
    name: 'Red Galaxy',
    subtitle: 'High-Hazard Crimson Incursion',
    icon: '🔴',
    unlockSector: 15,
    cost: 50000,
    desc: 'Volatile red-giant stellar nursery drenched in crimson solar flares and high-radiation plasma.',
    clearColor: 0x160303,
    sunColor: 0xff3333,
    sunIntensity: 1.9,
    fillColor: 0x5a0b0b,
    fillIntensity: 1.3,
    palette: [0xff3366, 0xff7700, 0xff0044, 0xffd166, 0xffffff],
    nebulaColor: 0xff0044
  },
  ice: {
    id: 'ice',
    name: 'Ice Galaxy',
    subtitle: 'Sub-Zero Diamond Cryo Field',
    icon: '❄️',
    unlockSector: 25,
    cost: 100000,
    desc: 'Freezing cryogenic asteroid field illuminated by a blinding sub-zero white dwarf and diamond dust.',
    clearColor: 0x020f1c,
    sunColor: 0xddf4ff,
    sunIntensity: 1.8,
    fillColor: 0x1a4b75,
    fillIntensity: 1.1,
    palette: [0x00f0ff, 0x70d6ff, 0xa0e7e5, 0xffffff, 0xbfe6ff],
    nebulaColor: 0x00f0ff
  },
  dark: {
    id: 'dark',
    name: 'Dark Galaxy',
    subtitle: 'Abyssal Singularity Core',
    icon: '🌑',
    unlockSector: 35,
    cost: 200000,
    desc: 'Pitch-black dead space bordering a supermassive black hole with ominous amber gravitational lensing.',
    clearColor: 0x010204,
    sunColor: 0xffaa00,
    sunIntensity: 1.2,
    fillColor: 0x241704,
    fillIntensity: 0.9,
    palette: [0xffaa00, 0xff7700, 0x4a3b00, 0x885500, 0xffffff],
    nebulaColor: 0xff9900
  },
  void: {
    id: 'void',
    name: 'Void Galaxy',
    subtitle: 'Deep Purple Antimatter Rift',
    icon: '🟣',
    unlockSector: 50,
    cost: 400000,
    desc: 'Shattered spacetime rift saturated with volatile dark energy and swirling violet cosmic rifts.',
    clearColor: 0x0d0317,
    sunColor: 0xd946ef,
    sunIntensity: 1.7,
    fillColor: 0x4a0e6b,
    fillIntensity: 1.2,
    palette: [0xa855f7, 0xc026d3, 0xd946ef, 0x00f0ff, 0xffffff],
    nebulaColor: 0xa855f7
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Galaxy',
    subtitle: 'Deep Indigo Deep Space',
    icon: '✨',
    unlockSector: 70,
    cost: 750000,
    desc: 'The heart of known deep space, featuring multi-spectral star clusters and ancient cosmic tranquility.',
    clearColor: 0x02050f,
    sunColor: 0xfff5e6,
    sunIntensity: 1.6,
    fillColor: 0x385b88,
    fillIntensity: 1.0,
    palette: [0x9db4ff, 0xf8f9fa, 0xfff4e8, 0xffd2a1, 0x00f0ff],
    nebulaColor: 0x7c3aed
  },
  destroyed: {
    id: 'destroyed',
    name: 'Destroyed Galaxy',
    subtitle: 'Cataclysmic Shattered Expanse',
    icon: '☄️',
    unlockSector: 85,
    cost: 1000000,
    desc: 'Remnants of an ancient solar apocalypse filled with burning molten asteroid clusters and radioactive dust.',
    clearColor: 0x140700,
    sunColor: 0xff6600,
    sunIntensity: 2.0,
    fillColor: 0x4d1a00,
    fillIntensity: 1.4,
    palette: [0xff4500, 0xffd700, 0xff8800, 0xff2200, 0xffffff],
    nebulaColor: 0xff4500
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Galaxy',
    subtitle: 'Divine Prismatic Sanctuary',
    icon: '🌠',
    unlockSector: 100,
    cost: 1500000,
    desc: 'The mythical cradle of creation bathed in divine golden starlight and prismatic chromatic radiance.',
    clearColor: 0x120e03,
    sunColor: 0xffe680,
    sunIntensity: 2.2,
    fillColor: 0x5e4807,
    fillIntensity: 1.5,
    palette: [0xffd700, 0xffffff, 0xfff3a8, 0x00f0ff, 0xff77ff],
    nebulaColor: 0xffd700
  }
};

export let nebulaCloudGroup = null;

function applyGalaxyEnvironment(mapId) {
  const renderer = window.renderer;
  const sunLight = window.sunLight;
  const spaceFillLight = window.spaceFillLight;
  const scene = window.scene;
  const starGeo = window.starGeo;
  const starColors = window.starColors;
  const STAR_COUNT = window.STAR_COUNT || 2400;
  const g = GALAXIES[mapId] || GALAXIES.nebula;
  state.selectedGalaxy = g.id;

  if (renderer) renderer.setClearColor(g.clearColor, 1.0);
  if (sunLight) {
    sunLight.color.setHex(g.sunColor);
    sunLight.intensity = g.sunIntensity;
  }
  if (spaceFillLight) {
    spaceFillLight.color.setHex(g.fillColor);
    spaceFillLight.intensity = g.fillIntensity;
  }

  // Multi-spectral starfield recoloring
  if (starGeo && starColors) {
    for (let i = 0; i < STAR_COUNT; i++) {
      const hex = g.palette[i % g.palette.length];
      const col = new THREE.Color(hex);
      starColors[i*3] = col.r;
      starColors[i*3+1] = col.g;
      starColors[i*3+2] = col.b;
    }
    starGeo.attributes.color.needsUpdate = true;
  }

  // Procedural 3D Volumetric Nebula Clouds
  if (nebulaCloudGroup) {
    scene.remove(nebulaCloudGroup);
    nebulaCloudGroup.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    nebulaCloudGroup = null;
  }

  if (g.nebulaColor) {
    nebulaCloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: g.nebulaColor,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const cloudClusterCount = 14;
    for (let i = 0; i < cloudClusterCount; i++) {
      const radius = 18 + Math.random() * 26;
      const sphereGeo = new THREE.DodecahedronGeometry(radius, 1);
      const mesh = new THREE.Mesh(sphereGeo, cloudMat);
      mesh.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 70,
        -50 - Math.random() * 180
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.set(1 + Math.random() * 0.8, 0.6 + Math.random() * 0.6, 1);
      nebulaCloudGroup.add(mesh);
    }
    scene.add(nebulaCloudGroup);
  }

  // Update starting deployment card indicator if present
  const pilotGalaxyEl = document.getElementById('pilotGalaxyName');
  if (pilotGalaxyEl) pilotGalaxyEl.textContent = `${g.icon} ${g.name}`;
}

function selectGalaxy(id) {
  const checkProgressionUnlocks = window.checkProgressionUnlocks || (() => {});
  const saveGameData = window.saveGameData || (() => {});
  const updateGalaxyModalUI = window.updateGalaxyModalUI || (() => {});
  const spawnFloatingText = window.spawnFloatingText || (() => {});
  const player = window.player || { position: { x: 0, y: 0, z: 0 } };
  if (!GALAXIES[id]) return;
  const g = GALAXIES[id];
  checkProgressionUnlocks();
  if (!state.unlockedGalaxies) state.unlockedGalaxies = ['nebula'];

  const isUnlocked = state.unlockedGalaxies.includes(id) || (state.highestSector || 1) >= g.unlockSector;
  if (!isUnlocked) {
    if (state.credits >= g.cost) {
      state.credits -= g.cost;
      state.unlockedGalaxies.push(id);
      saveGameData();
      spawnFloatingText(player.position, `🌌 ${g.name.toUpperCase()} UNLOCKED!`, "#ffd166");
    } else {
      spawnFloatingText(player.position, `LOCKED - REACH SECTOR ${g.unlockSector} OR ${g.cost.toLocaleString()} CR!`, "#ff3366");
      if (audio && typeof audio.playDeflect === 'function') audio.playDeflect();
      return;
    }
  }

  applyGalaxyEnvironment(id);
  updateGalaxyModalUI();
  if (audio && typeof audio.playPowerup === 'function') audio.playPowerup();
  spawnFloatingText(player.position, `🌌 WARP COURSE SET: ${g.name.toUpperCase()}!`, "#00ff88");
  saveGameData();
}

export { GALAXIES, applyGalaxyEnvironment, selectGalaxy };

if (typeof window !== 'undefined') {
  window.GALAXIES = GALAXIES;
  window.applyGalaxyEnvironment = applyGalaxyEnvironment;
  window.selectGalaxy = selectGalaxy;
}
