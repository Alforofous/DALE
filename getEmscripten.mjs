import { execSync } from 'child_process';
import { existsSync } from 'fs';

try
{
	execSync('emcc');
	console.log('Emscripten is already installed.');
} catch (error)
{
	console.log('Emscripten is not installed. Installing...');

	if (!existsSync('emsdk'))
	{
		execSync('git clone https://github.com/emscripten-core/emsdk.git');
	}

	execSync('./emsdk/emsdk install latest');
	execSync('./emsdk/emsdk activate latest');
}