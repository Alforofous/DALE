import { WebGLRenderer } from 'three';

class Renderer extends WebGLRenderer
{
	constructor()
	{
		super();
		this.setSize(window.innerWidth * 0.75, window.innerHeight);
		this.domElement.style.position = 'absolute';
		this.domElement.style.left = `${window.innerWidth * 0.25}px`;
		document.body.appendChild(this.domElement);
	}
}

export { Renderer };