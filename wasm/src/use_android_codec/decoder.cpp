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

    printf("SIMD VideoDecoder::setCodec vtype %d, extra %d \n", vtype, extra.length());
    
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

   // printf("SIMD VideoDecoder::decode input %d, timestamp %d \n", bufferLen, timestamp);

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



class AudioDecoder  {

public:



    bool mNotifyAudioParam;
    int mAVType;

    val mJsObject;
    bool mInit = false;


public:

    AudioDecoder(val&& v);
    virtual ~AudioDecoder();

    void setCodec(u32 atype, string extra);

    void decode(string input, u32 timestamp);
    void clear();

};


AudioDecoder::AudioDecoder(val&& v) : mJsObject(move(v)) {
    
    //指定输出fltp raw 流，其他 采样率，通道数，位深 保持不变


    mNotifyAudioParam = false;
}


void AudioDecoder::clear() {

        
    mNotifyAudioParam = false;

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
