# Space Shooter 3D — Extraterrestrial Combat Campaign

An atmospheric, industry-level 3D space combat simulator built with **Three.js** and **Web Audio API**, featuring **3 Lives System**, **Hyperspace Level Progression**, an interactive **Weapon & Armory Store**, **5 Selectable 3D Starfighters with Class-Specific Deadly Arsenals**, **Player XP & Military Ranks**, **Dynamic Tactical Bounties**, and in-game **Armada Overrun Incursion Events**.

> **Developed by Gaurav Gautam**  
> GitHub: [@ggthedeveloper](https://github.com/ggthedeveloper) · Repository: [Space-Shooter-3D](https://github.com/ggthedeveloper/Space-Shooter-3D)

---
### Live at: https://ggthedeveloper.github.io/Space-Shooter-3D/

## 🎮 Flight, Weapon & Store Controls

| Action | Primary Input | Secondary / Mobile |
| :--- | :--- | :--- |
| **Flight Strafe & Climb** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Left screen) |
| **Manual Screen Aim** | `Mouse Cursor` | Touch dragging on right screen |
| **Continuous Auto-Fire** | **Automatic** (Hands-free continuous shooting) | Continuous while flying |
| **Combat Tutorial & Manual** | `H` or top-bar `📖 TUT` | Interactive 5-step Flight Academy |
| **Command Menu (Career & Audio)** | `M`, `Escape`, `P` or top-bar `☰ MENU` | Career Profile & Reset Save |
| **Tactical Armory Store** | `B` or top-bar `🛒 ARMORY` button | In-flight / Post-sector shopping |
| **Pause Simulation** | `P` or top-bar `⏸` | Instant combat freeze |
| **Toggle Fullscreen** | Top-right `⛶` Button | Contained cleanly in top navbar |
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

---

## 🛸 1. Starfighter Fleet & Hangar Store Progression

Players earn persistent scrap credits (`CR`) from destroyed hostiles, asteroid mining, and sector completions to acquire and equip distinct starfighter archetypes in the **Hangar Store**:

| Starfighter | Class & Archetype | Unlock Price | Armor / Shields | Combat Trait & Deadly Weapons |
| :--- | :--- | :--- | :--- | :--- |
| **Valkyrie MK-II** | Balanced Interceptor | **Default (Owned)** | `100 Hull / 100 Shield` | Dual Hyper-Plasma, Cutting Laser, Micro-Flak, Photon Torpedo, Ion Pulse Arc |
| **Titan Behemoth** | Armored Dreadnought | **400 CR** | `180 Hull / 160 Shield` | +35% Heavy Damage · Siege Autocannons, Inferno Lance, Cluster Artillery, Bunkerbuster, Magnetic Shock |
| **Phantom Ghost** | Stealth Interceptor | **750 CR** | `75 Hull / 85 Shield` | +25% Fire Rate, +40% Crit · Void Needles, Phase Cutter, Razor Shards, Dark Singularity, Tesla Lightning |
| **Solar Phoenix** | Chrono-Vanguard | **1,200 CR** | `240 Hull / 200 Shield` | Nanite Hull Regen (+3 HP/s) · Solar Flare, Prominence Ray, Solar Scatter, Supernova Orb, Corona Storm |
| **Void Reaper** | Bio-Hybrid Assassin | **2,000 CR** | `130 Hull / 170 Shield` | +50% Crit Mult & 2x EMP Recharge · Bio-Disrupter, Void Siphon, Nether Shards, Gravity Torpedo, Spectral Shock |

- **Hangar Store UI**: Visual stat bars (Speed, Hull, Shield) and explicit states (`EQUIPPED`, `EQUIP`, `BUY: [Price] CR`).
- **Persistent Ownership**: Acquired starfighters and current loadout persist in browser `localStorage`.

---

## 🎖️ 2. Player Military Ranks & Combat Perks

Earn XP from hostile kills (+10–50 XP), asteroid mining (+15 XP), sector clearing (+100 XP * Sector), and repelling Armada incursions (+250 XP):

| Rank | Badge | Min XP | Combat Perk |
| :--- | :--- | :--- | :--- |
| **Ensign** | ⭐ | `0 XP` | Standard Fleet Issue |
| **Lieutenant** | 🌟 | `250 XP` | +10% Projectile Velocity |
| **Commander** | 🎖️ | `600 XP` | +15% Kinetic & Beam Damage |
| **Captain** | 🛡️ | `1,200 XP` | +20% Shield Recharge Rate |
| **Commodore** | ⚡ | `2,200 XP` | +25% EMP Singularity Recharge Rate |
| **Fleet Admiral** | 👑 | `3,800 XP` | +30% Critical Hit Chance & Maximum Overdrive |

---

## 🎯 3. Dynamic Tactical Bounties

A live objective system that generates high-value mini-challenges:
- **Raider Sweep**: Eliminate 8 Hostile Raiders (`+150 CR · +100 XP`).
- **Asteroid Mining**: Mine 3 Deep Space Mineral Asteroids (`+120 CR · +80 XP`).
- **Combat Master**: Achieve a 2.5x Combat Combo (`+160 CR · +120 XP`).
- **EMP Deployment**: Trigger Quantum EMP Singularity (`+140 CR · +90 XP`).
- **Armada Hunter**: Repel Hostile Armada Incursion (`+350 CR · +250 XP`).

