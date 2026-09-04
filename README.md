# Space Shooter 3D — Extraterrestrial Combat Campaign

An atmospheric 3D space combat simulator built with **Three.js** and **Web Audio API**, featuring **3 Lives System**, **Hyperspace Level Progression**, an interactive **Weapon & Armory Store**, and **5 Selectable 3D Starfighters with Unique Specialized Weapons**.

> **Developed by Gaurav Gautam**  
> GitHub: [@ggthedeveloper](https://github.com/ggthedeveloper) · Repository: [Space-Shooter-3D-](https://github.com/ggthedeveloper/Space-Shooter-3D-)

---
### Live at: https://ggthedeveloper.github.io/Space-Shooter-3D/

## 🎮 Flight, Weapon & Store Controls

| Action | Primary Input | Secondary / Mobile |
| :--- | :--- | :--- |
| **Flight Strafe & Climb** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Left screen) |
| **Manual Screen Aim** | `Mouse Cursor` | Touch dragging on right screen |
| **Continuous Auto-Fire** | **Automatic** (Hands-free continuous shooting) | Continuous while flying |
| **Combat Tutorial & Manual** | `H` or top-bar `📖 TUTORIAL [H]` | Interactive 5-step Flight Academy |
| **Command Menu (Career & Audio)** | `M`, `Escape`, `P` or top-bar `☰ MENU [M]` | Career Profile & Reset Save |
| **Tactical Armory Store** | `B` or top-bar `🛒 STORE [B]` button | In-flight / Post-sector shopping |
| **Weapon 1 (Primary System)** | `1` or Bottom Dock Card | Rapid kinetic bolts / Heavy slugs / Void needles |
| **Weapon 2 (Beam System)** | `2` or Mouse Wheel | Continuous laser / Thermal lance / Phase cutter |
| **Weapon 3 (Scatter System)** | `3` or Mouse Wheel | Shrapnel scatter / Heavy artillery / Razor shards |
| **Weapon 4 (Torpedo System)** | `4` or Mouse Wheel | Concussive antimatter / Bunkerbuster / Singularity |
| **Weapon 5 (Chain Arc System)** | `5` or Mouse Wheel | Ion pulse / Magnetic shock / Tesla lightning / Void shock |
| **Hyper-Overcharge Super-Beam** | `R` or Bottom Dock Click | 3x Colossal Laser Beam Overdrive |
| **Quick Power Upgrade with Coins** | Bottom dock `⚡ +PWR` buttons | Instantly spend coins to upgrade power |
| **Homing Swarm Missiles** | `Right Click` or `F` | `MISSILE` Button |
| **Evasive Barrel Roll** | `Left Shift` | `ROLL` Button (0.8s invulnerability) |
| **EMP Singularity Bomb** | `Q` | `EMP` Button (clears screen projectiles) |
| **Toggle Fullscreen** | Top-right `⛶` Button | Expands display |

---

## 🚀 1. 3 Lives System & Respawn Protocol

- **3 Starting Lives (`🚀 x3`)**: Displayed on the top HUD.
- **Quantum Invulnerability Respawn**:
  - When your fighter's hull reaches 0, 1 life is deducted.
  - A tactical reserve ship is deployed with full Hull and Shields at the flight line.
  - A shimmering **Golden Quantum Invulnerability Shield** protects the ship for 3.5 seconds.
  - Audio telemetry chimes signal reserve deployments and threat status.
- **Extra Lives in Store**: Purchase additional reserve ships in the Armory Store (`500 CR`, up to 5 lives).
- **Armada Destroyed**: Game Over only triggers once all reserve ships are depleted.

---

## 🌌 2. Level Changing & Hyperspace Warp

- **Hyperspace Jump Transition**:
  - Eliminating all alien hostiles in a sector initiates an automated hyper-drive jump.
  - Starfield streaks into warp lines ($z$-velocity $\times 12$).
  - Camera dynamically zooms into warp tunnel ($60^\circ \to 82^\circ$ FOV).
  - Rewards completion bonus credits (`+250 CR * Sector`).
  - Auto-docks into the **Tactical Armory Store** between sectors.
