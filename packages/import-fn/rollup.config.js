import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json' assert { type: 'json' }

export default {
  input: 'src/index.ts',
  output: [
    {
      file: `dist/${pkg.main}`,
      format: 'cjs'
    },
    // Some library breaks with ES modules...
    // {
    //   file: `dist/${pkg.module}`,
    //   format: 'es'
    // }
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
  plugins: [typescript()]
}
