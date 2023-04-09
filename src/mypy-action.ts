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
  return myOutput
}

// Regex the output for error lines, then format them in
export function parseMypyOutput(output: string): Annotation[] {
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
