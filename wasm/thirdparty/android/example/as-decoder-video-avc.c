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

#include "as-decoder-video.h"
#include "as-thread-support.h"
#include "log.h"

#define STRIDE                  0
#define ivd_api_function        ih264d_api_function

#if _POSIX_C_SOURCE >= 200112L || _XOPEN_SOURCE >= 600 ||   \
    (defined(__ANDROID__) && (__ANDROID_API__ > 16)) ||     \
    (defined(__APPLE__) &&                                  \
     (__MAC_OS_X_VERSION_MIN_REQUIRED >= __MAC_10_6 ||      \
      __IPHONE_OS_VERSION_MIN_REQUIRED >= __IPHONE_3_0)) || \
    defined(__FreeBSD__) || defined(__wasm32__)

void* ivd_aligned_malloc(void *pv_ctxt, WORD32 alignment, WORD32 i4_size) {
    (void)pv_ctxt;
    // use posix_memalign, but mimic the behaviour of memalign
    void* ptr = NULL;
    int rc = posix_memalign(&ptr, alignment, i4_size);
    return rc == 0 ? (errno = 0, ptr) : (errno = rc, NULL);
}

void ivd_aligned_free(void *pv_ctxt, void* aligned_ptr) {
    (void)pv_ctxt;
    free(aligned_ptr);
}

#elif defined(_WIN32)

void* ivd_aligned_malloc(void *pv_ctxt, WORD32 alignment, WORD32 i4_size) {
    (void)pv_ctxt;
    return _aligned_malloc(i4_size, alignment);
}

inline void ivd_aligned_free(void *pv_ctxt, void* aligned_ptr) {
    (void)pv_ctxt;
    _aligned_free(aligned_ptr);
}

#else

void* ivd_aligned_malloc(void *pv_ctxt, WORD32 alignment, WORD32 i4_size) {
    (void)pv_ctxt;
    return memalign(alignment, i4_size);
}

void ivd_aligned_free(void *pv_ctxt, void* aligned_ptr) {
    (void)pv_ctxt;
    free(aligned_ptr);
}
#endif

