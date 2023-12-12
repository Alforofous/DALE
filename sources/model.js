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
		this.loadGLTF('Icelandic_mountain.gltf');
		this.loaded = false;
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
						child.material = new THREE.MeshPhongMaterial({
							vertexColors: true,
							wireframe: false,
							transparent: false,
							opacity: 1.0,
							side: THREE.DoubleSide,
						});
						this.scene.terrainMesh = child;

						this.positionAttribute = child.geometry.attributes.position;
						this.colors = new Float32Array(this.positionAttribute.count * 3);
						child.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

						let bottomColor = new THREE.Color(0x126F1C);
						let topColor = new THREE.Color(0xCDCDCD);
						this.changeModelColor(bottomColor, topColor);

						child.geometry.computeVertexNormals();
						child.geometry.computeBoundsTree();
					}
				});
				this.scene.add(gltf.scene);
				this.loaded = true;
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

	changeModelColor(bottomColor, topColor)
	{
		this.positionAttribute = this.scene.terrainMesh.geometry.attributes.position;
		let minY = Infinity;
		let maxY = -Infinity;
		for (let i = 0; i < this.positionAttribute.count; i++)
		{
			let y = this.positionAttribute.getY(i);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}

		for (let i = 0; i < this.positionAttribute.count; i++)
		{
			let y = this.positionAttribute.getY(i);
			let t = (y - minY) / (maxY - minY);
			t = Math.pow(t, 3.2);
			let color = new THREE.Color();
			color.lerpColors(bottomColor, topColor, t);

			this.colors[i * 3] = color.r;
			this.colors[i * 3 + 1] = color.g;
			this.colors[i * 3 + 2] = color.b;
		}
		this.scene.terrainMesh.geometry.attributes.color.needsUpdate = true;
	}
}

export { Model };