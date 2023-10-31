import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const cameraPositionDiv = document.createElement('div');
cameraPositionDiv.style.position = 'absolute';
cameraPositionDiv.style.top = '0';
cameraPositionDiv.style.left = '0';
cameraPositionDiv.style.color = 'white';
cameraPositionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cameraPositionDiv.style.padding = '5px';
document.body.appendChild(cameraPositionDiv);

const deltaDiv = document.createElement('div');
deltaDiv.style.position = 'absolute';
deltaDiv.style.top = '0';
deltaDiv.style.right = '0';
deltaDiv.style.color = 'white';
deltaDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
deltaDiv.style.padding = '5px';
document.body.appendChild(deltaDiv);

let isCapturingMouse = false;

document.addEventListener('click', function (event)
{
	if (event.button === 0 && event.target === renderer.domElement) {
		isCapturingMouse = true;
		document.body.requestPointerLock();
	}
});

document.addEventListener('pointerlockchange', function ()
{
	if (!document.pointerLockElement && isCapturingMouse) {
		document.body.requestPointerLock();
	}
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.75 / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.75, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.left = `${window.innerWidth * 0.25}px`;
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

import { cameraInput, updateCamera } from './camera.js';

let clock = new THREE.Clock();
clock.start();
let keysPressed = {};

let mouseMovement = { x: 0, y: 0 };
let lastMousePosition = { x: 0, y: 0 };

function onUpdate()
{
	requestAnimationFrame(onUpdate);

	renderer.render(scene, camera);

	if (isCapturingMouse)
	{
		mouseMovement = { x: 0, y: 0 };
	}
	updateCamera(camera, keysPressed, mouseMovement, clock);

	const position = camera.position;
	cameraPositionDiv.innerHTML = `Camera Position: x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}, z: ${position.z.toFixed(2)}`;

	const delta = clock.getDelta();
	deltaDiv.innerHTML = `Delta: ${delta.toFixed(5)}`;

	mouseMovement.x = 0;
	mouseMovement.y = 0;
}

document.addEventListener('mousemove', function (event) {
	mouseMovement.x = event.clientX - lastMousePosition.x;
	mouseMovement.y = event.clientY - lastMousePosition.y;
	lastMousePosition.x = event.clientX;
	lastMousePosition.y = event.clientY;
});

cameraPositionDiv.style.zIndex = '1';
deltaDiv.style.zIndex = '1';

document.addEventListener('keydown', function (event) {
	keysPressed[event.key] = true;
});

document.addEventListener('keyup', function (event) {
	keysPressed[event.key] = false;
});

loadModel('Icelandic_mountain.gltf');
onUpdate();

function loadModel(modelName) {
	const gltfLoader = new GLTFLoader();

	gltfLoader.setPath('./models/');
	gltfLoader.load(modelName,
		function (gltf) {
			scene.add(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error);
		});
}