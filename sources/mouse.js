import * as THREE from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';
import { DynamicPolygon } from './dynamic_polygon.js';

class Mouse
{
	constructor(renderer, scene, userInterface, camera)
	{
		this.movement = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };

		this.#scene_ref = scene;
		this.#renderer_ref = renderer;
		this.#camera_ref = camera;
		this.#userInterface_ref = userInterface;

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
			this.#camera_ref.updateRotation(this.movement.x, this.movement.y);
		if (this.pressedButtons[0] && this.isCaptured === false)
		{
			if (this.#userInterface_ref?.active_button?.id === 'digTerrainButton')
				this.digTerrain(this.#scene_ref, this.#camera_ref);
			else if (this.#userInterface_ref?.active_button?.id === 'spawnConesButton')
				this.spawnCones(this.#scene_ref, this.#camera_ref);
		}
	}

	onMouseDown()
	{
		if (this.pressedButtonsSignal[0] === true)
		{
			if (this.isCaptured === false && this.#userInterface_ref.active_button === undefined)
				document.body.requestPointerLock();
			if (this.isCaptured === false && this.#userInterface_ref?.active_button?.id === 'drawPolygonButton')
				this.drawArea(this.#scene_ref, this.#camera_ref);
		}
	}

	onUpdate()
	{
		this.isCaptured = true;
		if (document.pointerLockElement == null)
			this.isCaptured = false;

		if (Object.values(this.pressedButtonsSignal).some(value => value === true))
			this.onMouseDown();
		if (this.movement.x !== 0 || this.movement.y !== 0)
			this.onMove();
	}

	drawArea(scene, camera)
	{
		let raycaster = new THREE.Raycaster();

		raycaster.setFromCamera(this.ray, camera);
		let intersects = raycaster.intersectObjects(scene.children, true);

		if (intersects.length === 0)
			return;
		let intersection = intersects[0];

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

	digTerrain(scene, camera)
	{
		let raycaster = new THREE.Raycaster();

		raycaster.setFromCamera(this.ray, camera);
		let intersects = raycaster.intersectObjects(scene.children, true);

		if (intersects.length === 0)
			return;
		let intersection = intersects[0];

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

	spawnCones(scene, camera)
	{
		let raycaster = new THREE.Raycaster();

		raycaster.setFromCamera(this.ray, camera);
		let intersects = raycaster.intersectObjects(scene.children, true);

		if (intersects.length === 0)
			return;
		let coneGeometry = new THREE.ConeGeometry(1, 10, 3, 1);
		let coneMaterial = new THREE.MeshPhongMaterial({ color: 0x152FC9 });
		let cone = new THREE.InstancedMesh(coneGeometry, coneMaterial, 1000);

		let matrix = new THREE.Matrix4();
		for (let i = 0; i < cone.count; i++)
		{
			let moveVector = new THREE.Vector3(randFloat(-40, 40), randFloat(-40, 40), randFloat(-40, 40));

			matrix.makeTranslation(moveVector.x, moveVector.y, moveVector.z);
			cone.setMatrixAt(i, matrix);
		}

		cone.instanceMatrix.needsUpdate = true;

		let intersection = intersects[0];
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
		let rect = this.#renderer_ref.domElement.getBoundingClientRect();
		ray.x = ((this.position.x - rect.left) / rect.width) * 2 - 1;
		ray.y = -((this.position.y - rect.top) / rect.height) * 2 + 1;
		return ray;
	}

	pressedButtons = {};
	pressedButtonsSignal = {};
	position = { x: 0, y: 0 };
	movement = { x: 0, y: 0 };
	isCaptured = false;
	#renderer_ref;
	#camera_ref;
	#userInterface_ref;
	#scene_ref;
}

export { Mouse };