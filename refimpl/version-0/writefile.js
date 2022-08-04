const FILE_IDENTIFIER = "CAfE";

const DATA_TYPE = "A"; // "A"udio, "D"ata
const SAMPLE_RATE = 44100;
const COMPRESSION_STRAT = "none";
const BIT_DEPTH = 16;
const NUM_CHANNELS = 1;

const VERSION = {
  major: 0,
  minor: 0,
  patch: 0
};

function write_header() {

  let identifier = FILE_IDENTIFIER.split('').map(x => x.charCodeAt(0));
  let data_type = DATA_TYPE.charCodeAt(0);
  let version_identifier = [...to8le(VERSION.major), ...to8le(VERSION.minor), ...to8le(VERSION.patch)];
  let global_params = writeGlobalParamsChunk({
    sampleRate: SAMPLE_RATE,
    compressionStrategy: COMPRESSION_STRAT,
    bitDepth: BIT_DEPTH,
    hasExtraMetadata: false
  });
  let meta_begin_tag = [77, 69, 84, 65];

  let dateModified = tou64le(Date.now());
  let sampleRate = to32le(SAMPLE_RATE);
  let out = new Uint8Array([...identifier, data_type, ...version_identifier, ...global_params, ...meta_begin_tag, ...dateModified, ...sampleRate]);

  return out;
}

/**
 * @param {number} in_chan_id
 * @param {Uint8Array} data - Must be compressed BEFORE calling this function.
 * @param {number} in_num_instructions
 */
function write_channel_data(in_chan_id, data, in_num_instructions) {
  let chan_begin_tag = [67, 66];
  let chan_id = to8le(in_chan_id)[0];
  let chan_data_cksum = to32le(crc32(data));
  let num_instructions = tou64le(in_num_instructions);
  let chan_end_tag = [67, 69];
  let out = new Uint8Array([...chan_begin_tag,chan_id,...chan_data_cksum,...num_instructions,...data,...chan_end_tag,0]);
  return out;
}

/**
 * @param {number} in_type_of_meta - 0x00: None, 0x01: ID3, 0x02: XMP, 0x03: Other
 * @param {string} in_metadata - will be encoded as UTF-8 
 */
function write_footer(in_type_of_meta, in_metadata) {
  let data_end_tag = [68, 69, 78, 68];
  let sz_extra_metadata = tou64le(in_metadata.length);
  let type_of_meta = to8le(in_type_of_meta);

  // This assumes that in_metadata is already UTF-8 encoded
  // in order to not corrupt the metadata.
  let extra_meta_contents = (in_metadata);
  let file_end = [69, 79, 70, 255];
  let out = new Uint8Array([...data_end_tag,...sz_extra_metadata,type_of_meta[0],...extra_meta_contents,...file_end]);
  return out;
}