# File structure

The file structure goes as follows:

## Header
```c
// Size: 4+1+3+2+8+4+3+4+4+4=37 bytes
struct cafe_header {
  // Headers marked with "!" are considered to be critical fields and
  // will affect the decoding if not properly written
  // Headers marked with "#" are not considered in the decoding process.
  char identifier[4];                 // Magic bytes "CAfE" 
  char data_type[1];                  //! Type of data in file ("A"udio, "D"ata)
  struct version_identifier {         //! Version identifier, useful for compatibility checking
  uint8_t major_version;              // Major version
  uint8_t minor_version;              // Major version
  uint8_t patch_no;                   // Major version
  };
  uint16_t global_params;             //! Used to describe how to interpret the file
  struct file_meta {                  // File metadata.
  uint64_t dateModified;              //# When the file was last modified
  uint32_t noOfInstructions;          //# Number of instructions the file uses
  uint24_t noOfRawdiffInstructions;   //# Number of times the file uses raw diffed data (see instruction-set.md for details on rawdiff)
  uint32_t sampleRate;                //! Custom sample rate, if the below presets are not applicable. Set as 0x00000000 if not used.
  };
  char data_begin[4];                 //! Byte identifier "DATA"
  uint32_t data_cksum;                //! CRC32 checksum, for corruption prevention
  // data follows...
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
Compression will affect the data portion of the file. The CRC32 checksum is calculated after compression.

| Bits | Description |
|------|-------------|
|  00  | No compression |
|  01  | LZSS (uses 32 byte buffer) |
|  10  | Extended LZSS (uses 128 byte buffer) |
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

## Footer
The footer structure is as follows:
```c
// Size: 4+4+4=12 bytes (not including extra_meta_contents)
struct cafe_footer {
  char data_end[4];             // Identifier "DEND"
  uint32_t sz_extra_meta;       // Size of extra metadata (ID3 tags or XMP data)
  char type_of_meta;            // Type of extra metadata (0x01: ID3, 0x02: XMP, 0x03: Both, 0x04: Other)
  char extra_meta_contents[];   // Extra metadata
  char file_end[4];             // Identifier "EOF\xFF"
};
```