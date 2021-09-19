import * as core from '@actions/core'
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as octokit from '@octokit/rest';
import {wait} from './wait'

const { GITHUB_TOKEN } = process.env;

async function runMypy() {
  let myOutput = '';
  let options = {
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      },
    }
  };
  try {
    await exec.exec('mypy .', [], options);
    myOutput = '';
  } catch (error: any) {
    core.debug(error)
  }
  return myOutput;
}

// type Annotation = octokit.ChecksUpdateParamsOutputAnnotations;
type Annotation = any;
// Regex the output for error lines, then format them in
function parseMypyOutput(output: string): Annotation[] {
  // Group 0: whole match
  // Group 1: filename
  // Group 2: line number
  // Group 3: error
  // Group 4: error description
  let regex = new RegExp(/^(.*?):(\d+): (\w\d+): ([\s|\w]*)/);
  let errors = output.split('\n');
  let annotations: Annotation[] = [];
  for (let i = 0; i < errors.length; i++) {
    let error = errors[i];
    let match = error.match(regex);
    if (match) {
      // Chop `./` off the front so that Github will recognize the file path
      const normalized_path = match[1].replace('./', '');
      const line = parseInt(match[2]);
      const annotation_level = <const> 'failure';
      const annotation = {
        path: normalized_path,
        start_line: line,
        end_line: line,
        // start_column: column,
        // end_column: column,
        annotation_level,
        message: `[${match[3]}] ${match[4]}`,
      };

      annotations.push(annotation);
    }
  }
  return annotations;
}

async function createCheck(check_name: string, title: string, annotations: Annotation[]) {
  const octokit = github.getOctokit(String(GITHUB_TOKEN));
  const res = await octokit.rest.checks.listForRef({
    check_name,
    ...github.context.repo,
    ref: github.context.sha
  });

  const check_run_id = res.data.check_runs[0].id;

  await octokit.rest.checks.update({
    ...github.context.repo,
    check_run_id,
    output: {
      title,
      summary: `${annotations.length} errors(s) found`,
      annotations
    }
  });
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
