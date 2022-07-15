#include <assert.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <limits.h>
#include <errno.h>
#include <stdio.h>

#include <avc/ih264_typedefs.h>
#include <avc/iv.h>
#include <avc/ivd.h>
#include <avc/ih264d.h>
#include <avc/ithread.h>

#include "log.h"
#include "decoderavc.h"

#define STRIDE                  0
#define ivd_api_function        ih264d_api_function

void* ivd_aligned_malloc(void *pv_ctxt, WORD32 alignment, WORD32 i4_size) {

    (void)pv_ctxt;
    // use posix_memalign, but mimic the behaviour of memalign
    void* ptr = NULL;
    int rc = posix_memalign(&ptr, alignment, i4_size);

    if (rc == 0) {
        errno = 0;
        return ptr;
    } else {
        errno = rc;
        return NULL;
    }

    //return  rc == 0 ? (errno = 0, ptr) : (errno = rc, NULL);
}

void ivd_aligned_free(void *pv_ctxt, void* aligned_ptr) {
    (void)pv_ctxt;
    free(aligned_ptr);
}


DecoderAVC::DecoderAVC(DecoderVideoObserver* obs):DecoderVideo(obs),mCodecCtx(nullptr), mVideoWith(0), mVideoHeight(0) {

   
}

DecoderAVC::~DecoderAVC() {

    if (mCodecCtx) {

        int status = 0;
        ivd_delete_ip_t s_delete_ip;
        ivd_delete_op_t s_delete_op;
            
        s_delete_ip.u4_size = sizeof(ivd_delete_ip_t);
        s_delete_ip.e_cmd = IVD_CMD_DELETE;
            
        s_delete_op.u4_size = sizeof(ivd_delete_op_t);
            
        status = ivd_api_function((iv_obj_t*)mCodecCtx, (void *)&s_delete_ip, (void *)&s_delete_op);
        if (status != IV_SUCCESS) {
            aslog(LOG_ERROR, "Error in delete: 0x%x",  s_delete_op.u4_error_code);
         }
    }

}


void DecoderAVC::init() {

     IV_API_CALL_STATUS_T ret;
    int numCores = 1;
    ih264d_create_ip_t s_create_ip;
    ih264d_create_op_t s_create_op;

    void *dec_fxns = (void *)&ivd_api_function;

    s_create_ip.s_ivd_create_ip_t.e_cmd = IVD_CMD_CREATE;
    s_create_ip.s_ivd_create_ip_t.u4_share_disp_buf = 0;
    s_create_ip.s_ivd_create_ip_t.e_output_format = IV_YUV_420P;
    s_create_ip.s_ivd_create_ip_t.pf_aligned_alloc = ivd_aligned_malloc;
    s_create_ip.s_ivd_create_ip_t.pf_aligned_free = ivd_aligned_free;
    s_create_ip.s_ivd_create_ip_t.pv_mem_ctxt = NULL;
    s_create_ip.s_ivd_create_ip_t.u4_size = sizeof(ih264d_create_ip_t);
    s_create_op.s_ivd_create_op_t.u4_size = sizeof(ih264d_create_op_t);



    ret = ivd_api_function(NULL, (void *)&s_create_ip,
                                (void *)&s_create_op);
    if(ret != IV_SUCCESS)
    {
        aslog(LOG_ERROR, "Error in Create %8x",
                s_create_op.s_ivd_create_op_t.u4_error_code);
        abort();
    }
    iv_obj_t* codecCtx = (iv_obj_t*)s_create_op.s_ivd_create_op_t.pv_handle;
    codecCtx->pv_fxns = dec_fxns;
    codecCtx->u4_size = sizeof(iv_obj_t);

    /** Configure ivd decode header */
    ivd_ctl_set_config_ip_t s_ctl_ip;
    ivd_ctl_set_config_op_t s_ctl_op;


    s_ctl_ip.u4_disp_wd = STRIDE;
    
    s_ctl_ip.e_frm_skip_mode = IVD_SKIP_NONE;
    s_ctl_ip.e_frm_out_mode = IVD_DISPLAY_FRAME_OUT;
    s_ctl_ip.e_vid_dec_mode = IVD_DECODE_HEADER;
    s_ctl_ip.e_cmd = IVD_CMD_VIDEO_CTL;
    s_ctl_ip.e_sub_cmd = IVD_CMD_CTL_SETPARAMS;
    s_ctl_ip.u4_size = sizeof(ivd_ctl_set_config_ip_t);
    s_ctl_op.u4_size = sizeof(ivd_ctl_set_config_op_t);

    ret = ivd_api_function(codecCtx, (void *)&s_ctl_ip, (void *)&s_ctl_op);
    if(ret != IV_SUCCESS)
    {
       // aslog(LOG_ERROR,  "Error in setting the stride");

        printf("SIMD setting the stride error\n"); 
        abort();
    }

    printf("SIMD setting the stride SUCCESS \n"); 

    mCodecCtx = codecCtx;

    setNumCores(numCores);
    setProcessor();
    logVersion();

    printf("SIMD AVC Decorder init SUCCESS \n"); 

}

