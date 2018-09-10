// Rollup plugins
import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
  input: 'src/index.js',
  output: {
    file: 'lazyfox.js',
    format: 'cjs'
  },
  plugins: [
    babel()
  ]
};