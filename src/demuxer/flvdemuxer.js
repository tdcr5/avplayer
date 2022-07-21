import EventEmitter from '../utils/events.js';
import { readAACSpecificConfig, getAACProfileName, readAVCSpecificConfig, getAVCProfileName } from '../utils/specific.js';
import {AVPacket, VideoInfo, AudioInfo} from '../utils/av.js';
import {AVType, VideoType, AudioType, PixelType, ADTS_HEADER_SIZE, AAC_SAMPLE_RATE, AACProfile} from '../constant'



const FLV_MEDIA_TYPE = {
    Audio: 8,
    Video: 9,
    Script: 18
}

const CodecID = {

    AVC : 7, //h264
    HEVC : 12 //h265

}

const FrameType = {

    KeyFrame : 1,
    InterFrame : 2

}

const AVCPacketType = {

    AVCSequenceHeader : 0,
    AVCNalu : 1,
    
}


const SoundFormat = {

    G711A : 7,
    G711U : 8,
    AAC : 10
}

const SoundRate = {

    E5_5HZ : 0,
    E11HZ : 1,
    E22HZ : 2,
    E44HZ : 3

}

const SoundSize = {

    E8BITS : 0,
    E16BITS : 1

}

const SoundType = {

    Mono : 0,
    Stereo : 1

}

const AACPackettype = {

    AACSequenceHeader : 0,
    AACRaw : 1

}







const FLV_Parse_State = {
    Init: 0,
    TagCommerHeader: 1,
    TagPayload:2
}

class FLVDemuxer extends EventEmitter {

    _buffer = undefined;

    _needlen = 0;
    _state = 0;
    _tagtype = 0;
    _dts = 0;
    _pts = 0;

    _videoinfo;
    _audioinfo;

    constructor(player) {

        super();

        this._player = player;

        this.reset();
        
    }

