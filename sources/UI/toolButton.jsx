import React from 'react';

class ToolButton extends React.Component
{
	render()
	{
		const { isActive, onClick, children } = this.props;
		return (
			<button
				className={`toolButton ${isActive ? 'active' : ''}`}
				onClick={onClick}
			>
				{children}
			</button>
		);
	}
}

export default ToolButton;