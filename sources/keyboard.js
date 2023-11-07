class Keyboard
{
	constructor()
	{
		this.pressedKeyCode = {};
		document.addEventListener('keydown', (event) =>
		{
			let key = event.code;
			if (this.pressedKeyCode[key])
				return;
			this.pressedKeyCode[key] = true;
			this.pressedSignal = true;
		});

		document.addEventListener('keyup', (event) =>
		{
			let key = event.code;
			this.pressedKeyCode[key] = false;
		});
	}

	onKeyDown(userInterface)
	{
		if (this.pressedKeyCode['Digit1'] )
			userInterface.buttons[0].click();
		if (this.pressedKeyCode['Digit2'] )
			userInterface.buttons[1].click();
		if (this.pressedKeyCode['Digit3'] )
			userInterface.buttons[2].click();
	}

	onUpdate(userInterface)
	{
		if (this.pressedSignal === true)
			this.onKeyDown(userInterface);
		this.pressedSignal = false;
	}

	pressedKeyCode = {};
	pressedSignal = false;
}

export { Keyboard };