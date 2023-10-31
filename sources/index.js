import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

import { cameraInput, updateCamera } from './camera.js';

function displayCameraPosition(camera)
{
    const position = camera.position;
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.color = 'white';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.padding = '5px';
    div.innerHTML = `Camera Position: x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}`;
    document.body.appendChild(div);
}

let currentTime = null;
let clock = new THREE.Clock();
clock.start();
let keysPressed = {};

function onUpdate()
{
    requestAnimationFrame(onUpdate);

    renderer.render(scene, camera);

    updateCamera(camera, keysPressed, clock);
    displayCameraPosition(camera);
    displayDelta(clock);
}

function displayDelta(clock) {
    const delta = clock.getDelta();
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.right = '0';
    div.style.color = 'white';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.padding = '5px';
    div.innerHTML = `Delta: ${delta.toFixed(5)}`;
    document.body.appendChild(div);
}

// Add event listeners for keydown and keyup events
document.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
});

loadModel('Icelandic_mountain.gltf');
onUpdate();

function loadModel(modelName)
{
    const gltfLoader = new GLTFLoader();

    gltfLoader.setPath('./models/');
    gltfLoader.load(modelName,
    function (gltf)
    {
        scene.add(gltf.scene);
    },
    undefined,
    function (error)
    {
        console.error(error);
    });
}