void DecoderAVC::decode(unsigned char *buf, unsigned int buflen, unsigned int timestamp) {

        int status = 0;
        ivd_video_decode_ip_t s_dec_ip;
        ivd_video_decode_op_t s_dec_op;

        memset(&s_dec_ip, 0, sizeof(ivd_video_decode_ip_t));
        memset(&s_dec_op, 0, sizeof(ivd_video_decode_op_t));

        s_dec_ip.u4_size = sizeof(ivd_video_decode_ip_t);
        s_dec_op.u4_size = sizeof(ivd_video_decode_op_t);
        
        s_dec_ip.e_cmd = IVD_CMD_VIDEO_DECODE;
        
        /* When in flush and after EOS with zero byte input,
         * inHeader is set to zero. Hence check for non-null */

        printf("SIMD decode buf %d ts %d \n", buflen, timestamp);
   
        //ps_dec_ip->u4_ts = timeStampIx;
        s_dec_ip.pv_stream_buffer = (void*)buf;
        s_dec_ip.u4_num_Bytes = buflen;

        int  bufferSize = 1280 * 720 * 3 / 2;
       // unsigned char* pBuf  = (unsigned char*)ivd_aligned_malloc(NULL,128, (int)bufferSize);

        // int sizeY = 1280 * 720;
        // int sizeUV  = sizeY / 4;

        unsigned char* pBuf = NULL;
        int sizeY = 0;
        int sizeUV  = 0;


        s_dec_ip.s_out_buffer.u4_min_out_buf_size[0] = sizeY;
        s_dec_ip.s_out_buffer.u4_min_out_buf_size[1] = sizeUV;
        s_dec_ip.s_out_buffer.u4_min_out_buf_size[2] = sizeUV;
        
        s_dec_ip.s_out_buffer.pu1_bufs[0] = pBuf;
        s_dec_ip.s_out_buffer.pu1_bufs[1] = pBuf + sizeY;
        s_dec_ip.s_out_buffer.pu1_bufs[2] = pBuf + sizeY + sizeUV;
        s_dec_ip.s_out_buffer.u4_num_bufs = 0;


        status = ivd_api_function((iv_obj_t*)mCodecCtx, (void*)&s_dec_ip, (void *)&s_dec_op);

        if(status != IV_SUCCESS) {
           // aslog(LOG_ERROR, "SoftHevcDec decode status=%d err =0x%x",status,s_dec_op.u4_error_code); 
            ivd_aligned_free(NULL, pBuf);
            printf("SIMD err decode status=%d err =0x%x \n",status,s_dec_op.u4_error_code); 
            return;          
        }

        printf("SIMD success decode status=%d err =0x%x \n",status,s_dec_op.u4_error_code); 

       // aslog(LOG_INFO, "SoftHevcDec decode status=%d err =0x%x",status,s_dec_op.u4_error_code);

        
    if (mVideoWith != s_dec_op.u4_pic_wd || mVideoHeight != s_dec_op.u4_pic_ht) {

        mVideoWith = s_dec_op.u4_pic_wd;
        mVideoHeight = s_dec_op.u4_pic_ht;

        mObserver->videoInfo(mVideoWith, mVideoHeight);

        if (mYUV) {
             ivd_aligned_free(NULL, mYUV);
        }
            
        mYUV  = (unsigned char*)ivd_aligned_malloc(NULL,128, (int)mVideoWith * mVideoHeight * 3 /2);

    }

    int size = mVideoWith * mVideoHeight;
 
    int halfw = mVideoWith >> 1;
    int halfh = mVideoHeight >> 1;


    int ylineszie = s_dec_op.s_disp_frm_buf.u4_y_strd;
    int ulineszie = s_dec_op.s_disp_frm_buf.u4_u_strd;
    int vlineszie = s_dec_op.s_disp_frm_buf.u4_v_strd;
    unsigned char* ydata = (unsigned char*)s_dec_op.s_disp_frm_buf.pv_y_buf;
    unsigned char* udata = (unsigned char*)s_dec_op.s_disp_frm_buf.pv_u_buf;
    unsigned char* vdata = (unsigned char*)s_dec_op.s_disp_frm_buf.pv_v_buf;


    if (mVideoWith == ylineszie) {

        memcpy(mYUV, ydata, size);

    } else {

        for (int i = 0; i < mVideoHeight; i++) {

            memcpy(mYUV + i*mVideoWith, ydata + ylineszie, mVideoWith);
        }

    }

    if (halfw == ulineszie) {

        memcpy(mYUV + size, udata, size>>2);

    } else {

        for (int i = 0; i < halfh; i++) {

            memcpy(mYUV + size + i*halfw, udata + i*ulineszie, halfw);
        }

    }

    if (halfw == vlineszie) {

        memcpy(mYUV + size*5/4, vdata, size>>2);

    } else {

        for (int i = 0; i < halfh; i++) {

            memcpy(mYUV + size*5/4 + i*halfw, vdata + i*vlineszie, halfw);
        }

    }

    ivd_aligned_free(NULL, s_dec_op.s_disp_frm_buf.pv_y_buf);

    mObserver->yuvData(mYUV, timestamp);

}


