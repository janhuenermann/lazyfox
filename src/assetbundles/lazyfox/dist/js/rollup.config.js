// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'lazyfox.js',
    format: 'es'
  },
  plugins: [
    babel()
  ]
};