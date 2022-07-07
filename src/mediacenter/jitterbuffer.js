import EventEmitter from '../utils/events.js';


const JitterBufferStatus = {
    notstart: 'notstart',      //未开始
    bufferring : 'bufferring',  //开始，等待缓冲满
    bufferReady: 'bufferReady'        //buffer准备好了，可以播放了
}


const DispatchStrategy = {
    outAudioDriven: 'outAudioDriven',      // 外部音频播放模块驱动，音画对齐效果最好
    outTimerDriven: 'outTimerDriven',      // 外部定时器驱动，内部需要建立时钟对齐音画
    playVideoOnlyDriven:  'playVideoOnlyDriven'   // 内部定时器驱动，该模式不播放声音，声音数据直接丢弃，内部需要建立时钟
}

const delayScale = 3.0;


class JitterBuffer extends EventEmitter {

    _vgop = [];
    _agop = [];
    _status = JitterBufferStatus.notstart;
    _strategy = DispatchStrategy.outAudioDriven;

    _firstpacketts = undefined; //如果 _strategy是playVideoOnlyDriven，为video gop 的首帧ts，否则为 audio gop的首帧ts
    _firstts = undefined;

    _player = undefined;
    
    _playTimer = undefined;
    _statisticTimer = undefined;
    
    constructor(player) {

        super();

        this._player = player;

        this._statisticTimer = setInterval(() => {

            this._player._logger.info('jitterbuffer', `strategy ${this._strategy} video ${this._vgop.length} audio ${this._agop.length}`);
            
          }, 2000);
    }

    destroy() {

        this._agop = [];
        this._vgop = [];

        if (this._playTimer) {
            clearInterval(this._playTimer);
        }

        if (this._statisticTimer) {
            clearInterval(this._statisticTimer);
        }

        this.off();
    }


    playVideoOnly() {

        changeStrategy(DispatchStrategy.playVideoOnlyDriven);
    }


    playVideoTicket() {

        if (this._strategy !== DispatchStrategy.playVideoOnlyDriven) {

            this._player._logger.error('jitterbuffer', `strategy [${this._strategy}] playVideoTicket not allowed, some error happen, please check logic`);
            return
        }

        if (this._vgop.length < 1) {

            return;
        }

        let now = new Date().getTime();
        if (now - this._firstts < this._vgop[0].timestamp - this._firstpacketts) {

            return;
        }

        yuvpacket = this._vgop.shift();
 
        this.emit('yuvdata', yuvpacket);

        this.updateJitterBufferState();

    }


    changeStrategy(strategy) {

        if (this._strategy === strategy) {

            return;
        }

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {

            this._player._logger.warn('jitterbuffer', `changeStrategy ${strategy} not allowed, because cur strategy is play Video only`);
            return;
        }

        this._strategy = strategy;

        this._player._logger.info('jitterbuffer', `changeStrategy ${strategy} success`);

        //策略变化，jitterbuffer状态机从头开始跑一遍
        this._status = JitterBufferStatus.notstart;
        this.updateJitterBufferState();

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {

            if (this._playTimer) {
                clearInterval(this._playTimer);
            }

            let sec = 25;

            this._playTimer = setInterval(() => {

                this.playVideoTicket();
                
              }, sec)

              this._player._logger.info('jitterbuffer', `strategy [${this._strategy}]  start play video timer ${1000/sec} frames per second`);

        }

    }

    pushPCMData(datas, timestamp) {


        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
            //声音直接丢弃
            return;
        }

        let pcmpacket = {
            datas,
            timestamp
        };

        this._agop.push(pcmpacket);

