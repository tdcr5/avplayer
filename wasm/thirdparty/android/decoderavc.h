#ifndef  __DECODER_AVC_H__
#define  __DECODER_AVC_H__

#include "decodervideo.h"

class DecoderAVC : public DecoderVideo
{

    public:

         void    *mCodecCtx;            // Codec context
         int      mVideoWith;          
         int      mVideoHeight;
         unsigned char* mYUV;


    public:

        DecoderAVC(DecoderVideoObserver* obs);

        virtual void init();
        virtual void decode(unsigned char *buf, unsigned int buflen, unsigned int timestamp);

        void setNumCores(int nNumCores);
        void setProcessor();
        void logVersion();


        virtual ~DecoderAVC();
};




#endif