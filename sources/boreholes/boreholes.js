import * as THREE from 'three';
import { loadShaderSynchronous } from '../shaders/shaderLoader.js';
import { BoreholeLabels } from './boreholeLabels.js';

class Boreholes extends THREE.InstancedMesh
{
	constructor(instanceCount = 100000, scene)
	{
		const geometry = new THREE.CylinderGeometry(5, 5, 1, 8);
		const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(geometry, tempMaterial, instanceCount);

		this.frustumCulled = false;
		this.geometry = geometry;
		this.instanceCount = instanceCount;

		this.#initInfo(scene);
		this.#loadShaders();
		this.#initMaterial();
		this.#initHighlightAttribute();
		this.#initInstanceUUIDsAttribute();
		this.#initInstanceGeometryAttribute();
		this.#initLabels();

		this.layers.set(10);
		this.geometry.computeBoundsTree();
		scene.add(this);
		scene.add(this.labels);
		this.scene = scene;
		this.updateGeometryProperties();
	}

	snapTopTowardsParent(index)
	{
		let raycaster = new THREE.Raycaster();
		raycaster.firstHitOnly = true;
		let direction = this.info.bottomParent[index].plane.normal;
		let origin = this.info.bottom[index].clone().add(direction.clone().multiplyScalar(-9999999));
		raycaster.set(origin, direction);

		let intersects = raycaster.intersectObjects([this.info.topParent[index]]);
		if (intersects.length > 0)
			this.info.top[index].copy(intersects[0].point);
		else
			this.info.top[index].copy(this.projectPointOntoPlane(origin, this.info.bottomParent[index].plane).add(direction.clone().multiplyScalar(0.1)));
	}

	snapBottomTowardsParent(index)
	{
		let raycaster = new THREE.Raycaster();
		raycaster.firstHitOnly = true;
		let direction = this.info.bottomParent[index].plane.normal;
		let origin = this.info.top[index].clone().add(direction.clone().multiplyScalar(-9999999));
		raycaster.set(origin, direction);

		let intersects = raycaster.intersectObjects([this.info.bottomParent[index]]);
		if (intersects.length > 0)
			this.info.bottom[index].copy(intersects[0].point);
		else
			this.info.bottom[index].copy(this.projectPointOntoPlane(origin, this.info.bottomParent[index].plane));
	}

	projectPointOntoPlane(point, plane)
	{
		let coplanarPoint = new THREE.Vector3();
		plane.coplanarPoint(coplanarPoint);

		let pointToPlaneVector = new THREE.Vector3().subVectors(point, coplanarPoint);
		let distanceToPlane = pointToPlaneVector.dot(plane.normal);
		let scaledNormal = plane.normal.clone().multiplyScalar(distanceToPlane);
		let projection = new THREE.Vector3().subVectors(point, scaledNormal);
		return projection;
	}