        this.updateJitterBufferState();

    }

    pushYUVData(data, timestamp, width, height) {

        let yuvpacket = {
            width,
            height,
            data,
            timestamp
        };

        this._vgop.push(yuvpacket);

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {

            this.updateJitterBufferState();
        }
    }

    
    getPCMData(trust) {

        this.changeStrategy(trust ? DispatchStrategy.outAudioDriven : DispatchStrategy.outTimerDriven);

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {

            this._player._logger.error('jitterbuffer', `strategy [${this._strategy}] getPCMData not allowed, some error happen, check the logic`);
            return;
        }

        if (this._status !== JitterBufferStatus.bufferReady || this._agop.length < 1) {

            return;
        }

        

        let now = new Date().getTime();
        if (this._strategy === DispatchStrategy.outTimerDriven && now - this._firstts < this._agop[0].timestamp - this._firstpacketts) {

            return;
        }

        let pcmpacket = this._agop.shift();

        this.syncVideo(pcmpacket.timestamp);

        this.updateJitterBufferState();

        return pcmpacket;
    }

    syncVideo(timestamp, drop) {

        let yuvpacket = undefined;
        let count = 0;

        while(1) {

            if (this._vgop.length < 1) {

                break;
            }

            if (this._vgop[0].timestamp > timestamp) {

                break;
            }

            yuvpacket = this._vgop.shift();
            count++;
            if (!drop) {

                this.emit('yuvdata', yuvpacket);
            }

        }

        return count;

    }

    updateJitterBufferState() {

        let ret = true;

        while (ret) {

            ret = this.tryUpdateJitterBufferState();
        }

    }

    tryUpdateJitterBufferState() {

        let gop = (this._strategy === DispatchStrategy.playVideoOnlyDriven ? this._vgop : this._agop);

        if (this._status === JitterBufferStatus.notstart) {

            if (gop.length < 1) {

                return false;
            }

            this._status = JitterBufferStatus.bufferring;
            return true;

        } else if (this._status === JitterBufferStatus.bufferring) {

            if (gop.length < 2) {
                this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] now buffering, but gop len [${gop.length}] less than 2,`);
                return false;
            }

            if (gop[gop.length-1].timestamp - gop[0].timestamp > this._player._options.delay) {


                this._firstpacketts = gop[0].timestamp;
                this._firstts = new Date().getTime();
                this._status = JitterBufferStatus.bufferReady;

                this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] gop buffer ok, delay ${this._player._options.delay}, last[${gop[gop.length-1].timestamp}] first[${gop[0].timestamp}] `);

                return true;
            }

            return false;

        } else if (this._status === JitterBufferStatus.bufferReady) {

            if (gop.length < 1) {

                this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] gop buffer is empty, restart buffering`);
                this._status = JitterBufferStatus.bufferring;
                return false;
            }

            this.tryDropFrames();

            return false;
            
        } else {

            this._player._logger.error('jitterbuffer',`strategy [${this._strategy}] jittbuffer status [${this._status}]  error !!!`);
        }

        return false;
    }


    tryDropFrames() {

        let dropDelay = this._player._options.delay*delayScale;

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {

            if (this._vgop.length < 2) {

                return;
            }

            if (this._agop.length > 0) {

                this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] drop frames find audio ${this._agop.length}`);

                this._agop = [];
            }

           
            if (this._vgop[this._vgop.length-1].timestamp - this._vgop[0].timestamp > dropDelay) {

                //丢弃一半
                let vdropcnt = Math.floor(this._vgop.length/2);

                this._vgop = this._vgop.slice(vdropcnt);

                this._firstpacketts = this._vgop[0].timestamp;
                this._firstts = new Date().getTime();
   
                this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] drop video frame ${vdropcnt}, now exist ${this._vgop.length}, delay ${this._player._options.delay}, last[${this._vgop[this._vgop.length-1].timestamp}] first[${ this._vgop[0].timestamp}] `);

                return;
            }



        } else {

            if (this._agop.length < 2) {

                return;
            }

            if (this._agop[this._agop.length-1].timestamp - this._agop[0].timestamp > dropDelay) {

                //丢弃一半
                let adropcnt = Math.floor(this._agop.length/2);

                this._agop = this._agop.slice(adropcnt);

                this._firstpacketts = this._agop[0].timestamp;
                this._firstts = new Date().getTime();

                let vdropcnt = this.syncVideo(this._firstpacketts, true);
   
                this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] drop audio frame ${adropcnt} vedio frams ${vdropcnt}, now exist audio ${this._agop.length} video ${this._vgop.length}, delay ${this._player._options.delay}, last[${this._agop[this._agop.length-1].timestamp}] first[${ this._agop[0].timestamp}] `);

                return;
            }

        }


    }





}


export default JitterBuffer;