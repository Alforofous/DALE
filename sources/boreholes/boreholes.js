import * as THREE from 'three';
import { loadShaderSynchronous } from '../shaders/shaderLoader.js';
import { BoreholeLabels } from './boreholeLabels.js';
import { randFloat } from 'three/src/math/MathUtils.js';

const MAX_SECTIONS_PER_BOREHOLE = 4;

class Boreholes extends THREE.InstancedMesh
{
	constructor(instanceCount = 100000, scene)
	{
		if (instanceCount > 16384 || instanceCount < 1)
			console.warn('Boreholes: instanceCount must be between 1 and 16384.');
		//instanceCount = Math.max(1, Math.min(16384, instanceCount));

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
		this.#initInstanceGeometryAttributes();
		this.#initLabels();

		this.layers.set(10);
		this.geometry.computeBoundsTree();
		scene.add(this);
		scene.add(this.labels);
		this.scene = scene;
		this.updateGeometryProperties();
	}

	setTopWithId(id, top)
	{
		for (let i = 0; i < this.instanceCount; i++)
		{
			if (this.info.id[i] === id)
			{
				this.info.top[i].copy(top);
				this.snapBottomTowardsParent(i);
				this.updateGeometryPropertyAtIndex(i);
				this.labels.syncWithPairedBorehole();
				break;
			}
		}
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

	selectAll()
	{
		let highlightAttribute = this.scene.boreholes.geometry.getAttribute('highlight');
		highlightAttribute.array.fill(0);
		this.selector.selectedBoreholeIds = [];
		for (let i = 0; i < this.count; i++)
		{
			const id = this.info.id[i];
			this.selector.selectedBoreholeIds.push(id);
			highlightAttribute.setX(i, 1);
		}
		highlightAttribute.needsUpdate = true;
	}

	selectWithIds(ids)
	{
		let highlightAttribute = this.scene.boreholes.geometry.getAttribute('highlight');
		highlightAttribute.array.fill(0);
		for (let id of ids)
		{
			const index = this.info.id.indexOf(id);
			highlightAttribute.setX(index, 1);
		}
		this.selector.selectedBoreholeIds = ids;
		highlightAttribute.needsUpdate = true;
	}

	add()
	{
		let boreholeId = 0;
		for (let i = 0; i < this.count; i++)
		{
			if (this.info.id[i] === boreholeId)
			{
				boreholeId++;
				i = -1;
			}
		}
		if (boreholeId >= this.instanceCount)
		{
			console.warn('Boreholes: maximum borehole count reached (' + boreholeId + '/' + this.instanceCount + ')');
			return (-1);
		}
		this.setVisibleWithId(boreholeId, true);
		return (boreholeId);
	}

	deleteSelected()
	{
		if (this.selector.selectedBoreholeIds.length === 0)
			return;
		for (let id of this.selector.selectedBoreholeIds)
		{
			this.setVisibleWithId(id, false);
			this.selectWithIds([])
		}
		this.userInterface.sidebar.current.setState({ boreholeCount: this.scene.boreholes.count });
	}

	swapInstances(index1, index2)
	{
		const cachedMatrix = new THREE.Matrix4();
		this.getMatrixAt(index1, cachedMatrix);
		const cachedInstanceId = this.info.id[index1];
		const cachedBottomParent = this.info.bottomParent[index1];
		const cachedTopParent = this.info.topParent[index1];
		const cachedHeight = this.info.height[index1];
		const cachedTop = this.info.top[index1];
		const cachedBottom = this.info.bottom[index1];
		const cachedSections = this.info.sections[index1];

		const matrix = new THREE.Matrix4();
		this.getMatrixAt(index2, matrix);
		this.setMatrixAt(index1, matrix);
		this.info.id[index1] = this.info.id[index2];
		this.info.bottomParent[index1] = this.info.bottomParent[index2];
		this.info.topParent[index1] = this.info.topParent[index2];
		this.info.height[index1] = this.info.height[index2];
		this.info.top[index1] = this.info.top[index2];
		this.info.bottom[index1] = this.info.bottom[index2];
		this.info.sections[index1] = this.info.sections[index2];

		this.setMatrixAt(index2, cachedMatrix);
		this.info.id[index2] = cachedInstanceId;
		this.info.bottomParent[index2] = cachedBottomParent;
		this.info.topParent[index2] = cachedTopParent;
		this.info.height[index2] = cachedHeight;
		this.info.top[index2] = cachedTop;
		this.info.bottom[index2] = cachedBottom;
		this.info.sections[index2] = cachedSections;
		this.instanceMatrix.needsUpdate = true;

		const heightAttribute = this.geometry.getAttribute('instanceHeight');
		heightAttribute.setX(index1, this.info.height[index1]);
		heightAttribute.setX(index2, this.info.height[index2]);
		heightAttribute.needsUpdate = true;
	}

	setVisibleWithId(id, visible)
	{
		const i = this.info.id.indexOf(id);
		if (i === -1)
			return;
		if (visible === true && i >= this.count)
		{
			this.swapInstances(i, this.count);
			this.labels.swapInstances(i, this.count);
			this.count++;
			this.labels.count++;
		}
		else if (visible === false && i < this.count)
		{
			this.swapInstances(i, this.count - 1);
			this.labels.swapInstances(i, this.count - 1);
			this.count--;
			this.labels.count--;
		}
		this.labels.syncWithPairedBorehole();
	}

	scatterWithIds(ids)
	{
		if (ids.length === 0)
			return;
		const distance = 1000;
		for (let id of ids) 
		{
			const index = this.info.id.indexOf(id);
			let moveVector = new THREE.Vector3(randFloat(-distance, distance), randFloat(-distance, distance), randFloat(-distance, distance));

			this.info.top[index].copy(moveVector);
			this.snapBottomTowardsParent(index);
			this.snapTopTowardsParent(index);
		}
		this.updateGeometryProperties();
		this.labels.syncWithPairedBorehole();
	}

	scatterSelected()
	{
		if (this.selector.selectedBoreholeIds.length === 0)
			return;
		const distance = 1000;
		for (let id of this.selector.selectedBoreholeIds) 
		{
			const index = this.info.id.indexOf(id);
			let moveVector = new THREE.Vector3(randFloat(-distance, distance), randFloat(-distance, distance), randFloat(-distance, distance));

			this.info.top[index].copy(moveVector);
			this.snapBottomTowardsParent(index);
			this.snapTopTowardsParent(index);
		}
		this.updateGeometryProperties();
		this.labels.syncWithPairedBorehole();
	}

	updateGeometryPropertyAtIndex(index)
	{
		let matrix = new THREE.Matrix4();
		let up = new THREE.Vector3(0, 1, 0);
		let quaternion = new THREE.Quaternion();
		let instanceHeight = this.geometry.getAttribute('instanceHeight');
		let scale = new THREE.Vector3();

		this.getMatrixAt(index, matrix);
		matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
		let top = this.info.top[index];
		let bottom = this.info.bottom[index];
		let position = new THREE.Vector3().addVectors(top, bottom).multiplyScalar(0.5);
		let height = top.distanceTo(bottom);
		let direction = new THREE.Vector3().subVectors(top, bottom).normalize();
		this.info.height[index] = height;

		quaternion.setFromUnitVectors(up, direction);
		instanceHeight.setX(index, height);
		matrix.compose(position, quaternion, scale);
		this.setMatrixAt(index, matrix);
		this.instanceMatrix.needsUpdate = true;
		this.geometry.attributes.instanceHeight.needsUpdate = true;
		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

	updateGeometryProperties()
	{
		let matrix = new THREE.Matrix4();
		let up = new THREE.Vector3(0, 1, 0);
		let quaternion = new THREE.Quaternion();
		let instanceHeight = this.geometry.getAttribute('instanceHeight');
		let scale = new THREE.Vector3();

		for (let i = 0; i < this.instanceCount; i++)
		{
			this.getMatrixAt(i, matrix);
			matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
			let top = this.info.top[i];
			let bottom = this.info.bottom[i];
			let position = new THREE.Vector3().addVectors(top, bottom).multiplyScalar(0.5);
			let height = top.distanceTo(bottom);
			let direction = new THREE.Vector3().subVectors(top, bottom).normalize();
			this.info.height[i] = height;

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
			sections: Array(this.instanceCount),
		};
		for (let i = 0; i < this.instanceCount; i++)
		{
			this.info.id[i] = i;
			let tmp = this.info.id.indexOf(i);
			this.info.bottomParent[i] = scene.freeSurface[0];
			this.info.height[i] = 0;
			this.info.top[i] = new THREE.Vector3(0, 0, 0);
			this.info.bottom[i] = new THREE.Vector3(0, 0, 0);
			this.info.sections[i] = Array(MAX_SECTIONS_PER_BOREHOLE);
			const sectionLength = 1 / MAX_SECTIONS_PER_BOREHOLE;
			for (let j = 0; j < MAX_SECTIONS_PER_BOREHOLE; j++)
			{
				let sectionColor = 0x000000;
				if (j % MAX_SECTIONS_PER_BOREHOLE === 0)
					sectionColor = 0xFF0000;
				else if (j % MAX_SECTIONS_PER_BOREHOLE === 1)
					sectionColor = 0x00FF00;
				else if (j % MAX_SECTIONS_PER_BOREHOLE === 2)
					sectionColor = 0x0000FF;
				else if (j % MAX_SECTIONS_PER_BOREHOLE === 3)
					sectionColor = 0xFFFFFF;
				else
					sectionColor = 0xFF00FF;
				this.info.sections[i][j] = { start: sectionLength * j, size: sectionLength, color: sectionColor };
			}
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
		const idStrings = this.info.id.map(id => id.toString());
		this.labels.values = idStrings;
		this.labels.initValues();
	}

	#initMaterial()
	{
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				...this.lambertShader.uniforms,
				uBoreholeIdTexture: { value: null },
				uResolution: { value: new THREE.Vector2() },
				uSectionsColorTexture: { value: this.#initSectionsColorData() },
				instanceCount: { value: this.instanceCount },
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

	#initInstanceGeometryAttributes()
	{
		let instanceHeight = new Float32Array(this.info.height);
		this.geometry.setAttribute('instanceHeight', new THREE.InstancedBufferAttribute(instanceHeight, 1));
		let instanceID = new Float32Array(this.instanceCount);
		for (let i = 0; i < this.instanceCount; i++)
			instanceID[i] = i;
		this.geometry.setAttribute('instanceID', new THREE.InstancedBufferAttribute(instanceID, 1));
		const arrayLength = this.instanceCount * MAX_SECTIONS_PER_BOREHOLE;
		let instanceSectionStart = new Float32Array(arrayLength);
		let instanceSectionSize = new Float32Array(arrayLength);
		for (let i = 0; i < this.instanceCount; i++)
		{
			for (let j = 0; j < MAX_SECTIONS_PER_BOREHOLE; j++)
			{
				instanceSectionStart[i * MAX_SECTIONS_PER_BOREHOLE + j] = this.info.sections[i][j].start;
				instanceSectionSize[i * MAX_SECTIONS_PER_BOREHOLE + j] = this.info.sections[i][j].size;
			}
		}
		this.geometry.setAttribute('instanceSectionStart', new THREE.InstancedBufferAttribute(instanceSectionStart, MAX_SECTIONS_PER_BOREHOLE));
		this.geometry.setAttribute('instanceSectionSize', new THREE.InstancedBufferAttribute(instanceSectionSize, MAX_SECTIONS_PER_BOREHOLE));
	}

	#initSectionsColorData()
	{
		let data = new Float32Array(this.instanceCount * MAX_SECTIONS_PER_BOREHOLE * 4);
		for (let i = 0; i < this.instanceCount; i++)
		{
			for (let j = 0; j < MAX_SECTIONS_PER_BOREHOLE; j++)
			{
				let index = (j * this.instanceCount + i) * 4;
				let color = this.info.sections[i][j].color;
				data[index] = ((color & 0xFF0000) >> 16);
				data[index + 1] = ((color & 0x00FF00) >> 8);
				data[index + 2] = (color & 0x0000FF);
			}
		}
		let dataTexture = new THREE.DataTexture(data, this.instanceCount, MAX_SECTIONS_PER_BOREHOLE, THREE.RGBAFormat, THREE.FloatType);
		dataTexture.needsUpdate = true;
		return (dataTexture);
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