import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI/UI.js';
import { BoreHoles } from './boreHole/boreHoles.js';

//MIGHT REMOVE
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

document.body.style.margin = '0';
document.body.style.height = '100vh';
document.documentElement.style.height = '100vh';

const scene = new Scene();
const camera = new Camera();
const boreHoleCamera = new Camera();
boreHoleCamera.layers.set(10);
const renderer = new Renderer(scene, camera, boreHoleCamera);

const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera, boreHoleCamera);
const keyboard = new Keyboard(scene);
const model = new Model(scene);
const clock = new THREE.Clock();

const views = [
	{
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 1.0,
		camera: camera,
	},
	{
		left: 0.75,
		bottom: 0,
		width: 0.25,
		height: 0.25,
		camera: boreHoleCamera,
	}
];

init();

function init()
{
	clock.start();

	model.loadGLTF('Icelandic_mountain.gltf');

	scene.traverse((child) =>
	{
		if (child.isMesh)
		{
			child.geometry.computeBoundsTree();
		}
	});

	scene.boreHoles = new BoreHoles(new THREE.Vector3(0, 50, 0), scene.referenceHeight, 1000);
	scene.boreHoles.init(scene).then(() =>
	{
		//scene.boreHoles.initSprites(scene);
		scene.boreHoles.selector = mouse.boreHoleSelector;
		onUpdate();
	});
}

function onUpdate()
{
	userInterface.stats.begin();
	const deltaTime = clock.getDelta();

	
	mouse.onUpdate();
	renderer.composer.passes[0].enabled = true;
	renderer.composer.passes[1].enabled = false;
	renderer.renderViewport(views[0], false);

	if (userInterface.showViewport2)
	{
		renderer.composer.passes[0].enabled = false;
		renderer.composer.passes[1].enabled = true;
		renderer.renderViewport(views[1], true);
	}

	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	boreHoleCamera.update(keyboard.pressedKeyCode, deltaTime);

	userInterface.updateInfo(camera, deltaTime, scene, renderer);
	userInterface.stats.end();
	requestAnimationFrame(onUpdate);
	renderer.info.reset();
}

window.addEventListener('resize', () =>
{
	renderer.domElement.style.position = 'relative';
	renderer.domElement.style.width = '75%';
	renderer.domElement.style.height = '100vh';
	renderer.domElement.style.left = `25%`;
	renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
	renderer.composer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
});