- **Campaign Sectors & Dynamic Swarm Scaling**:
  - **Sector 1**: *Orbital Gas Giant* — 18 hostiles (3 rows $\times$ 6 cols).
  - **Sector 2**: *Crimson Nebula Drift* — 28 hostiles + 8 hyperspace dive reinforcements.
  - **Sector 3**: *Flagship Incursion (Boss)* — Ancient Hive Leviathan with destructible batteries flanked by 16 fighter escorts.
  - **Sector 4**: *Galactic Core Expanse* — 40 hostiles + 12 dive reinforcements.
  - **Sector 5+**: *The Alien Singularity (Final Boss)* — 54+ hostiles + massive reinforcement swarms.
  - **Live Threat Telemetry**: HUD tracks `👾 HOSTILES: X REMAINING` in real-time.
  - **Reinforcement Alerts**: When active forces drop below threshold, incoming dive squadrons warp in with siren warnings!

---

## 🛒 3. Interactive Weapon & Armory Store (`[B]` Key)

Access the store anytime during flight with **`B`** or clicking **`🛒 STORE [B]`**, or after clearing a sector.

### Categories & Upgrades
- **Weapons (Tiers 1–10)**:
  - *Continuous Laser Supercharge* (Lv. 1–10): Continuous beam thickness expansion & +35% DPS per level (`200 CR * Lv`).
  - *Dual Plasma Booster* (Lv. 1–10): +22% bolt kinetic damage & velocity per level (`150 CR * Lv`).
  - *Flak Scatter Bore* (Lv. 1–10): +2 scatter pellets and wider blast radius per level (`180 CR * Lv`).
  - *Quantum Photon Torpedo* (Lv. 1–10): +35% antimatter concussive yield and spherical blast radius (`220 CR * Lv`).
  - *Tesla Arc Induction* (Lv. 1–10): +28% electrical voltage and additional lightning chain jumps (`240 CR * Lv`).
  - *HUD Quick-Upgrade Buttons*: Upgrade power directly on the HUD dock with coins on the fly!
- **Systems & Lives**:
  - *Autonomous Escort Drone Alpha*: Deploys wingman drone on port flank firing synchronized micro-lasers (`350 CR`).
  - *Autonomous Escort Drone Beta*: Deploys second drone on starboard flank for dual-escort coverage (`600 CR`).
  - *Reserve Starfighter (+1 Life)*: `500 CR` (Max 5 lives).
  - *Titanium Composite Armor*: +35 Max Hull & instant full repair (`250 CR`).
  - *Capacitor Overclocking*: +40% faster shield regeneration (`200 CR`).
  - *Quantum Tractor Coils*: Doubled magnet pickup range for scrap & powerups (`150 CR`).
- **Munitions**:
  - *Homing Swarm Missiles x4*: `100 CR`.
  - *Singularity Overcharge Cell*: Instant 100% EMP charge (`250 CR`).

---

## 🛸 4. Selectable 3D Starships & Unique Weapon Arsenals

Each starfighter features custom 3D geometries, distinct stats, unique projectile physics, and specialized weapon loadouts displayed dynamically on the bottom HUD dock:

1. **Valkyrie MK-II (Multi-Role Interceptor)**:
   - **Visuals**: Swept delta wings, cyan ion exhaust plumes, twin wing cannons.
   - **Stats**: Speed `18`, Hull `100`, Shields `100`, Agility `High`.
   - **Weapons**:
     - `[1] PRIMARY`: **Dual Hyper-Plasma** — Cyan twin kinetic bolts.
     - `[2] BEAM`: **Cutting Laser** — Sustained cyan high-energy cutting beam.
     - `[3] SCATTER`: **Micro-Flak** — 7-shot kinetic shrapnel scatter cone.
     - `[4] TORPEDO`: **Photon Torpedo** — Concussive cyan antimatter blast orb.
     - `[5] TESLA`: **Ion Pulse Arc** — Cyan disrupter electrical arc chaining between alien targets.
