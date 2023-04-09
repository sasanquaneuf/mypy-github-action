<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# `mypy` GitHub Action

This is a GitHub Action to run `mypy` against your repository. It uses the new GitHub Actions API and JavaScript toolkit. It does fancy things like add annotations to your PRs inline.

(image)

Use it in your project like:

(in `.github/workflows/lint.yml`)
```yaml
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
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"
          architecture: x64
      - name: Checkout
        uses: actions/checkout@v2
      - name: Install mypy
        run: pip install mypy
      - name: Run mypy
        uses: sasanquaneuf/mypy-github-action@releases/v2
        with:
          checkName: 'mypy'   # NOTE: this needs to be the same as the job name
          cmd: "tox run -e type" # Optional
          args: "--follow-imports=silent" # Optional
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

# Acknowledgments

This GitHub Action was made with reference to [flake8-github-action](https://github.com/suo/flake8-github-action)
