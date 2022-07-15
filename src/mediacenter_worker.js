//import Module from './decoder/decoder_ffmpeg'
import Module from './decoder/decoder_android_simd'

import {WORKER_SEND_TYPE, WORKER_EVENT_TYPE} from './constant'
import { AVPacket } from './utils/av';
import { AVType } from './constant';
import SpliteBuffer from './utils/splitebuffer';
import { caculateSamplesPerPacket } from './utils';
import Logger from './utils/logger.js';
import FLVDemuxer from './demuxer/flvdemuxer.js';
import FetchStream from './stream/fetchstream.js';


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

    _logger = undefined;

    _demuxer = undefined;
    _stream = undefined;

    _vframerate = 0;
    _vbitrate = 0;
    _aframerate = 0;
    _abitrate = 0;
    _yuvframerate = 0;
    _yuvbitrate = 0;
    _pcmframerate = 0;
    _pcmbitrate = 0;


    _statsec = 2;

    _lastts = 0;


    constructor(options) {

        this._vDecoder = new Module.VideoDecoder(this);
        this._aDecoder = new Module.AudioDecoder(this);

        this._options = options;

        this._logger = new Logger();
        this._logger.setLogEnable(true);

        this._demuxer = new FLVDemuxer(this);     // demux stream to h264/h265 aac/pcmu/pcma
        this._stream = new FetchStream(this); //get strem from remote

        this.registerEvents();

        this._stream.start();


      this._timer = setInterval(() => {

        let cnt = Math.min(10, this._gop.length);
        while(cnt>0) {
            this.handleTicket();
            cnt--;
        }
        
        
      }, 25);

      
      this._stattimer = setInterval(() => {
            
        this._logger.info('MCSTAT', `------ MCSTAT ---------
        video gen framerate:${this._vframerate/this._statsec} bitrate:${this._vbitrate*8/this._statsec}
        audio gen framerate:${this._aframerate/this._statsec} bitrate:${this._abitrate*8/this._statsec}
        yuv   gen framerate:${this._yuvframerate/this._statsec} bitrate:${this._yuvbitrate*8/this._statsec}
        pcm   gen framerate:${this._pcmframerate/this._statsec} bitrate:${this._pcmbitrate*8/this._statsec}
        packet buffer left count ${this._gop.length}
        `);

        this._vframerate = 0;
        this._vbitrate = 0;
        this._aframerate = 0;
        this._abitrate = 0;

        this._yuvframerate = 0;
        this._yuvbitrate = 0;
        this._pcmframerate = 0;
        this._pcmbitrate = 0;

    }, this._statsec*1000);



    }

    registerEvents() {

        this._logger.info('MediaCenterInternal', `now play ${this._options.url}`);

        this._stream.on('finish', () => {

        });

        this._stream.on('retry', () => {

           this.reset();
           postMessage({cmd: WORKER_EVENT_TYPE.reseted});

        });

        this._stream.on('data', (data) => {

            this._demuxer.dispatch(data);

        });

        this._demuxer.on('videoinfo', (videoinfo) => {

            this._logger.info('MediaCenterInternal', `demux video info vtype:${videoinfo.vtype} width:${videoinfo.width} hight:${videoinfo.height}`);

            this._vDecoder.setCodec(videoinfo.vtype, videoinfo.extradata);
        })

        this._demuxer.on('audioinfo', (audioinfo) => {

            this._logger.info('MediaCenterInternal', `demux audio info atype:${audioinfo.atype} sample:${audioinfo.sample} channels:${audioinfo.channels} depth:${audioinfo.depth} aacprofile:${audioinfo.profile}`);

            this._aDecoder.setCodec(audioinfo.atype, audioinfo.extradata);

            
        })

        this._demuxer.on('videodata', (packet) => {

            this._vframerate++;
            this._vbitrate += packet.payload.length;

            this.decodeVideo(packet.payload, packet.timestamp, packet.iskeyframe)

        })

        this._demuxer.on('audiodata', (packet) => {

            this._aframerate++;
            this._abitrate += packet.payload.length;

          this.decodeAudio(packet.payload, packet.timestamp);
        })

    }

    
    destroy() {

        this.reset();

        this._aDecoder.clear();
        this._vDecoder.clear();

        this._aDecoder = undefined;
        this._vDecoder = undefined;

        clearInterval(this._timer);
        clearInterval(this._statistic);


        this._stream.destroy();

        this._demuxer.destroy();
        
        clearInterval(this._stattimer);

        this._logger.info('MediaCenterInternal', `MediaCenterInternal destroy`);

    }
    


    reset() {

        this._logger.info('MediaCenterInternal', `work thiread reset, clear gop buffer & reset all Params`);

        this._gop = [];
        this._lastts = 0;

        this._useSpliteBuffer = false;
        this._spliteBuffer = undefined;

        this._width = 0;
        this._height = 0;
    
        this._sampleRate = 0;
        this._channels = 0;
        this.samplesPerPacket = 0;

        this._demuxer.reset();
        
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

                this._logger.warn('MediaCenterInternal', `packet buffer cache too much, drop ${this._gop.length - i} packet`);
                this._gop = this._gop.slice(0, i-1);
               
            }

        }

        this._gop.push(avpacket);
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

    }

    //callback
    videoInfo(vtype, width, height) {

        this._width = width;
        this._height = height;

        postMessage({cmd: WORKER_EVENT_TYPE.videoInfo, vtype, width, height})
    }

    yuvData(yuv, timestamp) {

        if (timestamp - this._lastts > 10000000) {

            this._logger.info('MediaCenterInternal', `yuvdata timestamp error ${timestamp} last ${this._lastts}`);
            return;
        }

        this._lastts = timestamp;

        let size = this._width*this._height*3/2;
        let out = Module.HEAPU8.subarray(yuv, yuv+size);

        let data = Uint8Array.from(out);

        this._yuvframerate++;
        this._yuvbitrate += data.length;

        
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

            this._logger.info('MediaCenterInternal', `pcmData timestamp error ${timestamp} last ${this._lastts}`);
            return;
        }

        this._lastts = timestamp;

        
        let datas = [];

        this._pcmframerate++;
     

        for (let i = 0; i < this._channels; i++) {
            var fp = Module.HEAPU32[(pcmDataArray >> 2) + i] >> 2;
            datas.push(Float32Array.of(...Module.HEAPF32.subarray(fp, fp + samples)));

           this._yuvbitrate += datas[i].length*4;
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



}


Module.print = function (text) {
    
    console.log(`wasm print msg: ${text}`);
}
Module.printErr = function (text) {
   
    console.log(`wasm print error msg: ${text}`);
}


Module.postRun = function() {

    console.log('avplayer: mediacenter worker start');

    let mcinternal = undefined;

    //recv msg from main thread
    self.onmessage = function(event) {

        var msg = event.data
        switch (msg.cmd) {

            case WORKER_SEND_TYPE.init: {

               mcinternal = new MediaCenterInternal(JSON.parse(msg.options));
               postMessage({cmd: WORKER_EVENT_TYPE.inited});

                break;
            }

            case WORKER_SEND_TYPE.destroy: {

                mcinternal.destroy();
                mcinternal = undefined;

                postMessage({cmd: WORKER_EVENT_TYPE.destroyed});
                
                break;
            }

        }

    }

    // notify main thread after worker thread  init completely
    postMessage({cmd: WORKER_EVENT_TYPE.created});


}