IV_API_CALL_STATUS_T get_version(void *codec_obj)
{
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

    i4_status = ivd_api_function((iv_obj_t *)codec_obj,
                                     (void *)&(ps_ctl_ip),
                                     (void *)&(ps_ctl_op));

    if(i4_status != IV_SUCCESS)
    {
        aslog(LOG_ERROR, "Error in Getting Version number e_dec_status = %d u4_error_code = %x\n",
                     i4_status, ps_ctl_op.u4_error_code);
    }
    else
    {
        aslog(LOG_ERROR, "Ittiam Decoder Version number: %s\n",
              (char *)ps_ctl_ip.pv_version_buffer);
    }
    return i4_status;
}

    /// Global static variants 
    static iv_obj_t *sCodecCtx;            // Codec context
    static int      sWidth;          
    static int      sHeight;

  static void setNumCores(int nNumCores) {
        
        IV_API_CALL_STATUS_T ret;
        ih264d_ctl_set_num_cores_ip_t s_ctl_set_cores_ip;
        ih264d_ctl_set_num_cores_op_t s_ctl_set_cores_op;

        s_ctl_set_cores_ip.e_cmd = IVD_CMD_VIDEO_CTL;
        s_ctl_set_cores_ip.e_sub_cmd =(IVD_CONTROL_API_COMMAND_TYPE_T) IH264D_CMD_CTL_SET_NUM_CORES;
        s_ctl_set_cores_ip.u4_num_cores = nNumCores;
        s_ctl_set_cores_ip.u4_size = sizeof(ih264d_ctl_set_num_cores_ip_t);
        s_ctl_set_cores_op.u4_size = sizeof(ih264d_ctl_set_num_cores_op_t);

        ret = ivd_api_function(sCodecCtx, (void *)&s_ctl_set_cores_ip,
                                   (void *)&s_ctl_set_cores_op);
        if(ret != IV_SUCCESS) {
            aslog(LOG_ERROR, "Error in setting number of cores");
            abort();
        }
  }

  static void setProcessor() {
        
        IV_API_CALL_STATUS_T ret;
        ih264d_ctl_set_processor_ip_t s_ctl_set_num_processor_ip;
        ih264d_ctl_set_processor_op_t s_ctl_set_num_processor_op;

        s_ctl_set_num_processor_ip.e_cmd = IVD_CMD_VIDEO_CTL;
        s_ctl_set_num_processor_ip.e_sub_cmd =(IVD_CONTROL_API_COMMAND_TYPE_T) IH264D_CMD_CTL_SET_PROCESSOR;
        s_ctl_set_num_processor_ip.u4_arch = ARCH_X86_SSSE3;
        s_ctl_set_num_processor_ip.u4_soc = SOC_GENERIC;
        s_ctl_set_num_processor_ip.u4_size = sizeof(ih264d_ctl_set_processor_ip_t);
        s_ctl_set_num_processor_op.u4_size = sizeof(ih264d_ctl_set_processor_op_t);

        ret = ivd_api_function(sCodecCtx, (void *)&s_ctl_set_num_processor_ip,
                                   (void *)&s_ctl_set_num_processor_op);
        if(ret != IV_SUCCESS)
        {
            aslog(LOG_ERROR, "Error in setting Processor type");
            abort();
        }
  }

  static void logVersion() {

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

    i4_status = ivd_api_function(sCodecCtx, (void *)&(ps_ctl_ip), (void *)&(ps_ctl_op));

    if(i4_status != IV_SUCCESS) {
        aslog(LOG_ERROR, "Error in Getting Version number e_dec_status = %d u4_error_code = %x",
                     i4_status, ps_ctl_op.u4_error_code);
    }
    else {
        aslog(LOG_INFO, "Ittiam Decoder Version number: %s", (char *)ps_ctl_ip.pv_version_buffer);
    }
  }

    static void do_init(int width, int height) {
        
        IV_API_CALL_STATUS_T ret;
        int numCores = 1;
        ih264d_create_ip_t s_create_ip;
        ih264d_create_op_t s_create_op;

        void *dec_fxns = (void *)&ivd_api_function;
        sWidth = width;
        sHeight = height;

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
        sCodecCtx = (iv_obj_t*)s_create_op.s_ivd_create_op_t.pv_handle;
        sCodecCtx->pv_fxns = dec_fxns;
        sCodecCtx->u4_size = sizeof(iv_obj_t);

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

        ret = ivd_api_function(sCodecCtx, (void *)&s_ctl_ip, (void *)&s_ctl_op);
        if(ret != IV_SUCCESS)
        {
            aslog(LOG_ERROR,  "Error in setting the stride");
            abort();
        }

 #ifdef __EMSCRIPTEN_PTHREADS__
	    const int max_cores = 16; // max threads for UHD tiled decoding, plus some extra for frame threading
	    numCores = emscripten_num_logical_cores();
	    if (numCores > max_cores) {
		    numCores = max_cores;
	    }
#endif
        setNumCores(numCores);
        setProcessor();
        logVersion();
    }

   static void setDecodeArgs(ivd_video_decode_ip_t *ps_dec_ip,
                             ivd_video_decode_op_t *ps_dec_op, 
                             void* inBuffer,
                             uint32_t inSize,
                             void* outBuffer) {
        uint32_t sizeY = sWidth * sHeight;
        uint32_t sizeUV;
        uint8_t *pBuf;
        
        ps_dec_ip->u4_size = sizeof(ivd_video_decode_ip_t);
        ps_dec_op->u4_size = sizeof(ivd_video_decode_op_t);
        
        ps_dec_ip->e_cmd = IVD_CMD_VIDEO_DECODE;
        
        /* When in flush and after EOS with zero byte input,
         * inHeader is set to zero. Hence check for non-null */
        if (inBuffer) {
            //ps_dec_ip->u4_ts = timeStampIx;
            ps_dec_ip->pv_stream_buffer = (uint8_t*)inBuffer;
            ps_dec_ip->u4_num_Bytes = inSize;
        } else {
            ps_dec_ip->u4_ts = 0;
            ps_dec_ip->pv_stream_buffer = NULL;
            ps_dec_ip->u4_num_Bytes = 0;
        }
        
        pBuf = (uint8_t*)outBuffer;
        
        sizeUV = sizeY / 4;
        ps_dec_ip->s_out_buffer.u4_min_out_buf_size[0] = sizeY;
        ps_dec_ip->s_out_buffer.u4_min_out_buf_size[1] = sizeUV;
        ps_dec_ip->s_out_buffer.u4_min_out_buf_size[2] = sizeUV;
        
        ps_dec_ip->s_out_buffer.pu1_bufs[0] = pBuf;
        ps_dec_ip->s_out_buffer.pu1_bufs[1] = pBuf + sizeY;
        ps_dec_ip->s_out_buffer.pu1_bufs[2] = pBuf + sizeY + sizeUV;
        ps_dec_ip->s_out_buffer.u4_num_bufs = 3;
    }

    static void process_frame_decode(const char *buf, size_t buf_len) {
        
        int status = 0;
        ivd_video_decode_ip_t s_dec_ip;
        ivd_video_decode_op_t s_dec_op;
        
        int  bufferSize = sWidth * sHeight * 3 / 2;
        uint8_t* outbuf  = ivd_aligned_malloc(NULL,128, (int)bufferSize);
        if (NULL == outbuf) {
            aslog(LOG_ERROR, "Could not allocate flushOutputBuffer of size %d", bufferSize);
            assert(0);
        }

        setDecodeArgs(&s_dec_ip, &s_dec_op, buf, buf_len, outbuf);
        status = ivd_api_function(sCodecCtx, (void *)&s_dec_ip, (void *)&s_dec_op);
        if(status != IV_SUCCESS) {
            ivd_aligned_free(NULL, outbuf);
            aslog(LOG_ERROR, "SoftHevcDec decode status=%d err =0x%x",status,s_dec_op.u4_error_code); 
            return;          
        }

        call_main_return(&s_dec_op, 0);

    }

