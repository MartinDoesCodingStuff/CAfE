/**
 * Requires file(s):
 * utils.js
 */

 var instruction_set = {
  'noop': 0x00,
  'direct': 0x01,
  'line': 0x02,
  'rawdiff': 0x03,
  'hold': 0x04
};

/**
 * @param {{instruction:string,args:number[]}[]} instructions
 * @param {number} bitdepth
 */
function write_instructions(instructions, bitdepth) {
  /**@type number[] */
  var ar_out = [];
  for (let i = 0; i < instructions.length; i++) {
    let args = instructions[i].args;
    switch (instructions[i].instruction) {
      case 'noop': ar_out.push(instruction_set.noop); break;
      case 'direct': {
        ar_out.push(instruction_set.direct);
          ar_out.push(...encode_via_bit_depth(args[0], bitdepth, true));
      } break;
      case 'line': {
        ar_out.push(instruction_set.line);
        let from = encode_via_bit_depth(args[0], bitdepth, true);
        let to = encode_via_bit_depth(args[1], bitdepth, true);
        let numTimes = to16le(args[2], false);
        ar_out.push(...from, ...to, ...numTimes);
      } break;
      case 'rawdiff': {
        ar_out.push(instruction_set.rawdiff);
        // let len = to16le(args[0]);
        // ar_out.push(...len);
        // for(let i=1;i<args.length;i++) ar_out.push(...encode_via_bit_depth(args[i]));
        ar_out.push(args[0]);
      } break;
      case 'hold': {
        ar_out.push(instruction_set.hold);
        let len = to24le(args[0]);
        ar_out.push(...len);
      } break;
      default: throw TypeError('In function: write_instructions: Invalid instruction: ' + instructions[i].instruction);
    }
  }
  let uint = new Uint8Array(ar_out);
  return uint;
}

/**
 * @param {number} chunk_index - Chunk size is variable
 * @param {Uint8Array[]} channels - Must be compressed beforehand.
 */
function write_data_chunk(chunk_index, channels) {
  const CHUNK_BEGIN_TAG = [67, 66];
  const CHANNEL_BEGIN_TAG = [67, 72];
  const CHUNK_END_TAG = [67, 69];
  var out = [];
  var chan_out = [];
  var sz_chan_out = 0;
  for(let chan_i=0;chan_i<channels.length;chan_i++) {
    chan_out.push(...CHANNEL_BEGIN_TAG,to8le(chan_i)[0], ...to64le(channels[chan_i].length, false));
    for(let data_i=0;data_i<channels[chan_i].length;data_i++) {chan_out.push(channels[chan_i][data_i]);}
    sz_chan_out += channels[chan_i].length;
  }
  out.push(...CHUNK_BEGIN_TAG, ...to64le(sz_chan_out, false), ...to32le(chunk_index, false));
  var crc = to32le(crc32(chan_out), false);
  if(verbose_console) console.debug('CRC32: %s',[...crc].map(x=>x.toString(16)).join(''));
  out.push(...crc);
  for(let i=0;i<chan_out.length;i++) out.push(chan_out[i]);
  out.push(...CHUNK_END_TAG, 0);
  let uint = new Uint8Array(out);
  return uint;
}
