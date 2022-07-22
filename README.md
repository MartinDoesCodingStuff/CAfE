# Cromulent Audio-file Encoding Format

## Background
Approximately during the last few months of online school, I thought up of a codec which just stores the difference of adjacent samples and uses LZSS to compress it. Short answer, my implementation didn't exactly work in my favor and abandoned that idea in favor of this. Compared to the last one, this is WAY more complex than just recording the difference between 2 PCM samples onto a modified WAV file.

## Why this exists
I am aware that this is not the best way to encode audio since you need to use more data than is usually used if it was saved as a regular WAV file. This repo is mostly just for showing a proof-of-concept that eventually might become a proper file format. But for the time being, some parts may be incomplete as this is a work in progress.

## Goals
- Encode waveforms using the least amounts of bytes possible.
- Create a Assembly-like language that can generate valid files from text-based source code files.


## Conclusion
This is not the best way to encode audio data (as many others also have talked about [here](docs/attempts.md)). Therefore, this is considered "cromulent" or totally acceptable.