# File structure

The entire file uses little-endian formatted integers, unless specified.

The file structure goes as follows:

## Header
```c
struct cafe_header {
  // Headers marked with "!" are considered to be critical fields and
  // will affect the decoding if not properly written, if used.
  // Headers marked with "#" are not considered in the decoding process
  // and can have arbritary data so long as it fits.
  char file_identifier[4];            //  Magic bytes "CAfE" 
  char data_type[1];                  //! Type of data in file ("A"udio, "D"ata)
  struct version_identifier {         //! Version identifier, useful for compatibility checking
  uint8_t major_version;              //  Major version
  uint8_t minor_version;              //  Major version
  uint8_t patch_no;                   //  Major version
  };
  uint16_t global_params;             //! Used to describe how to interpret the file
  uint8_t num_channels;               //! Number of channels
  struct file_meta {                  //  File metadata.
  char meta_begin_tag[4];             //! Byte identifier "META"
  uint64_t dateModified;              //# When the file was last modified
  uint32_t sampleRate;                //! Custom sample rate, if the below presets are not applicable.
  };
  char data_begin_tag[4];             //! Byte identifier "DATA"
};
```
## Header: `data_type`
This tells the decoder what type of file is it dealing with. Here is a table listing how it will be interpreted. So far, a decoder would only need to support 
| Character |                 Description                |
|-----------|--------------------------------------------|
|     A     |   File will be interpreted as audio data   |
|     D     |  File will be interpreted as regular data  |
<!-- |     I     | File will be interpreted as image data (not yet worked out) | -->


## Header: `global_params`
The `global_params` header defines many parsing parameters, such as how will the decoder interpret the instructions, what sample rate it uses, etc.

| Index | Size |     Name     | Description | Valid Values |
|-------|------|--------------|-------------|--------------|
|   0   |  4   |  SAMPLE_RATE | The encoded data's sample rate | See [Valid Sample Rates](#header-valid-sample-rates) |
|   4   |  2   | COMPRESSION_STRAT | Compression strategy of the data | See [Compression Strategies](#header-compression-strategies) |
|   6   |  3   |  BIT_DEPTH   | The required bit depth | See [Bit Depth](#header-bit-depth) |
|   10  |  1   | HAVE_EXTRA_META | Has extra metadata at the end of file | `0: false, 1: true` |
|   11  |  4   | reserved | Reserved for future revisions |


## Header: Valid Sample Rates
| Bits | Description |
|------|-------------|
| 0000 | Invalid     |
| 0001 | 8000Hz      |
| 0010 | 16000Hz     |
| 0011 | 22050Hz     |
| 0100 | 44100Hz     |
| 0101 | 48000Hz     |
| 0110 | 96000Hz     |
| 0111 | 192000Hz    |
| 1111 | Defined in `file_meta->sampleRate` |

## Header: Compression strategies
Each channel in the file is compressed seperately. The CRC32 checksum is calculated after compression.

| Bits | Description |
|------|-------------|
|  00  | No compression |
|  01  | LZSS (uses 2048 byte window with a 16 byte lookahead buffer) |
|  10  | Enhanced LZSS (uses 65536 byte window with a 256 byte lookahead buffer) |
|  11  | DEFLATE |

## Header: Bit Depth
| Bits | Description |
|------|-------------|
| 000  | Invalid     |
| 001  | 8-bit       |
| 010  | 16-bit      |
| 011  | 24-bit      |
| 100  | 32-bit      |
| 101  | 64-bit      |
<hr>

## Data section

```c
struct cafe_data_wrapper {
  // Headers marked with "!" are considered to be critical fields and
  // will affect the decoding if not properly written, if used.
  // Headers marked with "#" are not considered in the decoding process
  // and can have arbritary data so long as it fits.
  char chan_begin_tag[2];             //! Byte identifier "CB"
  uint8_t chan_id;                    //! Channel ID
  uint32_t chan_data_cksum;           //! CRC32 checksum, as a sanity check. Computed after compression and *ideally* checked before the decoding can start.
  uint64_t num_instructions;          //! Number of instuctions for the channel

  char data[];                        //! Actual data, compressed or not.

  char chan_end_tag[2];               //! Byte identifier "CE"
  char null_seperator[1];             //! Byte padding 0x00
  // attach next channel here.
};

```

<hr>

## Footer
```c
// Size: 4+8+1+4=17 bytes (not including extra_meta_contents)
struct cafe_footer {
  // Headers marked with "!" are considered to be critical fields and
  // will affect the decoding if not properly written, if used.
  // Headers marked with "#" are not considered in the decoding process
  // and can have arbritary data so long as it fits.
  char data_end_tag[4];         //! Identifier "DEND"
  // if another channel
  uint64_t sz_extra_meta;       // Size of extra metadata
  char type_of_meta;            // Type of extra metadata (0x00: None, 0x01: ID3, 0x02: XMP, 0x03: Other)
  char extra_meta_contents[];   // Extra metadata, encoded in UTF-8
  char file_end[4];             // Identifier "EOF\xFF"
};
```