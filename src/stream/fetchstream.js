import EventEmitter from '../utils/events.js';



class FetchStream extends EventEmitter {

    _player = undefined;
    _abort = undefined;
    _retryTimer = undefined;
    _retryCnt = 0;

    constructor(player) {

        super();

        this._player = player;
        this._abort = new AbortController();


    }

    start() {

        this._retryCnt++;

        this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} start, Cnt ${this._retryCnt}`);


        fetch(this._player._options.url, {signal:this._abort.signal}).then((res) => {
            const reader = res.body.getReader();
            
            let fetchNext = async () => {

                let {done, value} = await reader.read();

                if (done) {

                    this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} done, Cnt ${this._retryCnt}`);
                    this.retry();
            

                } else {

                    this.emit('data', value);

                    fetchNext();
                }

            }

            fetchNext();


        }).catch((e) => {

             this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} error ${e}, Cnt ${this._retryCnt}`);

            this.retry();
        });


    }

    retry() {

        this.stop();

        if (this._player._options.retryCnt >= 0 && this._retryCnt > this._player._options.retryCnt) {

            this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} finish because reach retryCnt, Cnt ${this._retryCnt} optionsCnt ${this._player._options.retryCnt}`);
           
            this.emit('finish');
            return;
        }
    

        this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} retry, start retry timer delay ${this._player._options.retryDelay} sec`);
        this._abort = new AbortController();
        this._retryTimer = setTimeout(() => {
            
            this.start();

        }, this._player._options.retryDelay*1000);

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
        this._player._logger.info('FetchStream', 'FetchStream destroy');
    }




}



export default FetchStream;