void DecoderAVC::setNumCores(int nNumCores) {
        
        IV_API_CALL_STATUS_T ret;
        ih264d_ctl_set_num_cores_ip_t s_ctl_set_cores_ip;
        ih264d_ctl_set_num_cores_op_t s_ctl_set_cores_op;

        s_ctl_set_cores_ip.e_cmd = IVD_CMD_VIDEO_CTL;
        s_ctl_set_cores_ip.e_sub_cmd =(IVD_CONTROL_API_COMMAND_TYPE_T) IH264D_CMD_CTL_SET_NUM_CORES;
        s_ctl_set_cores_ip.u4_num_cores = nNumCores;
        s_ctl_set_cores_ip.u4_size = sizeof(ih264d_ctl_set_num_cores_ip_t);
        s_ctl_set_cores_op.u4_size = sizeof(ih264d_ctl_set_num_cores_op_t);

        ret = ivd_api_function((iv_obj_t*)mCodecCtx, (void *)&s_ctl_set_cores_ip,
                                   (void *)&s_ctl_set_cores_op);
        if(ret != IV_SUCCESS) {
            printf("SIMD setNumCores error \n"); 
            abort();
        }

        printf("SIMD setNumCores SUCCESS \n"); 
  }

void DecoderAVC::setProcessor() {
        
        IV_API_CALL_STATUS_T ret;
        ih264d_ctl_set_processor_ip_t s_ctl_set_num_processor_ip;
        ih264d_ctl_set_processor_op_t s_ctl_set_num_processor_op;

        s_ctl_set_num_processor_ip.e_cmd = IVD_CMD_VIDEO_CTL;
        s_ctl_set_num_processor_ip.e_sub_cmd =(IVD_CONTROL_API_COMMAND_TYPE_T) IH264D_CMD_CTL_SET_PROCESSOR;
        s_ctl_set_num_processor_ip.u4_arch = ARCH_X86_GENERIC;
        s_ctl_set_num_processor_ip.u4_soc = SOC_GENERIC;
        s_ctl_set_num_processor_ip.u4_size = sizeof(ih264d_ctl_set_processor_ip_t);
        s_ctl_set_num_processor_op.u4_size = sizeof(ih264d_ctl_set_processor_op_t);

        ret = ivd_api_function((iv_obj_t*)mCodecCtx, (void *)&s_ctl_set_num_processor_ip,
                                   (void *)&s_ctl_set_num_processor_op);
        if(ret != IV_SUCCESS)
        {
            //aslog(LOG_ERROR, "Error in setting Processor type");

            printf("SIMD Error in setting Processor type \n"); 
            abort();
        }

        printf("SIMD  setting Processor Success \n"); 
  }

void DecoderAVC::logVersion() {

    ivd_ctl_getversioninfo_ip_t ps_ctl_ip;
    ivd_ctl_getversioninfo_op_t ps_ctl_op;
    UWORD8 au1_buf[512];
    IV_API_CALL_STATUS_T i4_status;
    ps_ctl_ip.e_cmd = IVD_CMD_VIDEO_CTL;
    ps_ctl_ip.e_sub_cmd = IVD_CMD_CTL_GETVERSION;
    ps_ctl_ip.u4_size = sizeof(ivd_ctl_getversioninfo_ip_t);
    ps_ctl_op.u4_size = sizeof(ivd_ctl_getversioninfo_op_t);
    ps_ctl_ip.pv_version_buffer = au1_buf;
    ps_ctl_ip.u4_version_buffer_size = sizeof(au1_buf);

    i4_status = ivd_api_function((iv_obj_t*)mCodecCtx, (void *)&(ps_ctl_ip), (void *)&(ps_ctl_op));

    if(i4_status != IV_SUCCESS) {
      //  aslog(LOG_ERROR, "Error in Getting Version number e_dec_status = %d u4_error_code = %x",
                    //  i4_status, ps_ctl_op.u4_error_code);

        printf("SIMD Getting Version number Error e_dec_status = %d u4_error_code = %x \n",
                     i4_status, ps_ctl_op.u4_error_code); 
    }
    else {
      //  aslog(LOG_INFO, "Ittiam Decoder Version number: %s", (char *)ps_ctl_ip.pv_version_buffer);

        printf("SIMD Ittiam Decoder Version number: %s \n", (char *)ps_ctl_ip.pv_version_buffer); 
    }
  }





