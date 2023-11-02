import * as THREE from 'three';

class UI
{
	constructor()
	{
	}

	updateInfo(camera, deltaTime)
	{
		const camera_position = document.getElementById('camera_position');
		camera_position.textContent = 'Camera Position: x: ' + camera.position.x.toFixed(2) + ', y: ' + camera.position.y.toFixed(2) + ', z: ' + camera.position.z.toFixed(2);

		const camera_rotation = document.getElementById('camera_rotation');
		camera_rotation.textContent = 'Camera rotation: x: ' + camera.rotation.x.toFixed(2) + ', y: ' + camera.rotation.y.toFixed(2) + ', z: ' + camera.rotation.z.toFixed(2);

		const performance_deltaTime = document.getElementById('performance_deltaTime');
		performance_deltaTime.textContent = deltaTime.toFixed(4) + ' ms';

		const performance_fps = document.getElementById('performance_fps');
		performance_fps.textContent = (1.0 / deltaTime).toFixed(0) + ' fps';
	}
}

export { UI };