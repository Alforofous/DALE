import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

class DynamicPolygon extends Line2
{
	constructor()
	{
		const geometry = new LineGeometry();
		const material = new LineMaterial({ color: 0xFFA500, linewidth: 5 });
		super(geometry, material);
		this.layers.set(1);
		this.material.resolution.set(window.innerWidth, window.innerHeight);
		this.vertices = [];
	}

	addVertex(vertex)
	{
		this.vertices.push(vertex.x, vertex.y, vertex.z);
		this.geometry.dispose();
		this.geometry = new LineGeometry();
		this.geometry.setPositions(this.vertices);
	}
}

export { DynamicPolygon };