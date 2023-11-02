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
			for (let i = 0; i < positions.count; i++)
			{
				let vertex = new THREE.Vector3(positions.array[i * 3], positions.array[i * 3 + 1], positions.array[i * 3 + 2]);
				vertex.applyMatrix4(intersection.object.matrixWorld);
				if (vertex.distanceTo(intersection.point) < range)
				{
					indicesInRange.push(i);
				}
			}
			if (indicesInRange.length > 0)
			{
				console.log('Vertices within range:', indicesInRange);

				// Create marker objects at the vertices within range
				const markerGeometry = new THREE.SphereGeometry(1, 32, 32);
				const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
				for (let i = 0; i < indicesInRange.length; i++)
				{
					let vertex = new THREE.Vector3(positions.array[indicesInRange[i] * 3], positions.array[indicesInRange[i] * 3 + 1], positions.array[indicesInRange[i] * 3 + 2]);
					vertex.applyMatrix4(intersection.object.matrixWorld);

					const marker = new THREE.Mesh(markerGeometry, markerMaterial);
					marker.position.copy(vertex);
					scene.add(marker);

					let displacementWorld = new THREE.Vector3(0, -1, 0);
					let matrixWorldInverse = new THREE.Matrix4().copy(intersection.object.matrixWorld).invert();
					let displacementObject = displacementWorld.applyMatrix4(matrixWorldInverse);

					positions.array[indicesInRange[i] * 3] += displacementObject.x;
					positions.array[indicesInRange[i] * 3 + 1] += displacementObject.y;
					positions.array[indicesInRange[i] * 3 + 2] += displacementObject.z;

					// Remove the marker after 3 seconds
					setTimeout(() =>
					{
						scene.remove(marker);
					}, 3000);
				}

				let indices = geometry.index;
				for (let i = 0; i < indices.count; i += 3)
				{
					// Get the indices of the vertices for this face
					let a = indices.array[i];
					let b = indices.array[i + 1];
					let c = indices.array[i + 2];

					// Check if any of the vertices for this face have been moved
					if (indicesInRange.includes(a) || indicesInRange.includes(b) || indicesInRange.includes(c))
					{
						// Update the indices to point to the new vertex positions
						// This is a placeholder - you'll need to replace this with the actual new indices
						indices.array[i] = a;
						indices.array[i + 1] = b;
						indices.array[i + 2] = c;
					}
				}

				indices.needsUpdate = true;
				positions.needsUpdate = true;
			}
		}
	}
}, false);