---

## 🚨 4. Dynamic "Armada Overrun" Incursion Event

Instead of a generic game-over text, **Armada Overrun** is an in-game dynamic emergency combat incursion in Sector 2+:
- **Emergency Sirens & Red Alert**: Warning siren procedural alarm SFX, pulsing crimson alert banner, and intercepted tactical radar comms.
- **Armada Commander Flagship**: Armored frigate chassis with forward prow blades and plasma core flanked by 4 heavy interceptor escorts.
- **Victory Rewards**: Defeating the Armada Commander repels the overrun, awarding **+400 CR**, **+250 XP**, and completing the Armada Bounty.
- **Contextual Game Over**: If the player is destroyed during an active incursion, the game-over screen displays `ARMADA OVERRUN: Vessel overwhelmed during hostile fleet incursion.`

---

## 🚀 5. 3 Lives System & Respawn Protocol

- **3 Starting Lives (`🚀 x3`)**: Displayed on the top HUD.
- **Quantum Invulnerability Respawn**:
  - When your fighter's hull reaches 0, 1 life is deducted.
  - A tactical reserve ship is deployed with full Hull and Shields at the flight line.
  - A shimmering **Golden Quantum Invulnerability Shield** protects the ship for 3.5 seconds.
- **Extra Lives in Store**: Purchase additional reserve ships in the Armory Store (`500 CR`, up to 5 lives).
- **Game Over**: Triggers only once all reserve ships are depleted.

---

## 🛒 6. Interactive Weapon & Armory Store (`[B]` Key)

Access the store anytime during flight with **`B`** or clicking **`🛒 ARMORY`**, or after clearing a sector.

### Categories & Upgrades
- **Weapons (Tiers 1–10)**:
  - *Continuous Laser Supercharge* (Lv. 1–10): Continuous beam thickness expansion & +35% DPS per level (`200 CR * Lv`).
  - *Dual Plasma Booster* (Lv. 1–10): +22% bolt kinetic damage & velocity per level (`150 CR * Lv`).
  - *Flak Scatter Bore* (Lv. 1–10): +2 scatter pellets and wider blast radius per level (`180 CR * Lv`).
  - *Quantum Photon Torpedo* (Lv. 1–10): +35% antimatter concussive yield and spherical blast radius (`220 CR * Lv`).
  - *Tesla Arc Induction* (Lv. 1–10): +28% electrical voltage and additional lightning chain jumps (`240 CR * Lv`).
  - *HUD Quick-Upgrade Buttons*: Upgrade power directly on the HUD dock with coins on the fly!
- **Systems & Drones**:
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

## 🎼 7. Procedural Space Sound Engine (100% Web Audio API)

Zero external audio asset dependencies, with smooth dynamic crossfades and customizable volumes:
- **🌌 Cosmic Ambient (Default)**: Deep 55Hz sub-drone, floating D Dorian / F Lydian space pads, and twinkling starlight pentatonic chimes.
- **✨ Celestial Starlight**: Peaceful crystal bell arpeggios, gentle high serene pads, and tranquil harmonics.
- **⚡ Cybernetic Synthwave**: Retro 80s space synth pulse with rhythmic 16th bass arpeggios (~108 BPM) and warm analog pads.
- **🚀 Deep Space Odyssey**: Ultra-deep planetary 43.65Hz sub-bass, slow-sweeping minor 9th cinematic pads, and celestial radar telemetry pings.
- **Tactical Audio FX**: Dual-frequency alarm sirens, harmonic promotion fanfares, kinetic cannons, continuous beam hums, and thunderous EMP explosions.

---

## 💎 8. Dynamic Destructible 3D Asteroids
- **Deep Space Mineral Fields**: Tumbling 3D procedural rocky and crystalline asteroids drift into the combat corridor.
- **Laser Cutting Physics**: Carving asteroids with your Continuous Laser or blasting them with plasma shatters them into fragments.
- **Mineral Crystal Drops**: Shattering asteroids drops bonus crystal scrap (`+25 to +50 CR`) and awards XP.

---

## 🏆 9. Persistent Career Data & Achievements
- **8 Permanent Medals**: First Contact, Laser Surgeon, Leviathan Hunter, Fleet Commander, Maximum Overdrive, Scrap Tycoon, Asteroid Miner, Deep Space Ace.
- **Persistent LocalStorage**: Credits, highest sector, pilot callsign, active starfighter, purchased fleet, weapon tiers, rank, and achievements persist between sessions.

---

## 👨‍💻 Author & Developer

**Developed by Gaurav Gautam**
- **GitHub**: [@ggthedeveloper](https://github.com/ggthedeveloper)
- **Repository**: [https://github.com/ggthedeveloper/Space-Shooter-3D](https://github.com/ggthedeveloper/Space-Shooter-3D)
