import * as THREE from 'three';
import { DynamicPolygon } from './dynamicPolygon.js';
import { BoreholeSelector } from './boreholes/boreholeSelector.js';
import { BoreholeMover } from './boreholes/boreholeMover.js';

class Mouse
{
	constructor(renderer, scene, userInterface, camera)
	{
		this.movement = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.userInterface = userInterface;
		this.pressedButtons = {};
		this.pressedButtonsSignal = {};
		this.releasedButtonsSignal = {};
		this.boreholeSelector = new BoreholeSelector(this.camera, this.scene, this.renderer);
		this.boreholeMover = new BoreholeMover(this.scene.boreholes);

		this.#addEvents();
	}

	onUpdate()
	{
		this.isCaptured = true;
		if (document.pointerLockElement == null)
			this.isCaptured = false;

		if (Object.values(this.pressedButtonsSignal).some(value => value === true))
			this.onMouseDownSignal();
		if (Object.values(this.releasedButtonsSignal).some(value => value === true))
			this.onMouseUpSignal();
		if (this.movement.x !== 0 || this.movement.y !== 0)
			this.onMove();
		if (Object.values(this.pressedButtons).some(value => value === true))
			this.onMouseDown();
		this.boreholeSelector.updateData();
		this.boreholeSelector.updateSelectionRectangle(this.position);
	}

	onMouseDown()
	{
		if (this.pressedButtons[0] && this.isCaptured === false)
		{
			const activeMenuIndex = this.userInterface?.sidebar?.current?.state.activeToolMenuIndex;
			const activeButtonIndex = this.userInterface?.sidebar?.current?.toolMenus[activeMenuIndex]?.current?.state?.activeToolButtonIndex;

			if (activeMenuIndex === 0)
			{
				if (activeButtonIndex === 0)
				{
				}
				else if (activeButtonIndex === 2)
				{
					const firstIntersectedObject = this.firstIntersectedObject;
					if (firstIntersectedObject !== undefined)
						this.boreholeMover.moveSelectedBoreholes(firstIntersectedObject.point, this.boreholeSelector.selectedBoreholeIds);
				}
				else if (activeButtonIndex === 3)
					this.scene.boreholes.scatter();
			}
		}
	}

	onMouseDownSignal()
	{
		if (this.pressedButtonsSignal[0] && this.isCaptured === false)
		{
			const activeMenuIndex = this.userInterface?.sidebar?.current?.state.activeToolMenuIndex;
			const activeButtonIndex = this.userInterface?.sidebar?.current?.toolMenus[activeMenuIndex]?.current?.state?.activeToolButtonIndex;

			if (activeMenuIndex === 0)
			{
				if (activeButtonIndex === 0)
				{
				}
				else if (activeButtonIndex === 1)
				{
					this.boreholeSelector.createSelectionRectangle(this.position);
				}
			}
			else if (activeMenuIndex === undefined || activeMenuIndex === null)
				document.body.requestPointerLock();
		}
	}

	onMouseUpSignal()
	{
		this.boreholeSelector.destroySelectionRectangle();
		this.boreholeMover.onMouseRelease();
	}

	onMove()
	{
		if (this.isCaptured)
		{
			this.camera.updateRotation(this.movement.x, this.movement.y);
		}
		if (this.pressedButtons[0] && this.isCaptured === false)
		{
			const activeMenuIndex = this.userInterface?.sidebar?.current?.state.activeToolMenuIndex;
			const activeButtonIndex = this.userInterface?.sidebar?.current?.toolMenus[activeMenuIndex]?.current?.state?.activeToolButtonIndex;

			if (activeMenuIndex === 0)
			{
				if (activeButtonIndex === 0)
				{
				}
				else if (activeButtonIndex === 1)
				{
				}
			}
		}
	}

	drawArea(scene)
	{
		let intersection = this.firstIntersectedObject;
		if (intersection === undefined)
			return;
		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			if (scene.currentDynamicMesh === undefined)
			{
				scene.currentDynamicMesh = new DynamicPolygon();
				scene.add(scene.currentDynamicMesh);
			}
			scene.currentDynamicMesh.addVertex(intersection.point);
		}
	}

	get ray()
	{
		let ray = new THREE.Vector2();
		let rect = this.renderer.domElement.getBoundingClientRect();
		ray.x = ((this.position.x - rect.left) / rect.width) * 2 - 1;
		ray.y = -((this.position.y - rect.top) / rect.height) * 2 + 1;
		return ray;
	}

	get intersected_objects()
	{
		let raycaster = new THREE.Raycaster();
		raycaster.layers.set(0);
		raycaster.setFromCamera(this.ray, this.camera);
		raycaster.firstHitOnly = true;
		return raycaster.intersectObjects(this.scene.children, true);
	}

	get firstIntersectedObject()
	{
		let intersects = this.intersected_objects;
		if (intersects.length === 0)
			return undefined;
		return intersects[0];
	}

	#addEvents()
	{
		document.addEventListener('mousedown', function (event)
		{
			let rect = this.renderer.domElement.getBoundingClientRect();
			if (event.clientX >= rect.left && event.clientX <= rect.right &&
				event.clientY >= rect.top && event.clientY <= rect.bottom) 
			{
				this.pressedButtons[event.button] = true;
				this.pressedButtonsSignal[event.button] = true;
				requestAnimationFrame(() => this.pressedButtonsSignal[event.button] = false);
			}
		}.bind(this));

		document.addEventListener('mouseup', function (event)
		{
			this.pressedButtons[event.button] = false;
			this.releasedButtonsSignal[event.button] = true;
			requestAnimationFrame(() => this.releasedButtonsSignal[event.button] = false);
		}.bind(this));

		document.addEventListener('mousemove', function (event)
		{
			this.movement.x = event.movementX;
			this.movement.y = event.movementY;
			this.position.x = event.clientX;
			this.position.y = event.clientY;
			requestAnimationFrame(() =>
			{
				this.movement.x = 0;
				this.movement.y = 0;
			});
		}.bind(this));

		window.addEventListener('contextmenu', function(event) {
			event.preventDefault();
		});
	}
}

export { Mouse };