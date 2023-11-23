import * as THREE from 'three';
import TextSprite from '@seregpie/three.text-sprite';
import { loadShader } from '../shaders/shaderLoader.js';
import { BoreHoleLabels } from './boreHoleLabels.js';

class BoreHoles extends THREE.InstancedMesh
{
	constructor(spawnPosition, referenceHeight, instanceCount = 10000)
	{
		const height = Math.abs(referenceHeight - spawnPosition.y);
		const boreHoleGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(boreHoleGeometry, tempMaterial, instanceCount);

		this.boreHoleGeometry = boreHoleGeometry;
		this.instanceCount = instanceCount;
		this.sprites = [];
	}

	initSprites(scene)
	{
		for (let i = 0; i < this.instanceCount; i++)
		{
			let sprite = new TextSprite({
				alignment: 'center',
				color: '#ffffff',
				fontFamily: '"Times New Roman", Times, serif',
				fontSize: 8,
				fontStyle: 'italic',
				text: i.toString(),
			});
			this.sprites.push(sprite);
			scene.add(sprite);
		}
		this.updateSprites();
	}

	updateSprites()
	{
		let matrix = new THREE.Matrix4();
		for (let i = 0; i < this.sprites.length; i++)
		{
			this.getMatrixAt(i, matrix);
			let position = new THREE.Vector3().setFromMatrixPosition(matrix);
			position.y += this.boreHoleGeometry.parameters.height / 2 + 5;
			this.sprites[i].position.copy(position);
		}
	}

	async init(scene)
	{
		let lambertShader = THREE.ShaderLib['lambert'];
		let customLambertShader = {
			uniforms: THREE.UniformsUtils.clone(lambertShader.uniforms),
		};

		this.vertexShaderCode = await loadShader('sources/shaders/customLambertVertex.glsl');
		this.fragmentShaderCode = await loadShader('sources/shaders/customLambertFragment.glsl');

		this.idSelectionVertexCode = await loadShader('sources/shaders/idSelectionVertex.glsl');
		this.idSelectionFragmentCode = await loadShader('sources/shaders/idSelectionFragment.glsl');

		const cylinderMaterial = new THREE.ShaderMaterial({
			uniforms: customLambertShader.uniforms,
			vertexShader: this.idSelectionVertexCode,
			fragmentShader: this.idSelectionFragmentCode,
			lights: true
		});

		cylinderMaterial.uniforms.diffuse.value.set(0x004C5A);

		this.material = cylinderMaterial;
		this.boreHoleGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));

		let instanceColors = new Float32Array(this.instanceCount * 3);
		for (let i = 0; i < this.instanceCount; i++)
		{
			let r = (i & 0xFF0000) >> 16;
			let g = (i & 0x00FF00) >> 8;
			let b = i & 0x0000FF;
		
			instanceColors[i * 3] = r / 255;
			instanceColors[i * 3 + 1] = g / 255;
			instanceColors[i * 3 + 2] = b / 255;
		}
		this.boreHoleGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));

		this.name = 'boreHoles';
		this.layers.set(10);
		this.geometry.computeBoundsTree();

		this.labels = new BoreHoleLabels('assets/textures/fontAtlas/courier.png', 'assets/fontAtlasData/courier.json', this.instanceCount);
		scene.add(this);
		scene.add(this.labels);
	}

	switchToIdShader()
	{
		this.material.vertexShader = this.idSelectionVertexCode;
		this.material.fragmentShader = this.idSelectionFragmentCode;
	}

	switchToDefaultShader()
	{
		this.material.vertexShader = this.vertexShaderCode;
		this.material.fragmentShader = this.fragmentShaderCode;
	}
}

export { BoreHoles };