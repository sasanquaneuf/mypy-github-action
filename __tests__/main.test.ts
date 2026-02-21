import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test, expect} from '@jest/globals'

test('action runs and outputs expected result', () => {
  process.env['INPUT_CHECKNAME'] = 'mypy'
  process.env['INPUT_MYPYFLAGS'] = '--config-file pyproject.toml'
  process.env['INPUT_MYPYFILES'] = '.'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const output = cp.execFileSync(np, [ip], options).toString()
  expect(output).toContain('mypy') // Adjust to match expected output
})