    reset() {

        this._videoinfo = new VideoInfo();
        this._audioinfo = new AudioInfo();

        this._state = FLV_Parse_State.Init;
        this._needlen = 9;
        this._buffer = undefined;

    }

    
    dispatch(data) {

        let remain = data;

        if (this._buffer) {

            let newbuffer = new Uint8Array(this._buffer.length + data.length);
            newbuffer.set(this._buffer, 0);
            newbuffer.set(data, this._buffer.length);

            remain = newbuffer;
            this._buffer = undefined;
        }

        const tmp = new ArrayBuffer(4);
        const dv = new DataView(tmp);

        while(true) {

            if (remain.length < this._needlen) {

                break;
            }

            if (this._state === FLV_Parse_State.Init) {

                let flvheader = remain.slice(0, this._needlen);
                remain = remain.slice(this._needlen);

                this._needlen = 15;
                this._state = FLV_Parse_State.TagCommerHeader;
                
            } else if (this._state === FLV_Parse_State.TagCommerHeader) {

                this._tagtype = remain[4]&0x1F; // 5bit代表类型,8:audio 9:video 18:script other:其他

                dv.setUint8(0, remain[7]);
                dv.setUint8(1, remain[6]);
                dv.setUint8(2, remain[5]);
                dv.setUint8(3, 0);

                let payloadlen = dv.getUint32(0, true); //Tag 中除通用头外的长度，即 Header + Data 字段的长度 (等于 Tag 总长度 – 11)

                dv.setUint8(0, remain[10]);
                dv.setUint8(1, remain[9]);
                dv.setUint8(2, remain[8]);
                dv.setUint8(3, remain[11]);

                this._dts = dv.getUint32(0, true);

                let tagcommonheader = remain.slice(0, this._needlen);
                remain = remain.slice(this._needlen);

                this._needlen = payloadlen;
                this._state = FLV_Parse_State.TagPayload;

            } else {

                if (this._tagtype === FLV_MEDIA_TYPE.Video) {

                    let frametype = (remain[0]>>4)&0x0F;
                    let codecid = (remain[0])&0x0F;

                    if (codecid === CodecID.AVC || codecid === CodecID.HEVC) {

                        let avcpackettype = remain[1];

                        dv.setUint8(0, remain[4]);
                        dv.setUint8(1, remain[3]);
                        dv.setUint8(2, remain[2]);
                        dv.setUint8(3, 0);

                        let compositiontime = dv.getUint32(0, true);
                        this._pts = this._dts + compositiontime;

                        if (frametype === FrameType.KeyFrame) {

                            if (avcpackettype === AVCPacketType.AVCSequenceHeader) {

                                //avcseq
                                let info = readAVCSpecificConfig(remain.slice(0, this._needlen));

                
                                this._videoinfo.vtype = codecid === CodecID.AVC ? VideoType.H264 : VideoType.H265;
                                this._videoinfo.width = info.width;
                                this._videoinfo.height = info.height
                                this._videoinfo.extradata = remain.slice(5, this._needlen);
            
                                this.emit('videoinfo', this._videoinfo);

                            } else if (avcpackettype === AVCPacketType.AVCNalu) {
                                //I Frame
                                let vframe = remain.slice(5, this._needlen);

                                let packet = new AVPacket();
                                packet.payload = vframe;//convertAVCCtoAnnexB(vframe);
                                packet.iskeyframe = true;
                                packet.timestamp = this._pts;
                                packet.avtype = AVType.Video;
                               // packet.nals = SplitBufferToNals(vframe);
            
                                this.emit('videodata', packet);

                            } else {


                            }


                        } else if (frametype === FrameType.InterFrame) {

                            if (avcpackettype === AVCPacketType.AVCNalu) {

                                //P Frame
                                let vframe = remain.slice(5, this._needlen);

                                
                                let packet = new AVPacket();
                                packet.payload = vframe;//convertAVCCtoAnnexB(vframe);
                                packet.iskeyframe = false;
                                packet.timestamp = this._pts;
                                packet.avtype = AVType.Video;
                                // packet.nals = SplitBufferToNals(vframe);

                                this.emit('videodata', packet);

                            } else {


                            }

                        } else {


                        }


                    }

                } else if (this._tagtype === FLV_MEDIA_TYPE.Audio) {

                    let soundformat = (remain[0]>>4)&0x0F;
                    let soundrate = (remain[0]>>2)&0x02;
                    let soundsize = (remain[0]>>1)&0x01;
                    let soundtype = (remain[0])&0x0F;

                    if (soundformat === SoundFormat.AAC) {

                        let aacpackettype = remain[1]; 

                        if (aacpackettype === AACPackettype.AACSequenceHeader) {

                            let aacinfo = readAACSpecificConfig(remain.slice(0, this._needlen));

                            
                            this._audioinfo.atype = AudioType.AAC;
                            this._audioinfo.profile = aacinfo.object_type;
                            this._audioinfo.sample = aacinfo.sample_rate;
                            this._audioinfo.channels = aacinfo.chan_config;
                            this._audioinfo.depth = soundsize ? 16 : 8;
                            this._audioinfo.extradata = remain.slice(2, this._needlen);

                            this.emit('audioinfo', this._audioinfo);

                        } else {

                            let aacraw = remain.slice(2, this._needlen);

                            let packet = new AVPacket();
                            packet.payload = aacraw;
                            packet.iskeyframe = false;
                            packet.timestamp = this._dts;
                            packet.avtype = AVType.Audio;
    
                            this.emit('audiodata', packet);
                        }

                    } else {

                        if (!this._pcminfosend) {

                            this._audioinfo.atype = soundformat === SoundFormat.G711A ? AudioType.PCMA : AudioType.PCMU;
                            this._audioinfo.profile = 0;
                            this._audioinfo.sample = 8000;
                            this._audioinfo.channels = 1;
                            this._audioinfo.depth = 16;
                            this._audioinfo.extradata = new Uint8Array(0);

                            this.emit('audioinfo', this._audioinfo);

                            this._pcminfosend = true;
                        }

                        let audioraw = remain.slice(1, this._needlen);

                        
                        let packet = new AVPacket();
                        packet.payload = audioraw;
                        packet.iskeyframe = false;
                        packet.timestamp = this._dts;
                        packet.avtype = AVType.Audio;

                        this.emit('audiodata', packet);
                    }

                } else if (this._tagtype === FLV_MEDIA_TYPE.Script) {


                } else {


                }

                remain = remain.slice(this._needlen);

                this._needlen = 15;
                this._state = FLV_Parse_State.TagCommerHeader;
            }

        }

        this._buffer = remain;


    }

