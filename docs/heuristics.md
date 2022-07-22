# Heuristics
This section discusses a proposed algorithm which is used to decide which instuction to use.

## Flow
Below is a diagram describing the flow of this algorithm.
<!-- insert image here -->

## Step 1: atan2
The encoder will first calculate the atan2 of a sample, recording it's results along the way. If it detects a meaningful curve, it uses another heuristics algorithm to generate a meaningful function

## Step 2: DFT
The encoder will next calculate a 512-point Discrete Fourier transform to detect if the waveform is outputting pure sine waves and will use the [`dirsine`](instruction-set.md) instruction if it detects a pure sine is being generated.