<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# `mypy` Github Action

This is a Github Action to run `mypy` against your repository. It uses the new Github Actions API and JavaScript toolkit. It does fancy things like add annotations to your PRs inline.

(image)

Use it in your project like:

(in `.github/workflows/lint.yml`)
```
name: Lint

on:
  push:
    paths:
      - '*.py'

jobs:
  mypy:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Python
        uses: actions/setup-python@v1
        with:
          python-version: 3.7.4
          architecture: x64
      - name: Checkout
        uses: actions/checkout@v1
      - name: Install mypy
        run: pip install mypy
      - name: Run mypy
        uses: sasanquaneuf/mypy-github-action@releases/v1
        with:
          checkName: 'mypy'   # NOTE: this needs to be the same as the job name
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
