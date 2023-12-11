import React, { useState } from 'react';

function ColorPicker()
{
	const [color, setColor] = useState('#000000');

	function handleChange(event)
	{
		setColor(event.target.value);
	}

	return (
		<div>
			<input type="color" value={color} onChange={handleChange} />
		</div>
	);
}

export default ColorPicker;