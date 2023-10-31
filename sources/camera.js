export function updateCamera(camera, keysPressed, mouseMovement, clock)
{
    const deltaTime = clock.getDelta();
    const speed = 10.0 * deltaTime;

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

    camera.rotation.y -= mouseMovement.x * 0.002;
    camera.rotation.x -= mouseMovement.y * 0.002;
}