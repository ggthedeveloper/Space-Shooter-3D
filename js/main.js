/**
 * ALIEN ASSAULT 3D - MAIN APPLICATION ENTRY POINT
 * Boots modules, wires window events, synchronizes UI, and initiates the cosmic campaign
 */

import { state } from "./state.js";
import { audio } from "./audio.js";
import { loadGameData } from "./save.js";
import { setStarship } from "./ships.js";
import { applyGalaxyEnvironment } from "./galaxies.js";
import { checkProgressionUnlocks } from "./progression.js";
import { openPilotRegistrationModal } from "./menu.js";
import { updateHUD, renderAchievementsMenu } from "./ui.js";
import { startMission, loop, renderer, camera } from "./game.js";

// Ensure all submodules are loaded and registered
import "./utils.js";
import "./player.js";
import "./weapons.js";
import "./enemies.js";
import "./sectors.js";
import "./economy.js";
import "./settings.js";

// Global error handlers
window.addEventListener("error", (e) => {
  console.error("Global window error:", e.error || e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled Promise:", e.reason);
});

// Viewport Resize Handler
function onResize() {
  const w = window.innerWidth || document.documentElement.clientWidth || 800;
  const h = window.innerHeight || document.documentElement.clientHeight || 600;
  if (renderer) renderer.setSize(w, h, true);
  if (camera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener("resize", onResize);

// Initialize Career Progress and Starfighter Launch with deduplication guard
let gameBooted = false;
function bootGame() {
  if (gameBooted) return;
  gameBooted = true;
  onResize();
  loadGameData();
  renderAchievementsMenu();
  startMission();
  updateHUD();
  openPilotRegistrationModal();
  loop();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootGame);
} else {
  bootGame();
}

export { onResize };
