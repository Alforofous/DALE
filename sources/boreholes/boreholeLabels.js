import * as THREE from 'three';
import { loadShaderSynchronous } from '../shaders/shaderLoader.js';

class BoreholeLabels extends THREE.InstancedMesh
{
	constructor(fontTexturePath, fontAtlasPath, instanceCount, boreholes)
	{
		const geometry = new THREE.PlaneGeometry(1.7, 2.5);
		const tmpMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(geometry, tmpMaterial, instanceCount);
		this.instanceCount = instanceCount;
		this.geometry = geometry;
		this.boreholes = boreholes;

		const loader = new THREE.TextureLoader();
		this.vertexShaderCode = loadShaderSynchronous('sources/shaders/labelVertex.glsl');
		this.fragmentShaderCode = loadShaderSynchronous('sources/shaders/labelFragment.glsl');
		Promise.all([
			loader.load(fontTexturePath),
			fetch(fontAtlasPath).then(response => response.json())
		]).then(([fontTexture, fontData]) =>
		{
			fontTexture.minFilter = THREE.NearestFilter;
			this.material.uniforms.fontTexture.value = fontTexture;
			this.characterData = this.#initCharacterData(fontData);
			this.material.uniforms.charPositions.value = this.characterData.positions;
			this.material.uniforms.charSizes.value = this.characterData.sizes;
		});
		this.values = undefined;
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				fontTexture: { value: null },
				charPositions: { value: null },
				charSizes: { value: null },
				stringTexture: { value: null },
				stringTextureSize: { value: null },
				uCameraForward: { value: null },
				uCameraRight: { value: null },
				uCameraUp: { value: null },
			},
			vertexShader: this.vertexShaderCode,
			fragmentShader: this.fragmentShaderCode,
			transparent: true,
		});
		this.layers.set(2);
	}

	syncWithBoreholes()
	{
		let instanceCount = this.boreholes.instanceCount;
		let matrix = new THREE.Matrix4();
		let halfHeight = this.boreholes.geometry.parameters.height / 2;
		let translationMatrix = new THREE.Matrix4().makeTranslation(0, halfHeight, 0);
		for (let i = 0; i < instanceCount; i++)
		{
			this.boreholes.getMatrixAt(i, matrix);
			matrix.multiply(translationMatrix);
			this.setMatrixAt(i, matrix);
		}
		this.instanceMatrix.needsUpdate = true;
		this.boreholes.labels.computeBoundingBox();
		this.boreholes.labels.computeBoundingSphere();
	}

	setValueAtIndex(index, value)
	{
		this.values[index] = value;
		initValues();
	}

	initValues()
	{
		let stringArray = new Array(this.instanceCount);
		let stringIndices = new Uint32Array(this.instanceCount);
		let stringLengths = new Uint32Array(this.instanceCount);

		let currentIndex = 0;
		for (let i = 0; i < this.instanceCount; i++)
		{
			let instanceText = this.values[i];
			stringArray[i] = instanceText;
			stringIndices[i] = currentIndex;
			stringLengths[i] = instanceText.length;
			currentIndex += instanceText.length;
		}
		let strings = stringArray.join('');

		let stringLengthsAttribute = new THREE.InstancedBufferAttribute(stringLengths, 1);
		let stringIndicesAttribute = new THREE.InstancedBufferAttribute(stringIndices, 1);

		this.geometry.setAttribute('stringLengths', stringLengthsAttribute);
		this.geometry.setAttribute('stringIndices', stringIndicesAttribute);
		let stringsUniform = this.createStringTexture(strings);
		let stringTextureSize = Math.ceil(Math.sqrt(strings.length / 4));

		this.material.uniforms.stringTexture.value = stringsUniform;
		this.material.uniforms.stringTextureSize.value = stringTextureSize;
	}

	createStringTexture(str)
	{
		let width = Math.ceil(Math.sqrt(str.length / 4));
		let height = width;

		let data = new Uint8Array(width * height * 4);
		for (let i = 0; i < str.length; i++)
		{
			data[i] = str.charCodeAt(i);
		}

		let texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
		texture.needsUpdate = true;
		return texture;
	}

	#initCharacterData(fontData)
	{
		let positions = new Float32Array(256 * 2);
		let sizes = new Float32Array(256 * 2);

		for (let char in fontData.characters)
		{
			let charData = fontData.characters[char];
			let index = char.charCodeAt(0) * 2;
			let charWidth = charData.width / fontData.width;
			let charHeight = charData.height / fontData.height;
			sizes[index] = charWidth;
			sizes[index + 1] = charHeight;
			positions[index] = charData.x / fontData.width;
			positions[index + 1] = 1 - charData.y / fontData.height - charHeight;
		}

		return { positions, sizes };
	}
}

export { BoreholeLabels };