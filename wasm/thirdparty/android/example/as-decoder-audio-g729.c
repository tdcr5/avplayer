#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include "log.h"
#include "as-decoder-audio.h"
#include <g729/typedef.h>
#include <g729/basic_op.h>
#include <g729/ld8a.h>
#include <g729/dtx.h>
#include <g729/octet.h>

void as_audio_decoder_init(void) {

    Init_Decod_ld8a();
    Init_Post_Filter();
    Init_Post_Process();
    /* for G.729b */
    Init_Dec_cng();
}

int as_audio_decoder_process_header(unsigned char *data, size_t data_len) {
    return 0;
}

int as_audio_decoder_process_audio(unsigned char *data, size_t data_len) {
    
    float   fpcm[L_FRAME];
    Word16  synth_buf[L_FRAME+M], *synth; /* Synthesis                   */
    Word16  parm[PRM_SIZE+2];             /* Synthesis parameters        */
    Word16  Az_dec[MP1*2];                /* Decoded Az for post-filter  */
    Word16  T2[2];                        /* Pitch lag for 2 subframes   */
    Word16  i, Vad;
    short* serial = (short*)data;
    if(serial[1] != data_len - 2 * sizeof(short)) {
        aslog(LOG_ERROR, "Invalid g729a decoder buffer!");
        return -1;
    }

    for (i=0; i<M; i++) synth_buf[i] = 0;
    synth = synth_buf + M;

    bits2prm_ld8k(&serial[1], parm);
    /* This part was modified for version V1.3 */
    /* for speech and SID frames, the hardware detects frame erasures
        by checking if all bits are set to zero */
    /* for untransmitted frames, the hardware detects frame erasures
        by testing serial[0] */

    parm[0] = 0;           /* No frame erasure */
    if(serial[1] != 0) {
    for (i = 0; i < serial[1]; i++)
        if (serial[i+2] == 0 ) parm[0] = 1;  /* frame erased     */
    }
    else if(serial[0] != SYNC_WORD) parm[0] = 1;

    if(parm[1] == 1) {
        /* check parity and put 1 in parm[5] if parity error */
        parm[5] = Check_Parity_Pitch(parm[4], parm[5]);
    }

    Decod_ld8a(parm, synth, Az_dec, T2, &Vad);
    Post_Filter(synth, Az_dec, T2, Vad);        /* Post-filter */
    Post_Process(synth, L_FRAME);

    for(i = 0; i < L_FRAME; i++) {
        fpcm[i] = (float)synth[i] / ( 1.0 * 0x8000);
    }

    asjs_callback_audio(&fpcm, 1, L_FRAME);
    return 0;
}

void as_audio_decoder_destroy(void) {

}