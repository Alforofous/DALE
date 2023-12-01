import * as THREE from 'three';

class FreeSurface extends THREE.Mesh
{
	constructor(size, normal, position)
	{
		normal.normalize();
		const planeGeometry = new THREE.PlaneGeometry(size.x, size.y, 10, 10);
		const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x4DACF3, wireframe: true, side: THREE.DoubleSide });

		super(planeGeometry, planeMaterial);
		this.lookAt(this.position.clone().add(normal));
		this.position.copy(position);

		this.plane = new THREE.Plane();
		this.plane.normal = normal;
		this.plane.setFromNormalAndCoplanarPoint(this.plane.normal, this.position);
	}
}

export { FreeSurface };