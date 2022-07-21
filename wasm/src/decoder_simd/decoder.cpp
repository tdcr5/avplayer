#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <stdio.h>
#include <string.h>

#include "decoderavc.h"
#include "decoderhevc.h"

using namespace emscripten;
using namespace std;
typedef unsigned char u8;
typedef unsigned int u32;

extern "C"
{
#include <libavcodec/avcodec.h>
#include <libswresample/swresample.h>
}


//视频类型，全局统一定义，JS层也使用该定义
enum VideoType {

    Video_H264 = 0x01,
    Video_H265 = 0x02

};

enum AudioType {

    Audio_PCM   = 0x1,
    Audio_PCMA  = 0x2,
    Audio_PCMU  = 0x4,
    Audio_AAC   = 0x8

};



class VideoDecoder : public DecoderVideoObserver {

public:

    int mVideoWith = 0;
    int mVideoHeight = 0;
    int mVType = 0;
    DecoderVideo* mDecoderV;


    val mJsObject;

    unsigned char* mSPS;
    unsigned char* mPPS;
    unsigned char* mVPS;
    int mSPSLen;
    int mPPSLen;
    int mVPSLen;

    unsigned char* mBuf;
    int mBufMaxLen;

    bool mInit = false;

public:

    VideoDecoder(val&& v);
    virtual ~VideoDecoder();

    void setCodec(u32 vtype, string extra);

    void decode(string input, u32 isKeyFrame, u32 timestamp);

    virtual void videoInfo(int width, int height);
    virtual void yuvData(unsigned char* yuv, unsigned int timestamp);

    void clear();

    void parseAVCExtraData(u8* extradata, int extradatalen);
    void parseHEVCExtraData(u8* extradata, int extradatalen);
    bool convertAnnexB(u8* data, int datalen);
    int addCodecInfo(u8* data, int datalen);

};


VideoDecoder::VideoDecoder(val&& v) : mJsObject(move(v)) {

    mSPS = NULL;
    mPPS = NULL;
    mVPS = NULL;
    mBuf = NULL;
    mSPSLen = 0;
    mPPSLen = 0;
    mVPSLen = 0;
    mBufMaxLen = 0;
  
}

VideoDecoder::~VideoDecoder() {

    clear();

    printf("VideoDecoder dealloc \n");

}

void VideoDecoder::clear() {

    mVideoWith = 0;
    mVideoHeight = 0;
    
    if (mDecoderV) {
        delete mDecoderV;
        mDecoderV = nullptr;
    }

    if (mSPS) {
        free(mSPS);
        mSPS = NULL;
        mSPSLen = 0;
    }

    if (mPPS) {
        free(mPPS);
        mPPS = NULL;
        mPPSLen = 0;
    }

    if (mVPS) {
        free(mVPS);
        mVPS = NULL;
        mVPSLen = 0;
    }

    if (mBuf) {
        free(mBuf);
        mBuf = NULL;
        mBufMaxLen = 0;
    }

}

void VideoDecoder::parseAVCExtraData(u8* extradata, int extradatalen) {

    int offset = 5;
    int spsnum = extradata[offset]&0x1F;
    offset += 1;

    u32 spslen = 0;
    u8* spslenptr = (u8*)&spslen;
    spslenptr[0] = extradata[offset+1];
    spslenptr[1] = extradata[offset];
    offset += 2;

    mSPSLen = spslen + 4;
    mSPS = (unsigned char*)malloc(mSPSLen);
    mSPS[0] = 0;
    mSPS[1] = 0;
    mSPS[2] = 0;
    mSPS[3] = 1;
    memcpy(mSPS+4, &extradata[offset], spslen);

    offset += spslen;

    int ppsnum = extradata[offset];
    offset += 1;

    u32 ppslen = 0;
    u8* ppslenptr = (u8*)&ppslen;
    ppslenptr[0] = extradata[offset+1];
    ppslenptr[1] = extradata[offset];
    offset += 2;

    mPPSLen = ppslen + 4;
    mPPS = (unsigned char*)malloc(mPPSLen);
    mPPS[0] = 0;
    mPPS[1] = 0;
    mPPS[2] = 0;
    mPPS[3] = 1;
    memcpy(mPPS+4, &extradata[offset], ppslen);

}

