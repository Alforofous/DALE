import { PerspectiveCamera } from 'three';
import * as THREE from 'three';

class Camera extends PerspectiveCamera
{
	constructor()
	{
		super(75, window.innerWidth * 0.75 / window.innerHeight, 0.1, 10000);
		this.position.x = 1500;
		this.position.y = 1700;
		this.position.z = 1850;
		
		const euler = new THREE.Euler(-0.7, 0.6, 0.0, 'YXZ');
		this.quaternion.setFromEuler(euler);
		this.layers.enableAll();
	}

	updateAspectRatio()
	{
		this.aspect = window.innerWidth * 0.75 / window.innerHeight;
		this.updateProjectionMatrix();
	}

	update(keysPressed, deltaTime)
	{
		let speed = 10.0 * deltaTime;
		let movementSpeed = speed;
		if (keysPressed['ShiftLeft'])
		{
			this.#lastShiftPress += deltaTime;
			movementSpeed *= Math.min(Math.max(5.0, this.#lastShiftPress * 10), 50.0);
		}
		else
		{
			this.#lastShiftPress = 0;
		}

		this.updatePosition(keysPressed, movementSpeed);
		if (keysPressed['ArrowUp'])
		{
			this.updateRotation(0, -speed * 100);
		}
		if (keysPressed['ArrowLeft'])
		{
			this.updateRotation(-speed * 100, 0);
		}
		if (keysPressed['ArrowDown'])
		{
			this.updateRotation(0, speed * 100);
		}
		if (keysPressed['ArrowRight'])
		{
			this.updateRotation(speed * 100, 0);
		}
	}

	updateRotation(movementX, movementY)
	{
		const sensitivity = 0.3;
		let rotationSpeed = sensitivity * 0.01;
		const euler = new THREE.Euler(0, 0, 0, 'YXZ');
		euler.setFromQuaternion(this.quaternion);

		euler.y -= movementX * rotationSpeed;
		euler.x -= movementY * rotationSpeed;
		const halfPi = Math.PI / 2 -0.00001;
		euler.x = Math.max(-halfPi, Math.min(halfPi, euler.x));

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
	}

	#lastShiftPress = 0;
}

export { Camera };