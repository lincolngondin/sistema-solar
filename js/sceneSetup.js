import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

const webglContainer = document.getElementById("webgl-container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  4000
);
camera.position.set(0, 80, 250);

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
webglContainer.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
webglContainer.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.background = textureLoader.load("textures/8k_stars.jpg", (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
});

// Luz ambiente para que as partes escuras não sejam totalmente pretas
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

export { scene, camera, renderer, labelRenderer, controls, textureLoader };
