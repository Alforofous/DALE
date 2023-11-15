import * as THREE from 'three';
import { createToolMenusArray } from './toolMenus';

class UI
{
	constructor(scene)
	{
		this.toolMenus = createToolMenusArray();

		this.wireframeButton = document.getElementById('wireframeButton');
		this.wireframeButton.addEventListener('click', function ()
		{
			toggleWireframe(scene.terrainMesh);
		});

		function toggleWireframe(object)
		{
			if (Array.isArray(object.material))
			{
				for (let i = 0; i < object.material.length; i++)
					object.material[i].wireframe = !object.material[i].wireframe;
			}
			else
				object.material.wireframe = !object.material.wireframe;
		}
		this.showViewport2 = false;
	}

	activeToolMenu()
	{
		let active_menu = undefined;
		this.toolMenus.forEach(toolMenu =>
		{
			if (toolMenu.isActive())
				active_menu = toolMenu;
		});
		return (active_menu);
	}

	updateInfo(camera, deltaTime, scene, renderer)
	{
		const camera_position = document.getElementById('camera_position');
		camera_position.textContent = 'Camera Position: x: ' + camera.position.x.toFixed(2) + ', y: ' + camera.position.y.toFixed(2) + ', z: ' + camera.position.z.toFixed(2);

		const camera_rotation = document.getElementById('camera_rotation');
		camera_rotation.textContent = 'Camera rotation: x: ' + camera.rotation.x.toFixed(2) + ', y: ' + camera.rotation.y.toFixed(2) + ', z: ' + camera.rotation.z.toFixed(2);

		const object_count = document.getElementById('object_count');
		let triangleCount = renderer.info.render.triangles;
		let objectCount = scene.children.length;
		object_count.textContent = 'Object count: ' + objectCount + ', Triangle count: ' + triangleCount;
	}

	active_menu;
	wireframeButton;
}

export { UI };