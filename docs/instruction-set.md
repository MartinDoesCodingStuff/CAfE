# Instructions
An instruction is a single character followed by any number of operands, provided the insturuction provides the exact length of it's operands.

The codec starts at `0` and changes the value according to the given instruction

Here are some proposed instructions:

|  Name  | Arguments | Description |
|--------|-----------|-------------|
| `noop` |   None    | Do nothing. |
| `direct` | `to: BIT_DEPTH_DEPENDANT` | directly go to a point |
| `line` | `points: BIT_DEPTH_DEPENDANT` | Make a straight line to a specified point. |
| `dirsine` | `phase: float16, amp: ufloat8, frequency: bfloat16, numTimes: uint32` | Generate a sine wave. |
| `rawdiff` | `len: uint16, ...directions: BIT_DEPTH_DEPENDANT[len]` | Encoded as the difference between an adjacent sample. |
| `bezcur` | `variant: uint2, numControlPoints: uint6, ...controlPointCoords: float16[numControlPoints]` | Draw a Bezier curve representation of the waveform. |

> Notes:
>
> * `BIT_DEPTH_DEPENDANT` - If the specified header, with the `u` flag specifying the type is undi
> * `ufloat8` - 8-bit unsigned floating point number
> * `bfloat16[numControlPoints]` - a `bfloat16` array with exactly the length specified in `numControlPoints`
> * `bfloat16` - A FP32 with it's mantissa truncated to 7 bits
> * `uint2` & `uint6` - 2-bit and 6-bit wide unsigned integers

<!-- ## `noop`
Do nothing

## `direct`
Directly go to a point in

## `line`

## `dirsine`

## `rawdiff`


## `bezcur` -->
