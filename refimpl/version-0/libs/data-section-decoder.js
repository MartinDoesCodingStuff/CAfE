/**
 * Requires file(s):
 * utils.js, readfile.js
 */

/**
 * @param {number[]|Uint8Array} raw
 * @param {number} bitdepth
 */
 function read_instructions(raw, bitdepth) {
  /**@type number[] */
  var ar_out = [];
  var num_bytes_for_bitdepth = bitdepth/8;
  var last_sample_value = 0;
  for (let i = 0; i < raw.length;) {
    dbgsyms.decoder_i = i;
    switch (raw[i]) {
      case instruction_set.noop: {info.no_instructions++; info.no_per_instr.noop++; i += 1;} break;
      case instruction_set.direct: {
        info.no_instructions++;
        info.no_per_instr.direct++;
        i++;
        let v = decode_via_bit_depth(raw.slice(i,i+num_bytes_for_bitdepth), false, bitdepth);
        last_sample_value = v;
        ar_out.push(v);
        i += num_bytes_for_bitdepth;
      } break;
      case instruction_set.line: {
        info.no_instructions++;
        info.no_per_instr.line++;
        i++;
        let readoffs = i;
        let from = decode_via_bit_depth(raw.slice(readoffs,readoffs+num_bytes_for_bitdepth),true,bitdepth); readoffs += num_bytes_for_bitdepth;
        let to = decode_via_bit_depth(raw.slice(readoffs,readoffs+num_bytes_for_bitdepth),true,bitdepth); readoffs += num_bytes_for_bitdepth;
        let len = from16le(raw.slice(readoffs,readoffs+2), false);

        let ps = getpoints(0,from,len,to,len);
        for(let n=0;n<ps.length;n++) {
          ar_out.push(ps[n]);
          last_sample_value = ps[n];
        }
        i += ((num_bytes_for_bitdepth*2)+2);
      } break;
      case instruction_set.rawdiff: {
        info.no_instructions++;
        info.no_per_instr.rawdiff++;
        i++;
        let v = decode_via_bit_depth(raw.slice(i,i+num_bytes_for_bitdepth), true, bitdepth);
        v = v + last_sample_value;
        last_sample_value = v;
        ar_out.push(v);
        i += num_bytes_for_bitdepth;
      } break;
      case instruction_set.hold: {
        info.no_instructions++;
        info.no_per_instr.hold++;
        i++;
        let hold = from24le(raw.slice(i,i+3), false);
        for(let n=0;n<hold;n++) {
          ar_out.push(last_sample_value);
        }
        i += 3;
      } break;

      // If invalid, advance to next byte until valid instruction appears
      default: {info.no_per_instr.invalid++; i += 1;} break;
    }
  }
  return ar_out;
}
/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} num
 */
function getpoints(x0, y0, x1, y1, num) {
	var ydiff = y1 - y0, xdiff = x1 - x0;
	var slope = ydiff / xdiff;
	var y = 0;
	var points = [];
	for(let i=0;i<num;i++) {
		y = slope == 0 ? 0 : ydiff * (i/num);
		points.push(Math.round(y+y0));
}
	return points;
}