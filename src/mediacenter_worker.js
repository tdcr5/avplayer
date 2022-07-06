import Module from './decoder/decoder'
import {WORKER_SEND_TYPE, WORKER_EVENT_TYPE} from './constant'
import { AVPacket } from './utils/av';
import { AVType } from './constant';
import SpliteBuffer from './utils/splitebuffer';


const JitterBufferStatus = {
    notstart: 'notstart',      //未开始
    bufferring : 'bufferring',  //开始，等待缓冲满
    decoding: 'decoding'        //开始解码
}



// 核心类，处理jitterbuffer, 播放控制，音画同步
class MediaCenterInternal {

    _vDecoder = undefined;
    _aDecoder = undefined;

    _vDecoder = undefined;
    _aDecoder = undefined;

    _width = 0;
    _height = 0;

    _sampleRate = 0;
    _channels = 0;

    _options = undefined;

    _gop = [];

    _status = JitterBufferStatus.notstart;
    _firstts = 0;
    _firstpacketts = 0;

    _timer = undefined;
    _statistic = undefined;


    _useSpliteBuffer = false;
    _spliteBuffer = undefined;


    constructor() {

        this._vDecoder = new Module.VideoDecoder(this);
        this._aDecoder = new Module.AudioDecoder(this);


      this._timer = setInterval(() => {

        this.handleTicket();
        
      }, 10);

      this._statistic = setInterval(() => {

        console.log(`----------------- jitter buffer count ${this._gop.length}`);
        
      }, 1000);
    }

    setOptions(options) {

        console.log(`work thiread recv options, delay ${options.delay}`);

        this._options = options;

    }

    handleTicket() {


        let next = true;

        while (next) {

            next = this.tryDecode()
        }

    }

    tryDecode() {

        if (this._status === JitterBufferStatus.notstart) {

            if (this._gop.length < 1) {

                return false;
            }

            this._status = JitterBufferStatus.bufferring;
            return true;

        } else if (this._status === JitterBufferStatus.bufferring) {

            if (this._gop.length < 2) {
                
                return false;
            }

            if (this._gop[this._gop.length-1].timestamp - this._gop[0].timestamp > this._options.delay) {

                this._status = JitterBufferStatus.decoding;

                this.tryDropFrames();

                this._firstpacketts = this._gop[0].timestamp;
                this._firstts = new Date().getTime();

                console.log(`gop buffer ok, delay ${this._options.delay}, last[${this._gop[this._gop.length-1].timestamp}] first[${ this._gop[0].timestamp}] factfirst[${this._firstts}]`);

                return true;
            }

            return false;

        } else if (this._status === JitterBufferStatus.decoding) {

            if (this._gop.length < 1) {

                console.log(`gop buffer is empty, restart buffering`);
                this._status = JitterBufferStatus.bufferring;
                return false;
            }

            let now = new Date().getTime();
            let packet = this._gop[0];

            if (now - this._firstts >= packet.timestamp - this._firstpacketts) {

                this.decodePacket(packet);
                this._gop.shift();
                return true;
            }
            
            return false

        } else {


            console.error(`jittbuffer status [${this._status}]  error !!!`);
        }

        return false;

    }

    tryDropFrames() {

        if (this._options.playmode === 'playback') {

            return;
        }

        let index = -1;
        for(let i = 0; i < this._gop; i++) {

            let packet = this._gop[i];

            if (packet.avtype === AVType.Video && packet.iskeyframe) {

                index = i;
            }
        }

        if (index > 0) {

            console.log(`tryDropFrames, find keyframe ${index} in gop, drop ${index} packet`);
            this._gop = this._gop.slice(index);
            return;
        }


        console.log(`tryDropFrames, find keyframe ${index} in gop, drop no packet`);
    }

    decodePacket(avpacket) {

        if (avpacket.avtype === AVType.Video) {

            this._vDecoder.decode(avpacket.payload, avpacket.timestamp);

        } else {

            this._aDecoder.decode(avpacket.payload, avpacket.timestamp);
        }

    }

    setVideoCodec(vtype, extradata) {

        this._vDecoder.setCodec(vtype, extradata);
    }

