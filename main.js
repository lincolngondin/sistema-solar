import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

// --- 1. CONFIGURAÇÃO INICIAL E ESSENCIAL ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 80, 250); // Posição inicial para ver o sistema

const textureLoader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("webgl-container").appendChild(renderer.domElement);

// Renderizador para as etiquetas de texto
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document
  .getElementById("webgl-container")
  .appendChild(labelRenderer.domElement);

// Controles de câmera livres para o usuário explorar
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Fundo de estrelas
scene.background = textureLoader.load(
  "textures/8k_stars.jpg",
  (t) => (t.mapping = THREE.EquirectangularReflectionMapping)
);

// --- 2. FUNÇÕES DE CRIAÇÃO ---

// Desenha a linha da órbita de um planeta
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

// "Fábrica" que cria qualquer corpo celeste
function createCelestialBody(data) {
  const geometry = new THREE.SphereGeometry(data.size, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(data.texture),
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Adiciona a etiqueta de texto
  const label = new CSS2DObject(document.createElement("div"));
  label.element.className = "label";
  label.element.textContent = data.label;
  label.position.set(0, data.size * 1.5, 0);
  mesh.add(label);

  data.mesh = mesh;

  if (data.radius) {
    createOrbitLine(data.radius);
  }
  return data;
}

// --- 3. DADOS DE TODOS OS PLANETAS ---
const celestialBodies = [
  createCelestialBody({
    name: "sun",
    label: "Sol",
    size: 12,
    texture: "textures/8k_sun.jpg",
    baseRotation: 0.001,
  }),
  createCelestialBody({
    name: "mercury",
    label: "Mercúrio",
    size: 1.5,
    texture: "textures/8k_mercury.jpg",
    radius: 35,
    speed: 1.6,
    baseRotation: 0.008,
  }),
  createCelestialBody({
    name: "venus",
    label: "Vênus",
    size: 2.5,
    texture: "textures/8k_venus_surface.jpg",
    radius: 50,
    speed: 1.2,
    baseRotation: 0.003,
  }),
  createCelestialBody({
    name: "earth",
    label: "Terra",
    size: 2.6,
    texture: "textures/8k_earth_daymap.jpg",
    radius: 68,
    speed: 1.0,
    baseRotation: 0.05,
  }),
  createCelestialBody({
    name: "mars",
    label: "Marte",
    size: 2,
    texture: "textures/8k_mars.jpg",
    radius: 85,
    speed: 0.8,
    baseRotation: 0.052,
  }),
  createCelestialBody({
    name: "jupiter",
    label: "Júpiter",
    size: 7,
    texture: "textures/8k_jupiter.jpg",
    radius: 120,
    speed: 0.4,
    baseRotation: 0.12,
  }),
  createCelestialBody({
    name: "saturn",
    label: "Saturno",
    size: 6,
    texture: "textures/8k_saturn.jpg",
    radius: 160,
    speed: 0.3,
    baseRotation: 0.11,
  }),
  createCelestialBody({
    name: "uranus",
    label: "Urano",
    size: 4,
    texture: "textures/2k_uranus.jpg",
    radius: 200,
    speed: 0.2,
    baseRotation: 0.08,
  }),
  createCelestialBody({
    name: "neptune",
    label: "Netuno",
    size: 3.8,
    texture: "textures/2k_neptune.jpg",
    radius: 240,
    speed: 0.15,
    baseRotation: 0.07,
  }),
];

// --- 4. LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  celestialBodies.forEach((body) => {
    // Rotação (girar em torno do próprio eixo)
    body.mesh.rotation.y += body.baseRotation;

    // Translação (girar em torno do Sol), se aplicável
    if (body.radius) {
      const angle = elapsedTime * body.speed * 0.1;
      body.mesh.position.x = Math.cos(angle) * body.radius;
      body.mesh.position.z = Math.sin(angle) * body.radius;
    }
  });

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Listener para redimensionar a janela
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicia a animação!
animate();
