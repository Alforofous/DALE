class Mouse
{
	constructor(renderer, camera)
	{
		this.deltaMove = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };

		document.addEventListener('mousemove', (event) =>
		{
			if (this.isCaptured)
				camera.updateMouse(event.movementX, event.movementY);
		});

		document.addEventListener('click', (event) =>
		{
			this.isClicked = true;
			if (event.button === 0 && event.target === renderer.domElement)
			{
				this.isCaptured = true;
				document.body.requestPointerLock();
			}
			requestAnimationFrame(() =>
			{
				this.isClicked = false;
			});
		});

		/*
		document.addEventListener('pointerlockchange', function ()
		{
			if (!document.pointerLockElement && isCapturingMouse)
			{
				document.body.requestPointerLock();
			}
		});
		*/
	}

	deltaMove;
	position = { x: 0, y: 0 };
	isClicked = false;
	isCaptured = false;
	#lastMousePosition = { x: 0, y: 0 };
}

export { Mouse };