	updateGeometryProperties()
	{
		let matrix = new THREE.Matrix4();
		let up = new THREE.Vector3(0, 1, 0);
		let quaternion = new THREE.Quaternion();
		let instanceHeight = this.geometry.getAttribute('instanceHeight');
		const scale = new THREE.Vector3(1, 1, 1);

		for (let i = 0; i < this.instanceCount; i++)
		{
			let top = this.info.top[i];
			let bottom = this.info.bottom[i];
			let position = new THREE.Vector3().addVectors(top, bottom).multiplyScalar(0.5);
			let height = top.distanceTo(bottom);
			let direction = new THREE.Vector3().subVectors(top, bottom).normalize();

			quaternion.setFromUnitVectors(up, direction);
			instanceHeight.setX(i, height);
			matrix.compose(position, quaternion, scale);
			this.setMatrixAt(i, matrix);
		}
		this.instanceMatrix.needsUpdate = true;
		this.geometry.attributes.instanceHeight.needsUpdate = true;
		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

	switchToDefaultShader()
	{
		this.material.vertexShader = this.vertexShaderCode;
		this.material.fragmentShader = this.fragmentShaderCode;
		this.material.needsUpdate = true;
	}

	switchToIdShader()
	{
		this.material.vertexShader = this.idSelectionVertexCode;
		this.material.fragmentShader = this.idSelectionFragmentCode;
		this.material.needsUpdate = true;
	}

	getCylinderProperties(top, bottom)
	{
		let position = new THREE.Vector3().addVectors(top, bottom).multiplyScalar(0.5);
		let direction = new THREE.Vector3().subVectors(top, bottom).normalize();
		return { position, direction };
	}

	#initInfo(scene)
	{
		this.info = {
			id: Array(this.instanceCount),
			bottomParent: Array(this.instanceCount),
			topParent: Array(this.instanceCount),
			height: Array(this.instanceCount),
			top: Array(this.instanceCount),
			bottom: Array(this.instanceCount),
		};
		for (let i = 0; i < this.instanceCount; i++)
		{
			this.info.id[i] = 'ID ' + i.toString();
			this.info.bottomParent[i] = scene.freeSurface[0];
			this.info.height[i] = i + 1;
			this.info.top[i] = new THREE.Vector3(0, 100, 0);
			this.info.bottom[i] = new THREE.Vector3(0, 0, 0);
		}
		this.#initTopParent(scene);
	}

	#initTopParent(scene)
	{
		if (scene.terrainMesh === undefined)
		{
			requestAnimationFrame(this.#initTopParent.bind(this, scene));
			return;
		}
		for (let i = 0; i < this.instanceCount; i++)
			this.info.topParent[i] = scene.terrainMesh;
	}

	#initHighlightAttribute()
	{
		this.geometry.setAttribute('highlight', new THREE.InstancedBufferAttribute(new Float32Array(this.instanceCount), 1));
	}

	#initLabels()
	{
		const fontName = 'andale_mono';
		this.labels = new BoreholeLabels('assets/textures/fontAtlas/' + fontName + '.png', 'assets/fontAtlasData/' + fontName + '.json', this.instanceCount, this);
		this.labels.geometry.computeBoundsTree();
		this.labels.values = this.info.id;
		this.labels.initValues();
	}

	#initMaterial()
	{
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				...this.lambertShader.uniforms,
				uBoreholeIdTexture: { value: null },
				uResolution: { value: new THREE.Vector2() },
			},
			vertexShader: this.idSelectionVertexCode,
			fragmentShader: this.idSelectionFragmentCode,
			lights: true
		});
		this.material.uniforms.diffuse.value.set(0x5DD2FF);
	}

	#initInstanceUUIDsAttribute()
	{
		let instanceUUIDs = new Float32Array(this.instanceCount * 3);
		for (let i = 0; i < this.instanceCount; i++)
		{
			let instanceId = i + 1;
			let r = (instanceId & 0xFF0000) >> 16;
			let g = (instanceId & 0x00FF00) >> 8;
			let b = instanceId & 0x0000FF;
		
			instanceUUIDs[i * 3] = r / 255;
			instanceUUIDs[i * 3 + 1] = g / 255;
			instanceUUIDs[i * 3 + 2] = b / 255;
		}
		this.geometry.setAttribute('instanceUUID', new THREE.InstancedBufferAttribute(instanceUUIDs, 3));
	}

	#initInstanceGeometryAttribute()
	{
		let instanceHeight = new Float32Array(this.info.height);
		this.geometry.setAttribute('instanceHeight', new THREE.InstancedBufferAttribute(instanceHeight, 1));
	}

	#loadShaders()
	{
		this.lambertShader = THREE.ShaderLib['lambert'];

		this.vertexShaderCode = loadShaderSynchronous('sources/shaders/boreholeVertex.glsl');
		this.fragmentShaderCode = loadShaderSynchronous('sources/shaders/boreholeFragment.glsl');

		this.idSelectionVertexCode = loadShaderSynchronous('sources/shaders/idSelectionVertex.glsl');
		this.idSelectionFragmentCode = loadShaderSynchronous('sources/shaders/idSelectionFragment.glsl');
	}
}

export { Boreholes };