import React from 'react';
import ToolButton from './ToolButton';

class ToolMenu extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			activeToolButtonIndex: null
		};
	};

	selectNextToolButton()
	{
		let nextToolButtonIndex;
		if (this.state.activeToolButtonIndex === null)
			nextToolButtonIndex = 0;
		else
			nextToolButtonIndex = (this.state.activeToolButtonIndex + 1) % this.props.toolButtons.length;
		this.setState({ activeToolButtonIndex: nextToolButtonIndex });
	}

	selectCurrentToolButton = (index) =>
	{
		this.setState({ activeToolButtonIndex: index });
	}

	render()
	{
		const { isActive, onClick, text } = this.props;
		const { activeToolButtonIndex } = this.state;

		return (
			<div>
				<button
					className={`toolMenu ${isActive ? 'active' : ''}`}
					onClick={onClick}
				>
					{text}
				</button>
				{isActive && this.props.toolButtons.map((child, childIndex) => (
					<ToolButton
						key={childIndex}
						isActive={activeToolButtonIndex === childIndex}
						onClick={() => this.selectCurrentToolButton(childIndex)}
					>
						{child}
					</ToolButton>
				))}
			</div>
		);
	}
}

export default ToolMenu;