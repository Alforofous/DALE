import React from 'react';

class ToggleButton extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = { isActive: this.props.isActive || false };
		this.toggleActive = this.toggleActive.bind(this);
	}

	toggleActive()
	{
		this.setState(prevState => ({ isActive: !prevState.isActive }));
		this.props.onClick && this.props.onClick();
	}

	render()
	{
		const { children } = this.props;
		const { isActive } = this.state;
		return (
			<button
				className={`toolButton ${isActive ? 'active' : ''}`}
				onClick={this.toggleActive}
			>
				{children}
			</button>
		);
	}
}

export default ToggleButton;