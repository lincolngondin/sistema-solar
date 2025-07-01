import { camera, renderer, labelRenderer } from "./sceneSetup.js";
import { celestialBodies } from "./celestialData.js";

// Objeto para compartilhar o estado da aplicação entre os módulos
export const AppState = {
  focusedBodyIndex: 0, // Começa na Terra (índice 2)
};

export function updatePlanetInfo() {
  const body = celestialBodies[AppState.focusedBodyIndex];
  const infoDiv = document.getElementById("planets-info");

  if (body.name === "sun") {
    infoDiv.style.display = "none";
    return;
  }

  infoDiv.style.display = "block";
  document.getElementById("planet-name").innerText = body.label || "Planeta";
  document.getElementById("planet-radius").innerText = body.radius;
  document.getElementById("planet-speed").innerText = body.speed.toFixed(2);
  document.getElementById("planet-rotation").innerText =
    body.baseRotation.toFixed(3);
}

export function setupEventListeners() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("keydown", (key) => {
    const len = celestialBodies.length;
    let newIndex = AppState.focusedBodyIndex;

    switch (key.key) {
      case "ArrowRight":
        newIndex = (AppState.focusedBodyIndex + 1) % len;
        break;
      case "ArrowLeft":
        newIndex = (AppState.focusedBodyIndex - 1 + len) % len;
        break;
      case "ArrowUp":
      case "ArrowDown":
        const currentBody = celestialBodies[AppState.focusedBodyIndex];
        if (!currentBody.radius) return;

        const direction = key.key === "ArrowUp" ? 1 : -1;
        if (key.shiftKey) {
          currentBody.baseRotation += 0.005 * direction;
        } else {
          currentBody.speed += 0.1 * direction;
        }
        break;
      default:
        return;
    }

    if (newIndex !== AppState.focusedBodyIndex) {
      AppState.focusedBodyIndex = newIndex;
    }
    updatePlanetInfo();
  });
}
