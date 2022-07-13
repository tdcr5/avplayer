#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include "log.h"
#include "as-decoder-audio.h"
#include <aac/faad.h>

NeAACDecHandle   sCodecCtx;
void as_audio_decoder_init(void) {
    sCodecCtx = NeAACDecOpen();
    if(sCodecCtx == NULL) {
        aslog(LOG_ERROR, "NeAACDecOpen() failed!");
        assert(0);
    }
}

static int adts_sample_rates[] = {96000,88200,64000,48000,44100,32000,24000,22050,16000,12000,11025,8000,7350,0,0,0};

int as_audio_decoder_process_header(unsigned char *data, size_t data_len) {
    
    int head_type = 0;
    unsigned long samplerate = 0;
    unsigned char channels = 0;
    if(data[0] == 0xff && (data[1] & 0xF6) == 0xf0) {
        /// ADTS header
        head_type = ADTS;

    } else if(memcmp(data, "ADIF", 4) == 0) {
        /// ADIF header
        head_type = ADIF;
    } else {
        /// DecoderSpecificInfo
        head_type = LATM;
    }

    /// Configure
    NeAACDecConfigurationPtr config = NeAACDecGetCurrentConfiguration(sCodecCtx);
    config->outputFormat = FAAD_FMT_16BIT;
    config->downMatrix = 0;
    config->useOldADTSFormat = 0;
    NeAACDecSetConfiguration(sCodecCtx, config);

    /// Initialize
    int result = 0;
    if(head_type == ADTS || head_type == ADIF) {
        result = NeAACDecInit(sCodecCtx, data, data_len, &samplerate, &channels);
    } else {
        result = NeAACDecInit2(sCodecCtx, data, data_len, &samplerate, &channels);
    }
    asjs_callback_init_audio(channels, samplerate);
    return 0;
}

int as_audio_decoder_process_audio(unsigned char *data, size_t data_len) {

    NeAACDecFrameInfo frameInfo;
    void* sample_buffer =  NeAACDecDecode(sCodecCtx, &frameInfo, data, data_len);
    asjs_callback_audio((float**)&sample_buffer, frameInfo.channels, frameInfo.samples);
    return 0;
}

void as_audio_decoder_destroy(void) {

    if(sCodecCtx) {
        NeAACDecClose(sCodecCtx);
    }
}
