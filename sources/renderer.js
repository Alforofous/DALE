import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

class Renderer extends WebGLRenderer
{
	constructor(scene, camera)
	{
		super();
		this.domElement.style.position = 'relative';
		this.domElement.style.width = '75%';
		this.domElement.style.height = '100vh';
		this.domElement.style.left = `25%`;
		this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
		this.outlinePass.edgeStrength = 3.0;
		this.outlinePass.edgeThickness = 2.0;
	}
}

export { Renderer };