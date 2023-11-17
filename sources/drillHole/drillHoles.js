import * as THREE from 'three';

let lambertShader = THREE.ShaderLib['lambert'];

let customLambertShader = {
	uniforms: THREE.UniformsUtils.clone(lambertShader.uniforms),
};

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
		const drillHoleGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		super(drillHoleGeometry, null, instanceCount);

		this.drillHoleGeometry = drillHoleGeometry;
		this.instanceCount = instanceCount;
		this.init(instanceCount);
	}

	async init(instanceCount)
	{
		const vertexShaderCode = await loadShader('sources/shaders/customVertexLambertShader.glsl');
		const fragmentShaderCode = await loadShader('sources/shaders/customFragmentLambertShader.glsl');

		const cylinderMaterial = new THREE.ShaderMaterial({
			uniforms: customLambertShader.uniforms,
			vertexShader: vertexShaderCode,
			fragmentShader: fragmentShaderCode,
			lights: true
		});

		console.log(fragmentShaderCode);
		console.log(vertexShaderCode);

		cylinderMaterial.uniforms.diffuse.value.set(0x004C5A);

		this.material = cylinderMaterial;
		this.drillHoleGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1));

		let instanceColors = new Float32Array(instanceCount * 3);
		for (let i = 0; i < instanceCount * 3; i++)
			instanceColors[i] = i / instanceCount;
		this.drillHoleGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instanceColors, 3));

		this.name = 'drillHoles';
		this.layers.set(2);
	}
}

export { DrillHoles };