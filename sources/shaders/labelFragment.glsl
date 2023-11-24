precision highp float;

uniform sampler2D fontTexture;
uniform sampler2D stringTexture;
uniform uint stringTextureSize;
uniform vec2 charPositions[256];
uniform vec2 charSizes[256];

flat in uint vStringLength;
flat in uint vStringOffsetIndex;
in vec2 vUv;

int get_character_ascii_value_from_texture(int index)
{
	int x = (index / 4) % int(stringTextureSize);
	int y = (index / 4) / int(stringTextureSize);
	vec4 color = texelFetch(stringTexture, ivec2(x, y), 0);

	int channel = index % 4;
	if (channel == 0)
		return int(color.r * 255.0);
	else if (channel == 1)
		return int(color.g * 255.0);
	else if (channel == 2) 
		return int(color.b * 255.0);
	else if (channel == 3)
		return int(color.a * 255.0);
	return (-1);
}

void main()
{
	vec4 color;

	int localIndex = int(vUv.x * float(vStringLength));
	int index = localIndex + int(vStringOffsetIndex);

	int char = get_character_ascii_value_from_texture(index);
	vec2 charPosition = charPositions[char];
	vec2 charSize = charSizes[char];

	vec2 indexedUv = vUv * vec2(float(vStringLength), 1.0) - vec2(float(localIndex), 0.0);

	vec2 charUv = (charPosition) + indexedUv * charSize;

	color = texture(fontTexture, charUv);
	//color = texture(fontTexture, vUv);
	//color = vec4(indexedUv, 0.0, 1.0);

	gl_FragColor = color;
}