import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import P from 'path'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { endent } from '@dword-design/functions'
import { readFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "baseConfig": "server",
        "devDependencies": {
          "@dword-design/base-config-server": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'export default 1 |> x => x * 2',
    src: {
      'cli.js': endent`
        #!/usr/bin/env node

        import api from '.'

        console.log(api)
      `,
      'foo.txt': '',
      'index.js': 'export default 1',
    },
  })
  const { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.eslintrc.json',
    '.gitignore',
    '.gitpod.yml',
    '.renovaterc.json',
    '.travis.yml',
    'dist',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
  expect(require(P.resolve('dist'))).toEqual(2)
  expect(await readFile('.gitignore', 'utf8')).toMatch('/.eslintrc.json\n')
  expect(stdout).toEqual('Successfully compiled 2 files with Babel.\n')
})