void VideoDecoder::parseHEVCExtraData(u8* extradata, int extradatalen) {

    int offset = 22;

    int nalsnum = extradata[offset];
    offset++;

    printf("parse HEVC nalsnum %d\n", nalsnum);

    for (int i = 0; i < nalsnum; i++) {

        int naltype = extradata[offset]&0x3F;
        offset++;

        u32 onenalnum = 0;
        u8* onenalnumptr = (u8*)&onenalnum;
        onenalnumptr[0] = extradata[offset+1];
        onenalnumptr[1] = extradata[offset];
        offset+=2;

        printf("parse HEVC naltype %d onenalnum %d\n", naltype, onenalnum);

        for (int j = 0; j < onenalnum; j++) {

            u32 onenallen = 0;
            u8* onenallenptr = (u8*)&onenallen;
            onenallenptr[0] = extradata[offset+1];
            onenallenptr[1] = extradata[offset];
            offset+=2;

            if (naltype == 32) {

                mVPSLen = onenallen + 4;
                mVPS = (unsigned char*)malloc(mVPSLen);
                mVPS[0] = 0;
                mVPS[1] = 0;
                mVPS[2] = 0;
                mVPS[3] = 1;
                memcpy(mVPS+4, &extradata[offset], onenallen);

            } else if (naltype == 33) {

                mSPSLen = onenallen + 4;
                mSPS = (unsigned char*)malloc(mSPSLen);
                mSPS[0] = 0;
                mSPS[1] = 0;
                mSPS[2] = 0;
                mSPS[3] = 1;
                memcpy(mSPS+4, &extradata[offset], onenallen);

            }
            else if (naltype == 34) {

                mPPSLen = onenallen + 4;
                mPPS = (unsigned char*)malloc(mPPSLen);
                mPPS[0] = 0;
                mPPS[1] = 0;
                mPPS[2] = 0;
                mPPS[3] = 1;
                memcpy(mPPS+4, &extradata[offset], onenallen);
                
            }

            offset += onenallen;

        }

    }

}

void VideoDecoder::setCodec(u32 vtype, string extra)
{

    printf("Use SIMD Decoder, VideoDecoder::setCodec vtype %d, extra %d \n", vtype, extra.length());
    
    clear();

    switch (vtype)
    {
        case Video_H264: {

            parseAVCExtraData((u8*)extra.data(), extra.length());
            mDecoderV = new DecoderAVC(this);


            break;
        }

        case Video_H265: {

            parseHEVCExtraData((u8*)extra.data(), extra.length());
            mDecoderV = new DecoderHEVC(this);
            break;
        }
    
        default: {

            return;
        }
    }

    mVType = vtype;

    mDecoderV->init();
    
    mInit = true;
}

bool VideoDecoder::convertAnnexB(u8* data, int datalen) {

    int offset = 0;
    bool bf = false;

    while(offset < datalen) {

        u32 nallen = 0;
        u8* nallenptr = (u8*)&nallen;
        nallenptr[0] = data[offset+3];
        nallenptr[1] = data[offset+2];
        nallenptr[2] = data[offset+1];
        nallenptr[3] = data[offset];
        
        data[offset] = 0;
        data[offset+1] = 0;
        data[offset+2] = 0;
        data[offset+3] = 1;

        offset += 4;

        if (!bf) {

            int naltype = 0;

            if (mVType == Video_H264) {

                naltype = data[offset]&0x1F;

                //avc sps
                if (naltype == 7) {

                bf = true;
                }

            } else {

                naltype = (data[offset]&0x7E)>>1;

                //hevc sps
                if (naltype == 33) {

                    bf = true;
                }
            }

        }

        offset += nallen;
    }

    if (offset != datalen) {

        printf("convertAnnexB error offset %d datalen %d \n", offset, datalen);
        
    } 

  //  printf("convertAnnexB end offset %d datalen %d bf %d \n", offset, datalen, bf);

    return bf;
}

int VideoDecoder::addCodecInfo(u8* data, int datalen) {

    int buflen = 0;

    if (mVType == Video_H264) {

        buflen = datalen + mSPSLen + mPPSLen;

    } else {

        buflen = datalen + mSPSLen + mPPSLen + mVPSLen;
    }

    if (buflen > mBufMaxLen) {

        if (mBuf) {
            free(mBuf);
        }
        
        mBuf = (unsigned char*)malloc(buflen);
        mBufMaxLen = buflen;
    }


    if (mVType == Video_H264) {

        memcpy(mBuf, mSPS, mSPSLen);
        memcpy(mBuf + mSPSLen, mPPS, mPPSLen);
        memcpy(mBuf + mSPSLen + mPPSLen, data, datalen);

    } else {

        memcpy(mBuf, mVPS, mVPSLen);
        memcpy(mBuf + mVPSLen, mSPS, mSPSLen);
        memcpy(mBuf + mVPSLen + mSPSLen, mPPS, mPPSLen);
        memcpy(mBuf + mVPSLen + mSPSLen + mPPSLen, data, datalen);
    }

    return buflen;

}

