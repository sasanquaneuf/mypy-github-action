import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'

export interface Annotation {
  path: string
  start_line: number
  end_line: number
  // start_column: number
  // end_column: number
  annotation_level: string
  message: string
}

export async function runMypy(cmd: string, args: string[]): Promise<string> {
  let myOutput = ''
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      }
    }
  }
  try {
    await exec.exec(cmd, args, options)
    myOutput = ''
  } catch (error: any) {
    core.debug(error)
  }
  core.info(`MyPy output: ${myOutput}`)
  return myOutput
}

// Regex the output for error lines, then format them in
export function parseMypyOutput(output: string): Annotation[] {
  const errors = output.split('\n')
  const annotations: Annotation[] = []
  for (const error of errors) {
    if (error) {
      let details = error.split(':')
      details = details.map(i => i.trim())
      if (details.length < 4 || details[2] !== 'error') {
        continue
      }
      // Chop `./` off the front so that Github will recognize the file path
      const normalized_path = details[0].replace('./', '')
      const line = parseInt(details[1])
      const annotation_level = <const>'failure'
      let message = details[3]
      message = message.slice(0, message.indexOf('[') - 1)
      const annotation = {
        path: normalized_path,
        start_line: line,
        end_line: line,
        // start_column: column,
        // end_column: column,
        annotation_level,
        message
      }

      annotations.push(annotation)
    }
  }
  return annotations
}

export async function createCheck(
  check_name: string,
  title: string,
  annotations: Annotation[],
  github_token: string
): Promise<void> {
  const octokit = github.getOctokit(String(github_token))
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

export async function verifyCheckNameIsProvidedCorrectly(
  check_name: string,
  github_token: string
): Promise<void> {
  const octokit = github.getOctokit(String(github_token))
  const res = await octokit.rest.checks.listForRef({
    check_name,
    ...github.context.repo,
    ref: github.context.sha
  })

  const check_run = res.data.check_runs[0]
  if (check_run === undefined) {
    throw new Error(
      '`check_run === undefined`, probably the `checkName` input was not specified correctly.'
    )
  }
}
