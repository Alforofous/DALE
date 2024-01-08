import * as THREE from 'three';
import { loadShaderSynchronous } from '../shaders/shaderLoader.js';

class BoreholeLabels extends THREE.InstancedMesh
{
	constructor(fontTexturePath, fontAtlasPath, instanceCount, boreholes)
	{
		const geometry = new THREE.PlaneGeometry(2.0, 2.5);
		const tmpMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(geometry, tmpMaterial, instanceCount);
		this.instanceCount = instanceCount;
		this.geometry = geometry;
		this.boreholes = boreholes;
		this.visible = false;

		const loader = new THREE.TextureLoader();
		this.vertexShaderCode = loadShaderSynchronous('sources/shaders/labelVertex.glsl');
		this.fragmentShaderCode = loadShaderSynchronous('sources/shaders/labelFragment.glsl');
		Promise.all([
			loader.load(fontTexturePath),
			fetch(fontAtlasPath).then(response => response.json())
		]).then(([fontTexture, fontData]) =>
		{
			fontTexture.minFilter = THREE.LinearFilter;
			this.material.uniforms.fontTexture.value = fontTexture;
			this.characterData = this.#initCharacterData(fontData);
			this.material.uniforms.charPositions.value = this.characterData.positions;
			this.material.uniforms.charSizes.value = this.characterData.sizes;
			this.material.uniforms.charPixelSizes.value = this.characterData.pixelSizes;
			this.material.uniforms.maxPixelWidth.value = fontData.maxPixelWidth;
			this.material.uniforms.advances.value = this.characterData.advances;
		});
		this.values = undefined;
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				fontTexture: { value: null },
				charPositions: { value: null },
				charSizes: { value: null },
				charPixelSizes: { value: null },
				advances: { value: null },
				maxPixelWidth: { value: null },
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
		for (let i = 0; i < instanceCount; i++)
		{
			let vector = this.boreholes.info.top[i];
			let matrix = new THREE.Matrix4().makeTranslation(vector.x, vector.y, vector.z);
			this.setMatrixAt(i, matrix);
		}
		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingBox();
		this.computeBoundingSphere();
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

	updateUniforms(camera)
	{
		if (this.material.uniforms)
		{
			let uCameraForward = camera.getWorldDirection(new THREE.Vector3());
			this.material.uniforms.uCameraForward.value = uCameraForward;

			let cameraUp = camera.up;
			let uCameraRight = new THREE.Vector3().crossVectors(uCameraForward, cameraUp).normalize();
			let uCameraUp = new THREE.Vector3().crossVectors(uCameraRight, uCameraForward).normalize();
			this.material.uniforms.uCameraUp.value = uCameraUp;
			this.material.uniforms.uCameraRight.value = uCameraRight;
		}
	}

	#initCharacterData(fontData)
	{
		let positions = new Float32Array(256 * 2);
		let sizes = new Float32Array(256 * 2);
		let pixelSizes = new Uint32Array(256 * 2);
		let advances = new Uint32Array(256);

		fontData.maxPixelWidth = 0;
		for (let char in fontData.characters)
		{
			let charData = fontData.characters[char];
			let index = char.charCodeAt(0) * 2;
			let charWidth = charData.width / fontData.width;
			let charHeight = charData.height / fontData.height;
			sizes[index] = charWidth;
			sizes[index + 1] = charHeight;
			pixelSizes[index] = charData.width;
			pixelSizes[index + 1] = charData.height;
			positions[index] = charData.x / fontData.width;
			positions[index + 1] = 1 - charData.y / fontData.height - charHeight;
			advances[index] = charData.advance;

			if (pixelSizes[index] > fontData.maxPixelWidth)
				fontData.maxPixelWidth = pixelSizes[index];
		}

		return { positions, sizes, pixelSizes, advances };
	}
}

export { BoreholeLabels };