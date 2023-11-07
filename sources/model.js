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
			(error) =>
			{
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
				gltf.scene.traverse((child) =>
				{
					if (child.isMesh)
					{
						let geometry = child.geometry;
						let positionAttribute = geometry.attributes.position;
						let colors = new Float32Array(positionAttribute.count * 3);

						let minY = Infinity;
						let maxY = -Infinity;
						for (let i = 0; i < positionAttribute.count; i++)
						{
							let y = positionAttribute.getY(i);
							minY = Math.min(minY, y);
							maxY = Math.max(maxY, y);
						}

						let bottomColor = new THREE.Color(0x004D00);
						let topColor = new THREE.Color(0xFFFFFF);

						for (let i = 0; i < positionAttribute.count; i++)
						{
							let y = positionAttribute.getY(i);
							let t = (y - minY) / (maxY - minY);
							t = Math.pow(t, 5);
							let color = new THREE.Color();
							color.lerpColors(bottomColor, topColor, t);

							colors[i * 3] = color.r;
							colors[i * 3 + 1] = color.g;
							colors[i * 3 + 2] = color.b;
						}

						geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

						child.material = new THREE.MeshPhongMaterial({
							vertexColors: true,
							wireframe: false,
							transparent: true,
							opacity: 1.0,
						});
						child.geometry.computeVertexNormals();
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