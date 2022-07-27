import Module from './decoder/decoder_simd'
import {WORKER_EVENT_TYPE, WORKER_SEND_TYPE} from "./constant";
import MediaCenterInternal from "./mediaCenterInternal";

console.log(`WorkName ${self.name}`);


Module.print = function (text) {
    console.log(`wasm print msg: ${text}`);
}
Module.printErr = function (text) {

    console.log(`wasm print error msg: ${text}`);
}


Module.postRun = function () {

    console.log('avplayer: mediacenter worker start');

    let mcinternal = undefined;

    //recv msg from main thread
    self.onmessage = function (event) {

        var msg = event.data
        switch (msg.cmd) {

            case WORKER_SEND_TYPE.init: {

                mcinternal = new MediaCenterInternal(JSON.parse(msg.options),Module);
                postMessage({cmd: WORKER_EVENT_TYPE.inited});

                break;
            }

            case WORKER_SEND_TYPE.destroy: {

                mcinternal.destroy();
                mcinternal = undefined;

                postMessage({cmd: WORKER_EVENT_TYPE.destroyed});

                break;
            }

        }

    }

    // notify main thread after worker thread  init completely
    postMessage({cmd: WORKER_EVENT_TYPE.created});


}




