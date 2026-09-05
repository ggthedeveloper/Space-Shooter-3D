# Space Shooter 3D — Extraterrestrial Combat Campaign

An atmospheric, industry-level 3D space combat simulator built with **Three.js** and **Web Audio API**, featuring **8 Dynamic Galactic Battlefields**, **16 Selectable 3D Starfighters with Class-Specific Weapons & Special Abilities**, **Interstellar-Inspired Cinematic Soundtrack**, **Emergency Hull Reinforcement Protocol**, **Universal Back Navigation**, and **High-Stakes Sector Progression**.

> **Developed by Gaurav Gautam**  
> GitHub: [@ggthedeveloper](https://github.com/ggthedeveloper) · Repository: [Space-Shooter-3D](https://github.com/ggthedeveloper/Space-Shooter-3D)

---
### Live at: https://ggthedeveloper.github.io/Space-Shooter-3D/

## 🎮 Flight, Weapon & Store Controls

| Action | Primary Input | Secondary / Mobile |
| :--- | :--- | :--- |
| **Flight Strafe & Climb** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Left screen) |
| **Manual Screen Aim** | `Mouse Cursor` | Touch dragging on right screen |
| **Continuous Auto-Fire** | **Automatic** (Continuous shooting) | Automatic while flying |
| **Ship Special Ability** | `C` or Bottom Dock `[C] ABILITY` | `ABILITY` Touch Button |
| **Emergency Hull Repair** | Auto-prompts at `Hull ≤ 20%` | Interactive Repair Modal |
| **Universal Menu Navigation** | Top-left `← BACK` Button | Seamless Multi-Level History Stack |
| **Galaxy / Map Selector** | `G` or top-bar `🌌 GALAXY` button | Real-time 3D celestial battlefields |
| **Tactical Armory Store** | `B` or top-bar `🛒 ARMORY` button | In-flight / Post-sector shopping |
| **Combat Tutorial & Manual** | `H` or top-bar `📖 TUT` | Interactive 5-step Flight Academy |
| **Command Menu (Career & Audio)** | `M`, `Escape`, `P` or top-bar `☰ MENU` | Career Profile & Audio Settings |
| **Pause Simulation** | `P` or top-bar `⏸` | Instant combat freeze |
| **Toggle Fullscreen** | Top-right `⛶` Button | Contained cleanly in top navbar |
| **Weapon 1 (Primary System)** | `1` or Bottom Dock Card | Ship-specific tailored primary weapon |
| **Weapon 2 (Beam System)** | `2` or Mouse Wheel | Continuous laser / Thermal lance / Phase cutter |
| **Weapon 3 (Scatter System)** | `3` or Mouse Wheel | Shrapnel scatter / Heavy artillery / Razor shards |
| **Weapon 4 (Torpedo System)** | `4` or Mouse Wheel | Concussive antimatter / Bunkerbuster / Singularity |
| **Weapon 5 (Chain Arc System)** | `5` or Mouse Wheel | Ion pulse / Magnetic shock / Tesla lightning / Void shock |
| **Hyper-Overcharge Super-Beam** | `R` or Bottom Dock Click | 3x Colossal Laser Beam Overdrive |
| **Quick Power Upgrade with Coins** | Bottom dock `⚡ +PWR` buttons | Instantly spend coins to upgrade power |
| **Homing Swarm Missiles** | `Right Click` or `F` | `MISSILE` Button |
| **Evasive Barrel Roll** | `Left Shift` | `ROLL` Button (0.8s invulnerability) |
| **EMP Singularity Bomb** | `Q` | `EMP` Button (clears screen projectiles) |

---

## 🌌 1. 8 Dynamic Galaxies & Map Selector

Pilots can choose their theater of war across **8 distinct celestial battlefields**, each featuring custom 3D lighting, background sky clear tones, multi-spectral starfield palettes, and procedural drifting 3D volumetric nebula clouds:

| Galaxy / Map | Normal Unlock | Early Credit Unlock | Atmosphere & Aesthetics |
| :--- | :--- | :--- | :--- |
| **🌌 Nebula Galaxy** | **Sector 1 (Default)** | Free | Emerald & teal stellar corona, dense ionized gas clouds |
| **🔴 Red Galaxy** | **Sector 15** | 50,000 CR | High-hazard crimson incursion, solar flares, crimson wash |
| **❄️ Ice Galaxy** | **Sector 25** | 100,000 CR | Sub-zero arctic diamond field, cold blue volumetric fog |
| **🌑 Dark Galaxy** | **Sector 35** | 200,000 CR | Abyssal blackness, gold singularity glow, drifting dark matter |
| **🟣 Void Galaxy** | **Sector 50** | 400,000 CR | Deep purple & magenta antimatter distortion, pulsing core |
| **✨ Cosmic Galaxy** | **Sector 70** | 750,000 CR | Multispectral starlight, deep indigo void, radiant aura |
| **☄️ Destroyed Galaxy** | **Sector 85** | 1,000,000 CR | Cataclysmic amber dust, burning molten debris field |
| **🌠 Legendary Galaxy** | **Sector 100** | 1,500,000 CR | Divine golden starlight, prismatic chromatic sanctuary |

