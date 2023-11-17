import * as THREE from 'three';

let lambertShader = THREE.ShaderLib['lambert'];

let customLambertShader = {
	uniforms: THREE.UniformsUtils.clone(lambertShader.uniforms),
	vertexShader: lambertShader.vertexShader,
	fragmentShader: lambertShader.fragmentShader
};

customLambertShader.vertexShader = 'attribute float highlight;\nvarying float vHighlight;\n' + customLambertShader.vertexShader;
customLambertShader.vertexShader = customLambertShader.vertexShader.replace('#include <begin_vertex>', 'vHighlight = highlight;\n#include <begin_vertex>');

customLambertShader.fragmentShader = 'varying float vHighlight;\n' + customLambertShader.fragmentShader;
customLambertShader.fragmentShader = customLambertShader.fragmentShader.replace('#include <opaque_fragment>', '#include <opaque_fragment>\ngl_FragColor = vec4(mix(gl_FragColor.rgb, vec3(1.0), vHighlight * 0.2), gl_FragColor.a);');

class DrillHoles extends THREE.InstancedMesh
{
	constructor(spawnPosition, referenceHeight, instanceCount = 10000)
	{
		const height = Math.abs(referenceHeight - spawnPosition.y);
		const drillHoleGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		//console.log(customLambertShader.vertexShader);
		//console.log(customLambertShader.fragmentShader);
		const cylinderMaterial = new THREE.ShaderMaterial({
			uniforms: customLambertShader.uniforms,
			vertexShader: customLambertShader.vertexShader,
			fragmentShader: customLambertShader.fragmentShader,
			lights: true
		});

		cylinderMaterial.uniforms.diffuse.value.set(0x00ff00);

		drillHoleGeometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1));

		super(drillHoleGeometry, cylinderMaterial, instanceCount);

		this.instanceCount = instanceCount;
		this.drillHoleGeometry = drillHoleGeometry;
		this.name = 'drillHoles';
		this.layers.set(2);
	}
}

export { DrillHoles };