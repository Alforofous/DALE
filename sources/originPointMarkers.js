import * as THREE from 'three';

class OriginPointMarkers
{
	constructor(objects, scene)
	{
		let positions = new Float32Array(objects.length * 3);
		let geometry = new THREE.BufferGeometry();

		for (let i = 0; i < objects.length; i++)
		{
			let position = objects[i].getWorldPosition(new THREE.Vector3());
			positions[i * 3] = position.x;
			positions[i * 3 + 1] = position.y;
			positions[i * 3 + 2] = position.z;
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		let material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 15,
			depthTest: false
		});
		this.points = new THREE.Points(geometry, material);
		this.scene = scene;
		scene.add(this.points);
	}

	deletePoints()
	{
		this.scene.remove(this.points);
	}
}

export { OriginPointMarkers };