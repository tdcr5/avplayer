import {WORKER_SEND_TYPE, WORKER_EVENT_TYPE} from '../constant'
import EventEmitter from '../utils/events.js';

class MediaCenter extends EventEmitter  {


    _mediacenterWorker = undefined;
    _player;

    constructor (player) {

        super()

        this._player = player;

        this._player._logger.info('mediacenter', `start worker thread ${player._options.decoder}`);
        this._mediacenterWorker = new Worker(player._options.decoder);

        this._mediacenterWorker.onmessageerror = (event) => {


            this._player._logger.info('mediacenter', `start worker thread err ${event}`);
        };

        this._mediacenterWorker.onmessage = (event) => {

            const msg = event.data;
            switch (msg.cmd) {

                case WORKER_EVENT_TYPE.created: {

                    this._mediacenterWorker.postMessage({
                                                cmd: WORKER_SEND_TYPE.init,
                                                options:JSON.stringify(this._player._options)});
                    break;

                }

                case WORKER_EVENT_TYPE.inited: {
    
                    this.emit('inited');
                    break;

                }

                case WORKER_EVENT_TYPE.videoInfo: {

                    this.emit('videoinfo', msg.vtype, msg.width, msg.height);
                    break;
                }

                    
                case WORKER_EVENT_TYPE.yuvData: {

                    let yuvpacket = {
                        width:msg.width,
                        height:msg.height,
                        data:msg.data,
                        timestamp:msg.timestamp
                    };
                
                    this.emit('yuvdata', yuvpacket);
                    break;
                }

                case WORKER_EVENT_TYPE.audioInfo: {

                    this.emit('audioinfo', msg.atype, msg.sampleRate, msg.channels, msg.samplesPerPacket);
                    break;
                }

     
                case WORKER_EVENT_TYPE.pcmData: {

                    let pcmpacket = {
                        datas:msg.datas,
                        timestamp:msg.timestamp
                    };
                
                    this.emit('pcmdata', pcmpacket);
                    break;

                }
   
                default: {

                    break;
                }
                   
            }

        };
    }

    
    destroy() {

        this._mediacenterWorker.terminate();
            
    }

    setVideoCodec(vtype, extradata) {


        this._mediacenterWorker.postMessage({
                                            cmd: WORKER_SEND_TYPE.setVideoCodec,
                                            vtype,
                                            extradata}, [extradata.buffer]);
    }

    decodeVideo(videodata, timestamp, keyframe) {

        this._mediacenterWorker.postMessage({
                                                cmd: WORKER_SEND_TYPE.decodeVideo,
                                                videodata,
                                                timestamp,
                                                keyframe
                                             }, [videodata.buffer]);
    }


    setAudioCodec(atype, extradata) {

        this._mediacenterWorker.postMessage({
            cmd: WORKER_SEND_TYPE.setAudioCodec,
            atype,
            extradata}, [extradata.buffer]);

    }

    decodeAudio(audiodata, timestamp) {

   
        this._mediacenterWorker.postMessage({
            cmd: WORKER_SEND_TYPE.decodeAudio,
            audiodata,
            timestamp,
         }, [audiodata.buffer]);
    }


}



export default  MediaCenter;