- **Permanent Unlock**: Once unlocked by sector progression or credit purchase, galaxies remain permanently accessible.
- **Dynamic 3D Atmosphere**: Warping into a new galaxy dynamically modifies the renderer clear color, sun light, fill light, star colors, and rotating 3D volumetric gas clusters.

---

## 🛸 2. 16 Starfighter Fleet & Class-Specific Deadly Arsenals

Command a complete fleet of **16 distinct 3D starfighters** across 4 military tiers. Advanced ships are unlocked through high-sector combat progression or can be **inspected and purchased early with credits before sector assignment**:

| Tier | Starfighter | Normal Unlock | Early Unlock Price | Primary Weapon | Special Ability (`[C]`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic** | **Valkyrie MK-II** | Sector 1 | Default / Free | Pulse Cannon (Twin Kinetic) | ⚡ EMP Blast (Disables hostiles) |
| **Basic** | **Solar Dart** | Sector 5 | 25,000 CR | Rapid Laser (Needle Bolts) | 🔥 Overdrive (2x Fire Rate, 5s) |
| **Advanced** | **Aero Blade** | Sector 10 | 75,000 CR | Twin Plasma Cannons | ⚔️ Laser Barrage (7-Laser Fan) |
| **Advanced** | **Plasma Marauder** | Sector 15 | 150,000 CR | Heavy Plasma Cannon (Slugs) | 💥 Plasma Burst (Colossal AoE) |
| **Advanced** | **Solar Phoenix** | Sector 20 | 250,000 CR | Solar Flare (Magma Orbs) | 🛡️ Energy Shield (Invulnerable 4s) |
| **Advanced** | **Aegis Bastion** | Sector 25 | 380,000 CR | Shield Cannon (+Shield on Hit) | 🛡️ Energy Shield (Fortress Dome) |
| **Advanced** | **Iron Hammer** | Sector 30 | 550,000 CR | Rail Cannon (Piercing Slugs) | ☄️ Meteor Strike (Kinetic Barrage) |
| **Elite** | **Shadow Wraith** | Sector 40 | 800,000 CR | Phase Blaster (Quantum Pierce) | 🌀 Void Rift (Gravity Vortex) |
| **Elite** | **Supernova Flash** | Sector 50 | 1,200,000 CR | Nova Beam (Thermal Lance) | 💥 Plasma Burst (Supernova Blast) |
| **Elite** | **Titan Behemoth** | Sector 60 | 1,600,000 CR | Mega Plasma Launcher | ☄️ Meteor Strike (Missile Swarm) |
| **Elite** | **Umbra Cruiser** | Sector 70 | 2,200,000 CR | Dark Energy Cannon | 🌀 Void Rift (Spacetime Vortex) |
| **Elite** | **Abyssal Stalker** | Sector 80 | 2,900,000 CR | Void Missile System (Homing) | ⚡ EMP Blast (Abyssal Shock) |
| **Legendary** | **Cosmic Reaper** | Sector 85 | 3,800,000 CR | Death Ray (Antimatter Vortex) | 🌌 Cosmic Wave (Fullscreen Wipe) |
| **Legendary** | **Astral Sentinel** | Sector 90 | 4,800,000 CR | Cosmic Pulse (Wide-Cone Wave) | 🛡️ Energy Shield (Sanctuary) |
| **Legendary** | **Seraph Prime** | Sector 95 | 6,500,000 CR | Celestial Beam (Holy Lance) | 🌌 Cosmic Wave (Supernova Wave) |
| **Ultimate** | **Apex Sovereign** | Sector 100 | 9,500,000 CR | Omega Cannon (Singularity) | 🌌 Cosmic Wave (Reality Blast) |

- **Buy Before Sector Assignment**: In the pilot briefing screen, pilots can view ship specs and purchase locked starfighters directly with credits before launching into combat.
- **Equipping Unlocked Ships**: Once unlocked, switching and equipping ships is **always 100% free**.

---

## 🛡️ 3. Critical Hull Warning & Dynamic In-Flight Repair (`Hull ≤ 20%`)

When your vessel's hull integrity drops to **20% or below**, an animated combat warning pops up from the bottom-left:
- **Smooth Bottom-Left Float**: The critical warning smoothly glides up from the bottom-left of the screen, remains visible during active dogfighting, and automatically vanishes after 7 seconds without interrupting or freezing combat.
- **Click to Repair (20,000 CR)**: Clicking the alert instantly deducts **20,000 Credits** and restores **+55% maximum hull integrity**.
- **Strict Sector Limit**: Exactly **1 emergency repair per combat sector**, resetting cleanly when advancing to the next sector.

---

## 🎼 4. Interstellar-Inspired Procedural Cinematic Soundtrack (12 Tracks)

100% Web Audio API procedural synthesizer engine with dynamic category routing and in-game track cycling:
- **🎹 Cosmic Organ Odyssey (Interstellar)**: Cathedral space organ synthesis with multi-oscillator detuned drawbars, deep 43.65Hz gravitational sub-bass pedal, slow majestic swelling chords, and clockwork time-dilation ticks.
- **🌀 Hyperspace Drift**: Vangelis / Blade Runner CS-80 inspired lush analog brass swells, warm 48.99Hz sub-drone, and emotional portamento echoes.
- **🌑 Dark Matter Infiltration**: Tense void infiltration soundscape, C0 32.7Hz sub-rumble, minor-augmented chromatic pads, and cosmic telemetry radar pings.
- **💥 Supernova Overdrive**: 138 BPM fast-paced electro combat anthem with driving 16th-note sequenced bass, punchy power stabs, and white-noise off-beat hats.
- **☀️ Solar Flare Symphony**: Uplifting neo-classical D Lydian space synth with cascading crystalline bell arpeggios and radiant pads.
- **🌠 Andromeda Requiem**: Haunting celestial vocal choir using formant-filtered synthesis ('Ah'/'Oh' vowels) and ethereal glass harmonica harmonics.
- **⚔️ Titan Incursion (Boss Battle)**: Dramatic brass-synth chords, aggressive 16th-note battle bass pulses, and tense cinematic swells.
- **🌌 Cosmic Ambient**: Deep sub-drone, floating D Dorian / F Lydian space pads, and starlight chimes.
- **✨ Celestial Starlight**: Peaceful crystal bell arpeggios, gentle high serene pads, and tranquil harmonics.
- **⚡ Cybernetic Synthwave**: Retro 80s space synth pulse with rhythmic bass arpeggios.
- **🚀 Deep Space Odyssey**: Planetary minor 9th cinematic pads and deep radar telemetry pings.
- **🔥 Battle Pulsar**: High-octane driving pulse basslines and resonant saw leads.
- **Dynamic Category Router**: Automatically matches music to context (`MENU`, `NORMAL_BATTLE`, `DEEP_SPACE`, `HIGH_SECTOR`, `BOSS_BATTLE`, `VICTORY`, `GAME_OVER`).
- **In-Game Cycling**: Convenient `⏭ NEXT MUSIC TRACK` button right in the HUD volume popover.
- **Pristine Audio Design**: Repetitive "pi pi" and "ping" sounds are completely removed.

---

## ⬅️ 5. Universal Back Navigation Stack

Every menu, modal, and submenu contains a responsive, styled **`← BACK`** button:
- Top-left placement matching the cybernetic HUD aesthetic.
- History stack navigates cleanly back to the immediately previous screen without resetting state or selections.
- Integrated across Pilot Briefing, Hangar Store, Galaxy Selector, Command Settings, and Combat Tutorial.

---

## 👾 6. Sector-Scaled Alien Fleets & Scaled Rewards

- **Alien Incursions by Sector**:
  - Sectors 1–10: Agile Bio-Saucers & Stalker Scouts
  - Sectors 11–30: Armored Heavy Raiders & Shielded Drones
  - Sectors 31–60: Stealth Void Cruisers & Heavy Gunships
  - Sectors 61–80: Dark Energy Fighters & Apex Titans
  - Sectors 81–100+: Cosmic Titans & Celestial Flagships
- **Scaled Credit Bounties**:
  - Normal Bosses: **25,000 CR**
  - Advanced Bosses: **75,000 CR**
  - Elite Bosses: **200,000 CR**
  - Legendary Bosses: **500,000 CR**
  - End-Game Bosses: **1,000,000+ CR**

---

## 🎯 7. Calibrated 7-Second Tactical Auto-Aim

- Strictly capped at **7.0 seconds maximum** across all triggers.
- Live countdown timer (`AUTO-AIM: 7.0s` down to `0.0s`) displayed on the HUD and crosshair.
- Clean disengagement with zero lingering lock-on or stuck timers.

---

## 💾 8. Persistent Progression & Anti-Exploit Security

- Full persistence via browser `localStorage`: Unlocked ships, equipped loadout, charted galaxies, selected battlefield, credits, high score, highest sector, and weapon tiers.
- Atomic balance checks prevent negative credits, duplicate purchases, or refresh exploits.

---

## 👨‍💻 Author & Developer

**Developed by Gaurav Gautam**
- **GitHub**: [@ggthedeveloper](https://github.com/ggthedeveloper)
- **Repository**: [https://github.com/ggthedeveloper/Space-Shooter-3D](https://github.com/ggthedeveloper/Space-Shooter-3D)
