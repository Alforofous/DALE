import { PerspectiveCamera } from 'three';
import * as THREE from 'three';

class Camera extends PerspectiveCamera
{
	constructor()
	{
		super(75, window.innerWidth * 0.75 / window.innerHeight, 0.1, 1000);
		this.position.z = 5;
	}

	update(keysPressed, clock)
	{
		const deltaTime = clock.getDelta();
		let speed = 10.0 * deltaTime;
		if (keysPressed['Shift'])
		{
			this.#lastShiftPress += deltaTime;
			speed *= Math.min(Math.max(2.0, this.#lastShiftPress), 20.0);
		}
		else
		{
			this.#lastShiftPress = 0;
		}

		this.updateKeyboard(keysPressed, speed);
	}

	updateMouse(movementX, movementY)
	{
		const sensitivity = 0.002;
		const euler = new THREE.Euler(0, 0, 0, 'YXZ');
		euler.setFromQuaternion(this.quaternion);

		euler.y -= movementX * sensitivity;
		euler.x -= movementY * sensitivity;
		euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

		this.quaternion.setFromEuler(euler);
	}

	updateKeyboard(keysPressed, speed)
	{
		const direction = new THREE.Vector3(0, 0, -1);
		direction.applyQuaternion(this.quaternion);
		const right = new THREE.Vector3(1, 0, 0);
		right.applyQuaternion(this.quaternion);
		const up = new THREE.Vector3();
		up.crossVectors(right, direction);

		if (keysPressed['w'])
		{
			this.position.add(direction.multiplyScalar(speed));
		}
		if (keysPressed['a'])
		{
			this.position.add(right.multiplyScalar(-speed));
		}
		if (keysPressed['s'])
		{
			this.position.add(direction.multiplyScalar(-speed));
		}
		if (keysPressed['d'])
		{
			this.position.add(right.multiplyScalar(speed));
		}
		if (keysPressed['q'])
		{
			this.position.add(up.clone().multiplyScalar(-speed));
		}
		if (keysPressed['e'])
		{
			this.position.add(up.clone().multiplyScalar(speed));
		}
		if (keysPressed['ArrowUp'])
		{
			this.updateMouse(0, -5);
		}
		if (keysPressed['ArrowLeft'])
		{
			this.updateMouse(-5, 0);
		}
		if (keysPressed['ArrowDown'])
		{
			this.updateMouse(0, 5);
		}
		if (keysPressed['ArrowRight'])
		{
			this.updateMouse(5, 0);
		}
	}

	#lastShiftPress = 0;
}

export { Camera };