# Instructions
An instruction is a single byte followed by any number of operands. Here are some proposed instructions:

|  Name  | Arguments | Description |
|--------|-----------|-------------|
| `noop` |   None    | Do nothing. |
| `direct` | `to: BIT_DEPTH_DEPENDANT` | directly go to a point in the "sandbox". |
| `line` | `from: BIT_DEPTH_DEPENDANT, to: BIT_DEPTH_DEPENDANT, length: int16` | Make a straight line to a specified point. |
| `rawdiff` | `diff: BIT_DEPTH_DEPENDANT` | Encoded as the difference between a previous sample `diff = samps[i] - samps[i + 1]`. |
| `hold` | `len: uint24` | Hold the current value for `len` times. |

> Notes:
>
> * `BIT_DEPTH_DEPENDANT` - depends on the bit depth requested be the header. (i.e. if header specifies a 32-bit "sandbox", the argument is also 32-bit)
> * `float16[numControlPoints]` - a `float16` array with exactly the length specified in `numControlPoints`.

<!-- ## `noop`
Do nothing

## `direct`
Directly go to a point in

## `line`

## `dirsine`

## `rawdiff`


## `bezcur` -->