void  VideoDecoder::decode(string input, u32 isKeyFrame, u32 timestamp)
{

    if (!mInit) {

        printf("VideoDecoder has not Init when decode \n");
        return;
    }

    u32 bufferLen = input.length();
    u8* buffer = (u8*)input.data();

    bool bf = convertAnnexB(buffer, bufferLen);

    if (isKeyFrame && !bf) {

        //给关键帧补齐sps/pps/vps信息
        int len = addCodecInfo(buffer, bufferLen);
        mDecoderV->decode(mBuf, len, timestamp);

    } else {

        mDecoderV->decode(buffer, bufferLen, timestamp);

    }

}

void VideoDecoder::videoInfo(int width, int height){

    mVideoWith = width;
    mVideoHeight = height;

    mJsObject.call<void>("videoInfo", mVType, mVideoWith, mVideoHeight);
}

void VideoDecoder::yuvData(unsigned char* yuv, unsigned int timestamp) {


    // printf("yuv %d %d %d %d %d %d\n", yuv[0], yuv[1], yuv[2], yuv[mVideoWith*mVideoHeight/2], yuv[mVideoWith*mVideoHeight/2+1], yuv[mVideoWith*mVideoHeight/2+2]);
    mJsObject.call<void>("yuvData", (u32)yuv, timestamp);

}



class Decoder {

public:
    val mJsObject;

    AVCodec *mCodec = nullptr;
    AVCodecContext *mDecCtx = nullptr;
    AVFrame *mFrame = nullptr;
    AVPacket *mPacket = nullptr;
    bool mInit = false;

public:

    Decoder(val&& v);
    virtual ~Decoder();

    void initCodec(enum AVCodecID codecID);
    virtual void clear();
    void decode(u8* buffer, u32 bufferLen, u32 timestamp);

    virtual void frameReady(u32 timestamp) {};

};

Decoder::Decoder(val&& v) : mJsObject(move(v)) {
  
}

Decoder::~Decoder() {
    clear();
}

void Decoder::initCodec(enum AVCodecID codecID) {
    
    if (mInit) {

        return;
    }

    mPacket = av_packet_alloc();
    mCodec = avcodec_find_decoder(codecID);
    mDecCtx = avcodec_alloc_context3(mCodec);
    mFrame = av_frame_alloc();

}

void Decoder::clear() {

    if (mDecCtx) {
        avcodec_free_context(&mDecCtx);
        mDecCtx = nullptr;
    }

    if (mFrame) {
        av_frame_free(&mFrame);
        mFrame = nullptr;
    }

    if (mPacket) {
        av_packet_free(&mPacket);
        mPacket = nullptr;
    }

    mCodec = nullptr;
    mInit = false;
}

