
// This generates a file with random instructions and parameters.
// Made in order to illustrate the uses of each function in the refimpl.
// Actual reference implementation will be done in the future, in Go.
function encode_random() {
  var head = write_header({ major: 0, minor: 0, patch: 0 }, 48000, 'none', 32, 0, 1);
  var channels = [];
  var inst = Object.keys(instruction_set);
  for (let i = 0; i < 1; i++) {
    let na = [];
    for (let n = 0; n < 512; n++) {
      switch(inst[Math.floor(Math.random() * (inst.length))]) {
        // case 'noop': na.push(0); break;
        case 'direct': na.push(...write_instructions([{instruction:'direct',args:[Math.floor(Math.random() * (32767 - (-32767)) + (-32767))]}], 16)); break;
        case 'line': na.push(...write_instructions([{instruction:'line',args:[
          0,
          32767,
          32768
        ]}], 32)); break;
        case 'rawdiff': na.push(...write_instructions([{ instruction: 'rawdiff', args: [Math.floor(Math.random() * (32767 - (-32767)) + (-32767))] }], 16)); break;
        case 'hold': na.push(...write_instructions([{instruction: 'hold', args: [Math.floor(Math.random() * 8192)]}], 16));
        // default: na.push(0); break;
      }
    }
    na.push(0,0,0); // padding
    channels.push(na);
  }
  var chunked_data = write_data_chunk(0,channels);
  var foot = write_footer(0,'');
  var out = [...head, ...chunked_data, ...foot];
  var data = '';
  console.log({head,chunked_data,foot,channels});
  for(let i=0;i<out.length;i++) {
    data += uint8_to_str(to8le(out[i]));
  }
  download_data(data);
}

function download_data(out) {
  if (verbose_console) console.debug('Downloading audio');
  var blob = new Blob([out], {type: 'application/octet-stream'});
  var objurl = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.download = Date.now() + '.bin';
  link.href = objurl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objurl);
}