static int process_frame_return(void *user_data) {

    if (!user_data) {
        // NULL indicated a sync point.
        return 0;
    }
    ivd_video_decode_op_t *frame = (ivd_video_decode_op_t *)user_data;    
    asjs_callback_frame(frame->s_disp_frm_buf.pv_y_buf,
                        frame->s_disp_frm_buf.u4_y_strd,
                        frame->s_disp_frm_buf.pv_u_buf,
                        frame->s_disp_frm_buf.u4_u_strd,
                        frame->s_disp_frm_buf.pv_v_buf,
                        frame->s_disp_frm_buf.u4_v_strd,
                        sWidth, sHeight,
                        frame->s_disp_frm_buf.u4_u_wd,
                        frame->s_disp_frm_buf.u4_u_ht,
                        frame->u4_pic_wd,
                        frame->u4_pic_ht, 0, 0, sWidth, sHeight);

    ivd_aligned_free(NULL, frame->s_disp_frm_buf.pv_y_buf);
    return 1;
}

static void do_destroy(void) {
   
    if (sCodecCtx) {

        int status = 0;
        ivd_delete_ip_t s_delete_ip;
        ivd_delete_op_t s_delete_op;
            
        s_delete_ip.u4_size = sizeof(ivd_delete_ip_t);
        s_delete_ip.e_cmd = IVD_CMD_DELETE;
            
        s_delete_op.u4_size = sizeof(ivd_delete_op_t);
            
        status = ivd_api_function(sCodecCtx, (void *)&s_delete_ip, (void *)&s_delete_op);
        if (status != IV_SUCCESS) {
            aslog(LOG_ERROR, "Error in delete: 0x%x",  s_delete_op.u4_error_code);
         }
    }
}    






