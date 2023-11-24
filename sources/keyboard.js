class Keyboard
{
	constructor(scene)
	{
		this.pressedKeyCode = {};
		this.pressedKeyCodeSignal = {};
		this.releasedKeyCodeSignal = {};
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
			this.releasedKeyCodeSignal[key] = true;
			requestAnimationFrame(() => this.releasedKeyCodeSignal[key] = false);
		});

		this.scene = scene;
	}

	onKeyUp(userInterface)
	{
		if (this.releasedKeyCodeSignal['ShiftLeft'])
		{
			this.scene.boreHoles.selector.addToSelection = false;
		}
	}

	onKeyDown(userInterface)
	{
		if (this.pressedKeyCodeSignal['Digit1'])
			userInterface.toolMenus[0].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit2'])
			userInterface.toolMenus[1].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit3'])
			userInterface.toolMenus[2].selectNextButton();
		else if (this.pressedKeyCodeSignal['Digit4'])
			userInterface.toolMenus[3].selectNextButton();
		else if (this.pressedKeyCodeSignal['ShiftRight'])
			userInterface.showViewport2 = !userInterface.showViewport2;
		else if (this.pressedKeyCodeSignal['KeyF'])
			document.body.requestFullscreen();
		else if (this.pressedKeyCodeSignal['ShiftLeft'])
		{
			this.scene.boreHoles.selector.addToSelection = true;
		}

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
		if (Object.values(this.releasedKeyCodeSignal).some(value => value === true))
			this.onKeyUp(userInterface);
	}
}

export { Keyboard };