#include <emscripten.h>
#include "glm/glm.hpp"

extern "C"
{
	EMSCRIPTEN_KEEPALIVE
	float angle_between_vectors(float v1[3], float v2[3])
	{
		glm::vec3 v1_vec = glm::vec3(v1[0], v1[1], v1[2]);
		glm::vec3 v2_vec = glm::vec3(v2[0], v2[1], v2[2]);
		float dot = glm::dot(v1_vec, v2_vec);
		return acos(dot / (glm::length(v1_vec) * glm::length(v2_vec)));
	}

	EMSCRIPTEN_KEEPALIVE
	int add_numbers(int a, int b)
	{
		return a + b;
	}
}