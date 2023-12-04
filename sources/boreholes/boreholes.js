import * as THREE from 'three';

class Borehole extends THREE.Mesh
{
	constructor()
	{
		const geometry = new THREE.CylinderGeometry(5, 5, 1, 8);
		const material = new THREE.MeshLambertMaterial({ color: 0x5D5D5D });
		super(geometry, material);

		this.layers.set(10);
		this.geometry.computeBoundsTree();
		this.top = new THREE.Vector3(0, 100, 0);
		this.bottom = new THREE.Vector3(0, 0, 0);
	}

	updateGeometryProperties()
	{
		const midPoint = new THREE.Vector3().addVectors(this.top, this.bottom).multiplyScalar(0.5);
		const direction = new THREE.Vector3().subVectors(this.top, this.bottom).normalize();
		const angle = Math.acos(direction.y);
		const length = this.top.distanceTo(this.bottom);

		this.scale.y = length;
		this.position.copy(midPoint);
		this.rotation.x = angle;
		this.matrixWorldNeedsUpdate = true;
	}
}

export { Borehole };