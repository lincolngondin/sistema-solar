import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { scene, textureLoader } from "./sceneSetup.js";

function createOrbitLine(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    points.push(
      new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
  });
  scene.add(new THREE.Line(geometry, material));
}

export function createCelestialBody(data) {
  const geometry = new THREE.SphereGeometry(data.size, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(data.texture),
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  data.mesh = mesh; // Anexa a malha 3D aos dados

  if (data.ring) {
    const ringGeometry = new THREE.RingGeometry(
      data.size + 2,
      data.size + 8,
      64
    );

    const ringTexture = textureLoader.load(data.ring.texture)
    ringTexture.center.set(0.5, 0.5);

    const raio_interno = data.size + 2;
    const raio_externo = data.size + 8;

    const pos = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;

    for (let i = 0; i < uv.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const radius = Math.sqrt(x * x + y * y);
      const u = (radius - raio_interno) / (raio_externo - raio_interno);
      uv.setXY(i, u, 0.5); // Valor Y constante, pois a imagem é uma faixa horizontal
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = -Math.PI / 2;
    mesh.add(ringMesh); // Adiciona o anel como filho do planeta
    data.ring.mesh = ringMesh;
  }

  if (data.moons) {
    data.moons.forEach((moonData) => {
      const moonGeometry = new THREE.SphereGeometry(moonData.size, 64, 64);
      const moonMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(moonData.texture),
      });
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      scene.add(moonMesh);
      moonData.mesh = moonMesh;
    });
  }

  const label = new CSS2DObject(document.createElement("div"));
  label.element.className = "label";
  label.element.textContent = data.label;
  label.position.set(0, data.size * 1.5, 0);
  mesh.add(label);

  if (data.radius) {
    createOrbitLine(data.radius);
  }

  return data;
}