2. **Titan Behemoth (Armored Dreadnought)**:
   - **Visuals**: Heavy angular titanium carapace, quad orange thrusters, armored blast cockpit, dual dorsal cannons.
   - **Stats**: Speed `13`, Hull `180`, Shields `160`, +35% Heavy Weapon Damage.
   - **Weapons**:
     - `[1] PRIMARY`: **Siege Autocannons** — Massive explosive kinetic slug rounds with screen-shaking punch.
     - `[2] BEAM`: **Inferno Lance** — Searing crimson-orange molten thermal laser.
     - `[3] SCATTER`: **Cluster Artillery** — Heavy 11-shot explosive shrapnel barrage.
     - `[4] TORPEDO`: **Bunkerbuster** — Colossal destructive concussive torpedo.
     - `[5] TESLA`: **Magnetic Shock** — Concussive orange electromagnetic shockwave.
3. **Phantom Ghost (Advanced Stealth Interceptor)**:
   - **Visuals**: Forward-swept razor blades, matte obsidian chassis, violet ion exhaust, crystal canopy.
   - **Stats**: Speed `24`, Hull `75`, Shields `85`, +25% Fire Rate, +40% Critical strike chance.
   - **Weapons**:
     - `[1] PRIMARY`: **Void Needles** — Ultra-fast violet armor-piercing laser needles (`speed: 82`).
     - `[2] BEAM`: **Phase Cutter** — Sustained ultraviolet slicer beam.
     - `[3] SCATTER`: **Razor Shards** — Obsidian fan spread of razor-sharp shards.
     - `[4] TORPEDO`: **Dark Singularity** — Violet vortex implosion sphere.
     - `[5] TESLA`: **Tesla Lightning** — High-voltage purple electric arc chaining across 5–8 ships.
4. **Solar Phoenix (Chrono-Vanguard Flagship)**:
   - **Visuals**: Heavy gold/obsidian battlecruiser chassis, radiant amber solar energy sails, triple fusion thrusters.
   - **Stats**: Speed `20`, Hull `240`, Shields `200`, **Passive Nanite Repair (+3 Hull/sec)** (`1,000 CR`).
   - **Weapons**:
     - `[1] PRIMARY`: **Solar Flare** — Radiant golden-orange sunburst magma orbs.
     - `[2] BEAM`: **Prominence Ray** — Colossal radiant amber solar beam.
     - `[3] SCATTER`: **Solar Scatter** — Golden sunburst particle spread.
     - `[4] TORPEDO`: **Supernova Orb** — Miniature star blast with radiant golden shockwave.
     - `[5] TESLA`: **Corona Storm** — Golden solar plasma arcs chaining between hostiles.
5. **Void Reaper (Dark Matter Bio-Hybrid Assassin)**:
   - **Visuals**: Dagger bio-carapace needle, glowing violet bio-veins, rotating cyan core, quad void wings.
   - **Stats**: Speed `27`, Hull `130`, Shields `170`, **+50% Crit Multiplier & 2x Faster EMP Charging** (`1,500 CR`).
   - **Weapons**:
     - `[1] PRIMARY`: **Bio-Disrupter** — Glowing emerald antimatter vortex energy bolts.
     - `[2] BEAM`: **Void Siphon** — Emerald-green dark matter siphon beam.
     - `[3] SCATTER`: **Nether Shards** — Toxic emerald splinter fan spread.
     - `[4] TORPEDO`: **Gravity Torpedo** — Spatial collapse singularity torpedo.
     - `[5] TESLA`: **Spectral Shock** — Emerald void lightning chain discharge.

---

## 🎼 4.5. Multi-Track Calm Space Music Engine

Relaxing soundtrack generator created purely with the **Web Audio API** (100% offline, zero audio file downloads, smooth dynamic crossfades):

- **🌌 Cosmic Ambient (Default)**: Deep 55Hz sub-drone, floating D Dorian / F Lydian space pads, and twinkling starlight pentatonic chimes.
- **✨ Celestial Starlight**: Peaceful crystal bell arpeggios, gentle high serene pads, and tranquil harmonics.
- **⚡ Cybernetic Synthwave**: Retro 80s space synth pulse with rhythmic 16th bass arpeggios (~108 BPM) and warm analog pads.
- **🚀 Deep Space Odyssey**: Ultra-deep planetary 43.65Hz sub-bass, slow-sweeping minor 9th cinematic pads, and celestial radar telemetry pings.

