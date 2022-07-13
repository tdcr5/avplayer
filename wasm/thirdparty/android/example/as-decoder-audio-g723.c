#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include "as-decoder-audio.h"
#define  __MOD_G723__
#include <g723/g723.h>

void as_audio_decoder_init(void) {
   Init_Decod();
   Init_Dec_Cng();
}

int as_audio_decoder_process_header(unsigned char *data, size_t data_len) {
    return 0;
}

int as_audio_decoder_process_audio(unsigned char *data, size_t data_len) {

    Word16 spcm[Frame];
    float fpcm[Frame];
    int i = 0;
    (void)Decod(spcm, data, 0);
    for(i = 0; i < Frame; i++) {
        fpcm[i] = (float)spcm[i] / (1.0 * 0x8000);
    }
    asjs_callback_audio(&fpcm, 1, Frame);
    return 0;
}

void as_audio_decoder_destroy(void) {

}




