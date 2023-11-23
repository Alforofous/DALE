async function loadShader(url)
{
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

export { loadShader };