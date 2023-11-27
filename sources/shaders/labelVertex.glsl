uniform vec3 uCameraForward;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;

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
	float distance = max(length(cameraToObject) / 100.0, 1.0);

	mat4 scaleMatrix = mat4(float(vStringLength), 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
	mat4 rotationMatrix = mat4(uCameraRight.x * distance, uCameraRight.y * distance, uCameraRight.z * distance, 0, uCameraUp.x * distance, uCameraUp.y * distance, uCameraUp.z * distance, 0, -uCameraForward.x * distance, -uCameraForward.y * distance, -uCameraForward.z * distance, 0, 0, 0, 0, 1);
	mat4 translationMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, distance, 0.0, 1.0);

	vec4 scaledPosition = scaleMatrix * vec4(position, 1.0);
	vec4 rotatedPosition = rotationMatrix * scaledPosition;
	vec4 translatedPosition = translationMatrix * rotatedPosition;

	gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * translatedPosition;
}