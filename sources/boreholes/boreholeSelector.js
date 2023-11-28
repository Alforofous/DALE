import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js'
import * as THREE from 'three';

class BoreholeSelector
{
	constructor(camera, boreholeCamera, scene, renderer)
	{
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;
		this.boreholeCamera = boreholeCamera;

		this.selectionBox = new SelectionBox(this.camera, this.scene);
		this.selectionHelper = new SelectionHelper(this.renderer, 'selectBox');
		this.addToSelection = false;
		this.color = new THREE.Color(0x86DDFF);
		this.selectedBoreholeIds = [];
	}

	updateSelectionRectangleColor()
	{
		if (this.selectionRectangle === undefined)
			return;
		let r = Math.round(this.color.r * 255);
		let g = Math.round(this.color.g * 255);
		let b = Math.round(this.color.b * 255);

		this.selectionRectangle.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${0.3})`;
		this.selectionRectangle.style.border = `2px solid rgba(${r}, ${g}, ${b}, ${0.5})`;
	}

	createSelectionRectangle(position)
	{
		let rendererBounds = this.renderer.domElement.getBoundingClientRect();

		let normalizedX = ((position.x - rendererBounds.left) / rendererBounds.width) * 2 - 1;
		let normalizedY = -((position.y - rendererBounds.top) / rendererBounds.height) * 2 + 1;

		this.selectionBox.startPoint.set(normalizedX, normalizedY, 0.5);

		this.selectionRectangle = document.createElement('div');
		this.selectionRectangle.style.position = 'absolute';

		this.updateSelectionRectangleColor();

		this.xy1 = { x: position.x - rendererBounds.left, y: position.y - rendererBounds.top };

		this.selectionRectangle.style.left = `${rendererBounds.left + this.xy1.x}px`;
		this.selectionRectangle.style.top = `${rendererBounds.top + this.xy1.y}px`;

		document.body.appendChild(this.selectionRectangle);
	}

	updateSelectionRectangle(position)
	{
		let rendererBounds = this.renderer.domElement.getBoundingClientRect();
		if (this.selectionHelper.isDown && this.selectionRectangle !== undefined)
		{
			let normalizedX = ((position.x - rendererBounds.left) / rendererBounds.width) * 2 - 1;
			let normalizedY = -((position.y - rendererBounds.top) / rendererBounds.height) * 2 + 1;

			this.xy2 = { x: position.x - rendererBounds.left, y: position.y - rendererBounds.top };

			let left = Math.round(Math.min(this.xy1.x, this.xy2.x));
			let top = Math.round(Math.min(this.xy1.y, this.xy2.y));
			let width = Math.round(Math.abs(this.xy1.x - this.xy2.x));
			let height = Math.round(Math.abs(this.xy1.y - this.xy2.y));

			this.selectionRectangle.style.left = `${rendererBounds.left + left}px`;
			this.selectionRectangle.style.top = `${rendererBounds.top + top}px`;
			this.selectionRectangle.style.width = `${width}px`;
			this.selectionRectangle.style.height = `${height}px`;

			this.#updateSelectedIndicesGPU(left, top, width + 1, height + 1);
			this.#updateSelectionBox(normalizedX, normalizedY);
		}
	}

	destroySelectionRectangle()
	{
		if (this.selectionRectangle === undefined)
			return;
		this.selectionRectangle.remove();
		this.selectionRectangle = undefined;
	}

	updateData()
	{
		let oldRenderTarget = this.renderer.getRenderTarget();
		this.renderTarget = new THREE.WebGLRenderTarget(this.renderer.domElement.width, this.renderer.domElement.height);
		this.renderer.setRenderTarget(this.renderTarget);
		this.renderer.renderViewport({ left: 0, bottom: 0, width: 1, height: 1, camera: this.boreholeCamera, enableIdShader: true, useComposer: false });

		this.pixelBuffer = new Uint8Array(this.renderTarget.width * this.renderTarget.height * 4);
		this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.renderTarget.width, this.renderTarget.height, this.pixelBuffer);
		this.renderer.setRenderTarget(oldRenderTarget);

		this.texture = new THREE.DataTexture(this.pixelBuffer, this.renderTarget.width, this.renderTarget.height, THREE.RGBAFormat);
		this.texture.needsUpdate = true;
		this.scene.boreholes.material.uniforms.uBoreholeIdTexture.value = this.texture;
		this.scene.boreholes.material.uniforms.uResolution.value = new THREE.Vector2(this.renderTarget.width, this.renderTarget.height);
	}

	#updateSelectedIndicesGPU(left, top, width, height)
	{
		let highlightAttribute = this.scene.boreholes.boreholeGeometry.getAttribute('highlight');
		if (this.addToSelection === false)
			highlightAttribute.array.fill(0);

		for (let y = top; y < top + height; y += 1)
		{
			for (let x = left; x < left + width; x += 1)
			{
				if (x < 0 || x >= this.renderTarget.width || y < 0 || y >= this.renderTarget.height)
					continue;
				let flippedY = this.renderTarget.height - y;
				let i = (flippedY * this.renderTarget.width + x) * 4;
				const selectedInstanceIndex = (this.pixelBuffer[i] << 16) + (this.pixelBuffer[i + 1] << 8) + this.pixelBuffer[i + 2];
				highlightAttribute.setX(selectedInstanceIndex - 1, 1);
			}
		}
		highlightAttribute.needsUpdate = true;
	}

	#updateSelectionBox(normalizedX, normalizedY)
	{
		this.selectionBox.endPoint.set(normalizedX, normalizedY, 0.5);

		this.selectionBox.instances = {};
		this.selectionBox.select();
		let selectedInstances = this.selectionBox.instances;
		let boreholesArray = selectedInstances[this.scene.boreholes.uuid];

		let highlightAttribute = this.scene.boreholes.boreholeGeometry.getAttribute('highlight');
		for (let i = 0; i < boreholesArray.length; i++)
		{
			const selectedInstanceIndex = boreholesArray[i];
			highlightAttribute.setX(selectedInstanceIndex, 1);
		}
		highlightAttribute.needsUpdate = true;
		this.selectedBoreholeIds = [];
		for (let i = 0; i < highlightAttribute.count; i++)
		{
			if (highlightAttribute.getX(i) === 1)
			{
				this.selectedBoreholeIds.push(i);
			}
		}
	}
}

export { BoreholeSelector };