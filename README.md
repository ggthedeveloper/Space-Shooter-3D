# Space Shooter 3D: Alien Assault (Modular Edition)

> **Epic WebGL Space Combat Simulator & Cosmic Armada Campaign**  
> Developed by **GG (Gaurav Gautam)**

---

## 🌟 Project Architecture

The game has been refactored from a monolithic 11,496-line file into a clean, modern, modular architecture:

```text
space-battle-game/
│
├── index.html                     # Clean semantic HTML container & UI skeleton
├── package.json                   # Project metadata & npm start script
├── server.js                      # Native Node.js static file HTTP server
├── README.md                      # Architecture documentation & extension guide
│
├── css/
│   ├── style.css                  # CSS custom properties, reset, scanlines, animations
│   ├── hud.css                    # Top HUD, health/shield bars, crosshair, dock, footer
│   ├── menu.css                   # Modals (Pilot, Store, Galaxy, Tutorial, Game Over, Hull)
│   ├── game.css                   # Combat canvas, floating damage text, wave & hull toasts
│   ├── ships.css                  # Ship cards, store grids, stat bars, weapon previews
│   └── responsive.css             # Touch joystick, mobile action buttons, media queries
│
├── js/
│   ├── main.js                    # Entry point: boot sequence, resize, window error handling
│   ├── game.js                    # Three.js scene, camera, renderer, starfield, game loop
│   ├── state.js                   # Centralized game state, military ranks, bounties, achievements
│   ├── player.js                  # Starfighter mesh, controls, flight bounds, barrel roll, damage
│   ├── ships.js                   # 16 Starship definitions & 3D procedural mesh builders
│   ├── weapons.js                 # Weapons arsenal, firing mechanics, projectiles, abilities
│   ├── enemies.js                 # Alien meshes, AI behaviors, alien bullets, boss logic
│   ├── sectors.js                 # Sector progression, squadron spawning, hyperspace warp
│   ├── galaxies.js                # 8 Galaxy environments, nebula lighting, galaxy selector
│   ├── economy.js                 # Scrap drops, purchases, 40k extra life, 20k hull repair
│   ├── progression.js             # Military ranks, XP, bounties, 7s tactical auto-aim
│   ├── audio.js                   # Web Audio synthesizer, 12 procedural soundtracks (no pi-pi)
│   ├── menu.js                    # NavigationStack (Universal Back), modal navigation
│   ├── settings.js                # Volume controls, audio style sync, CRT & fullscreen
│   ├── save.js                    # LocalStorage persistence, career save/load/wipe
│   ├── ui.js                      # HUD updates, weapon dock, floating combat text, toasts
│   ├── utils.js                   # Math helpers, clamp, randRange, formatCr
│   └── three.min.js               # Local Three.js library
│
└── assets/
    ├── README.md                  # Guide for adding external custom assets
    ├── images/
    ├── ships/
    ├── enemies/
    ├── galaxies/
    ├── weapons/
    ├── audio/
    └── fonts/
```

---

## 🚀 How to Run the Game

### Option 1: Native Node.js Static Server (Recommended)

1. Make sure you have Node.js installed.
2. Run:
   ```bash
   npm start
   ```
   *(Alternatively: `node server.js`)*
3. Open your browser to:
   ```text
   http://localhost:3000/
   ```
   *(If port 3000 is occupied, the server automatically selects the next available port).*

### Option 2: Any HTTP Static Server

You can also run the game with Python, Live Server, Nginx, or Caddy:
```bash
python3 -m http.server 8080
```

---

## 🎮 Key Gameplay Systems

1. **16 Selectable Starships**:
   - Tier 1: Valkyrie MK-II, Scout, Interceptor, Assault
   - Tier 2: Solar Phoenix, Guardian, Destroyer, Phantom Ghost
   - Tier 3: Nova, Titan Heavy, Eclipse, Void Hunter
   - Tier 4: Void Reaper, Galaxy Guardian, Celestial Emperor, Apex Sovereign
   - *Advanced ships unlock normally via sector progression or early via credit purchases in the hangar.*

2. **8 Celestial Galaxies**:
   - Nebula, Crimson, Void, Cyber, Solar Sun, Abyss, Andromeda, Singularity. Each features custom volumetric dust and starfield lighting.

3. **12 Procedural Soundtracks**:
   - Real-time Web Audio synthesizer tracks: interstellar, hyperspace, darkmatter, supernova, solarsun, andromeda, boss, ambient, starlight, synthwave, odyssey, pulsar.
   - *The irritating "pi-pi" sound has been completely removed.*

4. **Tactical Armory & Weapons**:
   - Plasma Cannons, Fusion Railgun, Flak Cannon, Photon Torpedoes, Tesla Lightning.
   - Secondary & Superweapons: Void Missiles, Quantum EMP, Hyper-Overcharge.
   - Unique Ship Abilities: Plasma Burst, Meteor Strike, Void Rift, Overdrive, Energy Shield, Laser Barrage, Cosmic Wave.

5. **Combat Protocols**:
   - **Tactical Auto-Aim**: Strictly 7-second duration with auto-aim reticle lock.
   - **Emergency Hull Repair**: Available once per sector for critical hull damage.
   - **Critical Hull Floating Toast**: 20,000 CR repair available when hull is critical.
   - **Extra Life Purchase**: 40,000 CR per extra reserve starfighter.

6. **Universal Back Navigation**:
   - Robust `NavigationStack` supporting Back buttons across all menus, briefing screens, hangar, and armory.

---

## 🛠️ How to Extend the Game

### Adding a New Ship
1. Add the definition in `js/ships.js` inside `SHIP_DEFINITIONS`.
2. Add a mesh builder function `buildMyShip()` in `js/ships.js`.
3. Add weapon configurations in `js/weapons.js` inside `SHIP_WEAPON_CONFIG`.

### Adding a New Weapon
1. Define the weapon firing logic in `js/weapons.js`.
2. Add weapon slot cards in `index.html` and `css/hud.css` dock styles.
3. Wire keyboard and touch trigger bindings.

### Adding a New Galaxy
1. Add the entry to `GALAXIES` in `js/galaxies.js` with color palette, clear color, and ambient lighting.
2. The UI in `updateGalaxyModalUI()` automatically renders the new galaxy card.

### Adding a New Audio Track
1. Add the generator function inside `SoundEngine` in `js/audio.js`.
2. Register the track style in `js/settings.js` dropdown selects.

---

## 🛡️ Zero Regressions Verified

All 13 primary user-flow steps have been tested and verified:
- Starting Screen & Pilot Briefing
- Universal Back Stack navigation
- Galaxy selector & visual warps
- 16 Ships & early credit unlock
- 12 procedural music themes (0 "pi-pi" alerts)
- Tactical auto-aim (strict 7-second ceiling)
- Full 5-weapon arsenal + special abilities + EMP
- Barrel roll evasive maneuvers
- Alien waves & living alien pilot cockpits
- Critical hull repair (20k toast & emergency modal)
- 40,000 CR extra life purchases
- Sector completion, rank XP, and hyperspace transitions
- Persistent LocalStorage save/load
