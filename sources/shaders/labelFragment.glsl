precision highp float;

uniform sampler2D fontTexture;
uniform sampler2D stringTexture;
uniform uint stringTextureSize;
uniform vec2 charPositions[256];
uniform vec2 charSizes[256];
uniform ivec2 charPixelSizes[256];
uniform uint advances[256];
uniform uint maxPixelWidth;

flat in uint vStringLength;
flat in uint vStringOffsetIndex;
in vec2 vUv;

int getAsciiValueFromTexture(int index)
{
	int x = (index / 4) % int(stringTextureSize);
	int y = (index / 4) / int(stringTextureSize);
	vec4 color = texelFetch(stringTexture, ivec2(x, y), 0);

	int channel = index % 4;
	switch (channel)
	{
		case 0:
			return int(color.r * 255.0);
		case 1:
			return int(color.g * 255.0);
		case 2:
			return int(color.b * 255.0);
		case 3:
			return int(color.a * 255.0);
		default:
			return -1;
	}
}



void main()
{
	vec4 color;

	int localIndex = int(vUv.x * float(vStringLength));
	int index = localIndex + int(vStringOffsetIndex);

	int char = getAsciiValueFromTexture(index);
	vec2 charPosition = charPositions[char];
	vec2 charSize = charSizes[char];
	ivec2 charPixelSize = charPixelSizes[char];
	float charWidthRatio = float(charPixelSize.x) / float(maxPixelWidth);

	vec2 indexedUv = vUv * vec2(float(vStringLength), 1.0) - vec2(float(localIndex), 0.0);
	vec2 charSpace = indexedUv;
	indexedUv.x /= charWidthRatio;
	//indexedUv.x -= charWidthRatio / 2.0;

	vec2 charUv = (charPosition) + indexedUv * charSize;

	if (indexedUv.x >= 0.0 && indexedUv.x <= 1.0 && indexedUv.y >= 0.0 && indexedUv.y <= 1.0)
		color = texture(fontTexture, charUv);
	else
		color = vec4(0.0, 0.0, 0.0, 0.0);

	//color = texture(fontTexture, vUv);
	//color = vec4(charUv, 0.0, 1.0);
	//color = vec4(indexedUv, 0.0, 1.0);
	//color = mix(color, vec4(charSpace, 0.0, 1.0), 0.8);

	gl_FragColor = color;
}