    decodeVideo(videodata, timestamp, keyframe) {

        let avpacket = new AVPacket();
        avpacket.avtype = AVType.Video;
        avpacket.payload = videodata;
        avpacket.timestamp = timestamp;
        avpacket.iskeyframe = keyframe;

        this._gop.push(avpacket);
        this._gop.sort((a, b) => a.timestamp - b.timestamp);

     //    this._vDecoder.decode(videodata, timestamp);
    }


    setAudioCodec(atype, extradata) {

        this._aDecoder.setCodec(atype, extradata);
    }

    decodeAudio(audiodata, timestamp) {

        let avpacket = new AVPacket();
        avpacket.avtype = AVType.Audio;
        avpacket.payload = audiodata;
        avpacket.timestamp = timestamp;

        this._gop.push(avpacket);
        this._gop.sort((a, b) => a.timestamp - b.timestamp);

        // this._aDecoder.decode(audiodata, timestamp);
    }

    //callback
    videoInfo(vtype, width, height) {

        this._width = width;
        this._height = height;

        postMessage({cmd: WORKER_EVENT_TYPE.videoInfo, vtype, width, height})
    }

    yuvData(yuv, timestamp) {

        let size = this._width*this._height*3/2;
        let out = Module.HEAPU8.subarray(yuv, yuv+size);

        let data = Uint8Array.from(out);

      //  console.log(`worker yuv[0-5] ${data[0]} ${data[1]} ${data[2]} ${data[3]} ${data[4]} ${data[5]}`);

        postMessage({cmd: WORKER_EVENT_TYPE.yuvData, data, width:this._width, height:this._height, timestamp}, [data.buffer]);
    }

    audioInfo(atype, sampleRate, channels) {

        this._sampleRate = sampleRate;
        this._channels = channels;

        postMessage({cmd: WORKER_EVENT_TYPE.audioInfo, atype, sampleRate, channels, samplesPerPacket:this._options.samplesPerPacket});
    }

    pcmData(pcmDataArray, samples, timestamp) {

        let datas = [];

        for (let i = 0; i < this._channels; i++) {
            var fp = Module.HEAPU32[(pcmDataArray >> 2) + i] >> 2;
            datas.push(Float32Array.of(...Module.HEAPF32.subarray(fp, fp + samples)));

           // console.log(`worker thread pcm data[${i}] length ${datas[i].length} samples ${samples}`);
        }


        if (!this._useSpliteBuffer) {

            if(samples === this._options.samplesPerPacket) {

                postMessage({cmd: WORKER_EVENT_TYPE.pcmData, datas, timestamp}, datas.map(x => x.buffer));
                return;
            }

            this._spliteBuffer = new SpliteBuffer(this._sampleRate, this._channels, this._options.samplesPerPacket);
            this._useSpliteBuffer = true;
        } 

        this._spliteBuffer.addBuffer(datas, timestamp);

        this._spliteBuffer.splite((buffers, ts) => {

            postMessage({cmd: WORKER_EVENT_TYPE.pcmData, datas:buffers, timestamp:ts}, buffers.map(x => x.buffer));
        });

    }


    destory() {

        clearInterval(this._timer);
        clearInterval(this._statistic);
        
    }
    

}


Module.postRun = function() {


    console.log('avplayer: mediacenter worker start');


    let mcinternal = new MediaCenterInternal();

    //recv msg from main thread
    self.onmessage = function(event) {

        var msg = event.data
        switch (msg.cmd) {

            case WORKER_SEND_TYPE.init: {

               mcinternal.setOptions(JSON.parse(msg.options));
               postMessage({cmd: WORKER_EVENT_TYPE.inited});

                break;
            }

            case WORKER_SEND_TYPE.setVideoCodec: {

                mcinternal.setVideoCodec(msg.vtype, msg.extradata)
                break;
            }

            case WORKER_SEND_TYPE.decodeVideo: {

                mcinternal.decodeVideo(msg.videodata, msg.timestamp)
                break;
            }

            case WORKER_SEND_TYPE.setAudioCodec: {

                mcinternal.setAudioCodec(msg.atype, msg.extradata)
                break;

            }

            case WORKER_SEND_TYPE.decodeAudio: {

                mcinternal.decodeAudio(msg.audiodata, msg.timestamp)
                break;
            }

            case WORKER_SEND_TYPE.close: {

                mcinternal.destory();
                
                break;
            }

        }

    }

    // notify main thread after worker thread  init completely
    postMessage({cmd: WORKER_EVENT_TYPE.created});


}


