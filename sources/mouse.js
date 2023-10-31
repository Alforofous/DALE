class Mouse
{
	constructor()
	{
		deltaMove = { x: 0, y: 0 };
		position = { x: 0, y: 0 };

		document.addEventListener('mousemove', function (event)
		{
			deltaMove.x = event.clientX - lastMousePosition.x;
			deltaMove.y = event.clientY - lastMousePosition.y;
			lastMousePosition.x = event.clientX;
			lastMousePosition.y = event.clientY;
		});
	}

	deltaMove;
	position;

	get deltaMove() 
	{
		return this._deltaMove;
	}

	get position() 
	{
		return this._position;
	}

	#lastMousePosition = { x: 0, y: 0 };
}

export { Mouse };