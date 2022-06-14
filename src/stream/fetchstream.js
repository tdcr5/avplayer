import EventEmitter from '../utils/events.js';



class FetchStream extends EventEmitter {

    _avplayer = undefined;
    _abort = undefined;

    constructor(avplayer) {

        super();

        this._avplayer = avplayer;
        this._abort = new AbortController();

    }

    start() {

        fetch(this._avplayer._options.url, {signal:this._abort.signal}).then((res) => {
            const reader = res.body.getReader();
            
            let fetchNext = async () => {

                let {done, value} = await reader.read();

                if (done) {

                } else {

                    this._avplayer._demux.dispatch(value);

                    fetchNext();
                }

            }

            fetchNext();


        }).catch((e) => {

            this.stop();
        });


    }

    stop() {

        if (this._abort) {

            this._abort.abort();
            this._abort = undefined;
        }

    }



    destroy() {
        this.stop();
        this.off();
    }




}



export default FetchStream;