import * as THREE from 'three';

class DrillHole extends THREE.Object3D
{
	constructor(spawnPosition, scene)
	{
		super();
		this.scene = scene;

		this.#createAndPosition(spawnPosition);
	}

	#createAndPosition(spawnPosition)
	{
		const height = Math.abs(this.scene.referenceHeight - spawnPosition.y);
		const cylinderGeometry = new THREE.CylinderGeometry(5, 5, height, 8);
		const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xF22F49, wireframe: false });
		this.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
		this.cylinder.name = 'cylinder';
		this.cylinder.layers.set(2);
		this.cylinder.position.y -= height / 2;

		this.position.copy(spawnPosition);
		this.add(this.cylinder);
		this.layers.set(2);
		this.name = 'drill_hole';
	}
}

export { DrillHole };