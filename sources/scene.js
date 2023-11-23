import * as THREE from 'three';

class Scene extends THREE.Scene
{
	constructor()
	{
		super();
		this.referenceHeight = 0;
		this.boreHoles = null;
		this.boreHoleCylinders = [];

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

		const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 20, 20);
		const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xF4CD15, wireframe: true });
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.lookAt(new THREE.Vector3(0, 1, 0));
		plane.position.y = this.referenceHeight;
		this.add(plane);
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