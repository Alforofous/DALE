import * as THREE from 'three';
import { Scene } from './scene.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Model } from './model.js';
import { Mouse } from './mouse.js';
import { Keyboard } from './keyboard.js';
import { UI } from './UI/UI.js';
import { Boreholes } from './boreholes/boreholes.js';

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
const boreholeCamera = new Camera();
boreholeCamera.layers.set(10);
const renderer = new Renderer(scene, camera, boreholeCamera);

const userInterface = new UI(scene);
const mouse = new Mouse(renderer, scene, userInterface, camera, boreholeCamera);
const keyboard = new Keyboard(scene);
const model = new Model(scene);
const clock = new THREE.Clock();

const views = [
	{
		name: 'main',
		left: 0,
		bottom: 0,
		width: 1.0,
		height: 1.0,
		camera: camera,
		enableIdShader: false,
		useComposer: true,
	},
	{
		name: 'debug1',
		left: 0.75,
		bottom: 0,
		width: 0.25,
		height: 0.25,
		camera: boreholeCamera,
		enableIdShader: true,
		useComposer: false,
	},
	{
		name: 'debug2',
		left: 0,
		bottom: 0,
		width: 0.25,
		height: 0.25,
		camera: boreholeCamera,
		enableIdShader: false,
		useComposer: false,
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

	scene.boreholes = new Boreholes(100, scene);
	scene.boreholes.selector = mouse.boreholeSelector;
	onUpdate();
}

function onUpdate()
{
	userInterface.stats.begin();
	const deltaTime = clock.getDelta();

	keyboard.onUpdate(userInterface);
	camera.update(keyboard.pressedKeyCode, deltaTime);
	boreholeCamera.update(keyboard.pressedKeyCode, deltaTime);
	mouse.onUpdate();

	renderer.updateOutlineBoreholesTexture();
	renderer.renderViewport(views[0]);
	if (userInterface.showViewport2)
	{
		renderer.renderViewport(views[2]);
		renderer.renderViewport(views[1]);
	}

	if (scene.boreholes.labels.material.uniforms)
	{
		let uCameraForward = camera.getWorldDirection(new THREE.Vector3());
		scene.boreholes.labels.material.uniforms.uCameraForward.value = uCameraForward;

		let cameraUp = camera.up;
		let uCameraRight = new THREE.Vector3().crossVectors(uCameraForward, cameraUp).normalize();
		let uCameraUp = new THREE.Vector3().crossVectors(uCameraRight, uCameraForward).normalize();
		scene.boreholes.labels.material.uniforms.uCameraUp.value = uCameraUp;
		scene.boreholes.labels.material.uniforms.uCameraRight.value = uCameraRight;
	}

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
	renderer.outlineBoreholeRenderTarget.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
	scene.boreholes.selector.initPixelBufferAndRenderTarget();
	renderer.composer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
});