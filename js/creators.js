import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";
import { scene, textureLoader } from "./sceneSetup.js";

function createOrbitLine(radius) {
  const geometry = new THREE.TorusGeometry(radius, 0.08, 16, 256);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
  });
  const orbit = new THREE.Mesh(geometry, material);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
}

// Nova função dedicada para criar o Sol com todos os seus efeitos
export function createSun(data) {
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(data.texture),
  });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 64, 64),
    material
  );
  data.mesh = mesh;
  scene.add(mesh); // Adiciona a malha do sol

  // Luz principal que emana do Sol
  const pointLight = new THREE.PointLight(0xffffff, 2.5, 4000);

  // Criação do LensFlare
  const flareTexture = textureLoader.load("textures/lensflare0.png");
  const flareRingTexture = textureLoader.load("textures/lensflare3.png");

  const lensflare = new Lensflare();
  lensflare.addElement(
    new LensflareElement(flareTexture, 700, 0, pointLight.color)
  );
  lensflare.addElement(new LensflareElement(flareRingTexture, 60, 0.6));
  lensflare.addElement(new LensflareElement(flareRingTexture, 70, 0.7));
  lensflare.addElement(new LensflareElement(flareRingTexture, 120, 0.9));

  pointLight.add(lensflare);
  scene.add(pointLight); // Adiciona a luz com o flare

  return data;
}

export function createCelestialBody(data) {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(data.texture),
  });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 64, 64),
    material
  );
  if (data.axialTiltDegrees) {
    mesh.rotation.z = THREE.MathUtils.degToRad(data.axialTiltDegrees);
  }
  pivot.add(mesh);

  if (data.ring) {
    const ringGeometry = new THREE.RingGeometry(
      data.size * 1.5,
      data.size * 2.5,
      128
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(data.ring.texture),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    mesh.add(ringMesh);
  }

  // LÓGICA DAS LUAS CORRIGIDA
  if (data.moons) {
    data.moons.forEach((moonData) => {
      const moonMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(moonData.texture),
      });
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(moonData.size, 32, 32),
        moonMaterial
      );
      moonData.mesh = moonMesh;
      // Adiciona a lua como filha do PIVÔ do planeta, para que orbite corretamente.
      pivot.add(moonMesh);
    });
  }

  const label = new CSS2DObject(document.createElement("div"));
  label.element.className = "label";
  label.element.textContent = data.label;
  label.position.set(0, data.size * 1.5, 0);
  mesh.add(label);

  data.mesh = mesh;
  data.pivot = pivot;

  if (data.radius > 0) createOrbitLine(data.radius);

  return data;
}

// Nova função para criar o cinturão de asteroides de forma performática
export function createAsteroidBelt(constants) {
  const asteroidCount = 1500;
  const dummy = new THREE.Object3D();

  const geometry = new THREE.IcosahedronGeometry(0.1, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 1.0,
  });
  const instancedMesh = new THREE.InstancedMesh(
    geometry,
    material,
    asteroidCount
  );

  for (let i = 0; i < asteroidCount; i++) {
    const radius =
      Math.random() * (constants.outerRadius - constants.innerRadius) +
      constants.innerRadius;
    const angle = Math.random() * Math.PI * 2;

    dummy.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 5,
      Math.sin(angle) * radius
    );
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    dummy.scale.setScalar(Math.random() * 2 + 0.5);

    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }
  scene.add(instancedMesh);
}
