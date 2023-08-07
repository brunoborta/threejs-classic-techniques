import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */

let geometry = null;
let material = null;
let points = null;

function generateGalaxy(params) {
  if (points) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);

  const colorInside = new THREE.Color(params.insideColor);
  const colorOutside = new THREE.Color(params.outsideColor);

  for (let i = 0; i < params.count; i++) {
    /**
     * Positions
     */

    // Instead of loop through count * 3, I will "cheat"
    //and create 3 positions everytime I loop
    const i3 = i * 3;

    // The size of the galaxy
    const radius = Math.random() * params.radius;

    // The idea is: if the star is far from the center,
    //it will curve more than the one that's close to the center
    const spinAngle = radius * params.spin;

    // This one is complicated:
    //1: Using i to define in which branch of the galaxy the star will go
    //2: Devide it by the number of branches so we have a number between 0 and 1
    //3: Multiply by 2PI to define the angle of the in a circle
    const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;

    // Adding Randomness
    // const randomX = (Math.random() - 0.5) * params.randomness;
    // const randomY = (Math.random() - 0.5) * params.randomness;
    // const randomZ = (Math.random() - 0.5) * params.randomness;

    // The last solution of randomness is good, but it makes the stars
    //to be very random through the line of the branch. The whole idea
    //with the power is to have more values close to the 0 (the line)
    //and less values out of the line
    const randomX =
      Math.pow(Math.random(), params.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), params.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), params.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    // To position the stars in a circle, we use sin and cos
    //with the branch angle we define before.
    // sin() and cos() have a default radius of 1. To make it
    //bigger, we multiply by our radius
    // By adding the spinAngle, we apply a curve on the line
    positions[i3] = Math.sin(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius + randomZ;

    /**
     * Colors
     */
    // The lerp method mix one color with another one
    //changing the color of the original object
    // That's why we are cloning the inside color
    const mixedColor = colorInside.clone();

    // The alpha param of lerp expect a number between 0 and 1:
    //If 0 is passed, the result color will be the color of the original object
    //If 1 is passed, the result will be the color passed as 1st param.
    mixedColor.lerp(colorOutside, radius / params.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: params.size,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
}

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .name("Number of Stars")
  .onFinishChange(() => generateGalaxy(parameters));
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.01)
  .name("Size of the Stars")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .name("Radius of the Galaxy")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .name("Number of Branches")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Curve Spin")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Randomness")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .name("Randomness Power")
  .onFinishChange(() => generateGalaxy(parameters));

gui
  .addColor(parameters, "insideColor")
  .name("Inside Color")
  .onFinishChange(() => generateGalaxy(parameters));
gui
  .addColor(parameters, "outsideColor")
  .name("Outside Color")
  .onFinishChange(() => generateGalaxy(parameters));

generateGalaxy(parameters);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
