import * as THREE from 'three';

class Scene extends THREE.Scene
{
	constructor()
	{
		super();

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 1, 2);
		directionalLight.castShadow = true;
		this.add(directionalLight);

		const pointLight = new THREE.PointLight(0xffffff, 5000.0);
		pointLight.position.set(100, 600, 0);
		pointLight.castShadow = true;
		this.add(pointLight);

		const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, pointLight.color);
		pointLight.add(pointLightHelper);
		this.add(pointLightHelper);

		const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
		this.add(ambientLight);

		this.opacitySlider = document.getElementById('opacitySlider');
		this.opacitySlider.addEventListener('input', this.changeOpacity.bind(this));

		const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 20, 20);
		const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x5D8DD9, wireframe: true });
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.lookAt(new THREE.Vector3(0, 1, 0));
		plane.position.y = this.reference_height;
		this.add(plane);

		let canvas = document.createElement('canvas');
		canvas.width = 500;  // adjust as needed
		canvas.height = 100;  // adjust as needed
		let context = canvas.getContext('2d');

		context.fillStyle = 'rgba(2, 2, 255, 0.5)';  // adjust color and transparency as needed
		context.fillRect(0, 0, canvas.width, canvas.height);

		let texture = new THREE.CanvasTexture(canvas);

		let material = new THREE.SpriteMaterial({
			map: texture,
			transparent: true,
			opacity: 0.5,
		});

		let sprite = new THREE.Sprite(material);
		sprite.position.set(0, 0, 0);  // adjust as needed
		sprite.scale.set(100, 100, 1);  // adjust as needed

		this.add(sprite);
	}

	changeOpacity()
	{
		let value = parseFloat(this.opacitySlider.value) / 100;
		for (let i = 0; i < this.children.length; i++)
		{
			let object = this.children[i];
			if (object instanceof THREE.Group)
			{
				object.traverse((child) =>
				{
					if (child.material)
					{
						this.setOpacity(child, value);
					}
				});
			} else if (object.material)
			{
				this.setOpacity(object, value);
			}
		}
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

	opacitySlider;
	currentDynamicMesh;
	reference_height = 0;
}

export { Scene };