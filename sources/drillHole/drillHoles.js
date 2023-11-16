import * as THREE from 'three';

let vertexDrillHoleShader = `
    attribute float highlight;
    varying float vHighlight;
    void main() {
        vHighlight = highlight;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

let fragmentDrillHoleShader = `
	varying float vHighlight;
	void main() {
		vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 1.0, 1.0), vHighlight);
		gl_FragColor = vec4(color, 1.0);
	}
`;

class DrillHoles extends THREE.InstancedMesh
{
	constructor(spawnPosition, scene, instanceCount = 10000)
	{
		const height = Math.abs(scene.referenceHeight - spawnPosition.y);
		const drillHoleGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		const cylinderMaterial = new THREE.ShaderMaterial(
			{
				vertexShader: vertexDrillHoleShader,
				fragmentShader: fragmentDrillHoleShader
			});
		drillHoleGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1));

		super(drillHoleGeometry, cylinderMaterial, instanceCount);

		this.scene = scene;
		this.instanceCount = instanceCount;
		this.drillHoleGeometry = drillHoleGeometry;
		/*
		const matrix = new THREE.Matrix4();
		for (let i = 0; i < maxInstances; i++)
		{
			matrix.set(3, 3, 0);
			this.setMatrixAt(i, matrix);
		}
		this.instanceMatrix.needsUpdate = true;
		*/
		this.name = 'drillHoles';
	}
}

export { DrillHoles };