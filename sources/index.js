import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI/UI.js';
import { DrillHoles } from './drillHole/drillHoles.js';

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
const drillHoleCamera = camera.clone();
drillHoleCamera.layers.set(2);
const renderer = new Renderer(scene, camera, drillHoleCamera);

const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera);
const keyboard = new Keyboard();
const model = new Model(scene);
const clock = new THREE.Clock();

const views = [
	{
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 1.0
	},
	{
		left: 0.75,
		bottom: 0,
		width: 0.25,
		height: 0.25
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
			console.log(child);
			child.geometry.computeBoundsTree();
		}
	});

	scene.drillHoles = new DrillHoles(new THREE.Vector3(0, 50, 0), scene.referenceHeight, 100000);
	scene.add(scene.drillHoles);
	onUpdate();
}

function onUpdate()
{
	userInterface.stats.begin();
	const deltaTime = clock.getDelta();

	renderViewports();
	
	mouse.onUpdate();

	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	drillHoleCamera.update(keyboard.pressedKeyCode, deltaTime);
	userInterface.updateInfo(camera, deltaTime, scene, renderer);
	userInterface.stats.end();
	requestAnimationFrame(onUpdate);
	renderer.info.reset();
}

function renderViewports()
{
	for (let i = 0; i < views.length; ++i)
	{
		if (i == 0)
		{
			renderer.composer.passes[0].enabled = true;
			renderer.composer.passes[1].enabled = false;
		}
		else if (i == 1)
		{
			renderer.composer.passes[0].enabled = false;
			renderer.composer.passes[1].enabled = true;
			if (!userInterface.showViewport2)
				break;
		}

		const view = views[i];

		const rendererBounds = renderer.domElement.getBoundingClientRect();
		const left = Math.floor(rendererBounds.width * view.left);
		const bottom = Math.floor(rendererBounds.height * view.bottom);
		const width = Math.floor(rendererBounds.width * view.width);
		const height = Math.floor(rendererBounds.height * view.height);
		renderer.setViewport(left, bottom, width, height);
		renderer.setScissor(left, bottom, width, height);
		renderer.setScissorTest(true);

		renderer.composer.render();
	}
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