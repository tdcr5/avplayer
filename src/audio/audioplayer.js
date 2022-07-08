import EventEmitter from "../utils/events";
import { clamp } from "../utils";

class AudioPlayer extends EventEmitter {

    _player = undefined;
    _audioContext = undefined;
    _gainNode = undefined;
    _scriptNode = undefined;
    _playing = false;

    _atype = 0;
    _samplerate = 0;
    _channels = 0;
    _samplesPerPacket = 0;

    _ticket = undefined;

    _init = false;

    constructor(player) {

        super();

        this._player = player;

        this._playing = false;
        this._init = false;

        this._player._logger.info('AudioPlayer', 'created');

    }

    setAudioInfo(atype, samplerate, channels, samplesPerPacket) {

        this.clear();

        this._atype = atype;
        this._samplerate = samplerate;
        this._channels = channels;
        this._samplesPerPacket = samplesPerPacket

        this._audioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate:samplerate});

        this._gainNode = this._audioContext.createGain();

        this.audioEnabled(true);
        // default setting 0
        this._gainNode.gain.value = 0;
        
        let scriptNode = this._audioContext.createScriptProcessor(samplesPerPacket, 0, channels);

        this._ticket = setInterval(() => {

            if (this.isStateRunning()) {

                return;
            }

            this._player.getPCMData(false);


            
        }, Math.floor(samplesPerPacket*1000/samplerate));

        scriptNode.onaudioprocess = (audioProcessingEvent) => {

            let outputBuffer = audioProcessingEvent.outputBuffer;

          //  this._player._logger.info('AudioPlayer', `onaudioprocess callback ${outputBuffer.sampleRate}`);

          let pcmpacket = this._player.getPCMData(true);

            if (!pcmpacket) {

                this._player._logger.warn('AudioPlayer', `audio buffer is empty`);

                for (let i = 0; i < this._channels; i++) {

                    let nowBuffering = outputBuffer.getChannelData(i);
                    for (let i = 0; i < this._samplesPerPacket; i++) {
                        nowBuffering[i] = 0;
                    }
                }
                return;
            }

            for (let i = 0; i < this._channels; i++) {
                let b = pcmpacket.datas[i];
                let nowBuffering = outputBuffer.getChannelData(i);
              //  this._player._logger.info('AudioPlayer', `onaudioprocess callback outputBuffer[${i}] length ${nowBuffering.length}`);
                for (let i = 0; i < this._samplesPerPacket; i++) {
                    nowBuffering[i] = b[i] || 0;
                }
            }
      
        }

        scriptNode.connect(this._gainNode);
        this._scriptNode = scriptNode;
        this._gainNode.connect(this._audioContext.destination);

        this._init = true;
    }

    //
    isPlaying() {
        return this._playing;
    }

     isMute() {
        return this._gainNode.gain.value === 0 || this.isStateSuspended();
    }

    volume() {
        return this._gainNode.gain.value;
    }



    mute() {

        if (!this._init) {

            return;
        }

        this.setVolume(0);
        this.audioEnabled(false);
    }

    unMute() {

        if (!this._init) {

            return;
        }

        this.setVolume(1);
        this.audioEnabled(true);
    
    }

    setVolume(volume) {
        volume = parseFloat(volume).toFixed(2);
        if (isNaN(volume)) {
            return;
        }
        this.audioEnabled(true);
        volume = clamp(volume, 0, 1);
        this._gainNode.gain.value = volume;
        this._gainNode.gain.setValueAtTime(volume, this._audioContext.currentTime);
    }


    // 是否播放。。。
    audioEnabled(flag) {

        this._player._logger.info('audioplayer', `audioEnabled flag ${flag} state ${this._audioContext.state}`);

        if (flag) {
            if (this._audioContext.state === 'suspended') {
                // resume
                this._audioContext.resume();
            }
        } else {
            if (this._audioContext.state === 'running') {
                // suspend
                this._audioContext.suspend();
            }
        }
    }

    isStateRunning() {
        return this._audioContext.state === 'running';
    }

    isStateSuspended() {
        return this._audioContext.state === 'suspended';
    }


    pause() {

        this._playing = false;
    }

    resume() {
        this._playing = true;
    }

    clear() {

        if (this._ticket) {

            clearInterval(this._ticket);
            this._ticket = this.undefined;
        }

        if (this._scriptNode) {

            this._scriptNode.disconnect(this._gainNode);
            this._scriptNode.onaudioprocess = undefined;
            this._scriptNode = undefined;
        }

        if (this._gainNode) {

            this._gainNode.disconnect(this._audioContext.destination);
            this._gainNode = undefined;
        }

        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }

        this._playing = false;
        this._init = false;

        this._player._logger.info('AudioPlayer', 'AudioPlayer clear resouce');
    }


    destroy() {

        this.clear();
        this.off();
        this._player._logger.info('AudioPlayer', 'AudioPlayer destroy');
    }

}


export default AudioPlayer;