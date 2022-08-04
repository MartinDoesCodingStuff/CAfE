/**
 * @param {Object} options
 * @param {number} options.sampleRate
 * @param {"none"|"deflate"|"lzss128"|"lzss32k"} options.compressionStrategy
 * @param {8|16|24|32|64} options.bitDepth
 * @param {boolean} options.hasExtraMetadata
 */
function writeGlobalParamsChunk(options) {
  var out = new Uint8Array(2);
  switch(options.sampleRate) {
    case 8000: out[0] |= 0b00010000; break;
    case 16000: out[0] |= 0b00110000; break;
    case 22050: out[0] |= 0b00110000; break;
    case 44100: out[0] |= 0b01000000; break;
    case 48000: out[0] |= 0b00110000; break;
    case 96000: out[0] |= 0b00110000; break;
    case 192000: out[0] |= 0b00110000; break;
    default: out[0] |= 0b11110000; break;
  }
  switch(options.compressionStrategy) {
    case 'none': out[0] |= 0b0000; break;
    case 'deflate': out[0] |= 0b0100; break;
    case 'lzss128': out[0] |= 0b1100; break;
    case 'lzss32k': out[0] |= 0b1100; break;
    default: throw TypeError('Unsupported compression strategy:' + options.compressionStrategy + '. Valid values are: \"none\", \"deflate\", \"lzss128\", \"lzss32k\"');
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
  return out;
}