**Music Style Selector**: Choose your soundtrack anytime via the top volume widget (`🎵`) or the Command Menu (`☰ MENU [M]`). Settings persist in `localStorage`.

---

## 🤖 5. Autonomous AI Wingman Drones (Alpha & Beta)
- **Tactical Escort Formation**: Deploy up to 2 autonomous AI drones that fly alongside your ship.
- **Drone Alpha (Port Flank, Cyan)**: Follows left wing, tilts with player flight maneuvers, and targets approaching hostiles with rapid micro-lasers.
- **Drone Beta (Starboard Flank, Magenta)**: Locks onto right wing, forming a lethal crossfire corridor.
- **Persistent Deployment**: Unlocked drones remain in service across sectors and game-overs!

---

## 💎 6. Dynamic Destructible 3D Asteroids
- **Deep Space Mineral Fields**: Tumbling 3D procedural rocky and crystalline asteroids drift into the combat corridor.
- **Laser Cutting Physics**: Carving asteroids with your Continuous Laser or blasting them with plasma shatters them into fragments.
- **Mineral Crystal Drops**: Shattering asteroids drops bonus crystal scrap (`+25 to +50 CR`) to supercharge your weapon power!
- **Hazard Warning**: Asteroids will damage your starship hull on collision — evade or vaporize them before impact!

---

## ⚡ 7. Hyper-Overcharge Super-Weapon (`[R]` Key)
- **Overdrive Gauge**: Fills from combo multiplier kills.
- **Colossal Super-Beam**: Activating Overdrive (`[R]` or clicking the HUD button) expands the continuous laser to **3x colossal width**, shifts plasma to prismatic cyan-white ionization, and multiplies damage by **300%** for 7.5 seconds!
- Accompanied by massive screen tremors and tactical announcer voice lines.

---

## 🏆 8. Persistent Combat Achievements & Trophy Room
- **8 Permanent Medals & Badges**:
  - 🛸 *First Contact*: Destroy your first alien ship.
  - ⚡ *Laser Surgeon*: Kill 15 alien ships with the Continuous Laser.
  - 👑 *Leviathan Hunter*: Destroy an Ancient Hive Leviathan flagship.
  - 🤖 *Fleet Commander*: Deploy both Alpha and Beta Wingman Drones.
  - 🔥 *Maximum Overdrive*: Upgrade any weapon to Level 10.
  - 💰 *Scrap Tycoon*: Accumulate over 1,500 credits.
  - 💎 *Asteroid Miner*: Shatter 5 deep-space mineral asteroids.
  - 🌌 *Deep Space Ace*: Survive and reach Sector 3 or beyond.
- **Interactive Trophy Room**: View your unlocked achievements in the Command Menu (`☰ MENU [M]`).

---

## 📡 9. Intercepted Hive Radio Comms
- Glassmorphic comms terminal in the top-left HUD.
- Types out intercepted extraterrestrial swarm signals, alien queen whispers, and fleet command tactical alerts with audio telemetry beeps.

---

## 💾 10. Persistent Career Data & LocalStorage
- **Persistent Scrap Bank**: Credits (`CR`) earned during missions are permanently saved in browser `localStorage`.
- **Persistent Systems**: All weapon levels (1–10), drones, hull plating, and unlocked achievements persist across sessions.
- **Command Menu (`M` / `☰ MENU`)**: View career stats, audio sliders, trophy room, and data reset options.

---

## 🚀 Running the Game

Launch [`index.html`](file:///Users/gg/.gemini/antigravity/scratch/alien-assault-3d/index.html) directly in Google Chrome or Safari.

---

## 👨‍💻 Author & Developer

**Developed by Gaurav Gautam**
- **GitHub**: [@ggthedeveloper](https://github.com/ggthedeveloper)
- **Repository**: [https://github.com/ggthedeveloper/Space-Shooter-3D-](https://github.com/ggthedeveloper/Space-Shooter-3D)
