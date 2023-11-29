in vec3 vinstanceUUID;

void main()
{
	gl_FragColor = vec4(vinstanceUUID.rgb, 1.0);
}