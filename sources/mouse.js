import * as THREE from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
import { DynamicPolygon } from './dynamicPolygon.js';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js'
import { originPointMarkers } from './originPointMarkers.js';
import { DrillHole } from './drillHole/drillHole.js';

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
		this.selectionBox = new SelectionBox(camera, scene);
		this.selectionHelper = new SelectionHelper(renderer, 'selectBox');

		document.addEventListener('mousedown', function (event)
		{
			let rect = renderer.domElement.getBoundingClientRect();
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
	}

	onMove()
	{
		if (this.isCaptured)
			this.camera.updateRotation(this.movement.x, this.movement.y);
		if (this.pressedButtons[0] && this.isCaptured === false)
		{
			if (this.userInterface?.toolMenus[0].isActive())
				this.spawnCones(this.scene);
			else if (this.userInterface?.toolMenus[1].isActive())
				this.drawArea(this.scene);
			else if (this.userInterface.toolMenus[2].isActive())
				this.digTerrain();
			else if (this.userInterface?.toolMenus[3].isActive())
			{
				const activeButtonIndex = this.userInterface?.toolMenus[3].activeButtonIndex();
				if (activeButtonIndex === 0)
					this.addDrillHole(this.scene);
			}
		}
	}

	onMouseUp()
	{
		this.destroySelectionRectangle();
	}

	onMouseDown()
	{
		if (this.pressedButtonsSignal[0] && this.isCaptured === false)
		{
			if (this.userInterface?.toolMenus[0].isActive())
				this.spawnCones(this.scene);
			else if (this.userInterface?.toolMenus[1].isActive())
				this.drawArea(this.scene);
			else if (this.userInterface?.toolMenus[2].isActive())
				this.digTerrain();
			else if (this.userInterface?.toolMenus[3].isActive())
			{
				const activeButtonIndex = this.userInterface?.toolMenus[3].activeButtonIndex();
				if (activeButtonIndex === 0)
					this.addDrillHole(this.scene);
				else if (activeButtonIndex === 1)
					this.createSelectionRectangle();
			}
			else
				document.body.requestPointerLock();
		}
	}

	createSelectionRectangle()
	{
		this.originPointMarkers = new originPointMarkers(this.scene.drillHoleCylinders, this.scene);

		let rendererBounds = this.renderer.domElement.getBoundingClientRect();

		let normalizedX = ((this.position.x - rendererBounds.left) / rendererBounds.width) * 2 - 1;
		let normalizedY = -((this.position.y - rendererBounds.top) / rendererBounds.height) * 2 + 1;

		this.selectionBox.startPoint.set(normalizedX, normalizedY, 0.5);

		this.selectionRectangle = document.createElement('div');
		this.selectionRectangle.style.position = 'absolute';
		this.selectionRectangle.style.backgroundColor = 'rgba(134, 221, 255, 0.2)';

		this.xy1 = { x: this.position.x - rendererBounds.left, y: this.position.y - rendererBounds.top };

		this.selectionRectangle.style.left = `${rendererBounds.left + this.xy1.x}px`;
		this.selectionRectangle.style.top = `${rendererBounds.top + this.xy1.y}px`;

		document.body.appendChild(this.selectionRectangle);
	}

	updateSelectionRectangle()
	{
		let rendererBounds = this.renderer.domElement.getBoundingClientRect();
		if (this.selectionHelper.isDown && this.selectionRectangle !== undefined)
		{
			let normalizedX = ((this.position.x - rendererBounds.left) / rendererBounds.width) * 2 - 1;
			let normalizedY = -((this.position.y - rendererBounds.top) / rendererBounds.height) * 2 + 1;

			this.renderer.outlineEffect.selection.clear();
			this.renderer.outlineEffect.selection.add(this.originPointMarkers.points);
			let selectedObjects = this.selectionBox.select();
			for (let i = 0; i < selectedObjects.length; i++)
			{
				const selectedObject = selectedObjects[i];
				if (selectedObject.name === 'cylinder')
				{
					this.renderer.outlineEffect.selection.add(selectedObject);
				}
			}
			this.selectionBox.endPoint.set(normalizedX, normalizedY, 0.5);
			this.xy2 = { x: this.position.x - rendererBounds.left, y: this.position.y - rendererBounds.top };

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

	onUpdate()
	{
		this.isCaptured = true;
		if (document.pointerLockElement == null)
			this.isCaptured = false;

		if (Object.values(this.pressedButtonsSignal).some(value => value === true))
			this.onMouseDown();
		if (Object.values(this.releasedButtonsSignal).some(value => value === true))
			this.onMouseUp();
		if (this.movement.x !== 0 || this.movement.y !== 0)
			this.onMove();
		this.updateSelectionRectangle();
	}

	drawArea(scene)
	{
		let intersection = this.first_intersected_object;
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

	addDrillHole(scene)
	{
		let intersection = this.first_intersected_object;
		if (intersection === undefined)
			return;
		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			const drill_hole = new DrillHole(intersection.point, scene, this.renderer);
			scene.add(drill_hole);
			scene.drillHoleCylinders.push(drill_hole.cylinder);
		}
	}

	digTerrain()
	{
		let intersection = this.first_intersected_object;
		if (intersection === undefined)
			return;

		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			let positions = intersection.object.geometry.attributes.position;
			intersection.object.geometry.attributes.position.array;

			let range = 100;
			let indicesInRange = [];
			for (let i = 0; i < positions.count; i++)
			{
				let vertexLocal = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
				let vertexWorld = vertexLocal.applyMatrix4(intersection.object.matrixWorld);
				if (vertexWorld.distanceTo(intersection.point) < range)
				{
					indicesInRange.push(i);

					let displacementWorld = new THREE.Vector3(0, -1, 0);
					let matrixWorldInverse = new THREE.Matrix4().copy(intersection.object.matrixWorld).invert();
					let displacementObject = displacementWorld.applyMatrix4(matrixWorldInverse);

					const x = positions.getX(i);
					const y = positions.getY(i);
					const z = positions.getZ(i);

					positions.setX(i, x + displacementObject.x);
					positions.setY(i, y + displacementObject.y);
					positions.setZ(i, z + displacementObject.z);
				}
			}
			positions.needsUpdate = true;
		}
	}

	spawnCones(scene)
	{
		let intersection = this.first_intersected_object;
		if (intersection === undefined)
			return;
		
		let coneGeometry = new THREE.ConeGeometry(1, 10, 3, 1);
		let coneMaterial = new THREE.MeshPhongMaterial({ color: 0x152FC9 });
		let cone = new THREE.InstancedMesh(coneGeometry, coneMaterial, 10000);

		let matrix = new THREE.Matrix4();
		const distance = 100;
		for (let i = 0; i < cone.count; i++)
		{
			let moveVector = new THREE.Vector3(randFloat(-distance, distance), randFloat(-distance, distance), randFloat(-distance, distance));

			matrix.makeTranslation(moveVector.x, moveVector.y, moveVector.z);
			cone.setMatrixAt(i, matrix);
		}

		cone.instanceMatrix.needsUpdate = true;

		cone.layers.set(1);
		cone.position.copy(intersection.point);

		const normal = new THREE.Vector3().copy(intersection.face.normal);
		const lookAtTarget = new THREE.Vector3().copy(intersection.point).add(normal);

		cone.lookAt(lookAtTarget);
		cone.geometry.rotateX(Math.PI / 2);
		scene.add(cone);
	};

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
		raycaster.setFromCamera(this.ray, this.camera);
		return raycaster.intersectObjects(this.scene.children, true);
	}

	get first_intersected_object()
	{
		let intersects = this.intersected_objects;
		if (intersects.length === 0)
			return undefined;
		return intersects[0];
	}

	selectionRectangle;
	pressedButtons = {};
	pressedButtonsSignal = {};
	releasedButtonsSignal = {};
	position = { x: 0, y: 0 };
	movement = { x: 0, y: 0 };
	isCaptured = false;
}

export { Mouse };