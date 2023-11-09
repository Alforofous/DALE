import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

class Renderer extends WebGLRenderer
{
	constructor(scene, camera)
	{
		super();
		this.setSize(window.innerWidth * 0.75, window.innerHeight);
		this.domElement.style.position = 'absolute';
		this.domElement.style.left = `${window.innerWidth * 0.25}px`;
		document.body.appendChild(this.domElement);
		this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
	}
}

export { Renderer };