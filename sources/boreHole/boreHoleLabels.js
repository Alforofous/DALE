import * as THREE from 'three';
import { loadShader } from '../shaders/shaderLoader.js';

class BoreholeLabels extends THREE.InstancedMesh
{
	constructor(fontTexturePath, fontAtlasPath, instanceCount)
	{
		const geometry = new THREE.PlaneGeometry(2, 3);
		const tmpMaterial = new THREE.MeshBasicMaterial({ color: 0x5D5D5D });
		super(geometry, tmpMaterial, instanceCount);
		this.instanceCount = instanceCount;
		this.geometry = geometry;

		const loader = new THREE.TextureLoader();
		Promise.all([
			loadShader('sources/shaders/labelVertex.glsl'),
			loadShader('sources/shaders/labelFragment.glsl'),
			loader.load(fontTexturePath),
			fetch(fontAtlasPath).then(response => response.json())
		]).then(([vertexShaderCode, fragmentShaderCode, fontTexture, fontData]) =>
		{
			this.vertexShaderCode = vertexShaderCode;
			this.fragmentShaderCode = fragmentShaderCode;
			this.fontTexture = fontTexture;
			this.fontData = fontData;
			this.init();
		});
	}

	init()
	{
		this.characterData = this.#initCharacterData();

		let stringArray = new Array(this.instanceCount);
		let stringIndices = new Uint32Array(this.instanceCount);
		let stringLengths = new Uint32Array(this.instanceCount);
		let currentIndex = 0;

		for (let i = 0; i < this.instanceCount; i++)
		{
			let instanceText = i.toString();
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

		this.fontTexture.minFilter = THREE.NearestFilter;
		const material = new THREE.ShaderMaterial({
			uniforms: {
				fontTexture: { value: this.fontTexture },
				objectPosition: { value: this.position },
				charPositions: { value: this.characterData.positions },
				charSizes: { value: this.characterData.sizes },
				stringTexture: { value: stringsUniform },
				stringTextureSize: { value: stringTextureSize },
				uCameraForward: { value: new THREE.Vector3() },
				uCameraRight: { value: new THREE.Vector3() },
				uCameraUp: { value: new THREE.Vector3() },
			},
			vertexShader: this.vertexShaderCode,
			fragmentShader: this.fragmentShaderCode,
			transparent: true,
		});
		this.material = material;
		this.layers.set(2);
		this.geometry.computeBoundsTree();
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

	#initCharacterData()
	{
		let positions = new Float32Array(256 * 2);
		let sizes = new Float32Array(256 * 2);

		for (let char in this.fontData.characters)
		{
			let charData = this.fontData.characters[char];
			let index = char.charCodeAt(0) * 2;
			let charWidth = charData.width / this.fontData.width;
			let charHeight = charData.height / this.fontData.height;
			sizes[index] = charWidth;
			sizes[index + 1] = charHeight;
			positions[index] = charData.x / this.fontData.width;
			positions[index + 1] = 1 - charData.y / this.fontData.height - charHeight;
		}

		return { positions, sizes };
	}
}

export { BoreholeLabels };