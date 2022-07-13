#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <stdio.h>
#include <string.h>

using namespace emscripten;
using namespace std;
typedef unsigned char u8;
typedef unsigned int u32;

extern "C"
{

}


#define LOG(args...)  \
        printf(args); \
        printf("\n");


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


class Decoder {

public:
    val mJsObject;

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

}

void Decoder::clear() {

    mInit = false;
}

void Decoder::decode(u8* buffer, u32 bufferLen, u32 timestamp) {


}


class VideoDecoder : public Decoder {

public:

    int mVideoWith = 0;
    int mVideoHeight = 0;
    int mVType = 0;

    u8* mYUV = nullptr;

public:

    VideoDecoder(val&& v);
    virtual ~VideoDecoder();

    void setCodec(u32 vtype, string extra);

    void decode(string input, u32 timestamp);

    virtual void clear();
    virtual void frameReady(u32 timestamp);

};


VideoDecoder::VideoDecoder(val&& v) : Decoder(move(v)) {
  
}

VideoDecoder::~VideoDecoder() {

    clear();

    printf("VideoDecoder dealloc \n");

}

void VideoDecoder::clear() {

    if (mYUV) {
        free(mYUV);
        mYUV = nullptr;
    }

    mVideoWith = 0;
    mVideoHeight = 0;

    Decoder::clear();
}

void VideoDecoder::setCodec(u32 vtype, string extra)
{

    printf("VideoDecoder::setCodec vtype %d, extra %d \n", vtype, extra.length());
    
  
    clear();

    enum AVCodecID codecID;

    switch (vtype)
    {
        case Video_H264: {

            codecID = AV_CODEC_ID_H264;

            break;
        }

        case Video_H265: {

            codecID = AV_CODEC_ID_HEVC;
            break;
        }
    
        default: {

            return;
        }
    }

    mVType = vtype;


    Decoder::initCodec(codecID);
    


    mInit = true;
}


void  VideoDecoder::decode(string input, u32 timestamp)
{

  //   printf("VideoDecoder::decode input %d, timestamp %d \n", input.length(), timestamp);

    if (!mInit) {

        printf("VideoDecoder has not Init when decode \n");
        return;
    }

    u32 bufferLen = input.length();
    u8* buffer = (u8*)input.data();

    Decoder::decode(buffer, bufferLen, timestamp);

}

void  VideoDecoder::frameReady(u32 timestamp) {

    if (mVideoWith != mFrame->width || mVideoHeight != mFrame->height) {

        mVideoWith = mFrame->width;
        mVideoHeight = mFrame->height;

        mJsObject.call<void>("videoInfo", mVType, mVideoWith, mVideoHeight);

        if (mYUV) {
            free(mYUV);
        }
            
       
        mYUV = (u8*)malloc(mVideoWith * mVideoHeight * 3 /2);
    }

   

    mJsObject.call<void>("yuvData", (u32)mYUV, timestamp);

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


    mOutBuffer[0] = nullptr;
    mOutBuffer[1] = nullptr;

    mNotifyAudioParam = false;
}


void AudioDecoder::clear() {


        
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


        }

        case Audio_PCMU: {


 
            break;
        }

        case Audio_PCMA: {


     
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
