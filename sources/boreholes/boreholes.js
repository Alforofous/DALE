import * as THREE from 'three';
import { loadShader } from '../shaders/shaderLoader.js';
import { BoreholeLabels } from './boreholeLabels.js';

class Boreholes extends THREE.InstancedMesh
{
	constructor(spawnPosition, referenceHeight, instanceCount = 100000)
	{
		const height = Math.abs(referenceHeight - spawnPosition.y);
		const boreholeGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(boreholeGeometry, tempMaterial, instanceCount);

		this.boreholeGeometry = boreholeGeometry;
		this.instanceCount = instanceCount;
		this.info = [];
		for (let i = 0; i < instanceCount; i++)
		{
			this.info.push({ id: 'id: ' + i.toString() });
		}
	}

	setId(id, index)
	{
		this.info[index].id = id;
	}

	async init(scene)
	{
		let lambertShader = THREE.ShaderLib['lambert'];
		let boreholeShader = {
			uniforms: THREE.UniformsUtils.clone(lambertShader.uniforms),
		};

		this.vertexShaderCode = await loadShader('sources/shaders/boreholeVertex.glsl');
		this.fragmentShaderCode = await loadShader('sources/shaders/boreholeFragment.glsl');

		this.idSelectionVertexCode = await loadShader('sources/shaders/idSelectionVertex.glsl');
		this.idSelectionFragmentCode = await loadShader('sources/shaders/idSelectionFragment.glsl');

		const cylinderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				...boreholeShader.uniforms,
				uBoreholeIdTexture: { value: null },
				uResolution: { value: new THREE.Vector2() },
			},
			vertexShader: this.idSelectionVertexCode,
			fragmentShader: this.idSelectionFragmentCode,
			lights: true
		});

		cylinderMaterial.uniforms.diffuse.value.set(0x004C5A);

		this.material = cylinderMaterial;
		this.boreholeGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));

		let instanceColors = new Float32Array(this.instanceCount * 3);
		for (let i = 0; i < this.instanceCount; i++)
		{
			let instanceId = i + 1;
			let r = (instanceId & 0xFF0000) >> 16;
			let g = (instanceId & 0x00FF00) >> 8;
			let b = instanceId & 0x0000FF;
		
			instanceColors[i * 3] = r / 255;
			instanceColors[i * 3 + 1] = g / 255;
			instanceColors[i * 3 + 2] = b / 255;
		}
		this.boreholeGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));

		this.name = 'boreholes';
		this.layers.set(10);
		this.geometry.computeBoundsTree();

		const fontName = 'andale_mono';
		this.labels = new BoreholeLabels('assets/textures/fontAtlas/' + fontName + '.png', 'assets/fontAtlasData/' + fontName + '.json', this.instanceCount, this);
		this.labels.geometry.computeBoundsTree();
		scene.add(this);
		scene.add(this.labels);
	}

	switchToIdShader()
	{
		this.material.vertexShader = this.idSelectionVertexCode;
		this.material.fragmentShader = this.idSelectionFragmentCode;
		this.material.needsUpdate = true;
	}

	switchToDefaultShader()
	{
		this.material.vertexShader = this.vertexShaderCode;
		this.material.fragmentShader = this.fragmentShaderCode;
		this.material.needsUpdate = true;
	}
}

export { Boreholes };