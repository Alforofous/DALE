import React from 'react';

class NumberInput extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			value: props.value || 0,
		};
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
				<input type="number" min={this.props.min || "0"} max={this.props.max || "100"} value={this.state.value} onChange={this.handleChange} />
			</div>
		);
	}
}

export default NumberInput;