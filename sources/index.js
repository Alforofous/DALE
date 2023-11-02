import * as THREE from 'three';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI.js';
//use this if we want fixed point camera
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new Camera();
const renderer = new Renderer();
const mouse = new Mouse(renderer, camera);
const keyboard = new Keyboard();
const model = new Model(scene);
const clock = new THREE.Clock();
const userInterface = new UI();

init();

function init()
{
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);

	scene.add(cube);

	// Create a directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(0, 200, 0); // set the position of the light
	scene.add(directionalLight);

	// Create an ambient light
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	clock.start();
	model.loadGLTF('lowPolyMountain.gltf');

	onUpdate();
}

function onUpdate()
{
	requestAnimationFrame(onUpdate);

	renderer.render(scene, camera);

	if (document.pointerLockElement == null)
		mouse.isCaptured = false;
	camera.update(keyboard.pressedKeys, clock);
	const cameraLookAt = new THREE.Vector3(0, 0, 0);
	userInterface.updateInfo(camera.position, cameraLookAt, clock.getDelta());
}