import {WORKER_SEND_TYPE, WORKER_EVENT_TYPE, AVType} from '../constant'
import EventEmitter from '../utils/events.js';
import JitterBuffer from './jitterbuffer';

class MediaCenter extends EventEmitter  {


    _mediacenterWorker = undefined;
    _player;
    _jitterBuffer = undefined;


    constructor (player) {

        super()

        this._player = player;

        this._player._logger.info('mediacenter', `start worker thread ${player._options.decoder}`);

        this._mediacenterWorker = new Worker(player._options.decoder, {name:player._options.decoderMode});

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

                case WORKER_EVENT_TYPE.reseted: {

                    this._jitterBuffer.reset();
                    break;
                }

                case WORKER_EVENT_TYPE.destroyed: {

                    this._mediacenterWorker.terminate();
                    this._jitterBuffer.destroy();
                    break;
                }

                case WORKER_EVENT_TYPE.videoInfo: {

                    this.emit('videoinfo', msg.vtype, msg.width, msg.height);

                   // this._jitterBuffer.playVideoOnly();
                    break;
                }

                    
                case WORKER_EVENT_TYPE.yuvData: {

                    this._jitterBuffer.pushYUVData(msg.data, msg.timestamp, msg.width, msg.height);
                
                    break;
                }

                case WORKER_EVENT_TYPE.audioInfo: {

                    this.emit('audioinfo', msg.atype, msg.sampleRate, msg.channels, msg.samplesPerPacket);
                    break;
                }


                case WORKER_EVENT_TYPE.pcmData: {

                    this._jitterBuffer.pushPCMData(msg.datas, msg.timestamp);
                    break;

                }

   
                default: {

                    break;
                }
                   
            }

        };

        this._jitterBuffer = new JitterBuffer(player);

        this._jitterBuffer.on('yuvdata', (yuvpacket) => {

            this.emit('yuvdata', yuvpacket);

        })

    }

    destroy() {

        this.off();
        this._mediacenterWorker.postMessage({cmd: WORKER_SEND_TYPE.destroy});

        this._player._logger.info('MediaCenter', 'MediaCenter destroy');
 
    }

    getPCMData(trust) {
      
      return this._jitterBuffer.getPCMData(trust);
    }

}



export default  MediaCenter;
