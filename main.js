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
  if (data.ring != undefined) {
    const ring_texture = textureLoader.load(data.ring.texture)
    ring_texture.center.set(0.5, 0.5);

    const raio_interno = data.size + 2;
    const raio_externo = data.size + 8;
    const ring_geometry = new THREE.RingGeometry(raio_interno, raio_externo, 64);

    const pos = ring_geometry.attributes.position;
    const uv = ring_geometry.attributes.uv;

    for (let i = 0; i < uv.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const radius = Math.sqrt(x * x + y * y);
      const u = (radius - raio_interno) / (raio_externo - raio_interno);
      uv.setXY(i, u, 0.5); // Valor Y constante, pois a imagem é uma faixa horizontal
    }

    const ring_material = new THREE.MeshBasicMaterial({
      map: ring_texture,
      transparent: true,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ring_geometry, ring_material);
    ring.rotation.x = 1.2;
    ring.rotation.y = 0.0;
    ring.rotation.z = 0.0;
    ring.position.set(0, data.size * 1.5, 0)
    data.ring = ring;
    scene.add(ring);
  }


  // Adiciona todas as luas que o planeta possui
  if (data.moons != undefined && data.moons.length != 0) {
    for (let lua = 0; lua < data.moons.length; lua++) {
      const lua_geometria = new THREE.SphereGeometry(data.moons[lua].size, 64, 64)
      const lua_material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(data.moons[lua].texture)
      })
      const moon = new THREE.Mesh(lua_geometria, lua_material)
      scene.add(moon)
      data.moons[lua].mesh = moon;
    }
  }

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
    moons: [
      {
        texture: "textures/8k_moon.jpg",
        size: 0.6,
        baseRotation: 0.02,
        radius: 5,
        speed: 0.3,
      }
    ]
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
    moons: [
      {
        label: "Europa",
        texture: "textures/europa.jpg",
        size: 0.4,
        baseRotation: 0.01,
        radius: 13,
        speed: 0.8,
      },
      {
        label: "Callisto",
        texture: "textures/callisto.jpg",
        size: 0.5,
        baseRotation: 0.01,
        radius: 19,
        speed: 0.4,
      },
      {
        label: "Ganymedes",
        texture: "textures/ganymede.jpg",
        size: 0.5,
        baseRotation: 0.01,
        radius: 15,
        speed: 0.7,
      },
      {
        label: "IO",
        texture: "textures/io.png",
        size: 0.7,
        baseRotation: 0.01,
        radius: 11,
        speed: 1,
      },
    ]
  }),
  createCelestialBody({
    name: "saturn",
    label: "Saturno",
    size: 6,
    texture: "textures/8k_saturn.jpg",
    radius: 160,
    speed: 0.3,
    baseRotation: 0.11,
    ring: {
      texture: "textures/8k_saturn_ring_alpha.png"
    },
    moons: [
      {
        label: "Titan",
        texture: "textures/titan.png",
        size: 0.5,
        baseRotation: 0.001,
        radius: 18,
        speed: 1,
      },
    ]
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
    moons: [
      {
        label: "Triton",
        texture: "textures/triton.jpg",
        size: 0.4,
        baseRotation: 0.001,
        radius: 12,
        speed: 0.7,
      },
    ]
  }),
];

// --- 4. LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  celestialBodies.forEach((body) => {
    // Rotação (girar em torno do próprio eixo)
    body.mesh.rotation.y += body.baseRotation;

    // inicializa o angulo do planeta para 0
    if (body.radius && body.angle === undefined) {
      body.angle = 0;
    }

    // Translação (girar em torno do Sol), se aplicável
    if (body.radius) {
      //const angle = elapsedTime * body.speed * 0.1;
      body.angle += deltaTime * body.speed * 0.1;
      body.mesh.position.x = Math.cos(body.angle) * body.radius;
      body.mesh.position.z = Math.sin(body.angle) * body.radius;
      // atualiza os aneis do planeta caso possua
      if (body.ring != undefined) {
        body.ring.position.copy(body.mesh.position)
      }
    }

    // atualiza a posicao das luas de cada planeta
    if (body.moons != undefined) {
      for (let i = 0; i < body.moons.length; i++) {
        const moon = body.moons[i];

        // inicializa o angulo da lua
        if (moon.angle === undefined) {
          moon.angle = 0;
        }

        moon.angle = deltaTime * moon.speed * 0.5;
        const offsetX = Math.cos(moon.angle) * moon.radius;
        const offsetZ = Math.sin(moon.angle) * moon.radius;

        moon.mesh.position.x = body.mesh.position.x + offsetX;
        moon.mesh.position.y = body.mesh.position.y;
        moon.mesh.position.z = body.mesh.position.z + offsetZ;
        moon.mesh.rotation.y += moon.speed;
      }
    }

  });

  // atualiza a posicao da camera em relacao ao corpo celeste focado
  controls.target.copy(celestialBodies[corpoCelesteFocado].mesh.position)

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

let corpoCelesteFocado = 2;
updatePlanetInfo(celestialBodies[corpoCelesteFocado])

function updatePlanetInfo(body) {
  if (body.name == "sun") {
    document.getElementById("planets-info").style.display = "none";
  }
  else {
    document.getElementById("planet-name").innerText = body.label || "Planeta";
    document.getElementById("planets-info").style.display = "block";
    document.getElementById("planet-radius").innerText = body.radius;
    document.getElementById("planet-speed").innerText = body.speed.toFixed(2);
    document.getElementById("planet-rotation").innerText = body.baseRotation.toFixed(2);
  }
}

// Listener para mudar o objeto celeste em foco
window.addEventListener("keydown", (key) => {
  switch (key.key) {
    case "ArrowRight":
      corpoCelesteFocado++;
      if (corpoCelesteFocado >= celestialBodies.length) {
        corpoCelesteFocado = 0;
      }
      updatePlanetInfo(celestialBodies[corpoCelesteFocado])
      break;
    case "ArrowLeft":
      corpoCelesteFocado--;
      if (corpoCelesteFocado < 0) {
        corpoCelesteFocado = celestialBodies.length - 1;
      }
      updatePlanetInfo(celestialBodies[corpoCelesteFocado])
      break;
    case "ArrowUp":
      if (key.shiftKey) {
        celestialBodies[corpoCelesteFocado].baseRotation += 0.01;
      }
      else {
        celestialBodies[corpoCelesteFocado].speed += 0.1;
      }
      updatePlanetInfo(celestialBodies[corpoCelesteFocado])
      break;
    case "ArrowDown":
      if (key.shiftKey) {
        celestialBodies[corpoCelesteFocado].baseRotation -= 0.01;
      }
      else {
        celestialBodies[corpoCelesteFocado].speed -= 0.1;
      }
      updatePlanetInfo(celestialBodies[corpoCelesteFocado])
      break;
  }
})

// Inicia a animação!
animate();