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

		this.geometry = geometry;
		this.instanceCount = instanceCount;
		this.info = {
			id: Array(instanceCount),
			parentFreeSurface: Array(instanceCount),
			height: Array(instanceCount),
		};
		for (let i = 0; i < instanceCount; i++)
		{
			this.info.id[i] = 'ID ' + i.toString();
			this.info.parentFreeSurface[i] = scene.freeSurface[0];
			this.info.height[i] = i + 1;
		}
		this.init(scene);
		this.labels.values = this.info.id;
		this.labels.initValues();
	}

	setId(id, index)
	{
		this.info[index].id = id;
	}

	init(scene)
	{
		let lambertShader = THREE.ShaderLib['lambert'];
		let boreholeShader = {
			uniforms: THREE.UniformsUtils.clone(lambertShader.uniforms),
		};

		this.vertexShaderCode = loadShaderSynchronous('sources/shaders/boreholeVertex.glsl');
		this.fragmentShaderCode = loadShaderSynchronous('sources/shaders/boreholeFragment.glsl');

		this.idSelectionVertexCode = loadShaderSynchronous('sources/shaders/idSelectionVertex.glsl');
		this.idSelectionFragmentCode = loadShaderSynchronous('sources/shaders/idSelectionFragment.glsl');

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
		this.geometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));

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
		this.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));

		let instanceHeight = new Float32Array(this.info.height);
		this.geometry.setAttribute('instanceHeight', new THREE.InstancedBufferAttribute(instanceHeight, 1));

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