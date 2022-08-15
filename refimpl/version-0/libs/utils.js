
//#region Writing functions
// functions to convert numbers to a little-endian Uint8Array (char[])
// These functions exist in order to avoid having to compensate for client endianness
/**
 * @param {number} a
 */
function to8le(a) { return new Uint8Array([a & 255]); }
/**
 * @param {number} a
 */
function to16le(a) { return new Uint8Array([a & 255, a >> 8 & 255]); }
/**
 * @param {number} a
 */
function to24le(a) { return new Uint8Array([a & 255, a >> 8 & 255, a >> 16 & 255]); }
/**
 * @param {number} a
 */
function to32le(a) { return new Uint8Array([a & 255, a >> 8 & 255, a >> 16 & 255, a >> 24 & 255]); }
/**
 * @param {number} num
 */
function toi64le(num) {
  let buffer = new ArrayBuffer(8);
  let view = new DataView(buffer);
  view.setBigInt64(0,BigInt(num),true);
  return new Uint8Array(view.buffer);
}
/**
 * @param {number} num
 */
 function tou64le(num) {
  let buffer = new ArrayBuffer(8);
  let view = new DataView(buffer);
  view.setBigUint64(0,BigInt(num),true);
  return new Uint8Array(view.buffer);
}

/**
* @param {number} num
*/
function tof32le(num) {
  let float = new Float32Array([num]);
  let uint = new Uint8Array(float.buffer);
  return uint;
}

/**
 * @param {...Uint8Array} buffers
 * @returns {string}
 */
function uint8_to_str(...buffers) {
  var out = '';
  for(let i=0;i<buffers.length;i++) {
    out += String.fromCharCode(...buffers[i]);
  }
  return out;
}
//#endregion

// https://stackoverflow.com/questions/18638900/javascript-crc32
// Modified it to:
// a. generate the CRC table at the start of script execution
// b. make the crc32 function accept number or byte arrays as the argument
// c. passed trough Google's closure compiler for faster operation
function makeCRCTable() { for (var a, d = [], b = 0; 256 > b; b++) { a = b; for (var c = 0; 8 > c; c++)a = a & 1 ? 3988292384 ^ a >>> 1 : a >>> 1; d[b] = a; } return d; };
var cafe_internal_CRCtable = makeCRCTable();
/**@param {number[]|Uint8Array} a */
function crc32(a) { for (var d = cafe_internal_CRCtable, b = -1, c = 0; c < a.length; c++)b = b >>> 8 ^ d[(b ^ a[c]) & 255]; return (b ^ -1) >>> 0; }

//#region Reading functions

//#endregion