void Decoder::decode(u8* buffer, u32 bufferLen, u32 timestamp) {

    int ret = 0;
    mPacket->data = buffer;
    mPacket->size = bufferLen;

    ret = avcodec_send_packet(mDecCtx, mPacket);
    while (ret >= 0)
    {
        ret = avcodec_receive_frame(mDecCtx, mFrame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
            return;

        frameReady(timestamp);
    }
}


class AudioDecoder : public Decoder {

public:

    enum AVSampleFormat mAudioFormat;

    SwrContext *mConvertCtx = nullptr;
    u8 *mOutBuffer[2];

    bool mNotifyAudioParam;
    int mAVType;


public:

    AudioDecoder(val&& v);
    virtual ~AudioDecoder();

    void setCodec(u32 atype, string extra);

    void decode(string input, u32 timestamp);
    virtual void clear();
    virtual void frameReady(u32 timestamp) ;

};


AudioDecoder::AudioDecoder(val&& v) : Decoder(move(v)) {
    
    //指定输出fltp raw 流，其他 采样率，通道数，位深 保持不变
    mAudioFormat = AV_SAMPLE_FMT_FLTP;

    mOutBuffer[0] = nullptr;
    mOutBuffer[1] = nullptr;

    mNotifyAudioParam = false;
}


void AudioDecoder::clear() {


    if (mConvertCtx) {
        swr_free(&mConvertCtx);
        mConvertCtx = nullptr;
    }
        
    if (mOutBuffer[0]) {
        free(mOutBuffer[0]);
        mOutBuffer[0] = nullptr;
    }

    mOutBuffer[1] = nullptr;
    mNotifyAudioParam = false;

    Decoder::clear();
}


AudioDecoder::~AudioDecoder() {

    clear();

    printf("AudioDecoder dealloc \n");
}

void AudioDecoder::setCodec(u32 atype, string extra)
{
    
    clear();
 
    switch (atype)
    {
        case Audio_AAC: {

            Decoder::initCodec(AV_CODEC_ID_AAC);
            mDecCtx->extradata_size = extra.length();
            mDecCtx->extradata = (u8*)extra.data();
            avcodec_open2(mDecCtx, mCodec, NULL);
            break;
        }

        case Audio_PCMU: {

            Decoder::initCodec(AV_CODEC_ID_PCM_MULAW);
            mDecCtx->channel_layout = AV_CH_LAYOUT_MONO;
            mDecCtx->sample_rate = 8000;
            mDecCtx->channels = 1;
            avcodec_open2(mDecCtx, mCodec, NULL);
 
            break;
        }

        case Audio_PCMA: {

            Decoder::initCodec(AV_CODEC_ID_PCM_ALAW);
            mDecCtx->channel_layout = AV_CH_LAYOUT_MONO;
            mDecCtx->sample_rate = 8000;
            mDecCtx->channels = 1;
            avcodec_open2(mDecCtx, mCodec, NULL);
     
            break;
        }
    
        default: {

            return;
        }
    }

    mAVType = atype;

    mInit = true;
}


void  AudioDecoder::decode(string input, u32 timestamp)
{
    if (!mInit) {

        return;
    }

    u32 bufferLen = input.length();
    u8* buffer = (u8*)input.data();

    Decoder::decode(buffer, bufferLen, timestamp);

}

void  AudioDecoder::frameReady(u32 timestamp)  {

    auto nb_samples = mFrame->nb_samples;


    if (!mNotifyAudioParam) {

        mJsObject.call<void>("audioInfo", mAVType, mFrame->sample_rate, mFrame->channels);
        mNotifyAudioParam = true;
    }

    // auto bytes_per_sample = av_get_bytes_per_sample(mAudioFormat);
    if (mDecCtx->sample_fmt == mAudioFormat)
    {
        mJsObject.call<void>("pcmData", int(mFrame->data), nb_samples, timestamp);
        return;
    }
    //s16 -> fltp
    if (!mConvertCtx)
    {
        mConvertCtx  = swr_alloc_set_opts(NULL, mFrame->channel_layout, mAudioFormat, mFrame->sample_rate,
                                            mDecCtx->channel_layout, mDecCtx->sample_fmt, mDecCtx->sample_rate,
                                            0, NULL);
        auto ret = swr_init(mConvertCtx);
        auto out_buffer_size = av_samples_get_buffer_size(NULL, mFrame->channels, nb_samples, mAudioFormat, 0);
        auto buffer = (uint8_t *)av_malloc(out_buffer_size);
        mOutBuffer[0] = buffer;
        mOutBuffer[1] = buffer + (out_buffer_size / 2);
    }
    // // 转换
    auto ret = swr_convert(mConvertCtx , mOutBuffer, nb_samples, (const uint8_t **)mFrame->data, nb_samples);
    while (ret > 0)
    {
        mJsObject.call<void>("pcmData", int(mOutBuffer), ret, timestamp);
        ret = swr_convert(mConvertCtx , mOutBuffer, nb_samples, (const uint8_t **)mFrame->data, 0);
    }

}





EMSCRIPTEN_BINDINGS(my_module) {
     class_<VideoDecoder>("VideoDecoder")
    .constructor<val>()
    .function("setCodec", &VideoDecoder::setCodec)
    .function("decode", &VideoDecoder::decode)
    .function("clear", &VideoDecoder::clear);
    class_<AudioDecoder>("AudioDecoder")
    .constructor<val>()
    .function("setCodec", &AudioDecoder::setCodec)
    .function("decode", &AudioDecoder::decode)
    .function("clear", &AudioDecoder::clear);
}
