in vec3 vInstanceUUID;

void main()
{
	gl_FragColor = vec4(vInstanceUUID.rgb, 1.0);
}