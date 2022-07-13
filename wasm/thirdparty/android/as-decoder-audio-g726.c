#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include "log.h"
#include "as-decoder-audio.h"
#include <g726/g726.h>

#define  PCM_SAMPLE_COUNT   480

void as_audio_decoder_init(void) {

}

int as_audio_decoder_process_header(unsigned char *data, size_t data_len) {
    return 0;
}

int as_audio_decoder_process_audio(unsigned char *data, size_t data_len) {
    int16_t   spcm[PCM_SAMPLE_COUNT]; 
    float     fpcm[PCM_SAMPLE_COUNT];
    if(data_len == 120) {
        g726_decode_16(data, spcm);
    } else if(data_len == 180) {
        g726_decode_24(data, spcm);
    } else if(data_len == 240) {
        g726_decode_32(data, spcm);
    } else if(data_len == 300) {
        g726_decode_40(data, spcm);
    } else {
        aslog(LOG_ERROR, "g726 decode, but encode buffer size:%zu", data_len);
        abort();
    }
    int i;
    for(i = 0; i < PCM_SAMPLE_COUNT; i++) {
        fpcm[i] = (float)spcm[i] / (1.0 * 0x8000);
    }
    asjs_callback_audio(&spcm, 1, PCM_SAMPLE_COUNT);
    return 0;
}

void as_audio_decoder_destroy(void) {

}
