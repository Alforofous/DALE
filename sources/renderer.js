import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { loadShaderSynchronous } from './shaders/shaderLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

class Renderer extends WebGLRenderer
{
	constructor(scene, camera)
	{
		super({ antialias: true });
		this.scene = scene;
		this.camera = camera;
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
				uBoreholeLabelsTexture: { value: null },
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader
		});

		this.shaderPass = new ShaderPass(this.shaderMaterial);
		this.composer.addPass(this.shaderPass);

		this.outlineBoreholeRenderTarget = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight);
		this.boreholeLabelRenderTarget = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight);
		this.shaderMaterial.uniforms.uOutlinedBoreholesTexture.value = this.outlineBoreholeRenderTarget.texture;
		this.shaderMaterial.uniforms.uBoreholeLabelsTexture.value = this.boreholeLabelRenderTarget.texture;
	}

	updateOutlineBoreholesTexture(renderTarget, view = { camera: undefined, scene: undefined, enableIdShader: false, useComposer: false }, dimensions = { left: 0, bottom: 0, width: 1, height: 1 })
	{
		let oldRenderTarget = this.getRenderTarget();
		this.setRenderTarget(renderTarget);
		this.renderViewport(view, dimensions);
		this.setRenderTarget(oldRenderTarget);
	}

	renderViewport({ camera = this.camera, layers = 0xFFFFFFFF, scene = undefined, enableIdShader = false, useComposer = false } = {}, { left = 0, bottom = 0, width = 1, height = 1 } = {})
	{
		if (enableIdShader === false)
		{
			this.scene.boreholes.material.uniforms.uResolution.value = new THREE.Vector2(this.domElement.clientWidth, this.domElement.clientHeight).multiply(new THREE.Vector2(width, height));
			this.scene.boreholes.switchToDefaultShader();
		}
		else
			this.scene.boreholes.switchToIdShader();

		const rendererBounds = this.domElement.getBoundingClientRect();
		const leftPixelCoords = Math.floor(rendererBounds.width * left);
		const bottomPixelCoords = Math.floor(rendererBounds.height * bottom);
		const widthPixelCoords = Math.floor(rendererBounds.width * width);
		const heightPixelCoords = Math.floor(rendererBounds.height * height);
		this.setViewport(leftPixelCoords, bottomPixelCoords, widthPixelCoords, heightPixelCoords);
		this.setScissor(leftPixelCoords, bottomPixelCoords, widthPixelCoords, heightPixelCoords);
		this.setScissorTest(true);

		const oldLayers = camera.layers.mask;
		camera.layers.mask = layers;

		if (useComposer === true)
		{
			this.mainRenderPass.camera = camera;
			this.mainRenderPass.scene = scene;
			this.composer.render();
		}
		else
			this.render(scene, camera);
		camera.layers.mask = oldLayers;
	}
}

export { Renderer };