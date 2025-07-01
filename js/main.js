import { setupEventListeners, updatePlanetInfo } from "./ui.js";
import { animate } from "./animation.js";

// Inicializa os listeners de eventos
setupEventListeners();

// Exibe a informação do planeta inicial
updatePlanetInfo();

// Começa o loop de animação
animate();
