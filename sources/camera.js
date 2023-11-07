import { PerspectiveCamera } from 'three';
import * as THREE from 'three';

class Camera extends PerspectiveCamera
{
	constructor(scene)
	{
		super(75, window.innerWidth * 0.75 / window.innerHeight, 0.1, 10000);
		this.position.z = 50;
		this.position.y = 700;
		this.layers.enable(1);
	}

	update(keysPressed, deltaTime)
	{
		let speed = 10.0 * deltaTime;
		if (keysPressed['ShiftLeft'])
		{
			this.#lastShiftPress += deltaTime;
			speed *= Math.min(Math.max(5.0, this.#lastShiftPress * 10), 50.0);
		}
		else
		{
			this.#lastShiftPress = 0;
		}

		this.updatePosition(keysPressed, speed);
	}

	updateRotation(movementX, movementY)
	{
		const sensitivity = 0.004;
		const euler = new THREE.Euler(0, 0, 0, 'YXZ');
		euler.setFromQuaternion(this.quaternion);

		euler.y -= movementX * sensitivity;
		euler.x -= movementY * sensitivity;
		euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

		this.quaternion.setFromEuler(euler);
	}

	updatePosition(keysPressed, speed)
	{
		const direction = new THREE.Vector3(0, 0, -1);
		direction.applyQuaternion(this.quaternion);
		const right = new THREE.Vector3(1, 0, 0);
		right.applyQuaternion(this.quaternion);
		const up = new THREE.Vector3();
		up.crossVectors(right, direction);

		if (keysPressed['KeyW'])
		{
			this.position.add(direction.clone().multiplyScalar(speed));
		}
		if (keysPressed['KeyA'])
		{
			this.position.add(right.clone().multiplyScalar(-speed));
		}
		if (keysPressed['KeyS'])
		{
			this.position.add(direction.clone().multiplyScalar(-speed));
		}
		if (keysPressed['KeyD'])
		{
			this.position.add(right.clone().multiplyScalar(speed));
		}
		if (keysPressed['KeyQ'])
		{
			this.position.add(up.clone().multiplyScalar(-speed));
		}
		if (keysPressed['KeyE'])
		{
			this.position.add(up.clone().multiplyScalar(speed));
		}
		if (keysPressed['ArrowUp'])
		{
			this.updateRotation(0, -5);
		}
		if (keysPressed['ArrowLeft'])
		{
			this.updateRotation(-5, 0);
		}
		if (keysPressed['ArrowDown'])
		{
			this.updateRotation(0, 5);
		}
		if (keysPressed['ArrowRight'])
		{
			this.updateRotation(5, 0);
		}
	}

	#lastShiftPress = 0;
}

export { Camera };