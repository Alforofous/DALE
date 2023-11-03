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
	const geometry = new THREE.BoxGeometry(20, 20, 20);
	const material = new THREE.MeshBasicMaterial({ color: 0x780000 });
	const cube = new THREE.Mesh(geometry, material);

	scene.add(cube);

	// Create a point light
	const pointLight = new THREE.PointLight(0xffffff, 1000000, 0);
	pointLight.position.set(50, 1000, 50); // set the position of the light
	pointLight.castShadow = true; // default false
	scene.add(pointLight);

	// Create a helper for the point light
	const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
	scene.add(pointLightHelper);

	// Create an ambient light
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambientLight);

	clock.start();
	//model.loadGLTF('lowPolyMountain.gltf');
	model.loadGLTF('Icelandic_mountain.gltf');

	onUpdate();
}

function onUpdate()
{
	const deltaTime = clock.getDelta();
	requestAnimationFrame(onUpdate);

	renderer.render(scene, camera);
	camera.update(keyboard.pressedKeys, deltaTime);
	userInterface.updateInfo(camera, deltaTime);
}

let raycaster = new THREE.Raycaster();
let ray = new THREE.Vector2();

window.addEventListener('mousemove', function (event)
{
	let rect = renderer.domElement.getBoundingClientRect();
	ray.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	ray.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}, false);

window.addEventListener('mousedown', function (event)
{
	// Raycast to the scene
	raycaster.setFromCamera(ray, camera);
	let intersects = raycaster.intersectObjects(scene.children, true);

	if (intersects.length > 0)
	{
		let intersection = intersects[0];

		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			let positions = intersection.object.geometry.attributes.position;

			let range = 100; // Replace with your range
			let indicesInRange = [];
			const markerGeometry = new THREE.SphereGeometry(1, 32, 32);
			const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
			for (let i = 0; i < positions.count; i++)
			{
				let vertexLocal = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
				let vertexWorld = vertexLocal.applyMatrix4(intersection.object.matrixWorld);
				if (vertexWorld.distanceTo(intersection.point) < range)
				{
					indicesInRange.push(i);

					let displacementWorld = new THREE.Vector3(0, -5, 0);
					let matrixWorldInverse = new THREE.Matrix4().copy(intersection.object.matrixWorld).invert();
					let displacementObject = displacementWorld.applyMatrix4(matrixWorldInverse);

					const x = positions.getX(i);
					const y = positions.getY(i);
					const z = positions.getZ(i);

					positions.setY(i, y + displacementObject.y);

					const marker = new THREE.Mesh(markerGeometry, markerMaterial);
					marker.ignoreRaycast = true;
					marker.position.copy(vertexWorld);
					scene.add(marker);
					// Remove the marker after 3 seconds
					setTimeout(() =>
					{
						scene.remove(marker);
					}, 1000);
				}
			}
			positions.needsUpdate = true;
			intersection.object.geometry.computeVertexNormals();
		}
	}
}, false);