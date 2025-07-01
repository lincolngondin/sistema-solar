import {
  createSun,
  createCelestialBody,
  createAsteroidBelt,
} from "./creators.js";

// --- PAINEL DE CONTROLE DA SIMULAÇÃO ---
export const Constants = {
  DISTANCE_SCALE: 120,
  ORBIT_SPEED_SCALE: 0.5,
  ROTATION_SPEED_SCALE: 5,
  ASTEROID_BELT_INNER_RADIUS: 2.2, // Em AU
  ASTEROID_BELT_OUTER_RADIUS: 3.2, // Em AU
};

const sunData = {
  name: "sun",
  label: "Sol",
  size: 12,
  texture: "textures/8k_sun.jpg",
  baseRotation: 0.0001,
};

const planetsData = [
  {
    name: "mercury",
    label: "Mercúrio",
    size: 1.5,
    distanceAU: 0.387,
    orbitalPeriodDays: 88,
    rotationPeriodHours: 1408,
    axialTiltDegrees: 0.03,
    texture: "textures/8k_mercury.jpg",
  },
  {
    name: "venus",
    label: "Vênus",
    size: 2.5,
    distanceAU: 0.723,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832,
    axialTiltDegrees: 177.3,
    texture: "textures/8k_venus_surface.jpg",
  },
  {
    name: "earth",
    label: "Terra",
    size: 2.6,
    distanceAU: 1,
    orbitalPeriodDays: 365.2,
    rotationPeriodHours: 23.9,
    axialTiltDegrees: 23.44,
    texture: "textures/8k_earth_daymap.jpg",
    moons: [
      {
        texture: "textures/8k_moon.jpg",
        size: 0.6,
        baseRotation: 0.07,
        radius: 5,
        speed: 2,
      },
    ],
  },
  {
    name: "mars",
    label: "Marte",
    size: 2,
    distanceAU: 1.52,
    orbitalPeriodDays: 687,
    rotationPeriodHours: 24.6,
    axialTiltDegrees: 25.19,
    texture: "textures/8k_mars.jpg",
  },
  {
    name: "jupiter",
    label: "Júpiter",
    size: 7,
    distanceAU: 5.2,
    orbitalPeriodDays: 4331,
    rotationPeriodHours: 9.9,
    axialTiltDegrees: 3.13,
    texture: "textures/8k_jupiter.jpg",
  },
  {
    name: "saturn",
    label: "Saturno",
    size: 6,
    distanceAU: 9.58,
    orbitalPeriodDays: 10747,
    rotationPeriodHours: 10.7,
    axialTiltDegrees: 26.73,
    ring: { texture: "textures/8k_saturn_ring_alpha.png" },
    texture: "textures/8k_saturn.jpg",
  },
  {
    name: "uranus",
    label: "Urano",
    size: 4,
    distanceAU: 19.22,
    orbitalPeriodDays: 30687,
    rotationPeriodHours: -17.2,
    axialTiltDegrees: 97.77,
    texture: "textures/2k_uranus.jpg",
  },
  {
    name: "neptune",
    label: "Netuno",
    size: 3.8,
    distanceAU: 30.05,
    orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.1,
    axialTiltDegrees: 28.32,
    texture: "textures/2k_neptune.jpg",
  },
];

const processedPlanets = planetsData.map((data) => {
  data.radius = data.distanceAU * Constants.DISTANCE_SCALE;
  data.speed =
    (1 / data.orbitalPeriodDays) *
    (data.distanceAU * Constants.ORBIT_SPEED_SCALE) *
    1000;
  data.baseRotation =
    (1 / data.rotationPeriodHours) * Constants.ROTATION_SPEED_SCALE;
  return createCelestialBody(data);
});

export const celestialBodies = [createSun(sunData), ...processedPlanets];

// Cria o cinturão de asteroides com as constantes de raio
createAsteroidBelt({
  innerRadius: Constants.ASTEROID_BELT_INNER_RADIUS * Constants.DISTANCE_SCALE,
  outerRadius: Constants.ASTEROID_BELT_OUTER_RADIUS * Constants.DISTANCE_SCALE,
});
