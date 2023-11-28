import * as THREE from 'three';

class FreeSurface extends THREE.Mesh
{
	constructor(size, normal, position)
	{
		const planeGeometry = new THREE.PlaneGeometry(size.x, size.y, 10, 10);
		const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x4DACF3, wireframe: true });

		super(planeGeometry, planeMaterial);
		this.lookAt(this.position.clone().add(normal));
		this.position.copy(position);
	}
}

export { FreeSurface };