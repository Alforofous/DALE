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
			this.pressedKeyCodeSignal[key] = true;
			requestAnimationFrame(() => this.pressedKeyCodeSignal[key] = false);
		});

		document.addEventListener('keyup', (event) =>
		{
			let key = event.code;
			this.pressedKeyCode[key] = false;
		});
	}

	onKeyDown(userInterface)
	{
		if (this.pressedKeyCodeSignal['Digit1'])
			userInterface.tool_menus[0].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit2'])
			userInterface.tool_menus[1].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit3'])
			userInterface.tool_menus[2].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit4'])
			userInterface.tool_menus[3].selectNextButton();
		else if (this.pressedKeyCodeSignal['ShiftRight'])
			userInterface.showViewport2 = !userInterface.showViewport2;

		if (userInterface.activeToolMenu() !== undefined)
		{
			document.body.style.cursor = 'crosshair';
			document.exitPointerLock();
		}
		else
		{
			document.body.style.cursor = 'default';
		}
	}

	onUpdate(userInterface)
	{
		if (Object.values(this.pressedKeyCodeSignal).some(value => value === true))
			this.onKeyDown(userInterface);
	}

	pressedKeyCode = {};
	pressedKeyCodeSignal = {};
}

export { Keyboard };