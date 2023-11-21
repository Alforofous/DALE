import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { EffectComposer, EffectPass, RenderPass, OutlineEffect } from "postprocessing";

class Renderer extends WebGLRenderer
{
	constructor(scene, camera, boreHoleCamera)
	{
		super();
		this.scene = scene;
		this.camera = camera;
		this.boreHoleCamera = boreHoleCamera;
		this.domElement.style.position = 'relative';
		this.domElement.style.width = '75%';
		this.domElement.style.height = '100vh';
		this.domElement.style.left = `25%`;

		this.outlineEffectSetup();

		this.composer = new EffectComposer(this);
		this.composer.addPass(new RenderPass(this.scene, camera), 0);
		this.composer.addPass(new RenderPass(this.scene, boreHoleCamera), 1);
		this.composer.addPass(new EffectPass(camera, this.outlineEffect), 2);

		document.body.appendChild(this.domElement);
		this.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
		this.composer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);

		this.info.autoReset = false;
		this.autoClear = true;
	}

	outlineEffectSetup()
	{
		this.outlineEffect = new OutlineEffect(
			this.scene,
			this.camera,
			{
				xRay: true,
				pulseSpeed: 0.5,
				visibleEdgeColor: 0x379CA5,
				hiddenEdgeColor: 0xFFFFFF,
				edgeStrength: 3.0,
				blur: false,
			}
		);
	}

	renderViewport(view = {left: 0, bottom: 0, width: 1, height: 1, camera: undefined}, enableIDShader)
	{
		if (enableIDShader === false)
			this.scene.boreHoles.switchToDefaultShader();
		else
			this.scene.boreHoles.switchToIdShader();

		const rendererBounds = this.domElement.getBoundingClientRect();
		const left = Math.floor(rendererBounds.width * view.left);
		const bottom = Math.floor(rendererBounds.height * view.bottom);
		const width = Math.floor(rendererBounds.width * view.width);
		const height = Math.floor(rendererBounds.height * view.height);
		this.setViewport(left, bottom, width, height);
		this.setScissor(left, bottom, width, height);
		this.setScissorTest(true);
		if (view.camera !== undefined)
			this.render(this.scene, view.camera);
		else
			this.render(this.scene, this.camera);
		//this.composer.render();
	}
}

export { Renderer };