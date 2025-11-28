import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json' assert { type: 'json' };

export default [
  // ESM build (used by Node and bundlers)
  {
    input: 'src/index.ts',
    external: ['cross-fetch'],
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })]
  },

  // CJS build (require)
  {
    input: 'src/index.ts',
    external: ['cross-fetch'],
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'default'
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })]
  },

  // UMD build (browser)
  {
    input: 'src/index.ts',
    external: [],
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'DatavistSDK',
      globals: { 'cross-fetch': 'fetch' },
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()]
  }
];