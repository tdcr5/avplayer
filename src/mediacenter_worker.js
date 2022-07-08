import Module from './decoder/decoder'
import {WORKER_SEND_TYPE, WORKER_EVENT_TYPE} from './constant'
import { AVPacket } from './utils/av';
import { AVType } from './constant';
import SpliteBuffer from './utils/splitebuffer';
import { caculateSamplesPerPacket } from './utils';



// 核心类，处理jitterbuffer, 播放控制，音画同步
class MediaCenterInternal {

    _vDecoder = undefined;
    _aDecoder = undefined;

    _width = 0;
    _height = 0;

    _sampleRate = 0;
    _channels = 0;
    _samplesPerPacket = 0;

    _options = undefined;

    _gop = [];


    _timer = undefined;
    _statistic = undefined;

    _useSpliteBuffer = false;
    _spliteBuffer = undefined;

    _lastts = 0;


    constructor() {

        this._vDecoder = new Module.VideoDecoder(this);
        this._aDecoder = new Module.AudioDecoder(this);


      this._timer = setInterval(() => {

        let cnt = Math.min(10, this._gop.length);
        while(cnt>0) {
            this.handleTicket();
            cnt--;
        }
        
        
      }, 25);

      this._statistic = setInterval(() => {

        console.log(`packet buffer count ${this._gop.length}`);
        
      }, 2000);
    }

    setOptions(options) {

        console.log(`work thiread recv options, delay ${options.delay}`);

        this._options = options;

    }


    reset() {

        console.log(`work thiread reset, clear gop buffer & reset all Params`);

        this._gop = [];
        this._lastts = 0;

        this._useSpliteBuffer = false;
        this._spliteBuffer = undefined;

        this._width = 0;
        this._height = 0;
    
        this._sampleRate = 0;
        this._channels = 0;
        this.samplesPerPacket = 0;
    }

    handleTicket() {

        if (this._gop.length < 1) {
            return;
        }

        let avpacket = this._gop.shift();

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
        avpacket.timestamp = timestamp,
        avpacket.iskeyframe = keyframe;

        if (keyframe && this._gop.length > 80) {

            let bf = false;
            let i = 0;
            for (; i < this._gop.length; i++) {

                let avpacket = this._gop[i];

                if (avpacket.avtype === AVType.Video && avpacket.iskeyframe) {

                    bf = true;
                    break;
                }
            }

            if (bf) {

                console.warn(`packet buffer cache too much, drop ${this._gop.length - i} packet`)
                this._gop = this._gop.slice(0, i-1);
               
            }

        }


        this._gop.push(avpacket);

       // this._vDecoder.decode(videodata, timestamp);
    }


    setAudioCodec(atype, extradata) {

        this._aDecoder.setCodec(atype, extradata);
    }

    decodeAudio(audiodata, timestamp) {

        let avpacket = new AVPacket();
        avpacket.avtype = AVType.Audio;
        avpacket.payload = audiodata;
        avpacket.timestamp = timestamp,

        this._gop.push(avpacket);

        // this._aDecoder.decode(audiodata, timestamp);
    }

    //callback
    videoInfo(vtype, width, height) {

        this._width = width;
        this._height = height;

        postMessage({cmd: WORKER_EVENT_TYPE.videoInfo, vtype, width, height})
    }

    yuvData(yuv, timestamp) {

        if (timestamp - this._lastts > 10000000) {

            console.log(`yuvdata timestamp error ${timestamp} last ${this._lastts}`);
            return;
        }

        this._lastts = timestamp;

        let size = this._width*this._height*3/2;
        let out = Module.HEAPU8.subarray(yuv, yuv+size);

        let data = Uint8Array.from(out);

        
        postMessage({cmd: WORKER_EVENT_TYPE.yuvData, data, width:this._width, height:this._height, timestamp}, [data.buffer]);

    }

    audioInfo(atype, sampleRate, channels) {

        this._sampleRate = sampleRate;
        this._channels = channels;
        this._samplesPerPacket = caculateSamplesPerPacket(sampleRate);

        postMessage({cmd: WORKER_EVENT_TYPE.audioInfo, atype, sampleRate, channels, samplesPerPacket:this._samplesPerPacket });
    }

    pcmData(pcmDataArray, samples, timestamp) {


        if (timestamp - this._lastts > 10000000) {

            console.log(`pcmData timestamp error ${timestamp} last ${this._lastts}`);
            return;
        }

        this._lastts = timestamp;

        
        let datas = [];

        for (let i = 0; i < this._channels; i++) {
            var fp = Module.HEAPU32[(pcmDataArray >> 2) + i] >> 2;
            datas.push(Float32Array.of(...Module.HEAPF32.subarray(fp, fp + samples)));

           // console.log(`worker thread pcm data[${i}] length ${datas[i].length} samples ${samples}`);
        }


        if (!this._useSpliteBuffer) {

            if(samples === this._samplesPerPacket) {

                postMessage({cmd: WORKER_EVENT_TYPE.pcmData, datas, timestamp}, datas.map(x => x.buffer));

                return;
            }

            this._spliteBuffer = new SpliteBuffer(this._sampleRate, this._channels, this._samplesPerPacket);
            this._useSpliteBuffer = true;
        } 

        this._spliteBuffer.addBuffer(datas, timestamp);

        this._spliteBuffer.splite((buffers, ts) => {

            postMessage({cmd: WORKER_EVENT_TYPE.pcmData, datas:buffers, timestamp:ts}, buffers.map(x => x.buffer));

        });

    }


    destroy() {

        this.reset();

        this._aDecoder.clear();
        this._vDecoder.clear();

        this._aDecoder = undefined;
        this._vDecoder = undefined;

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

                mcinternal.decodeVideo(msg.videodata, msg.timestamp, msg.keyframe)
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

            case WORKER_SEND_TYPE.reset: {

                mcinternal.reset();

                postMessage({cmd: WORKER_EVENT_TYPE.reseted});
                break;
            }

            case WORKER_SEND_TYPE.destroy: {

                mcinternal.destory();
                mcinternal = undefined;

                postMessage({cmd: WORKER_EVENT_TYPE.destroyed});
                
                break;
            }

        }

    }

    // notify main thread after worker thread  init completely
    postMessage({cmd: WORKER_EVENT_TYPE.created});


}


