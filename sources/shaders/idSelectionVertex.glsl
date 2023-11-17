attribute vec3 instanceColor;
varying vec3 vInstanceColor;

void main()
{
	vInstanceColor = instanceColor;
	gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
}