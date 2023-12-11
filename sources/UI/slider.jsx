import React, { useState } from 'react';

function Slider()
{
	const [value, setValue] = useState(50);

	function handleChange(event)
	{
		setValue(event.target.value);
	}

	return (
		<div>
			<input type="range" min="0" max="100" value={value} onChange={handleChange} />
		</div>
	);
}

export default Slider;