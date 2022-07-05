import EventEmitter from "../utils/events";
import { clamp } from "../utils";

class AudioPlayer extends EventEmitter {

    _player = undefined;
    _audioContext = undefined;
    _audioBuffer = undefined;
    _gainNode = undefined;
    _scriptNode = undefined;
    _playing = false;

    _atype = 0;
    _samplerate = 0;
    _channels = 0;
    _samplesPerPacket = 0;

    _init = false;

    constructor(player) {

        super();

        this._audioBuffer = [];
        this._player = player;

        this._playing = false;
        this._init = false;

        this._player._logger.info('AudioPlayer', 'created');
    }

    setAudioInfo(atype, samplerate, channels, samplesPerPacket) {

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

        scriptNode.onaudioprocess = (audioProcessingEvent) => {

            

            let outputBuffer = audioProcessingEvent.outputBuffer;

          //  this._player._logger.info('AudioPlayer', `onaudioprocess callback ${outputBuffer.sampleRate}`);

            if (this._audioBuffer.length === 0) {
                return;
            }

            let bufferItem = this._audioBuffer.shift();

            for (let i = 0; i < this._channels; i++) {
                let b = bufferItem.buffer[i];
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
        this.clear();
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

    closeAudio() {
        if (this.init) {
            this.scriptNode && this.scriptNode.disconnect(this._gainNode);
            this._gainNode && this._gainNode.disconnect(this._audioContext.destination);
        }
        this.clear();
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

    clear() {
        this._audioBuffer = [];
    }

    pushAudio(buffer, ts) {

        if(this.isStateSuspended()) {

            return;
        }

        this._audioBuffer.push({
            buffer,
            ts
        });

        // this.player.debug.log('AudioContext', `bufferList is ${this.bufferList.length}`)
    }

    pause() {

        this._playing = false;
        this.clear();
    }

    resume() {
        this._playing = true;
    }


    destroy() {
        this.closeAudio();
        this._audioContext.close();
        this._audioContext = null;
        this._gainNode = null;
        this.init = false;
        if (this._scriptNode) {
            this._scriptNode.onaudioprocess = undefined;
            this._scriptNode = null;
        }
        this.off();
        this._player._logger.info('AudioPlayer', 'destroy');
    }

}


export default AudioPlayer;