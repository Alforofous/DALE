import * as THREE from 'three';

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
		if (this.releasedKeyCodeSignal['MetaLeft'])
		{
			this.scene.boreholes.selector.addToSelection = false;
			this.scene.boreholes.selector.updateSelectionRectangleColor(new THREE.Color(0x86DDFF));
		}
	}

	onKeyDown(userInterface)
	{
		if (this.pressedKeyCodeSignal['Digit1'])
			userInterface.sidebar.current.selectNextToolButtonAndActivateMenu(0);
		else if (this.pressedKeyCodeSignal['Digit2'])
			userInterface.sidebar.current.selectNextToolButtonAndActivateMenu(1);
		else if (this.pressedKeyCodeSignal['ShiftRight'])
			userInterface.showViewport2 = !userInterface.showViewport2;
		else if (this.pressedKeyCodeSignal['KeyF'])
			document.body.requestFullscreen();
		else if (this.pressedKeyCodeSignal['MetaLeft'])
		{
			this.scene.boreholes.selector.addToSelection = true;
			this.scene.boreholes.selector.updateSelectionRectangleColor(new THREE.Color(0x86FFDD));
		}
		else if (this.pressedKeyCodeSignal['Escape'])
		{
			userInterface.sidebar.current.activateToolMenu(null);
		}
	}

	onUpdate(userInterface)
	{
		if (Object.values(this.pressedKeyCodeSignal).some(value => value === true))
			this.onKeyDown(userInterface);
		if (Object.values(this.releasedKeyCodeSignal).some(value => value === true))
			this.onKeyUp(userInterface);
		if (userInterface?.sidebar?.current?.state?.activeToolMenuIndex === undefined || userInterface?.sidebar?.current?.state?.activeToolMenuIndex === null)
		{
			document.body.style.cursor = 'default';
		}
		else
		{
			document.body.style.cursor = 'crosshair';
			document.exitPointerLock();
		}
	}
}

export { Keyboard };