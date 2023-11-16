import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js'
import { OriginPointMarkers } from '../originPointMarkers.js';

class DrillHoleSelector
{
	constructor(camera, scene, renderer)
	{
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;

		this.selectionBox = new SelectionBox(this.camera, this.scene);
		this.selectionHelper = new SelectionHelper(this.renderer, 'selectBox');
	}

	createSelectionRectangle(position)
	{
		this.originPointMarkers = new OriginPointMarkers(this.scene.drillHoleCylinders, this.scene);

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
			this.selectionBox.endPoint.set(normalizedX, normalizedY, 0.5);

			this.renderer.outlineEffect.selection.clear();
			this.renderer.outlineEffect.selection.add(this.originPointMarkers.points);

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

			this.xy2 = { x: position.x - rendererBounds.left, y: position.y - rendererBounds.top };

			let left = Math.min(this.xy1.x, this.xy2.x);
			let top = Math.min(this.xy1.y, this.xy2.y);
			let width = Math.abs(this.xy1.x - this.xy2.x);
			let height = Math.abs(this.xy1.y - this.xy2.y);

			this.selectionRectangle.style.left = `${rendererBounds.left + left}px`;
			this.selectionRectangle.style.top = `${rendererBounds.top + top}px`;
			this.selectionRectangle.style.width = `${width}px`;
			this.selectionRectangle.style.height = `${height}px`;
		}
	}

	destroySelectionRectangle()
	{
		if (this.selectionRectangle === undefined)
			return;
		this.originPointMarkers.deletePoints();
		this.selectionRectangle.remove();
		this.selectionRectangle = undefined;
	}
}

export { DrillHoleSelector };