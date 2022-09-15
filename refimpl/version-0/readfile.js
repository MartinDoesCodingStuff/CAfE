
var verbose_console = true;

var dbgsyms = {
  chan_size: 0,
  /**@type number[][] */
  chan_data: [],
  decoder_i: 0
};

var info = {
  no_instructions: 0,
  no_per_instr: {
    'noop':0,
    'direct':0,
    'line':0,
    'rawdiff':0,
    'hold':0,
    'invalid':0
  }
};
/**
 * @param {Uint8Array|number[]} data
 */
function parse_file(data) {
  if((!(data instanceof Uint8Array)) || (typeof data == "undefined")) { console.warn('invalid file'); return; }
  if (String.fromCharCode(...data.slice(0, 4)) != FILE_IDENTIFIER) { console.warn('invalid file'); return; }
  var sampleRate = 44100;

  var file_i = 4;

  var version = {
    major: data[file_i],
    minor: data[file_i + 1],
    patch: data[file_i + 2]
  };
  file_i += 3;

  var global_params = read_global_params_chunk(data.slice(file_i, file_i + 2));
  file_i += 2;

  var num_chunks = from32le(data.slice(file_i, file_i + 4), false);
  file_i += 4;

  file_i += 4; // skip over "META" tag

  var dateModified = from64le(data.slice(file_i, file_i + 8), false);
  file_i += 8;
  console.debug(`Date modified: ${new Date(dateModified).toString()}`);

  var customSampleRate = from32le(data.slice(file_i, file_i + 4));
  file_i += 4;
  sampleRate = global_params.sampleRate != 0 ? global_params.sampleRate : customSampleRate;

  console.debug(`Codec version: ${version.major}.${version.minor}.${version.patch}
  Sample rate: ${sampleRate}
  No. Channels: ${global_params.numChannels}
  Compression: ${global_params.compressionStrategy}
  Bit depth: ${global_params.bitDepth}
  Extra metadata?: ${global_params.hasExtraMetadata}
  Uses custom samplerate?: ${global_params.sampleRate == 0}`);

  if (verbose_console) console.debug('Finding DATA section');
  if (String.fromCharCode(...data.slice(file_i, file_i + 4)) != "DATA") { console.warn('Cannot find data begin identifier, corrupted file?'); return; }
  file_i += 4;


  /**@type number[][] */
  var data_per_channel = new Array(global_params.numChannels).fill([]);
  for (let chunk_i = 0; chunk_i < num_chunks; chunk_i++) {
    if (verbose_console) console.debug('At chunk index %d of %d', chunk_i, num_chunks);

    if (String.fromCharCode(...data.slice(file_i, file_i + 2)) != "CB") { console.warn('Cannot find chunk begin identifier, corrupted file?'); return; }
    file_i += 2;

    var chunk_size = from64le(data.slice(file_i, file_i + 8), false);
    if(verbose_console) console.debug('Chunk size: %d', chunk_size);
    file_i += 8;

    var chunk_index = from32le(data.slice(file_i, file_i + 4), false);
    file_i += 4;

    if (chunk_i != chunk_index) { console.warn('Mismatched chunk index, ignoring... (decoder: %d, file: %d)', chunk_i, chunk_index); }

    var chan_data_cksum = from32le(file_i, file_i + 4);
    var calculated_crc32 = crc32(data.slice(file_i, file_i + chunk_size));
    if (verbose_console) console.debug('Calculated CRC32s\nfile: %s @ %sh\ncalculated: %s', chan_data_cksum.toString(16), file_i.toString(16), calculated_crc32.toString(16));
    // if (calculated_crc32 != chan_data_cksum) { console.warn('CRC32 check failed, corrupted file?'); return; }
    file_i += 4;

    for (let chan_i = 0; chan_i < global_params.numChannels; chan_i++) {
      if(verbose_console) console.debug('At channel %d of %d @ %sh', chan_i+1, global_params.numChannels, file_i.toString(16));

      if (String.fromCharCode(...data.slice(file_i, file_i + 2)) != "CH") { console.warn('Channel begin not found, corrupted file?'); return; }
      file_i += 2;
      var channel_index = data[file_i];
      if(verbose_console) console.debug('Decoded channel index: %d @ %sh', channel_index, file_i.toString(16));
      file_i += 1;
      if (chan_i != channel_index) { console.warn('Channel index encoded in file does not correspond to decoder\'s own channel index'); }

      var chan_size = from64le(data.slice(file_i, file_i + 8), false);
      if(verbose_console) console.debug('chan_size: %d @ %sh', chan_size, file_i);
      file_i += 8;
      dbgsyms.chan_size = chan_size;

      if(verbose_console) console.debug('Reading instructions... (starting timer now)');
      var t0_instructions = performance.now();
      var parsed = read_instructions(data.slice(file_i, file_i + chan_size+1), global_params.bitDepth);
      var t1_instructions = performance.now();
      if(verbose_console) console.debug('decoding done, took %sms', t1_instructions - t0_instructions);
      for(let parsed_i=0;parsed_i<parsed.length;parsed_i++) data_per_channel[chan_i].push(parsed[parsed_i]);
      file_i += chan_size;
    }

    dbgsyms.chan_data = data_per_channel;
    if(verbose_console) console.debug('Finding chunk ending identifier @ %sh', file_i.toString(16));
    if (String.fromCharCode(...data.slice(file_i, file_i + 2)) != "CE") { console.warn('Chunk ending identifier not found, corrupted file?'); return; }
    file_i += 3;
  }


  if (String.fromCharCode(...data.slice(file_i, file_i + 4)) != "DEND") { console.warn('Data end identifier not found, corrupted file?'); }
  file_i += 4;
  // We're just going to ignore the metadata for now.
  var out = interleave(data_per_channel);
  write_to_wavfile(out, global_params.bitDepth, global_params.numChannels, sampleRate);
}

function write_to_wavfile(d, bitdepth, numchans, samplerate) {
  if(verbose_console) console.debug('Encoding to PCM file @ %d, %d with %d channels', bitdepth, samplerate, numchans);
  var data = '';
  for (let i = 0; i < d.length; i++) {
    data += String.fromCharCode(...encode_via_bit_depth(d[i], bitdepth, true));
  }
  if(verbose_console) console.debug('Done encoding, size of data: %d', data.length);
  downloadData(data);
}

function interleave(arr) {
  return Array.from({
    length: Math.max(...arr.map(o => o.length)), // find the maximum length
  },
    (_, i) => arr.map(r => r[i] ?? 0) // create a new row from all items in same column or substitute with 0
  ).flat();
}

function downloadData(out) {
  if (verbose_console) console.debug('Downloading audio');
  var blob = new Blob([out], {type: 'application/octet-stream'});
  var objurl = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.download = Date.now() + '.txt';
  link.href = objurl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objurl);
}