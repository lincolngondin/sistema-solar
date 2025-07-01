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

const clock = new THREE.Clock();

export function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  celestialBodies.forEach((body) => {
    body.mesh.rotation.y += body.baseRotation * deltaTime * 10;

    if (body.radius) {
      body.angle = (body.angle ?? 0) + deltaTime * body.speed * 0.5;
      body.mesh.position.x = Math.cos(body.angle) * body.radius;
      body.mesh.position.z = Math.sin(body.angle) * body.radius;
    }

    if (body.moons) {
      body.moons.forEach((moon) => {
        moon.angle = (moon.angle ?? 0) + deltaTime * moon.speed * 2;
        moon.mesh.position.x =
          body.mesh.position.x + Math.cos(moon.angle) * moon.radius;
        moon.mesh.position.z =
          body.mesh.position.z + Math.sin(moon.angle) * moon.radius;
        moon.mesh.rotation.y += moon.baseRotation;
      });
    }
  });

  controls.target.copy(
    celestialBodies[AppState.focusedBodyIndex].mesh.position
  );
  controls.update();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
