import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI/UI.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './UI/app.jsx';

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

document.body.style.margin = '0';
document.body.style.height = '100vh';
document.documentElement.style.height = '100vh';

const scene = new Scene();
const camera = new Camera();
const renderer = new Renderer(scene, camera);

const userInterface = new UI(renderer);
const mouse = new Mouse(renderer, scene, userInterface, camera);
const keyboard = new Keyboard(scene);
const clock = new THREE.Clock();

const fullDimensions = { left: 0, bottom: 0, width: 1, height: 1 };
const topLeftDimensions = { left: 0, bottom: 0.75, width: 0.25, height: 0.25 };
const topRightDimensions = { left: 0.75, bottom: 0.75, width: 0.25, height: 0.25 };
const bottomRightDimensions = { left: 0.75, bottom: 0, width: 0.25, height: 0.25 };
const bottomLeftDimensions = { left: 0, bottom: 0, width: 0.25, height: 0.25 };

const views = [
	{
		name: 'main',
		camera: camera,
		enableIdShader: false,
		useComposer: true,
		scene: scene,
		layers: 0xFFFFFFFF,
	},
	{
		name: 'boreholeIDs',
		camera: camera,
		enableIdShader: true,
		useComposer: false,
		scene: scene,
		layers: 1 << 10,
	},
	{
		name: 'boreholeOutlines',
		camera: camera,
		enableIdShader: false,
		useComposer: false,
		scene: scene,
		layers: 1 << 10,
	},
	{
		name: 'boreholeLabels',
		camera: camera,
		enableIdShader: false,
		useComposer: false,
		scene: scene,
		layers: 1 << 2,
	}
];

init();

function onTerrainMeshLoaded(scene)
{
	if (scene.terrainMesh !== undefined)
	{
		const tmpCount = scene.boreholes.count;
		scene.boreholes.count = scene.boreholes.instanceCount;
		scene.boreholes.scatterSelected();
		scene.boreholes.count = tmpCount;
	}
	else
	{
		setTimeout(() =>
		{
			onTerrainMeshLoaded(scene);
		}, 100);
	}
}

function init()
{
	userInterface.app = React.createRef();
	clock.start();

	scene.traverse((child) =>
	{
		if (child.isMesh)
		{
			child.geometry.computeBoundsTree();
		}
	});
	scene.boreholes.selector = mouse.boreholeSelector;
	scene.boreholes.userInterface = userInterface;
	onTerrainMeshLoaded(scene);
	onUpdate();
}

const root = createRoot(document.getElementById('root'));
root.render(<App
	scene={scene}
	userInterface={userInterface}
	ref={userInterface.app}
/>);

function onUpdate()
{
	userInterface.stats.forEach((stat) => stat.begin());
	const deltaTime = clock.getDelta();

	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	mouse.onUpdate();

	renderer.updateOutlineBoreholesTexture(renderer.outlineBoreholeRenderTarget, views[2], fullDimensions);
	renderer.updateOutlineBoreholesTexture(renderer.boreholeLabelRenderTarget, views[3], fullDimensions);
	renderer.renderViewport(views[0], fullDimensions);
	userInterface.showStats(userInterface.showViewport2);
	if (userInterface.showViewport2)
	{
		renderer.renderViewport(views[1], bottomRightDimensions);
		renderer.renderViewport(views[2], bottomLeftDimensions);
		renderer.renderViewport(views[3], topRightDimensions);
	}
	scene.boreholes.labels.updateUniforms(camera);

	userInterface.updateInfo(camera, deltaTime, scene, renderer);
	userInterface.stats.forEach((stat) => stat.end());
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
	renderer.outlineBoreholeRenderTarget.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
	renderer.boreholeLabelRenderTarget.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
	scene.boreholes.selector.initPixelBufferAndRenderTarget();
	renderer.composer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
	camera.updateAspectRatio();
});