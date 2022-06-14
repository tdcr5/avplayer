
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
}


class AudioInfo {

    atype;
    sample;
    channels;
    depth;
    profile;
   
}



export {AVPacket, VideoInfo, AudioInfo};