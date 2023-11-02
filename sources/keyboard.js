class Keyboard
{
	constructor()
	{
		this.pressedKeys = {};
		document.addEventListener('keydown', (event) =>
		{
			let key = event.key;
			if (key.match(/^[a-zA-Z]$/)) {
				key = key.toLowerCase();
			}
			this.pressedKeys[key] = true;
		});

		document.addEventListener('keyup', (event) =>
		{
			let key = event.key;
			if (key.match(/^[a-zA-Z]$/)) {
				key = key.toLowerCase();
			}
			this.pressedKeys[key] = false;
		});
	}

	pressedKeys = {};
}

export { Keyboard };