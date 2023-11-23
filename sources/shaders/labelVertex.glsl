attribute uint stringLengths;
attribute uint stringIndices;

flat out uint vStringLength;
flat out uint vStringOffsetIndex;
out vec2 vUv;

void main()
{
	vUv = uv;
	vStringLength = stringLengths;
	vStringOffsetIndex = stringIndices;

	vec3 instancePosition = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
	vec3 cameraToObject = cameraPosition - instancePosition;
	float distance = length(cameraToObject) / 100.0;
	distance = max(distance, 1.0);
	vec3 look = normalize(cameraToObject);
	vec3 right = normalize(cross(vec3(0, 1, 0), look));
	vec3 up = cross(look, right);

	float scaleFactor = 1.0 * float(vStringLength);
	mat4 scaleMatrix = mat4(scaleFactor, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);	

	mat4 rotationMatrix = mat4(right.x * distance, right.y * distance, right.z * distance, 0, up.x * distance, up.y * distance, up.z * distance, 0, look.x * distance, look.y * distance, look.z * distance, 0, 0, 0, 0, 1);

	vec4 scaledPosition = scaleMatrix * vec4(position, 1.0);
	vec4 rotatedPosition = rotationMatrix * scaledPosition;
	gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * rotatedPosition;
}