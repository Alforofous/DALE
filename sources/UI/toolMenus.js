function createToolMenusArray()
{
	const menuList = document.querySelectorAll('.toolMenu');
	const array = [];
	menuList.forEach(button =>
	{
		array.push(new ToolMenu(button));
	});
	return (array);
}

class ToolMenu
{
	constructor(toolMenu)
	{
		this.toolMenu = toolMenu;
		this.toolButtons = Array.from(toolMenu.children);

		this.#clickEvent(toolMenu);
		this.printMenuAndChildrenButtonIds();
	}

	isActive()
	{
		return this.toolMenu.classList.contains('active');
	}

	selectNextButton()
	{
		if (this.toolButtons.length === 0)
		{
			this.toolMenu.click();
			return;
		}
		let index = this.activeButtonIndex() + 1;
		if (this.isActive() === false)
		{
			index = 0;
			this.toolMenu.click();
		}
		this.#activateButtonAtIndexAndDeactivateOthers(index);
		if (this.activeButtonIndex() === -1)
			this.toolMenu.click();
	}

	printMenuAndChildrenButtonIds()
	{
		console.log('Menu: ' + this.toolMenu.id);
		this.toolButtons.forEach(button =>
		{
			console.log('↳Button: ' + button.id);
		});
	}

	#expand(menu)
	{
		Array.from(menu.children).forEach(button =>
		{
			button.style.display = 'block';
		});
		menu.classList.add('active');
	}

	#collapse(menu)
	{
		Array.from(menu.children).forEach(button =>
		{
			button.style.display = 'none';
		});
		menu.classList.remove('active');
	}

	#clickEvent(toolMenu)
	{
		const menuList = document.querySelectorAll('.toolMenu');
		toolMenu.addEventListener('click', (event) =>
		{
			if (event.target.classList.contains('active') === false)
			{
				this.#expand(event.target);
				if (this.activeButtonIndex() === -1)
					this.#activateButtonAtIndexAndDeactivateOthers(0);
			}
			else
				this.#collapse(event.target);
			menuList.forEach(btn =>
			{
				if (btn !== event.target)
					this.#collapse(btn);
			});
		});

		this.toolButtons.forEach(button =>
		{
			button.addEventListener('click', (event) =>
			{
				event.stopPropagation();
				this.#activateButtonAndDeactivateOthers(event.target);
			});
		});
	}

	#activateButtonAndDeactivateOthers(button)
	{
		this.toolButtons.forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');
	}

	#activateButtonAtIndexAndDeactivateOthers(index)
	{
		this.toolButtons.forEach(btn => btn.classList.remove('active'));
		if (index < this.toolButtons.length && index >= 0)
			this.toolButtons[index].classList.add('active');
	}

	activeButtonIndex()
	{
		return this.toolButtons.findIndex(btn => btn.classList.contains('active'));
	}
}

export { createToolMenusArray };