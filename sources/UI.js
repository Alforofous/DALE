class UI
{
	constructor()
	{
		this.cameraPositionTextBox = document.createElement('div');
		this.cameraPositionTextBox.style.zIndex = '1';

		this.cameraPositionTextBox.style.position = 'absolute';
		this.cameraPositionTextBox.style.top = '0';
		this.cameraPositionTextBox.style.left = '0';
		this.cameraPositionTextBox.style.color = 'white';
		this.cameraPositionTextBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
		this.cameraPositionTextBox.style.padding = '5px';
		document.body.appendChild(this.cameraPositionTextBox);

		this.cameraLookAtPointTextBox = document.createElement('div');
		this.cameraLookAtPointTextBox.style.zIndex = '1';

		this.cameraLookAtPointTextBox.style.position = 'absolute';
		this.cameraLookAtPointTextBox.style.top = '30px';
		this.cameraLookAtPointTextBox.style.left = '0';
		this.cameraLookAtPointTextBox.style.color = 'white';
		this.cameraLookAtPointTextBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
		this.cameraLookAtPointTextBox.style.padding = '5px';
		document.body.appendChild(this.cameraLookAtPointTextBox);

		this.deltaTimeTextBox = document.createElement('div');
		this.deltaTimeTextBox.style.zIndex = '1';

		this.deltaTimeTextBox.style.position = 'absolute';
		this.deltaTimeTextBox.style.top = '0';
		this.deltaTimeTextBox.style.right = '0';
		this.deltaTimeTextBox.style.color = 'white';
		this.deltaTimeTextBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
		this.deltaTimeTextBox.style.padding = '5px';
		document.body.appendChild(this.deltaTimeTextBox);
	}

	updateInfo(cameraPosition, cameraLookAtPoint, deltaTime)
	{
		this.cameraPositionTextBox.innerHTML = `Camera Position: x: ${cameraPosition.x.toFixed(2)}, y: ${cameraPosition.y.toFixed(2)}, z: ${cameraPosition.z.toFixed(2)}`;
		this.cameraLookAtPointTextBox.innerHTML = `Camera Look At Point: x: ${cameraLookAtPoint.x.toFixed(2)}, y: ${cameraLookAtPoint.y.toFixed(2)}, z: ${cameraLookAtPoint.z.toFixed(2)}`;
		
		let msTime = deltaTime.toFixed(4);
		let fps = deltaTime > 0 ? (1000 / deltaTime) : 0;
		this.deltaTimeTextBox.innerHTML = `${msTime}ms `;
	}

	cameraPositionTextBox;
	cameraLookAtPointTextBox;
	deltaTimeTextBox;
}

export { UI };