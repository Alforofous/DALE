import * as THREE from 'three';
import { loadShaderSynchronous } from '../shaders/shaderLoader.js';
import { BoreholeLabels } from './boreholeLabels.js';

class Boreholes extends THREE.InstancedMesh
{
	constructor(instanceCount = 100000, scene)
	{
		const geometry = new THREE.CylinderGeometry(5, 5, 1, 8);
		const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(geometry, tempMaterial, instanceCount);

		this.frustumCulled = false;
		this.geometry = geometry;
		this.instanceCount = instanceCount;

		this.#initInfo(scene);
		this.#loadShaders();
		this.#initMaterial();
		this.#initHighlightAttribute();
		this.#initInstanceUUIDsAttribute();
		this.#initInstanceHeightAttribute();
		this.#initLabels();

		this.layers.set(10);
		this.geometry.computeBoundsTree();
		scene.add(this);
		scene.add(this.labels);
	}

	switchToDefaultShader()
	{
		this.material.vertexShader = this.vertexShaderCode;
		this.material.fragmentShader = this.fragmentShaderCode;
		this.material.needsUpdate = true;
	}

	switchToIdShader()
	{
		this.material.vertexShader = this.idSelectionVertexCode;
		this.material.fragmentShader = this.idSelectionFragmentCode;
		this.material.needsUpdate = true;
	}

	setId(id, index)
	{
		this.info[index].id = id;
	}

	#initInfo(scene)
	{
		this.info = {
			id: Array(this.instanceCount),
			parentFreeSurface: Array(this.instanceCount),
			height: Array(this.instanceCount),
		};
		for (let i = 0; i < this.instanceCount; i++)
		{
			this.info.id[i] = 'ID ' + i.toString();
			this.info.parentFreeSurface[i] = scene.freeSurface[0];
			this.info.height[i] = i + 1;
		}
	}

	#initHighlightAttribute()
	{
		this.geometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));
	}

	#initLabels()
	{
		const fontName = 'andale_mono';
		this.labels = new BoreholeLabels('assets/textures/fontAtlas/' + fontName + '.png', 'assets/fontAtlasData/' + fontName + '.json', this.instanceCount, this);
		this.labels.geometry.computeBoundsTree();
		this.labels.values = this.info.id;
		this.labels.initValues();
	}

	#initMaterial()
	{
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				...this.lambertShader.uniforms,
				uBoreholeIdTexture: { value: null },
				uResolution: { value: new THREE.Vector2() },
			},
			vertexShader: this.idSelectionVertexCode,
			fragmentShader: this.idSelectionFragmentCode,
			lights: true
		});
		this.material.uniforms.diffuse.value.set(0x004C5A);
	}

	#initInstanceUUIDsAttribute()
	{
		let instanceUUIDs = new Float32Array(this.instanceCount * 3);
		for (let i = 0; i < this.instanceCount; i++)
		{
			let instanceId = i + 1;
			let r = (instanceId & 0xFF0000) >> 16;
			let g = (instanceId & 0x00FF00) >> 8;
			let b = instanceId & 0x0000FF;
		
			instanceUUIDs[i * 3] = r / 255;
			instanceUUIDs[i * 3 + 1] = g / 255;
			instanceUUIDs[i * 3 + 2] = b / 255;
		}
		this.geometry.setAttribute('instanceUUID', new THREE.InstancedBufferAttribute(instanceUUIDs, 3));
	}

	#initInstanceHeightAttribute()
	{
		let instanceHeight = new Float32Array(this.info.height);
		this.geometry.setAttribute('instanceHeight', new THREE.InstancedBufferAttribute(instanceHeight, 1));
	}

	#loadShaders()
	{
		this.lambertShader = THREE.ShaderLib['lambert'];

		this.vertexShaderCode = loadShaderSynchronous('sources/shaders/boreholeVertex.glsl');
		this.fragmentShaderCode = loadShaderSynchronous('sources/shaders/boreholeFragment.glsl');

		this.idSelectionVertexCode = loadShaderSynchronous('sources/shaders/idSelectionVertex.glsl');
		this.idSelectionFragmentCode = loadShaderSynchronous('sources/shaders/idSelectionFragment.glsl');
	}
}

export { Boreholes };