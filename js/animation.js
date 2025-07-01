import * as THREE from "three";
import {
  scene,
  camera,
  renderer,
  labelRenderer,
  controls,
} from "./sceneSetup.js";
import { celestialBodies } from "./celestialData.js";
import { AppState } from "./ui.js";
import { Constants } from "./celestialData.js";

const clock = new THREE.Clock();

export function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  celestialBodies.forEach((body) => {
    // A rotação agora usa o painel de controle
    body.mesh.rotation.y += (body.baseRotation || 0) * deltaTime;

    // Animação da órbita do planeta
    if (body.radius > 0) {
      body.angle = (body.angle ?? 0) + deltaTime * body.speed;
      body.pivot.position.x = Math.cos(body.angle) * body.radius;
      body.pivot.position.z = Math.sin(body.angle) * body.radius;
    }

    // ANIMAÇÃO DAS LUAS CORRIGIDA
    if (body.moons) {
      body.moons.forEach((moon) => {
        moon.angle = (moon.angle ?? 0) + deltaTime * moon.speed;
        // Posição local em relação ao pivô do planeta, não à cena
        moon.mesh.position.x = Math.cos(moon.angle) * moon.radius;
        moon.mesh.position.z = Math.sin(moon.angle) * moon.radius;
        moon.mesh.rotation.y += moon.baseRotation;
      });
    }
  });

  const targetBody = celestialBodies[AppState.focusedBodyIndex];
  const targetPosition = new THREE.Vector3();
  // Usa o pivô como alvo para uma câmera mais estável
  targetBody.pivot.getWorldPosition(targetPosition);
  controls.target.lerp(targetPosition, 0.05);

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
