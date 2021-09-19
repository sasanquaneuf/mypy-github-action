import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
// import * as octokit from '@octokit/rest'

const {GITHUB_TOKEN} = process.env

async function runMypy(): Promise<string> {
  let myOutput = ''
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      }
    }
  }
  try {
    await exec.exec('mypy .', [], options)
    myOutput = ''
  } catch (error: any) {
    core.debug(error)
  }
  return myOutput
}

// type Annotation = octokit.ChecksUpdateParamsOutputAnnotations
type Annotation = any
// Regex the output for error lines, then format them in
function parseMypyOutput(output: string): Annotation[] {
  // Group 0: whole match
  // Group 1: filename
  // Group 2: line number
  // Group 3: error
  // Group 4: error description
  const regex = new RegExp(/^(.*?):(\d+): (.+): ([\s|\w]*)/)
  const errors = output.split('\n')
  const annotations: Annotation[] = []
  for (const error of errors) {
    const match = error.match(regex)
    if (match) {
      // Chop `./` off the front so that Github will recognize the file path
      const normalized_path = match[1].replace('./', '')
      const line = parseInt(match[2])
      const annotation_level = <const>'failure'
      const annotation = {
        path: normalized_path,
        start_line: line,
        end_line: line,
        // start_column: column,
        // end_column: column,
        annotation_level,
        message: `[${match[3]}] ${match[4]}`
      }

      annotations.push(annotation)
    }
  }
  return annotations
}

async function createCheck(
  check_name: string,
  title: string,
  annotations: Annotation[]
): Promise<void> {
  const octokit = github.getOctokit(String(GITHUB_TOKEN))
  const res = await octokit.rest.checks.listForRef({
    check_name,
    ...github.context.repo,
    ref: github.context.sha
  })

  const check_run_id = res.data.check_runs[0].id

  await octokit.rest.checks.update({
    ...github.context.repo,
    check_run_id,
    output: {
      title,
      summary: `${annotations.length} errors(s) found`,
      annotations
    }
  })
}

async function run(): Promise<void> {
  try {
    const mypyOutput = await runMypy()
    const annotations = parseMypyOutput(mypyOutput)
    if (annotations.length > 0) {
      const checkName = core.getInput('checkName')
      await createCheck(checkName, 'mypy failure', annotations)
      core.setFailed(`${annotations.length} errors(s) found`)
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
