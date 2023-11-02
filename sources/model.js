import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

class Model
{
	constructor(scene_ref)
	{
		this.gltfLoader = new GLTFLoader();
		this.gltfLoader.setPath('../assets/models/');

		this.objLoader = new OBJLoader();
		this.objLoader.setPath('../assets/models/');

		this.scene = scene_ref;
	}

	loadOBJ(modelName)
	{
		this.objLoader.load(
			modelName,
			(object) =>
			{
				this.scene.add(object);
			},
			(xhr) => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) => {
				console.error('An error happened', error);
			}
		);
	}

	loadGLTF(modelName)
	{
		this.gltfLoader.load(
			modelName,
			(gltf) =>
			{
				gltf.scene.traverse((child) => {
					if (child.isMesh) {
						child.material = new THREE.MeshPhysicalMaterial({
							color: 0x008585,
							transparent: false,
							opacity: 0.5,
						});
					}
				});
				this.scene.add(gltf.scene);
			},
			(xhr) =>
			{
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) =>
			{
				console.error('An error happened', error);
			}
		);
	}

	gltfLoader;
	objLoader;
	scene;
}

export { Model };