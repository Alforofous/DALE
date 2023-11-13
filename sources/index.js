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
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.documentElement.style.height = '100vh';

const scene = new Scene();
const camera = new Camera(scene);
const renderer = new Renderer(scene, camera);

document.body.appendChild(renderer.domElement);
renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera);
const keyboard = new Keyboard();
const model = new Model(scene);
const clock = new THREE.Clock();
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);

const views = [
	{
		camera: camera,
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 1.0
	},
	{
		camera: camera,
		left: 0.75,
		bottom: 0,
		width: 0.25,
		height: 0.25
	}
];

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

	renderViewports();
	
	mouse.onUpdate();

	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	userInterface.updateInfo(camera, deltaTime, scene);
	stats.end();
	requestAnimationFrame(onUpdate);
}

function renderViewports()
{
	for (let i = 0; i < views.length; ++i)
	{
		const view = views[i];
		const camera = view.camera;

		const rendererBounds = renderer.domElement.getBoundingClientRect();
		const left = Math.floor(rendererBounds.width * view.left);
		const bottom = Math.floor(rendererBounds.height * view.bottom);
		const width = Math.floor(rendererBounds.width * view.width);
		const height = Math.floor(rendererBounds.height * view.height);
		renderer.setViewport(left, bottom, width, height);
		renderer.setScissor(left, bottom, width, height);
		renderer.setScissorTest(true);

		composer.render();
	}
}

window.addEventListener('resize', () =>
{
	renderer.domElement.style.position = 'relative';
	renderer.domElement.style.width = '75%';
	renderer.domElement.style.height = '100vh';
	renderer.domElement.style.left = `25%`;
	renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
});