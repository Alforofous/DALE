import * as THREE from 'three';

async function loadShader(url)
{
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

class DrillHoles extends THREE.InstancedMesh
{
	constructor(spawnPosition, referenceHeight, instanceCount = 10000)
	{
		const height = Math.abs(referenceHeight - spawnPosition.y);
		const drillHoleGeometry = new THREE.CylinderGeometry(5, 5, height, 3);
		super(drillHoleGeometry, null, instanceCount);

		this.drillHoleGeometry = drillHoleGeometry;
		this.instanceCount = instanceCount;
	}

	async init()
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
		this.drillHoleGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));

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
		this.drillHoleGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));

		this.name = 'drillHoles';
		this.layers.set(2);
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

export { DrillHoles };