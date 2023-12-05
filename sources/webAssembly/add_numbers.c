#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int add_numbers(int a, int b)
{
	return a + b;
}