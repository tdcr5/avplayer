

 const AVType = {

    Video: 0x1,
    Audio: 0x2

};

 const VideoType = {

    H264: 0x1,
    H265: 0x2

};

const AudioType = {

    PCM:   0x1,
    PCMA:  0x2,
    PCMU:  0x4,
    AAC:   0x8

};

const AACProfile = {
    AAC_MAIN: 1,
    AAC_LC: 2,
    AAC_SSR: 3
};

const PixelType = {

    YUV:   0x1,
    RGBA:  0x2,
};

const ADTS_HEADER_SIZE = 7;

const AAC_SAMPLE_RATE = [
    96000, 88200, 64000, 48000,
    44100, 32000, 24000, 22050,
    16000, 12000, 11025, 8000,
    7350, 0, 0, 0
  ];

export {AVType, VideoType, AudioType, PixelType, ADTS_HEADER_SIZE, AAC_SAMPLE_RATE, AACProfile};