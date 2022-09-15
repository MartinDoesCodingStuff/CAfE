/**
 * This is a standalone file.
 */

//#region Writing functions
// functions to convert numbers to a little-endian Uint8Array (char[])
// These functions exist in order to avoid having to compensate for client endianness
/**
 * @param {number} a
 */
 function to8le(a) { return new Uint8Array([a & 255]); }
 /**
  * @param {number} a
  * @param {boolean} signed
  */
 function to16le(a, signed) {
   let buffer = new ArrayBuffer(2);
   let view = new DataView(buffer);
   if(signed) {
     view.setUint16(0,a,true);
   } else {
     view.setInt16(0,a,true);
   }
   return new Uint8Array(view.buffer);
 }
 /**
  * @param {number} a
  */
 function to24le(a) { return new Uint8Array([a & 255, a >> 8 & 255, a >> 16 & 255]); }
 /**
  * @param {number} a
  * @param {boolean} signed
  */
 function to32le(a, signed) { 
   let buffer = new ArrayBuffer(4);
   let view = new DataView(buffer);
   if(signed) {
     view.setInt32(0,a,true);
   } else {
     view.setUint32(0,a,true);
   }
   return new Uint8Array(view.buffer);
 }
 /**
  * @param {number} num
  * @param {boolean} signed
  */
 function to64le(num, signed) {
   let buffer = new ArrayBuffer(8);
   let view = new DataView(buffer);
   if (signed == true) {
     view.setBigInt64(0, BigInt(num), true);
   } else if (signed == false) {
     view.setBigUint64(0, BigInt(num), true);
   }
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
  * @param {...Uint8Array|number[]} buffers
  * @returns {string}
  */
 function uint8_to_str(...buffers) {
   var out = '';
   for (let i = 0; i < buffers.length; i++) {
     out += String.fromCharCode(...buffers[i]);
   }
   return out;
 }
 
 /**
  * @param {number} a
  * @param {number} bitdepth
  * @param {boolean} signed
  */
 function encode_via_bit_depth(a, bitdepth, signed) {
   if (bitdepth == 8) { return to8le(a); }
   else if (bitdepth == 16) { return to16le(a, signed); }
   else if (bitdepth == 24) { return to24le(a); }
   else if (bitdepth == 32) { return to32le(a, signed); }
   else if (bitdepth == 64) { return to64le(a, signed); }
   else throw TypeError('In function: encode_via_bit_depth: Invalid bit depth: ' + bitdepth + '. Valid values are: 8, 16, 24, 32, 64');
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
 // Converting little-endian encoded arrays to numbers
 /**
  * @param {number[]|Uint8Array} a
  */
 function from8le(a) { return a[0]; }
 /**
  * @param {number[]|Uint8Array} a
  * @param {boolean} signed
  */
 function from16le(a, signed) {
   if (!(a instanceof Uint8Array)) {
     a = new Uint8Array(a);
   }
   let buf = a.buffer;
   return (signed ? new Int16Array(buf)[0] : new Uint16Array(buf)[0]);
 }
 /**
  * @param {number[]|Uint8Array} a
  * @param {boolean} signed
  */
 function from24le(a, signed) {
   if (!(a instanceof Uint8Array)) {
     a = new Uint8Array(a);
   }
   if (signed == false) {
     var x = new DataView(a.buffer).getUint16(0, true);
     var y = new DataView(a.buffer).getUint8(2);
     return x + y;
   }
   // else if (signed == true) {
   //   var x = new DataView(a.buffer).getInt16(0, true);
   //   var y = new DataView(a.buffer).getUint8(2);
   //   return x + y;
   // }
 }
 /**
 * @param {number[]|Uint8Array} a
 * @param {boolean} signed
 */
 function from32le(a, signed) {
   if (!(a instanceof Uint8Array)) {
     a = new Uint8Array(a);
   }
   let view = new DataView(a.buffer);
   return (signed ? view.getInt32(0, true) : view.getUint32(0, true));
 }
 /**
  * NOTE: Some numbers will come short when converting from BigInt to Number,
  * especially when it is above Number.MAX_SAFE_INTEGER.
  * @param {number[]|Uint8Array} a
  * @param {boolean} signed
  */
 function from64le(a, signed) {
   if (!(a instanceof Uint8Array)) {
     a = new Uint8Array(a);
   }
   let view = new DataView(a.buffer);
   if (signed == false) {
     return Number(view.getBigUint64(0, true));
   } else if (signed == true) {
     return Number(view.getBigInt64(0, true));
   }
 }
 /**
  * @param {number[]|Uint8Array} a
  * @param {boolean} signed
  * @param {number} bitdepth
  */
 function decode_via_bit_depth(a, signed, bitdepth) {
   if (bitdepth == 8) { return from8le(a); }
   else if (bitdepth == 16) { return from16le(a, signed); }
   else if (bitdepth == 24) { return from24le(a, signed); }
   else if (bitdepth == 32) { return from32le(a, signed); }
   else if (bitdepth == 64) { return from64le(a, signed); }
   else throw TypeError('In function: encode_via_bit_depth: Invalid bit depth: ' + bitdepth + '. Valid values are: 8, 16, 24, 32, 64');
 }
 
  //#endregion