const FILE_IDENTIFIER = "CAfE";

const DATA_TYPE = "A";
const SAMPLE_RATE = 44100;
const COMPRESSION_STRAT = "none";
const BIT_DEPTH = 16;
const NUM_CHANNELS = 1;

const VERSION = {
  major: 0,
  minor: 0,
  patch: 0
};

/**
 * @param {string} in_data_type
 * @param {{major:number,minor:number,patch:number}} in_version_identifier
 * @param {number} sampleRate
 * @param {string} compressionStrategy
 * @param {number} bitDepth
 */
function write_header(in_data_type, in_version_identifier, sampleRate, compressionStrategy, bitDepth) {

  let identifier = FILE_IDENTIFIER.split('').map(x => x.charCodeAt(0));
  let data_type = in_data_type.charCodeAt(0);
  let version_identifier = [...to8le(in_version_identifier.major), ...to8le(in_version_identifier.minor),
                            ...to8le(in_version_identifier.patch)];
  let global_params = write_global_params_chunk({
    sampleRate,
    compressionStrategy,
    bitDepth,
    hasExtraMetadata: false
  });
  let meta_begin_tag = [77, 69, 84, 65];

  let dateModified = tou64le(Date.now());
  let samplerate = to32le(sampleRate);
  let data_begin_tag = [68, 65, 84, 65];
  let out = new Uint8Array([...identifier, data_type, ...version_identifier,
    ...global_params, ...meta_begin_tag, ...dateModified, ...samplerate, ...data_begin_tag]);

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