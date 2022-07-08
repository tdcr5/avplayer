import EventEmitter from '../utils/events.js';



class FetchStream extends EventEmitter {

    _avplayer = undefined;
    _abort = undefined;
    _demuxer = undefined;
    _retryTimer = undefined;
    _retryCnt = 0;

    constructor(avplayer, demuxer) {

        super();

        this._avplayer = avplayer;
        this._demuxer = demuxer;
        this._abort = new AbortController();


    }

    start() {

        this._retryCnt++;

        this._avplayer._logger.warn('FetchStream', `fetch url ${this._avplayer._options.url} start, Cnt ${this._retryCnt}`);


        fetch(this._avplayer._options.url, {signal:this._abort.signal}).then((res) => {
            const reader = res.body.getReader();
            
            let fetchNext = async () => {

                let {done, value} = await reader.read();

                if (done) {

                    this._avplayer._logger.warn('FetchStream', `fetch url ${this._avplayer._options.url} done, Cnt ${this._retryCnt}`);
                    this.retry();
            

                } else {

                    this._demuxer.dispatch(value);

                    fetchNext();
                }

            }

            fetchNext();


        }).catch((e) => {

             this._avplayer._logger.warn('FetchStream', `fetch url ${this._avplayer._options.url} error ${e}, Cnt ${this._retryCnt}`);

            this.retry();
        });


    }

    retry() {

        this.stop();

        if (this._avplayer._options._retryCnt >= 0 && this._retryCnt > this.this._avplayer._options._retryCnt) {

            this._avplayer._logger.warn('FetchStream', `fetch url ${this._avplayer._options.url} finish because reach retryCnt, Cnt ${this._retryCnt} optionsCnt ${this._avplayer._options._retryCnt}`);
           
            this.emit('finish');
            return;
        }
    

        this._avplayer._logger.warn('FetchStream', `fetch url ${this._avplayer._options.url} retry, start retry timer delay ${this._avplayer._options.retryDelay} sec`);
        this._abort = new AbortController();
        this._demuxer.reset();
        this._retryTimer = setTimeout(() => {
            
            this.start();

        }, this._avplayer._options.retryDelay*1000);

        this.emit('retry');

    }


    stop() {

        if (this._abort) {

            this._abort.abort();
            this._abort = undefined;
        }

        if (this._retryTimer) {

            clearTimeout(this._retryTimer);
            this._retryTimer = undefined;
        }

    }



    destroy() {
        this.stop();
        this.off();
    }




}



export default FetchStream;