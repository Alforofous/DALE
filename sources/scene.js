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

		/*
		const pointLight = new THREE.PointLight(0xffffff, 5000.0);
		pointLight.position.set(100, 600, 0);
		pointLight.castShadow = true;
		this.add(pointLight);

		const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, pointLight.color);
		pointLight.add(pointLightHelper);
		this.add(pointLightHelper);
		*/

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		ambientLight.layers.enable(1);
		ambientLight.layers.enable(2);
		this.add(ambientLight);

		this.freeSurface = [];
		this.freeSurface.push(new FreeSurface({x: 10000, y: 10000}, new THREE.Vector3(0, 1, 0.0), new THREE.Vector3(0, 0, 0)));
		this.add(this.freeSurface[0]);

		this.modelLoader = new Model(this);
		this.boreholes = new Boreholes(16348, this);
		this.boreholes.count = 0;
		this.boreholes.labels.count = 0;
	}

	changeTerrainMeshOpacity(opacity)
	{
		this.terrainMesh.traverse((node) => {
			if (node.isMesh) {
				node.material.transparent = true;
				node.material.opacity = opacity;
			}
		});
	}

	toggleTerrainWireframe()
	{
		this.terrainMesh.traverse((node) => {
			if (node.isMesh) {
				node.material.wireframe = !node.material.wireframe;
			}
		});
	}

	toggleBoreholeLabelVisibility()
	{
		this.boreholes.labels.visible = !this.boreholes.labels.visible;
		if (this.boreholes.labels.visible === true)
			this.boreholes.labels.count = this.boreholes.count;
		else
			this.boreholes.labels.count = 0;
		this.boreholes.labels.computeBoundingBox();
		this.boreholes.labels.computeBoundingSphere();
		this.boreholes.labels.instanceMatrix.needsUpdate = true;
	}
}

export { Scene };