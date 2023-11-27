async function loadShader(url)
{
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

function loadShaderSynchronous(url)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, false);
	request.send(null);

	if (request.status === 200) {
		return request.responseText;
	}
}

export { loadShader };
export { loadShaderSynchronous };