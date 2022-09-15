/**
 * Does not require any other files.
 */

/**
 * @param {Object} options
 * @param {number} options.sampleRate
 * @param {"none"|"lzss1k"|"lzss2k"|"lzss32k"|"deflate"} options.compressionStrategy
 * @param {8|16|24|32|64} options.bitDepth
 * @param {boolean} options.hasExtraMetadata
 * @param {number} options.numChannels
 */
function write_global_params_chunk(options) {
  var out = new Uint8Array(2);
  switch(options.sampleRate) {
    case 8000: out[0]   |= 0b00010000; break;
    case 16000: out[0]  |= 0b00100000; break;
    case 22050: out[0]  |= 0b00110000; break;
    case 44100: out[0]  |= 0b01000000; break;
    case 48000: out[0]  |= 0b01010000; break;
    case 96000: out[0]  |= 0b01100000; break;
    case 192000: out[0] |= 0b01110000; break;
    default: out[0]     |= 0b11110000; break;
  }
  // if(options.optWholeFileCompression == true) out[0] |= 0b1000;
  switch(options.compressionStrategy) {
    case 'none': out[0] |= 0b0000; break;
    case 'lzss1k': out[0] |= 0b0001; break;
    case 'lzss2k': out[0] |= 0b0010; break;
    case 'lzss32k': out[0] |= 0b0011; break;
    case 'deflate': out[0] |= 0b0100; break;
    default: throw TypeError('Unsupported compression strategy:' + options.compressionStrategy + '. Valid values are: \"none\", \"lzss1k\", \"lzss2k\", \"lzss32k\", \"huff1d\", \"deflate\"');
  }

  switch(options.bitDepth) {
    case 8: out[1] |= 0b00100000; break;
    case 16: out[1] |= 0b01000000; break;
    case 24: out[1] |= 0b01100000; break;
    case 32: out[1] |= 0b10000000; break;
    case 64: out[1] |= 0b10100000; break;
    default: throw TypeError('Unsupported bit depth: ' + options.bitDepth + '. Valid values are: 8, 16, 24, 32, 64.');
  }
  if(options.hasExtraMetadata == true) out[1] |= 0b10000;

  if(options.numChannels > 15) throw TypeError('numChannels must not be greater than 15. Tip: channel 1 is indexed as 0.');
  else out[1] |= options.numChannels;
  
  return out;
}