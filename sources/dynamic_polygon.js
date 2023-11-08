import * as THREE from 'three';

class DynamicPolygon extends THREE.Line
{
	constructor()
	{
		const geometry = new THREE.BufferGeometry();
		const material = new THREE.LineBasicMaterial({ color: 0xFFA500 });
		super(geometry, material);
	}

	addVertex(vertex)
	{
		let vertices = this.geometry.attributes.position?.array;
		vertices = vertices ? Array.from(vertices) : [];
		vertices.push(vertex.x, vertex.y, vertex.z);
		this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.geometry.computeBoundingBox();
		this.geometry.computeBoundingSphere();
	}
}

export { DynamicPolygon };