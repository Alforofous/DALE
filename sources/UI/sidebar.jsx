import React from 'react';
import ToolMenu from './ToolMenu';

class Sidebar extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			activeToolMenuIndex: null,
		};
		this.toolMenus = [];
	}

	activateToolMenu = (index) =>
	{
		this.setState({ activeToolMenuIndex: index });
	};

	selectNextToolButtonAndActivateMenu(index)
	{
		if (this.state.activeToolMenuIndex !== index)
		{
			this.activateToolMenu(index);
			this.toolMenus[index].current.selectCurrentToolButton(0);
		}
		else
		{
			this.toolMenus[index].current.selectNextToolButton();
		}
	}

	render()
	{
		this.buttonsData = [
			{ text: 'Boreholes', toolButtons: ['Add', 'Select', 'Move'] },
			{ text: 'Spawn Cones', toolButtons: ['Tool 2-0', 'Tool 2-1'] },
		];

		return (
			<div id="sidebar">
				{this.buttonsData.map((button, index) =>
				{
					this.toolMenus[index] = React.createRef();
					return (
						<ToolMenu
							key={index}
							ref={this.toolMenus[index]}
							isActive={this.state.activeToolMenuIndex === index}
							onClick={() => this.activateToolMenu(index)}
							text={button.text}
							toolButtons={button.toolButtons}
						/>
					);
				})}
			</div>
		);
	}
}

export default Sidebar;