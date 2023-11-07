import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI.js';
//use this if we want fixed point camera
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new Scene();
const camera = new Camera(scene);
const renderer = new Renderer();
const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera);
const keyboard = new Keyboard();
const model = new Model(scene);
const clock = new THREE.Clock();

import Stats from 'stats.js';
let stats = new Stats();
document.body.appendChild(stats.dom);

init();

function init()
{
	clock.start();

	model.loadGLTF('Icelandic_mountain.gltf');

	onUpdate();
}

function onUpdate()
{
	stats.begin();
	const deltaTime = clock.getDelta();

	renderer.render(scene, camera);
	mouse.onUpdate();
	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	userInterface.updateInfo(camera, deltaTime, scene);
	stats.end();
	requestAnimationFrame(onUpdate);
}