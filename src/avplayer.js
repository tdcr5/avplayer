import CanvasRender from './render/canvasrender.js';
import Logger from './utils/logger.js';
import FLVDemux from './demux/flvdemux.js';
import FetchStream from './stream/fetchstream.js';


const DEFAULT_PLAYER_OPTIONS = {

    url:'',
    container:''

}

class AVPlayer {

    _options = undefined;

    _render = undefined;
    _logger = undefined;
    _demux = undefined;
    _stream = undefined;


    //统计
    _vframerate = 0;
    _vbitrate = 0;
    _aframerate = 0;
    _abitrate = 0;
    _statsec = 2;
    _stattimer = undefined;


    constructor(options) {

        this._logger = new Logger();
        this._logger.setLogEnable(true);

        this._options = Object.assign({}, DEFAULT_PLAYER_OPTIONS, options);
        this._container = options.container;


        this._logger.info('player', `now play ${this._options.url}`);


        this._render = new CanvasRender(this);

        this._demux = new FLVDemux(this);
        this._stream = new FetchStream(this);

        this.registerEvents();

        this._stream.start(); 

        this.startStatisc();

    }
    
    startStatisc() {

        this._stattimer = setInterval(() => {
            
            this._logger.info('STAT', `------ STAT ---------
            video framerate:${this._vframerate/this._statsec} bitrate:${this._vbitrate*8/this._statsec}
            audio framerate:${this._aframerate/this._statsec} bitrate:${this._abitrate*8/this._statsec}
            `);


            this._vframerate = 0;
            this._vbitrate = 0;
            this._aframerate = 0;
            this._abitrate = 0;




        }, this._statsec*1000);

    }

    stopStatic() {

        if (this._stattimer) {

            clearInterval(this._stattimer);
            this._stattimer = undefined;
        }

    }

    registerEvents() {

        this._demux.on('videoinfo', (videoinfo) => {

            this._logger.info('player', `videoinfo vtype:${videoinfo.vtype} width:${videoinfo.width} hight:${videoinfo.height}`);

        })

        this._demux.on('audioinfo', (audioinfo) => {

            this._logger.info('player', `audioinfo atype:${audioinfo.atype} sample:${audioinfo.sample} channels:${audioinfo.channels} depth:${audioinfo.depth} aacprofile:${audioinfo.profile}`);

        })

        this._demux.on('videodata', (packet) => {

            // this._logger.info('player', `recv VideoData ${packet.payload.length} keyframe:${packet.iskeyframe} nals:${packet.nals.length} pts:${packet.timestamp}`);
            // for (let nal of packet.nals) {

            //     let naltype = nal[4]&0x1F;
            //     this._logger.info('player', `Parse Nal: ${naltype}`)

            // }

            this._vframerate++;
            this._vbitrate += packet.payload.length;

        })

        this._demux.on('audiodata', (packet) => {

            this._aframerate++;
            this._abitrate += packet.payload.length;
          //  this._logger.info('player', `recv AudioData ${packet.payload.length} pts:${packet.timestamp}`);
        })

    }

    updateTexture(rgbabuf, width, height) {

        this._render.updateTexture(rgbabuf, width, height);
    }


}

window.AVPlayer = AVPlayer;

export default AVPlayer;