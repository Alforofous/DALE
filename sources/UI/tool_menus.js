function createToolMenusArray()
{
	const menu_list = document.querySelectorAll('.tool_menu');
	const array = [];
	menu_list.forEach(button =>
	{
		array.push(new ToolMenu(button));
	});
	return (array);
}

class ToolMenu
{
	constructor(tool_menu)
	{
		this.tool_menu = tool_menu;
		this.tool_buttons = Array.from(tool_menu.children);

		this.#clickEvent(tool_menu);
		this.printMenuAndChildrenButtonIds();
	}

	isActive()
	{
		return this.tool_menu.classList.contains('active');
	}

	selectNextButton()
	{
		if (this.tool_buttons.length === 0)
		{
			this.tool_menu.click();
			return;
		}
		let index = this.activeButtonIndex() + 1;
		if (this.isActive() === false)
		{
			index = 0;
			this.#expand(this.tool_menu);
		}
		this.#activateButtonAtIndexAndDeactivateOthers(index);
		if (this.activeButtonIndex() === -1)
			this.tool_menu.click();
	}

	printMenuAndChildrenButtonIds()
	{
		console.log('Menu: ' + this.tool_menu.id);
		this.tool_buttons.forEach(button =>
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

	#clickEvent(tool_menu)
	{
		const menu_list = document.querySelectorAll('.tool_menu');
		tool_menu.addEventListener('click', (event) =>
		{
			if (event.target.classList.contains('active') === false)
			{
				this.#expand(event.target);
				if (this.activeButtonIndex() === -1)
					this.#activateButtonAtIndexAndDeactivateOthers(0);
			}
			else
				this.#collapse(event.target);
			menu_list.forEach(btn =>
			{
				if (btn !== event.target)
					this.#collapse(btn);
			});
		});

		this.tool_buttons.forEach(button =>
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
		this.tool_buttons.forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');
	}

	#activateButtonAtIndexAndDeactivateOthers(index)
	{
		this.tool_buttons.forEach(btn => btn.classList.remove('active'));
		if (index < this.tool_buttons.length && index >= 0)
			this.tool_buttons[index].classList.add('active');
	}

	activeButtonIndex()
	{
		return this.tool_buttons.findIndex(btn => btn.classList.contains('active'));
	}
}

export { createToolMenusArray };