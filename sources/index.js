import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

//use this if we want fixed point camera
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new Scene();
const camera = new Camera(scene);
const renderer = new Renderer(scene, camera);
const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera);
const keyboard = new Keyboard();
const model = new Model(scene);
const clock = new THREE.Clock();
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);

import Stats from 'stats.js';
let stats = new Stats();
document.body.appendChild(stats.dom);
init();

function init()
{
	clock.start();

	model.loadGLTF('Icelandic_mountain.gltf');
	composer.addPass(renderPass);
	composer.addPass(renderer.outlinePass);

	scene.traverse((child) =>
	{
		if (child.isMesh)
		{
			console.log(child);
			child.geometry.computeBoundsTree();
		}
	});
	onUpdate();
}

function onUpdate()
{
	stats.begin();
	const deltaTime = clock.getDelta();

	composer.render();
	mouse.onUpdate();
	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	userInterface.updateInfo(camera, deltaTime, scene);
	stats.end();
	requestAnimationFrame(onUpdate);
}
