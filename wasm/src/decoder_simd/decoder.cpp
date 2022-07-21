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
    bool mInit = false;

public:

    VideoDecoder(val&& v);
    virtual ~VideoDecoder();

    void setCodec(u32 vtype, string extra);

    void decode(string input, u32 timestamp);

    virtual void videoInfo(int width, int height);
    virtual void yuvData(unsigned char* yuv, unsigned int timestamp);

    void clear();

};


VideoDecoder::VideoDecoder(val&& v) : mJsObject(move(v)) {
  
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

}

void VideoDecoder::setCodec(u32 vtype, string extra)
{

    printf("Use SIMD Decoder, VideoDecoder::setCodec vtype %d, extra %d \n", vtype, extra.length());
    
    clear();

    switch (vtype)
    {
        case Video_H264: {

            mDecoderV = new DecoderAVC(this);

            break;
        }

        case Video_H265: {

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


void  VideoDecoder::decode(string input, u32 timestamp)
{

    if (!mInit) {

        printf("VideoDecoder has not Init when decode \n");
        return;
    }

    u32 bufferLen = input.length();
    u8* buffer = (u8*)input.data();

    mDecoderV->decode(buffer, bufferLen, timestamp);

}

void VideoDecoder::videoInfo(int width, int height){

    mVideoWith = width;
    mVideoHeight = height;

    mJsObject.call<void>("videoInfo", mVType, mVideoWith, mVideoHeight);
}

void VideoDecoder::yuvData(unsigned char* yuv, unsigned int timestamp) {

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
