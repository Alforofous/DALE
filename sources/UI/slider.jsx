import React from 'react';

class Slider extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			value: 60,
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
				<input type="range" min="0" max="100" value={this.state.value} onChange={this.handleChange} />
			</div>
		);
	}
}

export default Slider;