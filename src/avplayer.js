import CanvasRender from './render/canvasrender.js';
import Logger from './utils/logger.js';
import FLVDemuxer from './demuxer/flvdemuxer.js';
import FetchStream from './stream/fetchstream.js';
import MediaCenter from './mediacenter/index.js';
import { PixelType } from './constant/index.js';
import AudioPlayer from './audio/audioplayer.js';

const DEFAULT_PLAYER_OPTIONS = {

    url:'',                 //播放地址
    container:'',           //外部容器，用于放置渲染画面


    playMode:'live',        //live 或者 playback

    renderMode:'normal', // normal:正常, green:绿幕, mask:掩码, cube:方块
    width:480,
    height:480,
    delay:500,              //缓冲时长


    retryCnt:-1,       //拉流失败重试次数
    retryDelay: 5,     //重试时延 5000

    decoder:'decoder.js',    //work线程的js文件
}

class AVPlayer {

    _options = undefined;

    _render = undefined;
    _logger = undefined;
    _demuxer = undefined;
    _stream = undefined;
    _mediacenter = undefined;
    _audioplayer = undefined;


    //统计
    _vframerate = 0;
    _vbitrate = 0;
    _aframerate = 0;
    _abitrate = 0;

    _yuvframerate = 0;
    _yuvbitrate = 0;
    _pcmframerate = 0;
    _pcmbitrate = 0;

    _statsec = 2;
    _stattimer = undefined;


    constructor(options) {

        this._logger = new Logger();
        this._logger.setLogEnable(true);

        this._options = Object.assign({}, DEFAULT_PLAYER_OPTIONS, options);
        this._container = options.container;

        this._logger.info('player', `now play ${this._options.url}`);

        this._demuxer = new FLVDemuxer(this);     // demux stream to h264/h265 aac/pcmu/pcma
        this._stream = new FetchStream(this, this._demuxer); //get strem from remote
        this._mediacenter = new MediaCenter(this); //jitterbuffer & decoder h264/h265 -> yuv aac/pcmu/pcma -> fltp
        this._render = new CanvasRender(this);  // render yuv
        this._audioplayer = new AudioPlayer(this); // play fltp

        this.registerEvents();
        this.startStatisc();
    }
    
    startStatisc() {

        this._stattimer = setInterval(() => {
            
            this._logger.info('STAT', `------ STAT ---------
            video framerate:${this._vframerate/this._statsec} bitrate:${this._vbitrate*8/this._statsec}
            audio framerate:${this._aframerate/this._statsec} bitrate:${this._abitrate*8/this._statsec}
            yuv   framerate:${this._yuvframerate/this._statsec} bitrate:${this._yuvbitrate*8/this._statsec}
            pcm   framerate:${this._pcmframerate/this._statsec} bitrate:${this._pcmbitrate*8/this._statsec}
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

    stopStatic() {

        if (this._stattimer) {

            clearInterval(this._stattimer);
            this._stattimer = undefined;
        }

    }

    registerEvents() {

        this._stream.on('finish', () => {



        });

        this._stream.on('retry', () => {

            this._mediacenter.reset();

        });

        this._demuxer.on('videoinfo', (videoinfo) => {

            this._logger.info('player', `demux video info vtype:${videoinfo.vtype} width:${videoinfo.width} hight:${videoinfo.height}`);

            this._mediacenter.setVideoCodec(videoinfo.vtype, videoinfo.extradata);

        })

        this._demuxer.on('audioinfo', (audioinfo) => {

            this._logger.info('player', `demux audio info atype:${audioinfo.atype} sample:${audioinfo.sample} channels:${audioinfo.channels} depth:${audioinfo.depth} aacprofile:${audioinfo.profile}`);

            this._mediacenter.setAudioCodec(audioinfo.atype, audioinfo.extradata);
        })

        this._demuxer.on('videodata', (packet) => {

            this._vframerate++;
            this._vbitrate += packet.payload.length;

            this._mediacenter.decodeVideo(packet.payload, packet.timestamp, packet.iskeyframe)

        })

        this._demuxer.on('audiodata', (packet) => {

            this._aframerate++;
            this._abitrate += packet.payload.length;

          this._mediacenter.decodeAudio(packet.payload, packet.timestamp);
        })

        this._mediacenter.on('inited', () => {

            this._logger.info('player', `mediacenter init success`);

            //start stream
            this._stream.start(); 
        })

        this._mediacenter.on('videoinfo', (vtype, width, height) => {

            this._logger.info('player', `mediacenter video info vtype ${vtype} width ${width} height ${height}`);
        })

        this._mediacenter.on('yuvdata', (yuvpacket) => {


            this._yuvframerate++;
            this._yuvbitrate += yuvpacket.data.length;
       //     this._logger.info('player', `decoder yuvdata ${yuvpacket.data.length} ts ${yuvpacket.timestamp} width:${yuvpacket.width} height:${yuvpacket.height}`);

            this._render.updateTexture(PixelType.YUV, yuvpacket.data, yuvpacket.width, yuvpacket.height);
        })

        this._mediacenter.on('audioinfo', (atype, sampleRate, channels, samplesPerPacket) => {

            this._logger.info('player', `mediacenter audio info atype ${atype} sampleRate ${sampleRate} channels ${channels}  samplesPerPacket ${samplesPerPacket}`);
            
            this._audioplayer.setAudioInfo(atype, sampleRate, channels, samplesPerPacket);
            
        })

    }

    getPCMData(trust)  {

        let pcmpacket = this._mediacenter.getPCMData(trust);
        
        if (pcmpacket) {

            this._pcmframerate++;

            for(let data of pcmpacket.datas) {
    
                this._pcmbitrate += data.length;
            }

        }

       return pcmpacket
    }


    destroy() {

        this._stream.destroy();
        this._demuxer.destroy();
        this._mediacenter.destroy();
        this._audioplayer.destroy();
        this._render.destroy();

        this._logger.info('player', `avplayer destroy`)

    }

    //public interface

    unMute() {

        this._audioplayer.unMute();
    }

    mute() {

        this._audioplayer.mute();
    }

    switchRender(renderMode) {

        this._render.switchRender(renderMode);

    }




}

window.AVPlayer = AVPlayer;

export default AVPlayer;