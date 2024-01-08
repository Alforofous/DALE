import React from 'react';

class Slider extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			value: props.value || 0,
		};

		const intervalId = setInterval(() =>
		{
			if (this.props.scene.terrainMesh !== undefined)
			{
				clearInterval(intervalId);
				this.props.scene.changeTerrainMeshOpacity(this.state.value / 100);
			}
		}, 100);
	}

	handleChange = (event) =>
	{
		this.setState({ value: event.target.value });
		this.props.onChange(event.target.value);
	};

	render()
	{
		return (
			<div>
				<p style={{ marginBottom: '0px' }}>{this.props.description}</p>
				<input type="range" min={this.props.min || "0"} max={this.props.max || "100"} value={this.state.value} onChange={this.handleChange} />
			</div>
		);
	}
}

export default Slider;