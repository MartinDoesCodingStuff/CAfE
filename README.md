# Cromulent Audio-file Encoding Format

QOI, but for audio.

## Background
Approximately during the last few months of online school, I thought up of a codec which just stores the difference of adjacent samples and uses LZSS to compress it. Short answer, my implementation didn't exactly work in my favor and abandoned that idea in favor of this. Compared to the last one, this is WAY more complex than just recording the difference between 2 PCM samples onto a WAV file. This idea was stuck in my head for a long time before deciding to make proper documentation for it. But when documentation started, my mind decided now is the right time to forget everything and suddenly think about horizontally spinning stegosauruses.

## Why this exists
I am aware that this is not the best way to encode audio since you need to use more data than is usually used if it was saved as a regular WAV file. This repo is mostly just for showing a proof-of-concept that eventually might become a proper file format. Some parts may be incomplete, incorrect, badly documented or missing as this is a work in progress. Also I have other things to worry about like my youtube channel.

## Goals
- Encode waveforms using the least amounts of bytes possible.
- Create an Assembly-like language that can generate valid files from text-based source code files (probably stupid).

## Folders
- docs/full - Full documentation.
- docs/version-0 - Where the current reference implentation is based on, the same but without some instructions and header fields. Appended to docs/full after approval.

## Conclusion
This is not the best way to encode audio data (as many others also have talked about [here](docs/attempts.md)). Therefore, this is considered "cromulent" or totally acceptable.