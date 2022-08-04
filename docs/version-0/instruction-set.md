# Instructions
An instruction is a single character followed by any number of operands, provided the insturuction provides the exact length of it's operands.

The de/encoder starts at `0` and changes the value according to the given instruction

Here are some proposed instructions:

|  Name  | Arguments | Description |
|--------|-----------|-------------|
| `noop` |   None    | Do nothing. |
| `direct` | `to: BIT_DEPTH_DEPENDANT` | directly go to a point in the "sandbox". |
| `line` | `from: BIT_DEPTH_DEPENDANT, to: BIT_DEPTH_DEPENDANT, numTimes: uint16` | Make a straight line to a specified point. |
| `rawdiff` | `len: uint16, ...directions: BIT_DEPTH_DEPENDANT[len]` | Encoded as the difference between an adjacent sample. |
| `hold` | `len: uint24` | Hold the current value for `len` times. |

> Notes:
>
> * `BIT_DEPTH_DEPENDANT` - depends on the bit depth requested be the header. (i.e. if header specifies a 32-bit "sandbox", the argument is also 32-bit)
> * `ufloat8` - 8-bit unsigned floating point number.
> * `float16[numControlPoints]` - a `float16` array with exactly the length specified in `numControlPoints`.

<!-- ## `noop`
Do nothing

## `direct`
Directly go to a point in

## `line`

## `dirsine`

## `rawdiff`


## `bezcur` -->
