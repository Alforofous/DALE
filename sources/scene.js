import * as THREE from 'three';
import { FreeSurface } from './freeSurface/freeSurface.js';
import { Boreholes } from './boreholes/boreholes.js';
import { Model } from './model.js';

class Scene extends THREE.Scene
{
	constructor()
	{
		super();
		this.boreholes = null;
		this.boreholeCylinders = [];

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
		directionalLight.position.set(0, 1, 2);
		directionalLight.castShadow = true;
		directionalLight.layers.enable(1);
		directionalLight.layers.enable(2);
		this.add(directionalLight);

		const pointLight = new THREE.PointLight(0xffffff, 5000.0);
		pointLight.position.set(100, 600, 0);
		pointLight.castShadow = true;
		this.add(pointLight);

		const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, pointLight.color);
		pointLight.add(pointLightHelper);
		this.add(pointLightHelper);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		ambientLight.layers.enable(1);
		ambientLight.layers.enable(2);
		this.add(ambientLight);

		this.opacitySlider = document.getElementById('opacitySlider');
		this.opacitySlider.addEventListener('input', this.changeTerrainMeshOpacity.bind(this));

		this.freeSurface = [];
		this.freeSurface.push(new FreeSurface({x: 10000, y: 10000}, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0)));
		this.add(this.freeSurface[0]);

		this.modelLoader = new Model(this);
		this.boreholes = new Boreholes(100, this);
	}

	changeTerrainMeshOpacity()
	{
		console.log(this.opacitySlider.value);
		let value = parseFloat(this.opacitySlider.value) / 100;
		this.setOpacity(this.terrainMesh, value);
	}

	setOpacity(object, value)
	{
		if (Array.isArray(object.material))
		{
			for (let i = 0; i < object.material.length; i++)
			{
				object.material[i].opacity = value;
				object.material[i].transparent = value < 1;
			}
		} else
		{
			object.material.opacity = value;
			object.material.transparent = value < 1;
		}
	}
}

export { Scene };