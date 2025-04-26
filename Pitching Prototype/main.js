import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "https://cdn.skypack.dev/gsap@3.12.5";
import * as dat from "https://cdn.jsdelivr.net/npm/lil-gui@0.16.0/dist/lil-gui.esm.min.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// Texture Loader
const textureLoader = new THREE.TextureLoader();

const tilesTexture = {
  color: textureLoader.load("./Static/Texture/Floor/color.jpg"),
  ao: textureLoader.load("./Static/Texture/Floor/AmbientOcclusion.jpg"),
  height: textureLoader.load("./Static/Texture/Floor/Height.jpg"),
  normal: textureLoader.load("./Static/Texture/Floor/Normal.jpg"),
  roughness: textureLoader.load("./Static/Texture/Floor/Roughness.jpg"),
};

const tableChair = new GLTFLoader();
tableChair.load("./Static/Models/TableChair/scene.gltf", (gltf) => {
  const tableChair = gltf.scene;

  // set position
  tableChair.position.set(-0.5, 0.05, -2.2);

  // set rotation
  tableChair.rotation.set(0, 11, 0);

  // set scale
  tableChair.scale.set(0.06, 0.06, 0.06);

  tableChair.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true; // Cast shadows
      node.receiveShadow = true; // Receive shadows
    }
  });

  // Add to the scene
  scene.add(tableChair);
});

const painting = new GLTFLoader();
painting.load("./Static/Models/Painting/scene.gltf", (gltf) => {
  const painting = gltf.scene;

  painting.position.set(-5.5, 5, -9.8);

  painting.scale.set(5, 5, 5);

  painting.traverse((node) => {
    if (node.isMesh) {
      node.receiveShadow = true;
    }
  });

  scene.add(painting);
});

const MiniCamera = new GLTFLoader();
MiniCamera.load("./Static/Models/MiniCamera/scene.gltf", (gltf) => {
  const MiniCamera = gltf.scene;

  MiniCamera.position.set(0, 10, -2);

  MiniCamera.rotation.set(Math.PI * 0.5, 0, 0);

  MiniCamera.scale.set(5, 5, 5);

  MiniCamera.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });

  scene.add(MiniCamera);
});

const lamp1 = new GLTFLoader();
lamp1.load("./Static/Models/WallLamp/scene.gltf", (gltf) => {
  const lamp1 = gltf.scene;

  lamp1.position.set(-7, 10, -9.9);

  lamp1.scale.set(7, 7, 7);

  lamp1.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });

  scene.add(lamp1);
});

const lamp2 = new GLTFLoader();
lamp2.load("./Static/Models/WallLamp/scene.gltf", (gltf) => {
  const lamp2 = gltf.scene;

  lamp2.position.set(7, 10, -9.9);

  lamp2.scale.set(7, 7, 7);

  lamp2.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });

  scene.add(lamp2);
});

let canvas, scene, sizes, camera, controls, renderer;

let restaurant, wall, stick, floor;

let ambientLight, lightBulb;

let clock = new THREE.Clock();

init();

function init() {
  // Canvas
  canvas = document.querySelector("canvas.webgl");

  // Scene
  scene = new THREE.Scene();

  // Restaurant container
  restaurant = new THREE.Group();
  scene.add(restaurant);
  // scene background color
  scene.background = new THREE.Color("#a9f1f6");

  wall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 12),
    new THREE.MeshBasicMaterial({
      color: 0xecf0f1,
    })
  );
  wall.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(wall.geometry.attributes.uv.array, 2)
  );
  //   wall.rotation.set(0, -Math.PI / 2, 0)
  wall.position.set(0, 6, -10);
  wall.receiveShadow = true;
  restaurant.add(wall);

  stick = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 8, 0.2),
    new THREE.MeshBasicMaterial({
      color: 0x080808,
    })
  );
  stick.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(stick.geometry.attributes.uv.array, 2)
  );
  stick.rotation.set(-Math.PI * 0.5, 0, 0);
  stick.position.set(0, 10, -6);
  stick.castShadow = true;
  restaurant.add(stick);

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      map: tilesTexture.color,
      aoMap: tilesTexture.ao,
      normalMap: tilesTexture.normal,
      roughnessMap: tilesTexture.roughness,
    })
  );
  floor.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
  );
  floor.rotation.set(-Math.PI * 0.5, 0, 0);
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Ambient light
  ambientLight = new THREE.AmbientLight("#b9d5ff", 1);
  scene.add(ambientLight);

  lightBulb = new THREE.DirectionalLight("#ffffff", 5); // Brighter directional light
  lightBulb.position.set(0, 5.5, 25); // Simulate sun high in the sky
  lightBulb.castShadow = true; // Enable shadows
  lightBulb.shadow.mapSize.set(1024, 1024); // Improve shadow quality
  lightBulb.shadow.camera.near = 1;
  lightBulb.shadow.camera.far = 50;
  lightBulb.shadow.camera.left = -10;
  lightBulb.shadow.camera.right = 10;
  lightBulb.shadow.camera.top = 10;
  lightBulb.shadow.camera.bottom = -10;
  scene.add(lightBulb);

  // Light helper
  const directionalLightCameraHelper = new THREE.CameraHelper(
    lightBulb.shadow.camera
  );
  directionalLightCameraHelper.visible = true;
  //   scene.add(directionalLightCameraHelper);

  sizes = {
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

  // Camera
  // Base camera
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(0, 15, 20);
  scene.add(camera);

  // Controls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setAnimationLoop(animate);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
}
