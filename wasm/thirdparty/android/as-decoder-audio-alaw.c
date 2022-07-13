#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include "as-decoder-audio.h"
#include <g711/g711.h>

void as_audio_decoder_init(void) {

}

int as_audio_decoder_process_header(unsigned char *data, size_t data_len) {
    return 0;
}

int as_audio_decoder_process_audio(unsigned char *data, size_t data_len) {
    
    uint8_t * dst = (uint8_t*)malloc(data_len * sizeof(float));
    alaw_to_pcm32(data_len, data, dst);
    asjs_callback_audio((float**)&dst, 1, data_len);
    free(dst);
    return 0;
}

void as_audio_decoder_destroy(void) {

}