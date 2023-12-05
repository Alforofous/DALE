const { execSync } = require('child_process');
const fs = require('fs');

try
{
	execSync('emcc');
	console.log('Emscripten is already installed.');
} catch (error)
{
	console.log('Emscripten is not installed. Installing...');

	if (!fs.existsSync('emsdk'))
	{
		execSync('git clone https://github.com/emscripten-core/emsdk.git');
	}

	execSync('./emsdk/emsdk install latest');
	execSync('./emsdk/emsdk activate latest');
}