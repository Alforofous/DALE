export function updateCamera(camera, keysPressed, clock)
{
    const deltaTime = clock.getDelta();
    const speed = 0.5 * deltaTime;

    if (keysPressed['w']) {
        camera.position.z -= speed;
    }
    if (keysPressed['a']) {
        camera.position.x -= speed;
    }
    if (keysPressed['s']) {
        camera.position.z += speed;
    }
    if (keysPressed['d']) {
        camera.position.x += speed;
    }
    if (keysPressed['q']) {
        camera.position.y -= speed;
    }
    if (keysPressed['e']) {
        camera.position.y += speed;
    }
}