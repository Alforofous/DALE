uniform sampler2D tDiffuse;
uniform sampler2D uOutlinedBoreholesTexture;
uniform sampler2D uBoreholeLabelsTexture;

in vec2 vUv;

void main()
{
	vec4 diffuseColor = texture2D(tDiffuse, vUv);
	vec4 outlinedBoreholeColor = texture2D(uOutlinedBoreholesTexture, vUv);
	vec4 boreholeLabelColor = texture2D(uBoreholeLabelsTexture, vUv);

	float transition = 0.5;
	if (outlinedBoreholeColor.rgb == vec3(0.0))
		transition = 0.0;

	gl_FragColor = mix(diffuseColor, outlinedBoreholeColor, transition);

	transition = 0.5;
	if (boreholeLabelColor.rgb == vec3(0.0))
		transition = 0.0;
	gl_FragColor = mix(gl_FragColor, boreholeLabelColor, transition);
}