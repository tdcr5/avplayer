

class Logger {

    _logEnable = false; 

    constructor() {

    }

    setLogEnable(logEnable) {

        this._logEnable = logEnable;
    }

    info(module, ...args)  {
        if (this._logEnable) {
            console.log(`AVPlayer: [${module}]`, ...args);
        }
    }

    warn (module, ...args) {
        if (this._logEnable) {
            console.warn(`AVPlayer: [${module}]`, ...args);
        }
    }

    error(module, ...args) {
        if (this._logEnable) {
            console.error(`AVPlayer: [${module}]`, ...args);
        }
    }


}

export default Logger;
