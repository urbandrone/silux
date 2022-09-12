const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const commonjs = require('@rollup/plugin-commonjs');
const buble = require('@rollup/plugin-buble');
const filesize = require('rollup-plugin-filesize');
const banner = require('rollup-plugin-banner').default;
const pkg = require('../package.json');


const REPO = 'https://github.com/urbandrone/silux';


module.exports = {
  input: 'compiled/main.js',
  output: [
    {
      file: 'main.js',
      format: 'umd',
      name: 'silux'
    },
    {
      file: 'main.mjs',
      format: 'es'
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    buble({
      objectAssign: 'Object.assign',
      transforms: {
        forOf: false
      }
    }),
    //terser(),
    banner(`silux ${pkg.version} | ${pkg.license} | ${REPO}`),
    filesize()
  ]
};