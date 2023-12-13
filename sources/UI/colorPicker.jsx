import React from 'react';

class ColorPicker extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = { color: props.color };
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount()
	{
		const intervalId = setInterval(() =>
		{
			if (this.props.scene.terrainMesh !== undefined)
			{
				clearInterval(intervalId);
				this.props.onChange(this.state.color);
			}
		}, 100);
	}

	handleChange(event)
	{
		this.setState({ color: event.target.value });
		this.props.onChange(event.target.value);
	}

	render()
	{
		return (
			<div>
				<p style={{ marginBottom: '0px' }}>{this.props.description}</p>
				<input type="color" value={this.state.color} onChange={this.handleChange} />
			</div>
		);
	}
}

export default ColorPicker;