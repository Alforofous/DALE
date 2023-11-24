import * as THREE from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
import { DynamicPolygon } from './dynamicPolygon.js';
import { BoreHoleSelector } from './boreHole/boreHoleSelector.js';

class Mouse
{
	constructor(renderer, scene, userInterface, camera, boreHoleCamera)
	{
		this.movement = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.boreHoleCamera = boreHoleCamera;
		this.userInterface = userInterface;
		this.pressedButtons = {};
		this.pressedButtonsSignal = {};
		this.releasedButtonsSignal = {};
		this.boreHoleSelector = new BoreHoleSelector(this.camera, this.boreHoleCamera, this.scene, this.renderer);

		this.#addEvents();
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
		this.boreHoleSelector.updateData();
		this.boreHoleSelector.updateSelectionRectangle(this.position);
		this.scene.boreHoles.labels.count = 0;
		if (this.userInterface?.toolMenus[3].isActive())
		{
			const activeButtonIndex = this.userInterface?.toolMenus[3].activeButtonIndex();
			if (activeButtonIndex === 3)
			{
				this.scene.boreHoles.labels.count = this.scene.boreHoles.count;
			}
		}
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
					this.addBoreHole(this.scene);
				else if (activeButtonIndex === 1)
				{
					this.boreHoleSelector.createSelectionRectangle(this.position);
				}
			}
			else
				document.body.requestPointerLock();
		}
	}

	onMouseUp()
	{
		this.boreHoleSelector.destroySelectionRectangle();
	}

	onMove()
	{
		if (this.isCaptured)
		{
			this.camera.updateRotation(this.movement.x, this.movement.y);
			this.boreHoleCamera.updateRotation(this.movement.x, this.movement.y);
		}
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
				{
					this.addBoreHole(this.scene);
				}
				else if (activeButtonIndex === 1)
				{
				}
			}
		}
	}

	addBoreHole(scene)
	{
		let intersection = this.first_intersected_object;
		if (intersection === undefined)
			return;
		if (intersection.object.geometry && intersection.object.geometry.isBufferGeometry)
		{
			let raycaster = new THREE.Raycaster();
			let direction = new THREE.Vector3(0, -1, 0);
			raycaster.firstHitOnly = true;
			raycaster.layers.set(0);
			raycaster.camera = this.camera;

			let matrix = new THREE.Matrix4();
			let matrix2 = new THREE.Matrix4();
			const distance = 1000;
			for (let i = 0; i < scene.boreHoles.count; i++)
			{
				let moveVector = new THREE.Vector3(randFloat(-distance, distance), randFloat(-distance, distance), randFloat(-distance, distance));

				let origin = new THREE.Vector3(moveVector.x, 10000, moveVector.z);
				raycaster.set(origin, direction);
				let intersects = raycaster.intersectObjects(scene.children, true);

				if (intersects.length > 0)
					moveVector.y = intersects[0].point.y;
				matrix.makeTranslation(moveVector.x, moveVector.y, moveVector.z);
				matrix2.makeTranslation(moveVector.x, moveVector.y + scene.boreHoles.boreHoleGeometry.parameters.height / 2 + 5, moveVector.z);
				scene.boreHoles.setMatrixAt(i, matrix);
				scene.boreHoles.labels.setMatrixAt(i, matrix2);
				scene.boreHoles.updateSprites();
			}
			scene.boreHoles.instanceMatrix.needsUpdate = true;
			scene.boreHoles.labels.instanceMatrix.needsUpdate = true;
			scene.boreHoles.computeBoundingBox();
			scene.boreHoles.computeBoundingSphere();
			scene.boreHoles.labels.computeBoundingBox();
			scene.boreHoles.labels.computeBoundingSphere();
		}
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
		raycaster.layers.set(0);
		raycaster.setFromCamera(this.ray, this.camera);
		raycaster.firstHitOnly = true;
		return raycaster.intersectObjects(this.scene.children, true);
	}

	get first_intersected_object()
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
			event.preventDefault();
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