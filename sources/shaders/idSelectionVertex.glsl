attribute vec3 instanceUUID;
attribute float instanceHeight;

out vec3 vinstanceUUID;

void main()
{
	vinstanceUUID = instanceUUID;
	vec3 newPosition = position;
	newPosition.y *= instanceHeight;
	gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPosition, 1.0);
}