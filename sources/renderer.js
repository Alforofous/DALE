import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { loadShaderSynchronous } from './shaders/shaderLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

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

		document.body.appendChild(this.domElement);
		this.composer = new EffectComposer(this);
		this.mainRenderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.mainRenderPass);
		const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
		this.composer.addPass(gammaCorrectionPass);

		this.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
		this.composer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);

		this.info.autoReset = false;
		this.autoClear = true;

		this.initPostProcessing();
	}

	initPostProcessing()
	{
		this.vertexShader = loadShaderSynchronous('sources/shaders/postprocessing/boreholeOutlineVertex.glsl');
		this.fragmentShader = loadShaderSynchronous('sources/shaders/postprocessing/boreholeOutlineFragment.glsl');

		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tDiffuse: { value: null },
				uOutlinedBoreholesTexture: { value: null },
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader
		});

		this.shaderPass = new ShaderPass(this.shaderMaterial);
		this.composer.addPass(this.shaderPass);

		this.outlineBoreholeRenderTarget = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight);
	}

	updateOutlineBoreholesTexture()
	{
		let oldRenderTarget = this.getRenderTarget();
		this.setRenderTarget(this.outlineBoreholeRenderTarget);
		this.renderViewport({ name: 'undef', left: 0, bottom: 0, width: 1, height: 1, camera: this.boreHoleCamera, enableIDShader: false, useComposer: false });
		this.setRenderTarget(oldRenderTarget);

		this.shaderMaterial.uniforms.uOutlinedBoreholesTexture.value = this.outlineBoreholeRenderTarget.texture;
	}

	renderViewport(view = { left: 0, bottom: 0, width: 1, height: 1, camera: undefined, enableIDShader: false, useComposer: false })
	{
		if (view.enableIDShader === false)
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

		let camera = view.camera;
		if (view.camera === undefined)
			camera = this.camera;

		if (view.useComposer === true)
		{
			this.mainRenderPass.camera = camera;
			this.mainRenderPass.scene = this.scene;
			this.composer.render();
		}
		else
			this.render(this.scene, camera);
	}
}

export { Renderer };