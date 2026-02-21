<p align="center">
  <a href="https://github.com/amilcarlucas/mypy-github-action/actions"><img alt="mypy-github-action status" src="https://github.com/amilcarlucas/mypy-github-action/workflows/build-test/badge.svg"></a>
</p>

# `mypy` GitHub Action

This is a GitHub Action to run [`mypy`](https://mypy-lang.org/) against your repository and annotate results directly in your pull requests using GitHub Checks.

## Inputs

This action accepts the following input parameters:

- **checkName** (required):
  The name of the GitHub check to add annotations to. This should generally match the job name in your workflow.

- **mypyFlags** (optional):
  Additional flags to pass to the `mypy` command (e.g., `--config-file pyproject.toml`). Default: `''`

- **mypyFiles** (optional):
  Files or directories on which to run `mypy`. Default: `.` (runs on the full project)

## Usage Example

Add the following to your workflow file (e.g. `.github/workflows/lint.yml`):

```yaml
name: lint

on:
  push:
    paths:
      - '*.py'

jobs:
  mypy:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Python
        uses: aactions/setup-python@e797f83bcb11b83ae66e0230d6156d7c80228e7c # v6.0.0
        with:
          python-version: 3.13.0
          architecture: x64
      - name: Checkout
        uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - name: Install mypy
        run: pip install mypy
      - name: Run mypy
        uses: amilcarlucas/mypy-github-action@releases/v2.0.0
        with:
          checkName: 'lint'   # NOTE: this needs to be the same as the job name
          mypyFlags: '--config-file pyproject.toml'
          mypyFiles: '.'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## What happens?

The action runs `mypy` on the specified files with the given flags.
Any type errors found are annotated directly in the PR using GitHub Checks.
The check will fail if any errors are found, making it easy to enforce type safety in your CI.

Inputs Reference

| Name      | Required | Default | Description                          |
|-----------|----------|---------|--------------------------------------|
| checkName | Yes      |         | Name of the GitHub check to annotate.|
| mypyFlags | No       | ''      | Additional flags for mypy.           |
| mypyFiles | No       | .       | Files/directories to check.          |

# Acknowledgments

This GitHub Action was made with reference to [flake8-github-action](https://github.com/suo/flake8-github-action)
This is forked from [sasanquaneuf](https://github.com/sasanquaneuf/mypy-github-action).
