import * as THREE from 'three';

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
		if (this.pressedKeyCodeSignal['Digit1'] )
			userInterface.buttons[0].click();
		if (this.pressedKeyCodeSignal['Digit2'] )
			userInterface.buttons[1].click();
		if (this.pressedKeyCodeSignal['Digit3'] )
			userInterface.buttons[2].click();
		if (this.pressedKeyCodeSignal['Digit4'] )
			userInterface.buttons[3].click();
		if (userInterface.active_button !== undefined)
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