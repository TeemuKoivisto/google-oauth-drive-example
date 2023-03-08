import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json' assert { type: 'json' }

/**
 * Creates a new package.json with all the local workspace packages excluded
 *
 * Since Google Cloud functions install their own dependencies, we have to do this manually as they will try
 * to install from NPM the packages, resulting in 404 and crashing the deployment.
 * @returns
 */
async function makePackageJson() {
  const newPkg = Object.assign({}, pkg)
  newPkg.dependencies = Object.keys(pkg.dependencies).reduce((acc, key) => {
    if (!key.startsWith('@my-org')) {
      acc[key] = pkg.dependencies[key]
    }
    return acc
  }, {})
  return JSON.stringify(newPkg, null, 2)
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: `dist/${pkg.main}`,
      format: 'cjs'
    },
    // Some library breaks with ES modules...
    {
      file: `dist/${pkg.module}`,
      format: 'es'
    }
  ],
  external: [
    // Bundle all local packages
    ...Object.keys(pkg.dependencies || {}).filter(d => !d.startsWith('@my-org')),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    resolve({
      browser: false
    }),
    commonjs(),
    json(),
    typescript(),
    {
      name: 'create-package-json',
      async generateBundle(_outputOptions, _bundle) {
        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: await makePackageJson()
        })
      }
    }
  ]
}
