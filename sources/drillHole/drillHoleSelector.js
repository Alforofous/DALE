import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js'
import * as THREE from 'three';

class DrillHoleSelector
{
	constructor(camera, drillHoleCamera, scene, renderer)
	{
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;
		this.drillHoleCamera = drillHoleCamera;

		this.selectionBox = new SelectionBox(this.camera, this.scene);
		this.selectionHelper = new SelectionHelper(this.renderer, 'selectBox');
	}

	createSelectionRectangle(position)
	{
		let rendererBounds = this.renderer.domElement.getBoundingClientRect();

		let normalizedX = ((position.x - rendererBounds.left) / rendererBounds.width) * 2 - 1;
		let normalizedY = -((position.y - rendererBounds.top) / rendererBounds.height) * 2 + 1;

		this.selectionBox.startPoint.set(normalizedX, normalizedY, 0.5);

		this.selectionRectangle = document.createElement('div');
		this.selectionRectangle.style.position = 'absolute';
		this.selectionRectangle.style.backgroundColor = 'rgba(134, 221, 255, 0.2)';

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

			let left = Math.min(this.xy1.x, this.xy2.x);
			let top = Math.min(this.xy1.y, this.xy2.y);
			let width = Math.abs(this.xy1.x - this.xy2.x);
			let height = Math.abs(this.xy1.y - this.xy2.y);

			this.selectionRectangle.style.left = `${rendererBounds.left + left}px`;
			this.selectionRectangle.style.top = `${rendererBounds.top + top}px`;
			this.selectionRectangle.style.width = `${width}px`;
			this.selectionRectangle.style.height = `${height}px`;

			let oldRenderTarget = this.renderer.getRenderTarget();
			let renderTarget = new THREE.WebGLRenderTarget(this.renderer.domElement.width, this.renderer.domElement.height);
			this.renderer.setRenderTarget(renderTarget);
			this.renderer.renderViewport({ left: 0, bottom: 0, width: 1, height: 1, camera: this.drillHoleCamera }, true);

			let pixelBuffer = new Uint8Array(renderTarget.width * renderTarget.height * 4);
			this.renderer.readRenderTargetPixels(renderTarget, 0, 0, renderTarget.width, renderTarget.height, pixelBuffer);
			this.renderer.setRenderTarget(oldRenderTarget);

			this.#updateSelectedItems(renderTarget, pixelBuffer, left, top, width + 1, height + 1);
			//this.#updateSelectionBox(normalizedX, normalizedY);
		}
	}

	destroySelectionRectangle()
	{
		if (this.selectionRectangle === undefined)
			return;
		this.selectionRectangle.remove();
		this.selectionRectangle = undefined;
	}

	#updateSelectedItems(renderTarget, pixelBuffer, left, top, width, height)
	{
		let highlightAttribute = this.scene.drillHoles.drillHoleGeometry.getAttribute('highlight');
		highlightAttribute.array.fill(0);
		for (let i = 0; i < renderTarget.width * renderTarget.height * 4; i += 4)
		{
			const selectedInstanceIndex = (pixelBuffer[i] << 16) + (pixelBuffer[i + 1] << 8) + pixelBuffer[i + 2];
			highlightAttribute.setX(selectedInstanceIndex, 1);
		}
		highlightAttribute.needsUpdate = true;
	}

	#updateSelectionBox(normalizedX, normalizedY)
	{
		this.selectionBox.endPoint.set(normalizedX, normalizedY, 0.5);

		this.selectionBox.instances = {};
		this.selectionBox.select();
		let selectedInstances = this.selectionBox.instances;
		let drillHolesArray = selectedInstances[this.scene.drillHoles.uuid];

		let highlightAttribute = this.scene.drillHoles.drillHoleGeometry.getAttribute('highlight');
		highlightAttribute.array.fill(0);
		for (let i = 0; i < drillHolesArray.length; i++)
		{
			const selectedInstanceIndex = drillHolesArray[i];
			highlightAttribute.setX(selectedInstanceIndex, 1);
		}
		highlightAttribute.needsUpdate = true;
	}
}

export { DrillHoleSelector };