import glsl from 'vite-plugin-glsl';
import copy from 'rollup-plugin-copy';

export default {
  plugins: [
    glsl(),
    {
      ...copy({
        targets: [
          { src: 'sources/shaders', dest: 'dist/sources' }
        ],
        hook: 'writeBundle'
      })
    }
  ]
};