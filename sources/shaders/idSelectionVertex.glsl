attribute vec3 instanceColor;
attribute float instanceHeight;

out vec3 vInstanceColor;

void main()
{
	vInstanceColor = instanceColor;
	vec3 newPosition = position;
	newPosition.y *= instanceHeight;
	gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPosition, 1.0);
}