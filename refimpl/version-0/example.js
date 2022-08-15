
// This generates a file with random instructions and parameters.
// Made in order to illustrate the uses of each function in the refimpl.
// Actual reference implementation will be done in the future, in Go.
function encode() {
  var SampleRate = 48000;
  var BitDepth = 16;

  var head = write_header('A', { major: 0, minor: 0, patch: 0 }, SampleRate, 'none', BitDepth);
  var channels = [];
  var inst = Object.keys(instruction_set);
  for (let i = 0; i < 5; i++) {
    let na = [];
    for (let n = 0; n < SampleRate; n++) {
      switch(inst[Math.floor(Math.random() * inst.length)]) {
        case 'noop': na.push(0); break;
        case 'direct': na.push(...write_instructions([{instruction:'direct',args:[Math.floor(Math.random() * (32767 - (-32767)) + (-32767))]}]));
        case 'line': na.push(...write_instructions([{instruction:'line',args:[Math.floor(Math.random() * (32767 - (-32767)) + (-32767)),Math.floor(Math.random() * (32767 - (-32767)) + (-32767)),Math.floor(Math.random() * (32767 - (-32767)) + (-32767))]}]));
        case 'rawdiff': na.push(...write_instructions([{ instruction: 'rawdiff', args: [Math.floor(Math.random() * (32767 - (-32767)) + (-32767))] }]));
        case 'hold': na.push(...write_instructions([{instruction: 'hold', args: [Math.floor(Math.random() * 32767)]}]));
        default: na.push(0); break;
      }
    }
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