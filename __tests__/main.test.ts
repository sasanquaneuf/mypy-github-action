import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test, expect} from '@jest/globals'
import {parseMypyOutput} from '../src/main'

const TOX_RUN_OUTPUT =
  "type: install_deps> python -I -m pip install 'captum>=0.6' datasets matplotlib mypy pytest 'torch>=1.13.1' 'torchvision>=0.14.1' tqdm 'transformers>=4.26'\n" +
  '.pkg: _optional_hooks> python /Users/artemsereda/miniconda3/lib/python3.10/site-packages/pyproject_api/_backend.py True flit_core.buildapi\n' +
  '.pkg: get_requires_for_build_editable> python /Users/artemsereda/miniconda3/lib/python3.10/site-packages/pyproject_api/_backend.py True flit_core.buildapi\n' +
  '.pkg: get_requires_for_build_sdist> python /Users/artemsereda/miniconda3/lib/python3.10/site-packages/pyproject_api/_backend.py True flit_core.buildapi\n' +
  '.pkg: build_sdist> python /Users/artemsereda/miniconda3/lib/python3.10/site-packages/pyproject_api/_backend.py True flit_core.buildapi\n' +
  "type: install_package_deps> python -I -m pip install 'torch>=1.13.1' tqdm\n" +
  'type: install_package> python -I -m pip install --force-reinstall --no-deps /Users/artemsereda/Documents/IdeaProjects/NoiseGrad/.tox/.tmp/package/3/noisegrad-0.0.1.tar.gz\n' +
  'type: commands[0]> mypy .\n' +
  'noisegrad/utils.py:11: error: Missing return statement  [return]\n' +
  'noisegrad/utils.py:24: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/utils.py:24: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'noisegrad/utils.py:26: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:27: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:28: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:29: error: Unsupported operand type for unary - (np.array?)  [operator]\n' +
  'noisegrad/utils.py:29: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:30: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:32: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:75: error: "ndarray[Any, Any]" has no attribute "cpu"  [attr-defined]\n' +
  'noisegrad/noisegrad.py:137: error: No overload variant of "mean" of "_TensorBase" matches argument type "Tuple[int]"  [call-overload]\n' +
  'noisegrad/noisegrad.py:137: note: Possible overload variants:\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, dim: Union[int, Union[Size, List[int], Tuple[int, ...]], None], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, dim: Sequence[Union[str, ellipsis, None]], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:161: error: Return type "Tensor" of "enhance_explanation" incompatible with return type "int" in supertype "NoiseGrad"  [override]\n' +
  'noisegrad/noisegrad.py:208: error: No overload variant of "mean" of "_TensorBase" matches argument type "Tuple[int, int]"  [call-overload]\n' +
  'noisegrad/noisegrad.py:208: note: Possible overload variants:\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, dim: Union[int, Union[Size, List[int], Tuple[int, ...]], None], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, dim: Sequence[Union[str, ellipsis, None]], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/explainers.py:21: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/explainers.py:21: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'noisegrad/explainers.py:53: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/explainers.py:53: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'Found 15 errors in 3 files (checked 7 source files)\n' +
  'type: exit 1 (30.66 seconds) /Users/artemsereda/Documents/IdeaProjects/NoiseGrad> mypy . pid=59381\n'

const RAW_OUTPUT =
  'noisegrad/utils.py:11: error: Missing return statement  [return]\n' +
  'noisegrad/utils.py:24: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/utils.py:24: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'noisegrad/utils.py:26: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:27: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:28: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:29: error: Unsupported operand type for unary - (np.array?)  [operator]\n' +
  'noisegrad/utils.py:29: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:30: error: np.array? has no attribute "max"  [attr-defined]\n' +
  'noisegrad/utils.py:32: error: np.array? has no attribute "min"  [attr-defined]\n' +
  'noisegrad/utils.py:75: error: "ndarray[Any, Any]" has no attribute "cpu"  [attr-defined]\n' +
  'noisegrad/noisegrad.py:137: error: No overload variant of "mean" of "_TensorBase" matches argument type "Tuple[int]"  [call-overload]\n' +
  'noisegrad/noisegrad.py:137: note: Possible overload variants:\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, dim: Union[int, Union[Size, List[int], Tuple[int, ...]], None], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:137: note:     def mean(self, dim: Sequence[Union[str, ellipsis, None]], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:161: error: Return type "Tensor" of "enhance_explanation" incompatible with return type "int" in supertype "NoiseGrad"  [override]\n' +
  'noisegrad/noisegrad.py:208: error: No overload variant of "mean" of "_TensorBase" matches argument type "Tuple[int, int]"  [call-overload]\n' +
  'noisegrad/noisegrad.py:208: note: Possible overload variants:\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, dim: Union[int, Union[Size, List[int], Tuple[int, ...]], None], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/noisegrad.py:208: note:     def mean(self, dim: Sequence[Union[str, ellipsis, None]], keepdim: bool = ..., *, dtype: Optional[dtype] = ...) -> Tensor\n' +
  'noisegrad/explainers.py:21: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/explainers.py:21: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'noisegrad/explainers.py:53: error: Function "numpy.core.multiarray.array" is not valid as a type  [valid-type]\n' +
  'noisegrad/explainers.py:53: note: Perhaps you need "Callable[...]" or a callback protocol?\n' +
  'Found 15 errors in 3 files (checked 7 source files)\n'

test('test raw output', () => {
  const result = parseMypyOutput(RAW_OUTPUT)
  expect(result.length).toBe(26)
})

test('test tox output', () => {
  const result = parseMypyOutput(TOX_RUN_OUTPUT)
  expect(result.length).toBe(26)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  // process.env['INPUT_MILLISECONDS'] = '500'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