    destroy() {

        this.off();
        this._player._logger.info('FLVDemuxer', 'FLVDemuxer destroy');
    }


}

function convertAVCCtoAnnexB(buffer) {

    let offset = 0;
    const tmp = new ArrayBuffer(4);
    const dv = new DataView(tmp);

    while(offset < buffer.length) {

        dv.setUint8(0, buffer[offset+3]);
        dv.setUint8(1, buffer[offset+2]);
        dv.setUint8(2, buffer[offset+1]);
        dv.setUint8(3, buffer[offset]);
        
        let nallen = dv.getUint32(0, true);
        
        buffer[offset] = 0;
        buffer[offset+1] = 0;
        buffer[offset+2] = 0;
        buffer[offset+3] = 1;

        offset += 4;
        // let naltype = buffer[offset]&0x1F;

        let naltype = (buffer[offset]&0x7E)>>1;

        console.log(`nal len ${nallen} type:${naltype}`)
        offset += nallen;
    }

    if (offset != buffer.length) {

        console.error(`parse nal error, offset:${offset} buflen:${buffer.length}`)
    } else {
        console.log(`parse nal suc, offset:${offset} buflen:${buffer.length}`)

    }

    return buffer;
}



function SplitBufferToNals(buffer) {

    let nals = [];
    let offset = 0;

    
    const tmp = new ArrayBuffer(4);
    const dv = new DataView(tmp);

    while(offset < buffer.length) {

        dv.setUint8(0, buffer[offset+3]);
        dv.setUint8(1, buffer[offset+2]);
        dv.setUint8(2, buffer[offset+1]);
        dv.setUint8(3, buffer[offset]);
        
        let nallen = dv.getUint32(0, true);
        
        //buf.writeUInt32BE(1, offset);

        nals.push(buffer.slice(offset, offset + nallen + 4));
        
        offset += 4;
        let naltype = buffer[offset]&0x1F;

       // console.log(`nal len ${nallen} type:${naltype}`)
        offset += nallen;
    }

    if (offset != buffer.length) {

        console.error(`parse nal error, offset:${offset} buflen:${buffer.length}`)
    } else {
      //  console.log(`parse nal suc, offset:${offset} buflen:${buffer.length}`)

    }

    return nals;

}


function ParseSPSAndPPS(videData) {

    let avcSequenceHeader = new Uint8Array(videData.length - 5);
    avcSequenceHeader.set(videData.slice(5));

        
    const tmp = new ArrayBuffer(2);
    const dv = new DataView(tmp);
  
    let offset = 5;
    let spsnum = avcSequenceHeader[offset]&0x1F;
    offset += 1;

    dv.setInt8(0,avcSequenceHeader[offset+1]);
    dv.setInt8(1,avcSequenceHeader[offset]);

    let spslen = dv.getUint16(0, true);
    offset += 2;
    let sps = avcSequenceHeader.slice(offset, offset + spslen);
    offset += spslen;

    let ppsnum = avcSequenceHeader[offset];
    offset += 1;

    dv.setInt8(0,avcSequenceHeader[offset+1]);
    dv.setInt8(1,avcSequenceHeader[offset]);
    let ppslen =  dv.getUint16(0, true);
    offset += 2;
    let pps = avcSequenceHeader.slice(offset, offset + ppslen);

    return {sps, pps}

}





export default FLVDemuxer;