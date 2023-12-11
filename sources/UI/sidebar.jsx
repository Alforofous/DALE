import React from 'react';

class Sidebar extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			activeToolMenuIndex: null,
			activeToolButtonIndex: null,
		};
	}

	handleToolMenuClick = (index) =>
	{
		this.setState({ activeToolMenuIndex: index });
	};

	handleToolButtonClick = (index) =>
	{
		console.log('Tool button ' + index.toString() + ' clicked');
		this.setState({ activeToolButtonIndex: index });
	};

	render()
	{
		const buttonsData = [
			{ text: 'Wireframe', toolButtons: ['Tool 1-0', 'Tool 1-1'] },
			{ text: 'Spawn Cones', toolButtons: ['Tool 2-0', 'Tool 2-1'] },
		];

		this.toolMenus = buttonsData.map((button, index) => (
			<div key={index}>
				<button
					className={`toolMenu ${this.state.activeToolMenuIndex === index ? 'active' : ''}`}
					onClick={() => this.handleToolMenuClick(index)}
				>
					{button.text}
				</button>
				<div style={{ display: this.state.activeToolMenuIndex === index ? 'block' : 'none' }}>
					{button.toolButtons.map((child, childIndex) => (
						<button
							key={childIndex}
							className={`toolButton ${this.state.activeToolButtonIndex === childIndex ? 'active' : ''}`}
							onClick={() => this.handleToolButtonClick(childIndex)}
						>
							{child}
						</button>
					))}
				</div>
			</div>
		));

		return (
			<div id="sidebar">
				{this.toolMenus}
			</div>
		);
	}
}

export default Sidebar;