in vec3 vInstanceColor;

void main()
{
	gl_FragColor = vec4(vInstanceColor.rgb, 1.0);
}