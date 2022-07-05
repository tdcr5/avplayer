
class AVPacket {

    payload;
    avtype;
    timestamp;
    nals;
    iskeyframe;
    
}


class VideoInfo {

    vtype;
    width;
    height;
    extradata;
}


class AudioInfo {

    atype;
    sample;
    channels;
    depth;
    profile;
    extradata;
   
}



export {AVPacket, VideoInfo, AudioInfo};