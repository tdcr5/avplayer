


class SpliteBuffer {

    _sampleRate = 0;
    _channels = 0;
    _samplesPerPacket = 0;
    _samplesList = [];
    _curSamples = 0;

    constructor(sampleRate, channels, samplesPerPacket) {

        this._sampleRate = sampleRate;
        this._channels = channels;
        this._samplesPerPacket = samplesPerPacket;

    }

    addBuffer(buffers, pts) {

        this._samplesList.push({buffers, pts});
        this._curSamples += buffers[0].length;
    }


    spliteOnce(f) {

        if (this._curSamples < this._samplesPerPacket) {

            return;
        }

        let newbuffers = [];
        let pts = undefined;

        for(let i = 0; i < this._channels; i++ ) {

            newbuffers.push(new Float32Array(this._samplesPerPacket));
        }

        let needSamples = this._samplesPerPacket;
        let copySamples = 0;

        while(true) {

            if (needSamples === 0) {

                break;
            }

            let first = this._samplesList[0];

            if (!pts) {
                pts = first.pts
            }

            if (needSamples >= first.buffers[0].length) {

                newbuffers[0].set(first.buffers[0], copySamples);

                if (this._channels > 1) {

                    newbuffers[1].set(first.buffers[1], copySamples);
                }

                needSamples -= first.buffers[0].length
                copySamples += first.buffers[0].length;

                this._samplesList.shift();

            }  else {

                newbuffers[0].set(first.buffers[0].slice(0, needSamples), copySamples);

                first.buffers[0] = first.buffers[0].slice(needSamples)

                if (this._channels > 1) {

                    newbuffers[1].set(first.buffers[1].slice(0, needSamples), copySamples);
                    first.buffers[1] = first.buffers[1].slice(needSamples)
                }


                first.pts += Math.floor(needSamples*1000/this._sampleRate); 

                copySamples += needSamples;
                needSamples = 0;
            }

        }

        this._curSamples -= this._samplesPerPacket;

        f(newbuffers, pts);
    
    }

    splite(f) {

        while(this._curSamples >= this._samplesPerPacket) {

            this.spliteOnce(f);
        }

    }    



}


export default SpliteBuffer;