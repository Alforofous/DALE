uniform sampler2D tDiffuse;
uniform sampler2D uOutlinedBoreholesTexture;

in vec2 vUv;

void main()
{
	vec4 diffuseColor = texture2D(tDiffuse, vUv);
	vec4 outlinedBoreholeColor = texture2D(uOutlinedBoreholesTexture, vUv);

	float transition = 0.5;
	if (outlinedBoreholeColor.rgb == vec3(0.0))
		transition = 0.0;

	gl_FragColor = mix(diffuseColor, outlinedBoreholeColor, transition);
}