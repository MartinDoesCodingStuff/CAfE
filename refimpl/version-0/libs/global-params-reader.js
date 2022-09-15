/**
 * Does not require any other files.
 */

/**
 * @param {number[]|Uint8Array} bytes
 */
function read_global_params_chunk(bytes) {
  var sampleRate = 0;
  var numChannels = bytes[1] & 0b00001111;
  var hasExtraMetadata = bytes[1] & 0b10000 == 16;
  var bitDepth = 0;
  var compressionStrategy = '';
  var samplerate_nibble = bytes[0] & 0b11110000;
  var compstrat_nibble = bytes[0] & 0b00001111;
  var bitdepth_nibble = bytes[1] & 0b11100000;

  switch(samplerate_nibble) {
    case 0b00010000: sampleRate = 8000; break;
    case 0b00100000: sampleRate = 16000; break;
    case 0b00110000: sampleRate = 22050; break;
    case 0b01000000: sampleRate = 44100; break;
    case 0b01010000: sampleRate = 48000; break;
    case 0b01100000: sampleRate = 96000; break;
    case 0b01110000: sampleRate = 192000; break;
    default: sampleRate = 0; break;
  }
  switch(compstrat_nibble) {
    case 0b00000000: compressionStrategy = 'none'; break;
    case 0b00000001: compressionStrategy = 'lzss1k'; break;
    case 0b00000010: compressionStrategy = 'lzss2k'; break;
    case 0b00000011: compressionStrategy = 'lzss32k'; break;
    case 0b00000100: compressionStrategy = 'deflate'; break;
    default: compressionStrategy = 'none'; break;
  }
  switch(bitdepth_nibble) {
    case 0b00100000: bitDepth = 8; break;
    case 0b01000000: bitDepth = 16; break;
    case 0b01100000: bitDepth = 24; break;
    case 0b10000000: bitDepth = 32; break;
    case 0b10100000: bitDepth = 64; break;
    default: throw new TypeError('Invalid bit depth read, corrupted file?');
  }

  return {sampleRate, numChannels, bitDepth, hasExtraMetadata, compressionStrategy};
}