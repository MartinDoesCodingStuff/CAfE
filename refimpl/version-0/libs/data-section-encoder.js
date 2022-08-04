var instruction_set = {
  'noop': 0x00,
  'direct': 0x01,
  'line': 0x02,
  'rawdiff': 0x03,
  'hold': 0x04
};

/**
 * @param {{instruction:string,args:number[]|any[]}[]} instructions
 */
function writeDataSection(instructions) {
  /**@type number[] */
  var ar_out = [];
  for (let i = 0; i < instructions.length; i++) {
    let args = instructions[i].args;
    switch (instructions[i].instruction) {
      case 'noop': ar_out.push(instruction_set.noop); break;
      case 'direct': {
        ar_out.push(instruction_set.direct);
          ar_out.push(...encode_via_bit_depth(args[0]));
      } break;
      case 'line': {
        ar_out.push(instruction_set.line);
        let from = encode_via_bit_depth(args[0]);
        let to = encode_via_bit_depth(args[1]);
        let numTimes = to16le(args[2]);
        ar_out.push(...from, ...to, ...numTimes);
      } break;
      case 'rawdiff': {
        ar_out.push(instruction_set.rawdiff);
        let len = to16le(args[0]);
        ar_out.push(...len);
        for(let i=1;i<args.length;i++) ar_out.push(...encode_via_bit_depth(args[i]));
      } break;
      case 'hold': {
        ar_out.push(instruction_set.hold);
        let len = to24le(args[0]);
        ar_out.push(...len);
      } break;
      default: throw TypeError('Invalid instruction: ' + instructions[i].instruction);
    }
  }
  let uint = new Uint8Array(ar_out);
  return uint;
}

/**@param {number} a */
function encode_via_bit_depth(a) {
  let func;
  if (BIT_DEPTH == 8) { func = to8le; }
  else if (BIT_DEPTH == 16) { func = to16le; }
  else if (BIT_DEPTH == 24) { func = to24le; }
  else if (BIT_DEPTH == 32) { func = to32le; }
  else if (BIT_DEPTH == 64) { func = toi64le; }
  return func(a);
}