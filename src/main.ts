import * as core from '@actions/core'
import {
  createCheck,
  parseMypyOutput,
  runMypy,
  verifyCheckNameIsProvidedCorrectly
} from './mypy-action'

const {GITHUB_TOKEN} = process.env

async function run(): Promise<void> {
  if (GITHUB_TOKEN === undefined) {
    core.setFailed('GITHUB_TOKEN is undefined')
  }
  try {
    const checkName = core.getInput('checkName')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await verifyCheckNameIsProvidedCorrectly(checkName, GITHUB_TOKEN!!)
    const cmd = core.getInput('command')
    const args = core.getInput('args').split(' ')
    const mypyOutput = await runMypy(cmd, args)
    const annotations = parseMypyOutput(mypyOutput)
    if (annotations.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await createCheck(checkName, 'mypy failure', annotations, GITHUB_TOKEN!!)
      core.setFailed(`${annotations.length} errors(s) found`)
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
