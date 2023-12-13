import * as THREE from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
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
					this.addBorehole(this.scene);
				}
				else if (activeButtonIndex === 2)
				{
					const firstIntersectedObject = this.firstIntersectedObject;
					if (firstIntersectedObject !== undefined)
						this.boreholeMover.moveSelectedBoreholes(firstIntersectedObject.point, this.boreholeSelector.selectedBoreholeIds);
				}
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
					this.addBorehole(this.scene);
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
					this.addBorehole(this.scene);
				}
				else if (activeButtonIndex === 1)
				{
				}
			}
		}
	}

	addBorehole(scene)
	{
		let intersection = this.firstIntersectedObject;
		if (intersection === undefined)
			return;
		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			let raycaster = new THREE.Raycaster();
			let direction = new THREE.Vector3(0, -1, 0);
			raycaster.firstHitOnly = true;
			raycaster.layers.set(0);
			raycaster.camera = this.camera;

			const distance = 1000;
			for (let i = 0; i < scene.boreholes.count; i++)
			{
				let moveVector = new THREE.Vector3(randFloat(-distance, distance), randFloat(-distance, distance), randFloat(-distance, distance));

				let origin = new THREE.Vector3(moveVector.x, 10000, moveVector.z);
				raycaster.set(origin, direction);
				let intersects = raycaster.intersectObjects(scene.children, true);

				if (intersects.length > 0)
					moveVector.y = intersects[0].point.y;
				scene.boreholes.info.top[i].copy(moveVector);
				scene.boreholes.snapBottomTowardsParent(i);
			}
			scene.boreholes.updateGeometryProperties();
			scene.boreholes.labels.syncWithBoreholes();
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

	digTerrain()
	{
		let intersection = this.firstIntersectedObject;
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
		let intersection = this.firstIntersectedObject;
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