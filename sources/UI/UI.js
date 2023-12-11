import { render } from 'react-dom';
import { createToolMenusArray } from './toolMenus';
import Stats from 'stats.js';

class UI
{
	constructor(renderer)
	{
		this.toolMenus = createToolMenusArray();

		this.showViewport2 = false;

		this.stats = [];
		for (let i = 0; i < 3; i++)
		{
			const stat = new Stats();
			stat.showPanel(i);
			stat.dom.style.top = `${i * 48}px`;
			stat.dom.style.left = renderer.domElement.style.left;
			stat.dom.classList.add('stats');
			renderer.domElement.parentElement.appendChild(stat.dom);
			this.stats.push(stat);
		}
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
		const object_count = document.getElementById('object_count');
		let triangleCount = renderer.info.render.triangles;
		let objectCount = scene.children.length;
		if (object_count !== undefined && object_count !== null)
			object_count.textContent = 'Object count: ' + objectCount + ', Triangle count: ' + triangleCount;
	}
}

export { UI };