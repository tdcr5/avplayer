(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('path'), require('fs'), require('crypto')) :
	typeof define === 'function' && define.amd ? define(['path', 'fs', 'crypto'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.path, global.fs, global.crypto));
})(this, (function (path, fs, crypto$1) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
	var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
	var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto$1);

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var decoder = createCommonjsModule(function (module) {
	  var Module = typeof Module != "undefined" ? Module : {};
	  var moduleOverrides = Object.assign({}, Module);
	  var thisProgram = "./this.program";

	  var ENVIRONMENT_IS_WEB = typeof window == "object";
	  var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
	  var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
	  var scriptDirectory = "";

	  function locateFile(path) {
	    if (Module["locateFile"]) {
	      return Module["locateFile"](path, scriptDirectory);
	    }

	    return scriptDirectory + path;
	  }

	  var read_, readAsync, readBinary;

	  var fs;
	  var nodePath;
	  var requireNodeFS;

	  if (ENVIRONMENT_IS_NODE) {
	    if (ENVIRONMENT_IS_WORKER) {
	      scriptDirectory = path__default["default"].dirname(scriptDirectory) + "/";
	    } else {
	      scriptDirectory = __dirname + "/";
	    }

	    requireNodeFS = () => {
	      if (!nodePath) {
	        fs = fs__default["default"];
	        nodePath = path__default["default"];
	      }
	    };

	    read_ = function shell_read(filename, binary) {
	      requireNodeFS();
	      filename = nodePath["normalize"](filename);
	      return fs.readFileSync(filename, binary ? undefined : "utf8");
	    };

	    readBinary = filename => {
	      var ret = read_(filename, true);

	      if (!ret.buffer) {
	        ret = new Uint8Array(ret);
	      }

	      return ret;
	    };

	    readAsync = (filename, onload, onerror) => {
	      requireNodeFS();
	      filename = nodePath["normalize"](filename);
	      fs.readFile(filename, function (err, data) {
	        if (err) onerror(err);else onload(data.buffer);
	      });
	    };

	    if (process["argv"].length > 1) {
	      thisProgram = process["argv"][1].replace(/\\/g, "/");
	    }

	    process["argv"].slice(2);

	    {
	      module["exports"] = Module;
	    }

	    process["on"]("uncaughtException", function (ex) {
	      if (!(ex instanceof ExitStatus)) {
	        throw ex;
	      }
	    });
	    process["on"]("unhandledRejection", function (reason) {
	      throw reason;
	    });

	    Module["inspect"] = function () {
	      return "[Emscripten Module object]";
	    };
	  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
	    if (ENVIRONMENT_IS_WORKER) {
	      scriptDirectory = self.location.href;
	    } else if (typeof document != "undefined" && document.currentScript) {
	      scriptDirectory = document.currentScript.src;
	    }

	    if (scriptDirectory.indexOf("blob:") !== 0) {
	      scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
	    } else {
	      scriptDirectory = "";
	    }

	    {
	      read_ = url => {
	        var xhr = new XMLHttpRequest();
	        xhr.open("GET", url, false);
	        xhr.send(null);
	        return xhr.responseText;
	      };

	      if (ENVIRONMENT_IS_WORKER) {
	        readBinary = url => {
	          var xhr = new XMLHttpRequest();
	          xhr.open("GET", url, false);
	          xhr.responseType = "arraybuffer";
	          xhr.send(null);
	          return new Uint8Array(xhr.response);
	        };
	      }

	      readAsync = (url, onload, onerror) => {
	        var xhr = new XMLHttpRequest();
	        xhr.open("GET", url, true);
	        xhr.responseType = "arraybuffer";

	        xhr.onload = () => {
	          if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
	            onload(xhr.response);
	            return;
	          }

	          onerror();
	        };

	        xhr.onerror = onerror;
	        xhr.send(null);
	      };
	    }
	  } else ;

	  var out = Module["print"] || console.log.bind(console);
	  var err = Module["printErr"] || console.warn.bind(console);
	  Object.assign(Module, moduleOverrides);
	  moduleOverrides = null;
	  if (Module["arguments"]) Module["arguments"];
	  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
	  if (Module["quit"]) Module["quit"];
	  var POINTER_SIZE = 4;

	  var wasmBinary;
	  if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
	  Module["noExitRuntime"] || true;

	  if (typeof WebAssembly != "object") {
	    abort("no native wasm support detected");
	  }

	  var wasmMemory;
	  var ABORT = false;

	  function assert(condition, text) {
	    if (!condition) {
	      abort(text);
	    }
	  }

	  var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

	  function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
	    var endIdx = idx + maxBytesToRead;
	    var endPtr = idx;

	    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

	    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
	      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
	    } else {
	      var str = "";

	      while (idx < endPtr) {
	        var u0 = heapOrArray[idx++];

	        if (!(u0 & 128)) {
	          str += String.fromCharCode(u0);
	          continue;
	        }

	        var u1 = heapOrArray[idx++] & 63;

	        if ((u0 & 224) == 192) {
	          str += String.fromCharCode((u0 & 31) << 6 | u1);
	          continue;
	        }

	        var u2 = heapOrArray[idx++] & 63;

	        if ((u0 & 240) == 224) {
	          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
	        } else {
	          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
	        }

	        if (u0 < 65536) {
	          str += String.fromCharCode(u0);
	        } else {
	          var ch = u0 - 65536;
	          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
	        }
	      }
	    }

	    return str;
	  }

	  function UTF8ToString(ptr, maxBytesToRead) {
	    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
	  }

	  function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
	    if (!(maxBytesToWrite > 0)) return 0;
	    var startIdx = outIdx;
	    var endIdx = outIdx + maxBytesToWrite - 1;

	    for (var i = 0; i < str.length; ++i) {
	      var u = str.charCodeAt(i);

	      if (u >= 55296 && u <= 57343) {
	        var u1 = str.charCodeAt(++i);
	        u = 65536 + ((u & 1023) << 10) | u1 & 1023;
	      }

	      if (u <= 127) {
	        if (outIdx >= endIdx) break;
	        heap[outIdx++] = u;
	      } else if (u <= 2047) {
	        if (outIdx + 1 >= endIdx) break;
	        heap[outIdx++] = 192 | u >> 6;
	        heap[outIdx++] = 128 | u & 63;
	      } else if (u <= 65535) {
	        if (outIdx + 2 >= endIdx) break;
	        heap[outIdx++] = 224 | u >> 12;
	        heap[outIdx++] = 128 | u >> 6 & 63;
	        heap[outIdx++] = 128 | u & 63;
	      } else {
	        if (outIdx + 3 >= endIdx) break;
	        heap[outIdx++] = 240 | u >> 18;
	        heap[outIdx++] = 128 | u >> 12 & 63;
	        heap[outIdx++] = 128 | u >> 6 & 63;
	        heap[outIdx++] = 128 | u & 63;
	      }
	    }

	    heap[outIdx] = 0;
	    return outIdx - startIdx;
	  }

	  function stringToUTF8(str, outPtr, maxBytesToWrite) {
	    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
	  }

	  function lengthBytesUTF8(str) {
	    var len = 0;

	    for (var i = 0; i < str.length; ++i) {
	      var u = str.charCodeAt(i);
	      if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
	      if (u <= 127) ++len;else if (u <= 2047) len += 2;else if (u <= 65535) len += 3;else len += 4;
	    }

	    return len;
	  }

	  var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;

	  function UTF16ToString(ptr, maxBytesToRead) {
	    var endPtr = ptr;
	    var idx = endPtr >> 1;
	    var maxIdx = idx + maxBytesToRead / 2;

	    while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;

	    endPtr = idx << 1;

	    if (endPtr - ptr > 32 && UTF16Decoder) {
	      return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
	    } else {
	      var str = "";

	      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
	        var codeUnit = HEAP16[ptr + i * 2 >> 1];
	        if (codeUnit == 0) break;
	        str += String.fromCharCode(codeUnit);
	      }

	      return str;
	    }
	  }

	  function stringToUTF16(str, outPtr, maxBytesToWrite) {
	    if (maxBytesToWrite === undefined) {
	      maxBytesToWrite = 2147483647;
	    }

	    if (maxBytesToWrite < 2) return 0;
	    maxBytesToWrite -= 2;
	    var startPtr = outPtr;
	    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;

	    for (var i = 0; i < numCharsToWrite; ++i) {
	      var codeUnit = str.charCodeAt(i);
	      HEAP16[outPtr >> 1] = codeUnit;
	      outPtr += 2;
	    }

	    HEAP16[outPtr >> 1] = 0;
	    return outPtr - startPtr;
	  }

	  function lengthBytesUTF16(str) {
	    return str.length * 2;
	  }

	  function UTF32ToString(ptr, maxBytesToRead) {
	    var i = 0;
	    var str = "";

	    while (!(i >= maxBytesToRead / 4)) {
	      var utf32 = HEAP32[ptr + i * 4 >> 2];
	      if (utf32 == 0) break;
	      ++i;

	      if (utf32 >= 65536) {
	        var ch = utf32 - 65536;
	        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
	      } else {
	        str += String.fromCharCode(utf32);
	      }
	    }

	    return str;
	  }

	  function stringToUTF32(str, outPtr, maxBytesToWrite) {
	    if (maxBytesToWrite === undefined) {
	      maxBytesToWrite = 2147483647;
	    }

	    if (maxBytesToWrite < 4) return 0;
	    var startPtr = outPtr;
	    var endPtr = startPtr + maxBytesToWrite - 4;

	    for (var i = 0; i < str.length; ++i) {
	      var codeUnit = str.charCodeAt(i);

	      if (codeUnit >= 55296 && codeUnit <= 57343) {
	        var trailSurrogate = str.charCodeAt(++i);
	        codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
	      }

	      HEAP32[outPtr >> 2] = codeUnit;
	      outPtr += 4;
	      if (outPtr + 4 > endPtr) break;
	    }

	    HEAP32[outPtr >> 2] = 0;
	    return outPtr - startPtr;
	  }

	  function lengthBytesUTF32(str) {
	    var len = 0;

	    for (var i = 0; i < str.length; ++i) {
	      var codeUnit = str.charCodeAt(i);
	      if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
	      len += 4;
	    }

	    return len;
	  }

	  function writeAsciiToMemory(str, buffer, dontAddNull) {
	    for (var i = 0; i < str.length; ++i) {
	      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
	    }

	    if (!dontAddNull) HEAP8[buffer >> 0] = 0;
	  }

	  var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

	  function updateGlobalBufferAndViews(buf) {
	    buffer = buf;
	    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
	    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
	    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
	    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
	    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
	    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
	    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
	    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
	  }

	  Module["INITIAL_MEMORY"] || 536870912;
	  var wasmTable;
	  var __ATPRERUN__ = [];
	  var __ATINIT__ = [];
	  var __ATPOSTRUN__ = [];

	  function preRun() {
	    if (Module["preRun"]) {
	      if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];

	      while (Module["preRun"].length) {
	        addOnPreRun(Module["preRun"].shift());
	      }
	    }

	    callRuntimeCallbacks(__ATPRERUN__);
	  }

	  function initRuntime() {
	    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
	    FS.ignorePermissions = false;
	    callRuntimeCallbacks(__ATINIT__);
	  }

	  function postRun() {
	    if (Module["postRun"]) {
	      if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];

	      while (Module["postRun"].length) {
	        addOnPostRun(Module["postRun"].shift());
	      }
	    }

	    callRuntimeCallbacks(__ATPOSTRUN__);
	  }

	  function addOnPreRun(cb) {
	    __ATPRERUN__.unshift(cb);
	  }

	  function addOnInit(cb) {
	    __ATINIT__.unshift(cb);
	  }

	  function addOnPostRun(cb) {
	    __ATPOSTRUN__.unshift(cb);
	  }

	  var runDependencies = 0;
	  var dependenciesFulfilled = null;

	  function getUniqueRunDependency(id) {
	    return id;
	  }

	  function addRunDependency(id) {
	    runDependencies++;

	    if (Module["monitorRunDependencies"]) {
	      Module["monitorRunDependencies"](runDependencies);
	    }
	  }

	  function removeRunDependency(id) {
	    runDependencies--;

	    if (Module["monitorRunDependencies"]) {
	      Module["monitorRunDependencies"](runDependencies);
	    }

	    if (runDependencies == 0) {

	      if (dependenciesFulfilled) {
	        var callback = dependenciesFulfilled;
	        dependenciesFulfilled = null;
	        callback();
	      }
	    }
	  }

	  function abort(what) {
	    {
	      if (Module["onAbort"]) {
	        Module["onAbort"](what);
	      }
	    }
	    what = "Aborted(" + what + ")";
	    err(what);
	    ABORT = true;
	    what += ". Build with -sASSERTIONS for more info.";
	    var e = new WebAssembly.RuntimeError(what);
	    throw e;
	  }

	  var dataURIPrefix = "data:application/octet-stream;base64,";

	  function isDataURI(filename) {
	    return filename.startsWith(dataURIPrefix);
	  }

	  function isFileURI(filename) {
	    return filename.startsWith("file://");
	  }

	  var wasmBinaryFile;
	  wasmBinaryFile = "decoder.wasm";

	  if (!isDataURI(wasmBinaryFile)) {
	    wasmBinaryFile = locateFile(wasmBinaryFile);
	  }

	  function getBinary(file) {
	    try {
	      if (file == wasmBinaryFile && wasmBinary) {
	        return new Uint8Array(wasmBinary);
	      }

	      if (readBinary) {
	        return readBinary(file);
	      } else {
	        throw "both async and sync fetching of the wasm failed";
	      }
	    } catch (err) {
	      abort(err);
	    }
	  }

	  function getBinaryPromise() {
	    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
	      if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
	        return fetch(wasmBinaryFile, {
	          credentials: "same-origin"
	        }).then(function (response) {
	          if (!response["ok"]) {
	            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
	          }

	          return response["arrayBuffer"]();
	        }).catch(function () {
	          return getBinary(wasmBinaryFile);
	        });
	      } else {
	        if (readAsync) {
	          return new Promise(function (resolve, reject) {
	            readAsync(wasmBinaryFile, function (response) {
	              resolve(new Uint8Array(response));
	            }, reject);
	          });
	        }
	      }
	    }

	    return Promise.resolve().then(function () {
	      return getBinary(wasmBinaryFile);
	    });
	  }

	  function createWasm() {
	    var info = {
	      "a": asmLibraryArg
	    };

	    function receiveInstance(instance, module) {
	      var exports = instance.exports;
	      Module["asm"] = exports;
	      wasmMemory = Module["asm"]["D"];
	      updateGlobalBufferAndViews(wasmMemory.buffer);
	      wasmTable = Module["asm"]["H"];
	      addOnInit(Module["asm"]["E"]);
	      removeRunDependency();
	    }

	    addRunDependency();

	    function receiveInstantiationResult(result) {
	      receiveInstance(result["instance"]);
	    }

	    function instantiateArrayBuffer(receiver) {
	      return getBinaryPromise().then(function (binary) {
	        return WebAssembly.instantiate(binary, info);
	      }).then(function (instance) {
	        return instance;
	      }).then(receiver, function (reason) {
	        err("failed to asynchronously prepare wasm: " + reason);
	        abort(reason);
	      });
	    }

	    function instantiateAsync() {
	      if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
	        return fetch(wasmBinaryFile, {
	          credentials: "same-origin"
	        }).then(function (response) {
	          var result = WebAssembly.instantiateStreaming(response, info);
	          return result.then(receiveInstantiationResult, function (reason) {
	            err("wasm streaming compile failed: " + reason);
	            err("falling back to ArrayBuffer instantiation");
	            return instantiateArrayBuffer(receiveInstantiationResult);
	          });
	        });
	      } else {
	        return instantiateArrayBuffer(receiveInstantiationResult);
	      }
	    }

	    if (Module["instantiateWasm"]) {
	      try {
	        var exports = Module["instantiateWasm"](info, receiveInstance);
	        return exports;
	      } catch (e) {
	        err("Module.instantiateWasm callback failed with error: " + e);
	        return false;
	      }
	    }

	    instantiateAsync();
	    return {};
	  }

	  var tempDouble;
	  var tempI64;

	  function callRuntimeCallbacks(callbacks) {
	    while (callbacks.length > 0) {
	      callbacks.shift()(Module);
	    }
	  }

	  function getWasmTableEntry(funcPtr) {
	    return wasmTable.get(funcPtr);
	  }

	  function setErrNo(value) {
	    HEAP32[___errno_location() >> 2] = value;
	    return value;
	  }

	  var PATH = {
	    isAbs: path => path.charAt(0) === "/",
	    splitPath: filename => {
	      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	      return splitPathRe.exec(filename).slice(1);
	    },
	    normalizeArray: (parts, allowAboveRoot) => {
	      var up = 0;

	      for (var i = parts.length - 1; i >= 0; i--) {
	        var last = parts[i];

	        if (last === ".") {
	          parts.splice(i, 1);
	        } else if (last === "..") {
	          parts.splice(i, 1);
	          up++;
	        } else if (up) {
	          parts.splice(i, 1);
	          up--;
	        }
	      }

	      if (allowAboveRoot) {
	        for (; up; up--) {
	          parts.unshift("..");
	        }
	      }

	      return parts;
	    },
	    normalize: path => {
	      var isAbsolute = PATH.isAbs(path),
	          trailingSlash = path.substr(-1) === "/";
	      path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");

	      if (!path && !isAbsolute) {
	        path = ".";
	      }

	      if (path && trailingSlash) {
	        path += "/";
	      }

	      return (isAbsolute ? "/" : "") + path;
	    },
	    dirname: path => {
	      var result = PATH.splitPath(path),
	          root = result[0],
	          dir = result[1];

	      if (!root && !dir) {
	        return ".";
	      }

	      if (dir) {
	        dir = dir.substr(0, dir.length - 1);
	      }

	      return root + dir;
	    },
	    basename: path => {
	      if (path === "/") return "/";
	      path = PATH.normalize(path);
	      path = path.replace(/\/$/, "");
	      var lastSlash = path.lastIndexOf("/");
	      if (lastSlash === -1) return path;
	      return path.substr(lastSlash + 1);
	    },
	    join: function () {
	      var paths = Array.prototype.slice.call(arguments, 0);
	      return PATH.normalize(paths.join("/"));
	    },
	    join2: (l, r) => {
	      return PATH.normalize(l + "/" + r);
	    }
	  };

	  function getRandomDevice() {
	    if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
	      var randomBuffer = new Uint8Array(1);
	      return function () {
	        crypto.getRandomValues(randomBuffer);
	        return randomBuffer[0];
	      };
	    } else if (ENVIRONMENT_IS_NODE) {
	      try {
	        var crypto_module = crypto__default["default"];
	        return function () {
	          return crypto_module["randomBytes"](1)[0];
	        };
	      } catch (e) {}
	    }

	    return function () {
	      abort("randomDevice");
	    };
	  }

	  var PATH_FS = {
	    resolve: function () {
	      var resolvedPath = "",
	          resolvedAbsolute = false;

	      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	        var path = i >= 0 ? arguments[i] : FS.cwd();

	        if (typeof path != "string") {
	          throw new TypeError("Arguments to path.resolve must be strings");
	        } else if (!path) {
	          return "";
	        }

	        resolvedPath = path + "/" + resolvedPath;
	        resolvedAbsolute = PATH.isAbs(path);
	      }

	      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
	      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
	    },
	    relative: (from, to) => {
	      from = PATH_FS.resolve(from).substr(1);
	      to = PATH_FS.resolve(to).substr(1);

	      function trim(arr) {
	        var start = 0;

	        for (; start < arr.length; start++) {
	          if (arr[start] !== "") break;
	        }

	        var end = arr.length - 1;

	        for (; end >= 0; end--) {
	          if (arr[end] !== "") break;
	        }

	        if (start > end) return [];
	        return arr.slice(start, end - start + 1);
	      }

	      var fromParts = trim(from.split("/"));
	      var toParts = trim(to.split("/"));
	      var length = Math.min(fromParts.length, toParts.length);
	      var samePartsLength = length;

	      for (var i = 0; i < length; i++) {
	        if (fromParts[i] !== toParts[i]) {
	          samePartsLength = i;
	          break;
	        }
	      }

	      var outputParts = [];

	      for (var i = samePartsLength; i < fromParts.length; i++) {
	        outputParts.push("..");
	      }

	      outputParts = outputParts.concat(toParts.slice(samePartsLength));
	      return outputParts.join("/");
	    }
	  };
	  var TTY = {
	    ttys: [],
	    init: function () {},
	    shutdown: function () {},
	    register: function (dev, ops) {
	      TTY.ttys[dev] = {
	        input: [],
	        output: [],
	        ops: ops
	      };
	      FS.registerDevice(dev, TTY.stream_ops);
	    },
	    stream_ops: {
	      open: function (stream) {
	        var tty = TTY.ttys[stream.node.rdev];

	        if (!tty) {
	          throw new FS.ErrnoError(43);
	        }

	        stream.tty = tty;
	        stream.seekable = false;
	      },
	      close: function (stream) {
	        stream.tty.ops.flush(stream.tty);
	      },
	      flush: function (stream) {
	        stream.tty.ops.flush(stream.tty);
	      },
	      read: function (stream, buffer, offset, length, pos) {
	        if (!stream.tty || !stream.tty.ops.get_char) {
	          throw new FS.ErrnoError(60);
	        }

	        var bytesRead = 0;

	        for (var i = 0; i < length; i++) {
	          var result;

	          try {
	            result = stream.tty.ops.get_char(stream.tty);
	          } catch (e) {
	            throw new FS.ErrnoError(29);
	          }

	          if (result === undefined && bytesRead === 0) {
	            throw new FS.ErrnoError(6);
	          }

	          if (result === null || result === undefined) break;
	          bytesRead++;
	          buffer[offset + i] = result;
	        }

	        if (bytesRead) {
	          stream.node.timestamp = Date.now();
	        }

	        return bytesRead;
	      },
	      write: function (stream, buffer, offset, length, pos) {
	        if (!stream.tty || !stream.tty.ops.put_char) {
	          throw new FS.ErrnoError(60);
	        }

	        try {
	          for (var i = 0; i < length; i++) {
	            stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
	          }
	        } catch (e) {
	          throw new FS.ErrnoError(29);
	        }

	        if (length) {
	          stream.node.timestamp = Date.now();
	        }

	        return i;
	      }
	    },
	    default_tty_ops: {
	      get_char: function (tty) {
	        if (!tty.input.length) {
	          var result = null;

	          if (ENVIRONMENT_IS_NODE) {
	            var BUFSIZE = 256;
	            var buf = Buffer.alloc(BUFSIZE);
	            var bytesRead = 0;

	            try {
	              bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
	            } catch (e) {
	              if (e.toString().includes("EOF")) bytesRead = 0;else throw e;
	            }

	            if (bytesRead > 0) {
	              result = buf.slice(0, bytesRead).toString("utf-8");
	            } else {
	              result = null;
	            }
	          } else if (typeof window != "undefined" && typeof window.prompt == "function") {
	            result = window.prompt("Input: ");

	            if (result !== null) {
	              result += "\n";
	            }
	          } else if (typeof readline == "function") {
	            result = readline();

	            if (result !== null) {
	              result += "\n";
	            }
	          }

	          if (!result) {
	            return null;
	          }

	          tty.input = intArrayFromString(result, true);
	        }

	        return tty.input.shift();
	      },
	      put_char: function (tty, val) {
	        if (val === null || val === 10) {
	          out(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        } else {
	          if (val != 0) tty.output.push(val);
	        }
	      },
	      flush: function (tty) {
	        if (tty.output && tty.output.length > 0) {
	          out(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        }
	      }
	    },
	    default_tty1_ops: {
	      put_char: function (tty, val) {
	        if (val === null || val === 10) {
	          err(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        } else {
	          if (val != 0) tty.output.push(val);
	        }
	      },
	      flush: function (tty) {
	        if (tty.output && tty.output.length > 0) {
	          err(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        }
	      }
	    }
	  };

	  function zeroMemory(address, size) {
	    HEAPU8.fill(0, address, address + size);
	  }

	  function alignMemory(size, alignment) {
	    return Math.ceil(size / alignment) * alignment;
	  }

	  function mmapAlloc(size) {
	    size = alignMemory(size, 65536);

	    var ptr = _emscripten_builtin_memalign(65536, size);

	    if (!ptr) return 0;
	    zeroMemory(ptr, size);
	    return ptr;
	  }

	  var MEMFS = {
	    ops_table: null,
	    mount: function (mount) {
	      return MEMFS.createNode(null, "/", 16384 | 511, 0);
	    },
	    createNode: function (parent, name, mode, dev) {
	      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
	        throw new FS.ErrnoError(63);
	      }

	      if (!MEMFS.ops_table) {
	        MEMFS.ops_table = {
	          dir: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr,
	              lookup: MEMFS.node_ops.lookup,
	              mknod: MEMFS.node_ops.mknod,
	              rename: MEMFS.node_ops.rename,
	              unlink: MEMFS.node_ops.unlink,
	              rmdir: MEMFS.node_ops.rmdir,
	              readdir: MEMFS.node_ops.readdir,
	              symlink: MEMFS.node_ops.symlink
	            },
	            stream: {
	              llseek: MEMFS.stream_ops.llseek
	            }
	          },
	          file: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr
	            },
	            stream: {
	              llseek: MEMFS.stream_ops.llseek,
	              read: MEMFS.stream_ops.read,
	              write: MEMFS.stream_ops.write,
	              allocate: MEMFS.stream_ops.allocate,
	              mmap: MEMFS.stream_ops.mmap,
	              msync: MEMFS.stream_ops.msync
	            }
	          },
	          link: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr,
	              readlink: MEMFS.node_ops.readlink
	            },
	            stream: {}
	          },
	          chrdev: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr
	            },
	            stream: FS.chrdev_stream_ops
	          }
	        };
	      }

	      var node = FS.createNode(parent, name, mode, dev);

	      if (FS.isDir(node.mode)) {
	        node.node_ops = MEMFS.ops_table.dir.node;
	        node.stream_ops = MEMFS.ops_table.dir.stream;
	        node.contents = {};
	      } else if (FS.isFile(node.mode)) {
	        node.node_ops = MEMFS.ops_table.file.node;
	        node.stream_ops = MEMFS.ops_table.file.stream;
	        node.usedBytes = 0;
	        node.contents = null;
	      } else if (FS.isLink(node.mode)) {
	        node.node_ops = MEMFS.ops_table.link.node;
	        node.stream_ops = MEMFS.ops_table.link.stream;
	      } else if (FS.isChrdev(node.mode)) {
	        node.node_ops = MEMFS.ops_table.chrdev.node;
	        node.stream_ops = MEMFS.ops_table.chrdev.stream;
	      }

	      node.timestamp = Date.now();

	      if (parent) {
	        parent.contents[name] = node;
	        parent.timestamp = node.timestamp;
	      }

	      return node;
	    },
	    getFileDataAsTypedArray: function (node) {
	      if (!node.contents) return new Uint8Array(0);
	      if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
	      return new Uint8Array(node.contents);
	    },
	    expandFileStorage: function (node, newCapacity) {
	      var prevCapacity = node.contents ? node.contents.length : 0;
	      if (prevCapacity >= newCapacity) return;
	      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
	      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
	      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
	      var oldContents = node.contents;
	      node.contents = new Uint8Array(newCapacity);
	      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
	    },
	    resizeFileStorage: function (node, newSize) {
	      if (node.usedBytes == newSize) return;

	      if (newSize == 0) {
	        node.contents = null;
	        node.usedBytes = 0;
	      } else {
	        var oldContents = node.contents;
	        node.contents = new Uint8Array(newSize);

	        if (oldContents) {
	          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
	        }

	        node.usedBytes = newSize;
	      }
	    },
	    node_ops: {
	      getattr: function (node) {
	        var attr = {};
	        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
	        attr.ino = node.id;
	        attr.mode = node.mode;
	        attr.nlink = 1;
	        attr.uid = 0;
	        attr.gid = 0;
	        attr.rdev = node.rdev;

	        if (FS.isDir(node.mode)) {
	          attr.size = 4096;
	        } else if (FS.isFile(node.mode)) {
	          attr.size = node.usedBytes;
	        } else if (FS.isLink(node.mode)) {
	          attr.size = node.link.length;
	        } else {
	          attr.size = 0;
	        }

	        attr.atime = new Date(node.timestamp);
	        attr.mtime = new Date(node.timestamp);
	        attr.ctime = new Date(node.timestamp);
	        attr.blksize = 4096;
	        attr.blocks = Math.ceil(attr.size / attr.blksize);
	        return attr;
	      },
	      setattr: function (node, attr) {
	        if (attr.mode !== undefined) {
	          node.mode = attr.mode;
	        }

	        if (attr.timestamp !== undefined) {
	          node.timestamp = attr.timestamp;
	        }

	        if (attr.size !== undefined) {
	          MEMFS.resizeFileStorage(node, attr.size);
	        }
	      },
	      lookup: function (parent, name) {
	        throw FS.genericErrors[44];
	      },
	      mknod: function (parent, name, mode, dev) {
	        return MEMFS.createNode(parent, name, mode, dev);
	      },
	      rename: function (old_node, new_dir, new_name) {
	        if (FS.isDir(old_node.mode)) {
	          var new_node;

	          try {
	            new_node = FS.lookupNode(new_dir, new_name);
	          } catch (e) {}

	          if (new_node) {
	            for (var i in new_node.contents) {
	              throw new FS.ErrnoError(55);
	            }
	          }
	        }

	        delete old_node.parent.contents[old_node.name];
	        old_node.parent.timestamp = Date.now();
	        old_node.name = new_name;
	        new_dir.contents[new_name] = old_node;
	        new_dir.timestamp = old_node.parent.timestamp;
	        old_node.parent = new_dir;
	      },
	      unlink: function (parent, name) {
	        delete parent.contents[name];
	        parent.timestamp = Date.now();
	      },
	      rmdir: function (parent, name) {
	        var node = FS.lookupNode(parent, name);

	        for (var i in node.contents) {
	          throw new FS.ErrnoError(55);
	        }

	        delete parent.contents[name];
	        parent.timestamp = Date.now();
	      },
	      readdir: function (node) {
	        var entries = [".", ".."];

	        for (var key in node.contents) {
	          if (!node.contents.hasOwnProperty(key)) {
	            continue;
	          }

	          entries.push(key);
	        }

	        return entries;
	      },
	      symlink: function (parent, newname, oldpath) {
	        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
	        node.link = oldpath;
	        return node;
	      },
	      readlink: function (node) {
	        if (!FS.isLink(node.mode)) {
	          throw new FS.ErrnoError(28);
	        }

	        return node.link;
	      }
	    },
	    stream_ops: {
	      read: function (stream, buffer, offset, length, position) {
	        var contents = stream.node.contents;
	        if (position >= stream.node.usedBytes) return 0;
	        var size = Math.min(stream.node.usedBytes - position, length);

	        if (size > 8 && contents.subarray) {
	          buffer.set(contents.subarray(position, position + size), offset);
	        } else {
	          for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
	        }

	        return size;
	      },
	      write: function (stream, buffer, offset, length, position, canOwn) {
	        if (!length) return 0;
	        var node = stream.node;
	        node.timestamp = Date.now();

	        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
	          if (canOwn) {
	            node.contents = buffer.subarray(offset, offset + length);
	            node.usedBytes = length;
	            return length;
	          } else if (node.usedBytes === 0 && position === 0) {
	            node.contents = buffer.slice(offset, offset + length);
	            node.usedBytes = length;
	            return length;
	          } else if (position + length <= node.usedBytes) {
	            node.contents.set(buffer.subarray(offset, offset + length), position);
	            return length;
	          }
	        }

	        MEMFS.expandFileStorage(node, position + length);

	        if (node.contents.subarray && buffer.subarray) {
	          node.contents.set(buffer.subarray(offset, offset + length), position);
	        } else {
	          for (var i = 0; i < length; i++) {
	            node.contents[position + i] = buffer[offset + i];
	          }
	        }

	        node.usedBytes = Math.max(node.usedBytes, position + length);
	        return length;
	      },
	      llseek: function (stream, offset, whence) {
	        var position = offset;

	        if (whence === 1) {
	          position += stream.position;
	        } else if (whence === 2) {
	          if (FS.isFile(stream.node.mode)) {
	            position += stream.node.usedBytes;
	          }
	        }

	        if (position < 0) {
	          throw new FS.ErrnoError(28);
	        }

	        return position;
	      },
	      allocate: function (stream, offset, length) {
	        MEMFS.expandFileStorage(stream.node, offset + length);
	        stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
	      },
	      mmap: function (stream, length, position, prot, flags) {
	        if (!FS.isFile(stream.node.mode)) {
	          throw new FS.ErrnoError(43);
	        }

	        var ptr;
	        var allocated;
	        var contents = stream.node.contents;

	        if (!(flags & 2) && contents.buffer === buffer) {
	          allocated = false;
	          ptr = contents.byteOffset;
	        } else {
	          if (position > 0 || position + length < contents.length) {
	            if (contents.subarray) {
	              contents = contents.subarray(position, position + length);
	            } else {
	              contents = Array.prototype.slice.call(contents, position, position + length);
	            }
	          }

	          allocated = true;
	          ptr = mmapAlloc(length);

	          if (!ptr) {
	            throw new FS.ErrnoError(48);
	          }

	          HEAP8.set(contents, ptr);
	        }

	        return {
	          ptr: ptr,
	          allocated: allocated
	        };
	      },
	      msync: function (stream, buffer, offset, length, mmapFlags) {
	        if (!FS.isFile(stream.node.mode)) {
	          throw new FS.ErrnoError(43);
	        }

	        if (mmapFlags & 2) {
	          return 0;
	        }

	        MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
	        return 0;
	      }
	    }
	  };

	  function asyncLoad(url, onload, onerror, noRunDep) {
	    var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
	    readAsync(url, function (arrayBuffer) {
	      assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
	      onload(new Uint8Array(arrayBuffer));
	      if (dep) removeRunDependency();
	    }, function (event) {
	      if (onerror) {
	        onerror();
	      } else {
	        throw 'Loading data file "' + url + '" failed.';
	      }
	    });
	    if (dep) addRunDependency();
	  }

	  var FS = {
	    root: null,
	    mounts: [],
	    devices: {},
	    streams: [],
	    nextInode: 1,
	    nameTable: null,
	    currentPath: "/",
	    initialized: false,
	    ignorePermissions: true,
	    ErrnoError: null,
	    genericErrors: {},
	    filesystems: null,
	    syncFSRequests: 0,
	    lookupPath: function (path) {
	      let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      path = PATH_FS.resolve(FS.cwd(), path);
	      if (!path) return {
	        path: "",
	        node: null
	      };
	      var defaults = {
	        follow_mount: true,
	        recurse_count: 0
	      };
	      opts = Object.assign(defaults, opts);

	      if (opts.recurse_count > 8) {
	        throw new FS.ErrnoError(32);
	      }

	      var parts = PATH.normalizeArray(path.split("/").filter(p => !!p), false);
	      var current = FS.root;
	      var current_path = "/";

	      for (var i = 0; i < parts.length; i++) {
	        var islast = i === parts.length - 1;

	        if (islast && opts.parent) {
	          break;
	        }

	        current = FS.lookupNode(current, parts[i]);
	        current_path = PATH.join2(current_path, parts[i]);

	        if (FS.isMountpoint(current)) {
	          if (!islast || islast && opts.follow_mount) {
	            current = current.mounted.root;
	          }
	        }

	        if (!islast || opts.follow) {
	          var count = 0;

	          while (FS.isLink(current.mode)) {
	            var link = FS.readlink(current_path);
	            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
	            var lookup = FS.lookupPath(current_path, {
	              recurse_count: opts.recurse_count + 1
	            });
	            current = lookup.node;

	            if (count++ > 40) {
	              throw new FS.ErrnoError(32);
	            }
	          }
	        }
	      }

	      return {
	        path: current_path,
	        node: current
	      };
	    },
	    getPath: node => {
	      var path;

	      while (true) {
	        if (FS.isRoot(node)) {
	          var mount = node.mount.mountpoint;
	          if (!path) return mount;
	          return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
	        }

	        path = path ? node.name + "/" + path : node.name;
	        node = node.parent;
	      }
	    },
	    hashName: (parentid, name) => {
	      var hash = 0;

	      for (var i = 0; i < name.length; i++) {
	        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
	      }

	      return (parentid + hash >>> 0) % FS.nameTable.length;
	    },
	    hashAddNode: node => {
	      var hash = FS.hashName(node.parent.id, node.name);
	      node.name_next = FS.nameTable[hash];
	      FS.nameTable[hash] = node;
	    },
	    hashRemoveNode: node => {
	      var hash = FS.hashName(node.parent.id, node.name);

	      if (FS.nameTable[hash] === node) {
	        FS.nameTable[hash] = node.name_next;
	      } else {
	        var current = FS.nameTable[hash];

	        while (current) {
	          if (current.name_next === node) {
	            current.name_next = node.name_next;
	            break;
	          }

	          current = current.name_next;
	        }
	      }
	    },
	    lookupNode: (parent, name) => {
	      var errCode = FS.mayLookup(parent);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode, parent);
	      }

	      var hash = FS.hashName(parent.id, name);

	      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
	        var nodeName = node.name;

	        if (node.parent.id === parent.id && nodeName === name) {
	          return node;
	        }
	      }

	      return FS.lookup(parent, name);
	    },
	    createNode: (parent, name, mode, rdev) => {
	      var node = new FS.FSNode(parent, name, mode, rdev);
	      FS.hashAddNode(node);
	      return node;
	    },
	    destroyNode: node => {
	      FS.hashRemoveNode(node);
	    },
	    isRoot: node => {
	      return node === node.parent;
	    },
	    isMountpoint: node => {
	      return !!node.mounted;
	    },
	    isFile: mode => {
	      return (mode & 61440) === 32768;
	    },
	    isDir: mode => {
	      return (mode & 61440) === 16384;
	    },
	    isLink: mode => {
	      return (mode & 61440) === 40960;
	    },
	    isChrdev: mode => {
	      return (mode & 61440) === 8192;
	    },
	    isBlkdev: mode => {
	      return (mode & 61440) === 24576;
	    },
	    isFIFO: mode => {
	      return (mode & 61440) === 4096;
	    },
	    isSocket: mode => {
	      return (mode & 49152) === 49152;
	    },
	    flagModes: {
	      "r": 0,
	      "r+": 2,
	      "w": 577,
	      "w+": 578,
	      "a": 1089,
	      "a+": 1090
	    },
	    modeStringToFlags: str => {
	      var flags = FS.flagModes[str];

	      if (typeof flags == "undefined") {
	        throw new Error("Unknown file open mode: " + str);
	      }

	      return flags;
	    },
	    flagsToPermissionString: flag => {
	      var perms = ["r", "w", "rw"][flag & 3];

	      if (flag & 512) {
	        perms += "w";
	      }

	      return perms;
	    },
	    nodePermissions: (node, perms) => {
	      if (FS.ignorePermissions) {
	        return 0;
	      }

	      if (perms.includes("r") && !(node.mode & 292)) {
	        return 2;
	      } else if (perms.includes("w") && !(node.mode & 146)) {
	        return 2;
	      } else if (perms.includes("x") && !(node.mode & 73)) {
	        return 2;
	      }

	      return 0;
	    },
	    mayLookup: dir => {
	      var errCode = FS.nodePermissions(dir, "x");
	      if (errCode) return errCode;
	      if (!dir.node_ops.lookup) return 2;
	      return 0;
	    },
	    mayCreate: (dir, name) => {
	      try {
	        var node = FS.lookupNode(dir, name);
	        return 20;
	      } catch (e) {}

	      return FS.nodePermissions(dir, "wx");
	    },
	    mayDelete: (dir, name, isdir) => {
	      var node;

	      try {
	        node = FS.lookupNode(dir, name);
	      } catch (e) {
	        return e.errno;
	      }

	      var errCode = FS.nodePermissions(dir, "wx");

	      if (errCode) {
	        return errCode;
	      }

	      if (isdir) {
	        if (!FS.isDir(node.mode)) {
	          return 54;
	        }

	        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
	          return 10;
	        }
	      } else {
	        if (FS.isDir(node.mode)) {
	          return 31;
	        }
	      }

	      return 0;
	    },
	    mayOpen: (node, flags) => {
	      if (!node) {
	        return 44;
	      }

	      if (FS.isLink(node.mode)) {
	        return 32;
	      } else if (FS.isDir(node.mode)) {
	        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
	          return 31;
	        }
	      }

	      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
	    },
	    MAX_OPEN_FDS: 4096,
	    nextfd: function () {
	      let fd_start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	      let fd_end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : FS.MAX_OPEN_FDS;

	      for (var fd = fd_start; fd <= fd_end; fd++) {
	        if (!FS.streams[fd]) {
	          return fd;
	        }
	      }

	      throw new FS.ErrnoError(33);
	    },
	    getStream: fd => FS.streams[fd],
	    createStream: (stream, fd_start, fd_end) => {
	      if (!FS.FSStream) {
	        FS.FSStream = function () {
	          this.shared = {};
	        };

	        FS.FSStream.prototype = {};
	        Object.defineProperties(FS.FSStream.prototype, {
	          object: {
	            get: function () {
	              return this.node;
	            },
	            set: function (val) {
	              this.node = val;
	            }
	          },
	          isRead: {
	            get: function () {
	              return (this.flags & 2097155) !== 1;
	            }
	          },
	          isWrite: {
	            get: function () {
	              return (this.flags & 2097155) !== 0;
	            }
	          },
	          isAppend: {
	            get: function () {
	              return this.flags & 1024;
	            }
	          },
	          flags: {
	            get: function () {
	              return this.shared.flags;
	            },
	            set: function (val) {
	              this.shared.flags = val;
	            }
	          },
	          position: {
	            get: function () {
	              return this.shared.position;
	            },
	            set: function (val) {
	              this.shared.position = val;
	            }
	          }
	        });
	      }

	      stream = Object.assign(new FS.FSStream(), stream);
	      var fd = FS.nextfd(fd_start, fd_end);
	      stream.fd = fd;
	      FS.streams[fd] = stream;
	      return stream;
	    },
	    closeStream: fd => {
	      FS.streams[fd] = null;
	    },
	    chrdev_stream_ops: {
	      open: stream => {
	        var device = FS.getDevice(stream.node.rdev);
	        stream.stream_ops = device.stream_ops;

	        if (stream.stream_ops.open) {
	          stream.stream_ops.open(stream);
	        }
	      },
	      llseek: () => {
	        throw new FS.ErrnoError(70);
	      }
	    },
	    major: dev => dev >> 8,
	    minor: dev => dev & 255,
	    makedev: (ma, mi) => ma << 8 | mi,
	    registerDevice: (dev, ops) => {
	      FS.devices[dev] = {
	        stream_ops: ops
	      };
	    },
	    getDevice: dev => FS.devices[dev],
	    getMounts: mount => {
	      var mounts = [];
	      var check = [mount];

	      while (check.length) {
	        var m = check.pop();
	        mounts.push(m);
	        check.push.apply(check, m.mounts);
	      }

	      return mounts;
	    },
	    syncfs: (populate, callback) => {
	      if (typeof populate == "function") {
	        callback = populate;
	        populate = false;
	      }

	      FS.syncFSRequests++;

	      if (FS.syncFSRequests > 1) {
	        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
	      }

	      var mounts = FS.getMounts(FS.root.mount);
	      var completed = 0;

	      function doCallback(errCode) {
	        FS.syncFSRequests--;
	        return callback(errCode);
	      }

	      function done(errCode) {
	        if (errCode) {
	          if (!done.errored) {
	            done.errored = true;
	            return doCallback(errCode);
	          }

	          return;
	        }

	        if (++completed >= mounts.length) {
	          doCallback(null);
	        }
	      }

	      mounts.forEach(mount => {
	        if (!mount.type.syncfs) {
	          return done(null);
	        }

	        mount.type.syncfs(mount, populate, done);
	      });
	    },
	    mount: (type, opts, mountpoint) => {
	      var root = mountpoint === "/";
	      var pseudo = !mountpoint;
	      var node;

	      if (root && FS.root) {
	        throw new FS.ErrnoError(10);
	      } else if (!root && !pseudo) {
	        var lookup = FS.lookupPath(mountpoint, {
	          follow_mount: false
	        });
	        mountpoint = lookup.path;
	        node = lookup.node;

	        if (FS.isMountpoint(node)) {
	          throw new FS.ErrnoError(10);
	        }

	        if (!FS.isDir(node.mode)) {
	          throw new FS.ErrnoError(54);
	        }
	      }

	      var mount = {
	        type: type,
	        opts: opts,
	        mountpoint: mountpoint,
	        mounts: []
	      };
	      var mountRoot = type.mount(mount);
	      mountRoot.mount = mount;
	      mount.root = mountRoot;

	      if (root) {
	        FS.root = mountRoot;
	      } else if (node) {
	        node.mounted = mount;

	        if (node.mount) {
	          node.mount.mounts.push(mount);
	        }
	      }

	      return mountRoot;
	    },
	    unmount: mountpoint => {
	      var lookup = FS.lookupPath(mountpoint, {
	        follow_mount: false
	      });

	      if (!FS.isMountpoint(lookup.node)) {
	        throw new FS.ErrnoError(28);
	      }

	      var node = lookup.node;
	      var mount = node.mounted;
	      var mounts = FS.getMounts(mount);
	      Object.keys(FS.nameTable).forEach(hash => {
	        var current = FS.nameTable[hash];

	        while (current) {
	          var next = current.name_next;

	          if (mounts.includes(current.mount)) {
	            FS.destroyNode(current);
	          }

	          current = next;
	        }
	      });
	      node.mounted = null;
	      var idx = node.mount.mounts.indexOf(mount);
	      node.mount.mounts.splice(idx, 1);
	    },
	    lookup: (parent, name) => {
	      return parent.node_ops.lookup(parent, name);
	    },
	    mknod: (path, mode, dev) => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;
	      var name = PATH.basename(path);

	      if (!name || name === "." || name === "..") {
	        throw new FS.ErrnoError(28);
	      }

	      var errCode = FS.mayCreate(parent, name);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.mknod) {
	        throw new FS.ErrnoError(63);
	      }

	      return parent.node_ops.mknod(parent, name, mode, dev);
	    },
	    create: (path, mode) => {
	      mode = mode !== undefined ? mode : 438;
	      mode &= 4095;
	      mode |= 32768;
	      return FS.mknod(path, mode, 0);
	    },
	    mkdir: (path, mode) => {
	      mode = mode !== undefined ? mode : 511;
	      mode &= 511 | 512;
	      mode |= 16384;
	      return FS.mknod(path, mode, 0);
	    },
	    mkdirTree: (path, mode) => {
	      var dirs = path.split("/");
	      var d = "";

	      for (var i = 0; i < dirs.length; ++i) {
	        if (!dirs[i]) continue;
	        d += "/" + dirs[i];

	        try {
	          FS.mkdir(d, mode);
	        } catch (e) {
	          if (e.errno != 20) throw e;
	        }
	      }
	    },
	    mkdev: (path, mode, dev) => {
	      if (typeof dev == "undefined") {
	        dev = mode;
	        mode = 438;
	      }

	      mode |= 8192;
	      return FS.mknod(path, mode, dev);
	    },
	    symlink: (oldpath, newpath) => {
	      if (!PATH_FS.resolve(oldpath)) {
	        throw new FS.ErrnoError(44);
	      }

	      var lookup = FS.lookupPath(newpath, {
	        parent: true
	      });
	      var parent = lookup.node;

	      if (!parent) {
	        throw new FS.ErrnoError(44);
	      }

	      var newname = PATH.basename(newpath);
	      var errCode = FS.mayCreate(parent, newname);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.symlink) {
	        throw new FS.ErrnoError(63);
	      }

	      return parent.node_ops.symlink(parent, newname, oldpath);
	    },
	    rename: (old_path, new_path) => {
	      var old_dirname = PATH.dirname(old_path);
	      var new_dirname = PATH.dirname(new_path);
	      var old_name = PATH.basename(old_path);
	      var new_name = PATH.basename(new_path);
	      var lookup, old_dir, new_dir;
	      lookup = FS.lookupPath(old_path, {
	        parent: true
	      });
	      old_dir = lookup.node;
	      lookup = FS.lookupPath(new_path, {
	        parent: true
	      });
	      new_dir = lookup.node;
	      if (!old_dir || !new_dir) throw new FS.ErrnoError(44);

	      if (old_dir.mount !== new_dir.mount) {
	        throw new FS.ErrnoError(75);
	      }

	      var old_node = FS.lookupNode(old_dir, old_name);
	      var relative = PATH_FS.relative(old_path, new_dirname);

	      if (relative.charAt(0) !== ".") {
	        throw new FS.ErrnoError(28);
	      }

	      relative = PATH_FS.relative(new_path, old_dirname);

	      if (relative.charAt(0) !== ".") {
	        throw new FS.ErrnoError(55);
	      }

	      var new_node;

	      try {
	        new_node = FS.lookupNode(new_dir, new_name);
	      } catch (e) {}

	      if (old_node === new_node) {
	        return;
	      }

	      var isdir = FS.isDir(old_node.mode);
	      var errCode = FS.mayDelete(old_dir, old_name, isdir);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!old_dir.node_ops.rename) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
	        throw new FS.ErrnoError(10);
	      }

	      if (new_dir !== old_dir) {
	        errCode = FS.nodePermissions(old_dir, "w");

	        if (errCode) {
	          throw new FS.ErrnoError(errCode);
	        }
	      }

	      FS.hashRemoveNode(old_node);

	      try {
	        old_dir.node_ops.rename(old_node, new_dir, new_name);
	      } catch (e) {
	        throw e;
	      } finally {
	        FS.hashAddNode(old_node);
	      }
	    },
	    rmdir: path => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;
	      var name = PATH.basename(path);
	      var node = FS.lookupNode(parent, name);
	      var errCode = FS.mayDelete(parent, name, true);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.rmdir) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(node)) {
	        throw new FS.ErrnoError(10);
	      }

	      parent.node_ops.rmdir(parent, name);
	      FS.destroyNode(node);
	    },
	    readdir: path => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });
	      var node = lookup.node;

	      if (!node.node_ops.readdir) {
	        throw new FS.ErrnoError(54);
	      }

	      return node.node_ops.readdir(node);
	    },
	    unlink: path => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;

	      if (!parent) {
	        throw new FS.ErrnoError(44);
	      }

	      var name = PATH.basename(path);
	      var node = FS.lookupNode(parent, name);
	      var errCode = FS.mayDelete(parent, name, false);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.unlink) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(node)) {
	        throw new FS.ErrnoError(10);
	      }

	      parent.node_ops.unlink(parent, name);
	      FS.destroyNode(node);
	    },
	    readlink: path => {
	      var lookup = FS.lookupPath(path);
	      var link = lookup.node;

	      if (!link) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!link.node_ops.readlink) {
	        throw new FS.ErrnoError(28);
	      }

	      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
	    },
	    stat: (path, dontFollow) => {
	      var lookup = FS.lookupPath(path, {
	        follow: !dontFollow
	      });
	      var node = lookup.node;

	      if (!node) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!node.node_ops.getattr) {
	        throw new FS.ErrnoError(63);
	      }

	      return node.node_ops.getattr(node);
	    },
	    lstat: path => {
	      return FS.stat(path, true);
	    },
	    chmod: (path, mode, dontFollow) => {
	      var node;

	      if (typeof path == "string") {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontFollow
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      node.node_ops.setattr(node, {
	        mode: mode & 4095 | node.mode & ~4095,
	        timestamp: Date.now()
	      });
	    },
	    lchmod: (path, mode) => {
	      FS.chmod(path, mode, true);
	    },
	    fchmod: (fd, mode) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      FS.chmod(stream.node, mode);
	    },
	    chown: (path, uid, gid, dontFollow) => {
	      var node;

	      if (typeof path == "string") {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontFollow
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      node.node_ops.setattr(node, {
	        timestamp: Date.now()
	      });
	    },
	    lchown: (path, uid, gid) => {
	      FS.chown(path, uid, gid, true);
	    },
	    fchown: (fd, uid, gid) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      FS.chown(stream.node, uid, gid);
	    },
	    truncate: (path, len) => {
	      if (len < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      var node;

	      if (typeof path == "string") {
	        var lookup = FS.lookupPath(path, {
	          follow: true
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isDir(node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!FS.isFile(node.mode)) {
	        throw new FS.ErrnoError(28);
	      }

	      var errCode = FS.nodePermissions(node, "w");

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      node.node_ops.setattr(node, {
	        size: len,
	        timestamp: Date.now()
	      });
	    },
	    ftruncate: (fd, len) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(28);
	      }

	      FS.truncate(stream.node, len);
	    },
	    utime: (path, atime, mtime) => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });
	      var node = lookup.node;
	      node.node_ops.setattr(node, {
	        timestamp: Math.max(atime, mtime)
	      });
	    },
	    open: (path, flags, mode) => {
	      if (path === "") {
	        throw new FS.ErrnoError(44);
	      }

	      flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
	      mode = typeof mode == "undefined" ? 438 : mode;

	      if (flags & 64) {
	        mode = mode & 4095 | 32768;
	      } else {
	        mode = 0;
	      }

	      var node;

	      if (typeof path == "object") {
	        node = path;
	      } else {
	        path = PATH.normalize(path);

	        try {
	          var lookup = FS.lookupPath(path, {
	            follow: !(flags & 131072)
	          });
	          node = lookup.node;
	        } catch (e) {}
	      }

	      var created = false;

	      if (flags & 64) {
	        if (node) {
	          if (flags & 128) {
	            throw new FS.ErrnoError(20);
	          }
	        } else {
	          node = FS.mknod(path, mode, 0);
	          created = true;
	        }
	      }

	      if (!node) {
	        throw new FS.ErrnoError(44);
	      }

	      if (FS.isChrdev(node.mode)) {
	        flags &= ~512;
	      }

	      if (flags & 65536 && !FS.isDir(node.mode)) {
	        throw new FS.ErrnoError(54);
	      }

	      if (!created) {
	        var errCode = FS.mayOpen(node, flags);

	        if (errCode) {
	          throw new FS.ErrnoError(errCode);
	        }
	      }

	      if (flags & 512 && !created) {
	        FS.truncate(node, 0);
	      }

	      flags &= ~(128 | 512 | 131072);
	      var stream = FS.createStream({
	        node: node,
	        path: FS.getPath(node),
	        flags: flags,
	        seekable: true,
	        position: 0,
	        stream_ops: node.stream_ops,
	        ungotten: [],
	        error: false
	      });

	      if (stream.stream_ops.open) {
	        stream.stream_ops.open(stream);
	      }

	      if (Module["logReadFiles"] && !(flags & 1)) {
	        if (!FS.readFiles) FS.readFiles = {};

	        if (!(path in FS.readFiles)) {
	          FS.readFiles[path] = 1;
	        }
	      }

	      return stream;
	    },
	    close: stream => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (stream.getdents) stream.getdents = null;

	      try {
	        if (stream.stream_ops.close) {
	          stream.stream_ops.close(stream);
	        }
	      } catch (e) {
	        throw e;
	      } finally {
	        FS.closeStream(stream.fd);
	      }

	      stream.fd = null;
	    },
	    isClosed: stream => {
	      return stream.fd === null;
	    },
	    llseek: (stream, offset, whence) => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (!stream.seekable || !stream.stream_ops.llseek) {
	        throw new FS.ErrnoError(70);
	      }

	      if (whence != 0 && whence != 1 && whence != 2) {
	        throw new FS.ErrnoError(28);
	      }

	      stream.position = stream.stream_ops.llseek(stream, offset, whence);
	      stream.ungotten = [];
	      return stream.position;
	    },
	    read: (stream, buffer, offset, length, position) => {
	      if (length < 0 || position < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 1) {
	        throw new FS.ErrnoError(8);
	      }

	      if (FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!stream.stream_ops.read) {
	        throw new FS.ErrnoError(28);
	      }

	      var seeking = typeof position != "undefined";

	      if (!seeking) {
	        position = stream.position;
	      } else if (!stream.seekable) {
	        throw new FS.ErrnoError(70);
	      }

	      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
	      if (!seeking) stream.position += bytesRead;
	      return bytesRead;
	    },
	    write: (stream, buffer, offset, length, position, canOwn) => {
	      if (length < 0 || position < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(8);
	      }

	      if (FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!stream.stream_ops.write) {
	        throw new FS.ErrnoError(28);
	      }

	      if (stream.seekable && stream.flags & 1024) {
	        FS.llseek(stream, 0, 2);
	      }

	      var seeking = typeof position != "undefined";

	      if (!seeking) {
	        position = stream.position;
	      } else if (!stream.seekable) {
	        throw new FS.ErrnoError(70);
	      }

	      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
	      if (!seeking) stream.position += bytesWritten;
	      return bytesWritten;
	    },
	    allocate: (stream, offset, length) => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (offset < 0 || length <= 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(8);
	      }

	      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(43);
	      }

	      if (!stream.stream_ops.allocate) {
	        throw new FS.ErrnoError(138);
	      }

	      stream.stream_ops.allocate(stream, offset, length);
	    },
	    mmap: (stream, length, position, prot, flags) => {
	      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
	        throw new FS.ErrnoError(2);
	      }

	      if ((stream.flags & 2097155) === 1) {
	        throw new FS.ErrnoError(2);
	      }

	      if (!stream.stream_ops.mmap) {
	        throw new FS.ErrnoError(43);
	      }

	      return stream.stream_ops.mmap(stream, length, position, prot, flags);
	    },
	    msync: (stream, buffer, offset, length, mmapFlags) => {
	      if (!stream || !stream.stream_ops.msync) {
	        return 0;
	      }

	      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
	    },
	    munmap: stream => 0,
	    ioctl: (stream, cmd, arg) => {
	      if (!stream.stream_ops.ioctl) {
	        throw new FS.ErrnoError(59);
	      }

	      return stream.stream_ops.ioctl(stream, cmd, arg);
	    },
	    readFile: function (path) {
	      let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      opts.flags = opts.flags || 0;
	      opts.encoding = opts.encoding || "binary";

	      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
	        throw new Error('Invalid encoding type "' + opts.encoding + '"');
	      }

	      var ret;
	      var stream = FS.open(path, opts.flags);
	      var stat = FS.stat(path);
	      var length = stat.size;
	      var buf = new Uint8Array(length);
	      FS.read(stream, buf, 0, length, 0);

	      if (opts.encoding === "utf8") {
	        ret = UTF8ArrayToString(buf, 0);
	      } else if (opts.encoding === "binary") {
	        ret = buf;
	      }

	      FS.close(stream);
	      return ret;
	    },
	    writeFile: function (path, data) {
	      let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      opts.flags = opts.flags || 577;
	      var stream = FS.open(path, opts.flags, opts.mode);

	      if (typeof data == "string") {
	        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
	        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
	        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
	      } else if (ArrayBuffer.isView(data)) {
	        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
	      } else {
	        throw new Error("Unsupported data type");
	      }

	      FS.close(stream);
	    },
	    cwd: () => FS.currentPath,
	    chdir: path => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });

	      if (lookup.node === null) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!FS.isDir(lookup.node.mode)) {
	        throw new FS.ErrnoError(54);
	      }

	      var errCode = FS.nodePermissions(lookup.node, "x");

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      FS.currentPath = lookup.path;
	    },
	    createDefaultDirectories: () => {
	      FS.mkdir("/tmp");
	      FS.mkdir("/home");
	      FS.mkdir("/home/web_user");
	    },
	    createDefaultDevices: () => {
	      FS.mkdir("/dev");
	      FS.registerDevice(FS.makedev(1, 3), {
	        read: () => 0,
	        write: (stream, buffer, offset, length, pos) => length
	      });
	      FS.mkdev("/dev/null", FS.makedev(1, 3));
	      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
	      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
	      FS.mkdev("/dev/tty", FS.makedev(5, 0));
	      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
	      var random_device = getRandomDevice();
	      FS.createDevice("/dev", "random", random_device);
	      FS.createDevice("/dev", "urandom", random_device);
	      FS.mkdir("/dev/shm");
	      FS.mkdir("/dev/shm/tmp");
	    },
	    createSpecialDirectories: () => {
	      FS.mkdir("/proc");
	      var proc_self = FS.mkdir("/proc/self");
	      FS.mkdir("/proc/self/fd");
	      FS.mount({
	        mount: () => {
	          var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
	          node.node_ops = {
	            lookup: (parent, name) => {
	              var fd = +name;
	              var stream = FS.getStream(fd);
	              if (!stream) throw new FS.ErrnoError(8);
	              var ret = {
	                parent: null,
	                mount: {
	                  mountpoint: "fake"
	                },
	                node_ops: {
	                  readlink: () => stream.path
	                }
	              };
	              ret.parent = ret;
	              return ret;
	            }
	          };
	          return node;
	        }
	      }, {}, "/proc/self/fd");
	    },
	    createStandardStreams: () => {
	      if (Module["stdin"]) {
	        FS.createDevice("/dev", "stdin", Module["stdin"]);
	      } else {
	        FS.symlink("/dev/tty", "/dev/stdin");
	      }

	      if (Module["stdout"]) {
	        FS.createDevice("/dev", "stdout", null, Module["stdout"]);
	      } else {
	        FS.symlink("/dev/tty", "/dev/stdout");
	      }

	      if (Module["stderr"]) {
	        FS.createDevice("/dev", "stderr", null, Module["stderr"]);
	      } else {
	        FS.symlink("/dev/tty1", "/dev/stderr");
	      }

	      FS.open("/dev/stdin", 0);
	      FS.open("/dev/stdout", 1);
	      FS.open("/dev/stderr", 1);
	    },
	    ensureErrnoError: () => {
	      if (FS.ErrnoError) return;

	      FS.ErrnoError = function ErrnoError(errno, node) {
	        this.node = node;

	        this.setErrno = function (errno) {
	          this.errno = errno;
	        };

	        this.setErrno(errno);
	        this.message = "FS error";
	      };

	      FS.ErrnoError.prototype = new Error();
	      FS.ErrnoError.prototype.constructor = FS.ErrnoError;
	      [44].forEach(code => {
	        FS.genericErrors[code] = new FS.ErrnoError(code);
	        FS.genericErrors[code].stack = "<generic error, no stack>";
	      });
	    },
	    staticInit: () => {
	      FS.ensureErrnoError();
	      FS.nameTable = new Array(4096);
	      FS.mount(MEMFS, {}, "/");
	      FS.createDefaultDirectories();
	      FS.createDefaultDevices();
	      FS.createSpecialDirectories();
	      FS.filesystems = {
	        "MEMFS": MEMFS
	      };
	    },
	    init: (input, output, error) => {
	      FS.init.initialized = true;
	      FS.ensureErrnoError();
	      Module["stdin"] = input || Module["stdin"];
	      Module["stdout"] = output || Module["stdout"];
	      Module["stderr"] = error || Module["stderr"];
	      FS.createStandardStreams();
	    },
	    quit: () => {
	      FS.init.initialized = false;

	      for (var i = 0; i < FS.streams.length; i++) {
	        var stream = FS.streams[i];

	        if (!stream) {
	          continue;
	        }

	        FS.close(stream);
	      }
	    },
	    getMode: (canRead, canWrite) => {
	      var mode = 0;
	      if (canRead) mode |= 292 | 73;
	      if (canWrite) mode |= 146;
	      return mode;
	    },
	    findObject: (path, dontResolveLastLink) => {
	      var ret = FS.analyzePath(path, dontResolveLastLink);

	      if (ret.exists) {
	        return ret.object;
	      } else {
	        return null;
	      }
	    },
	    analyzePath: (path, dontResolveLastLink) => {
	      try {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontResolveLastLink
	        });
	        path = lookup.path;
	      } catch (e) {}

	      var ret = {
	        isRoot: false,
	        exists: false,
	        error: 0,
	        name: null,
	        path: null,
	        object: null,
	        parentExists: false,
	        parentPath: null,
	        parentObject: null
	      };

	      try {
	        var lookup = FS.lookupPath(path, {
	          parent: true
	        });
	        ret.parentExists = true;
	        ret.parentPath = lookup.path;
	        ret.parentObject = lookup.node;
	        ret.name = PATH.basename(path);
	        lookup = FS.lookupPath(path, {
	          follow: !dontResolveLastLink
	        });
	        ret.exists = true;
	        ret.path = lookup.path;
	        ret.object = lookup.node;
	        ret.name = lookup.node.name;
	        ret.isRoot = lookup.path === "/";
	      } catch (e) {
	        ret.error = e.errno;
	      }

	      return ret;
	    },
	    createPath: (parent, path, canRead, canWrite) => {
	      parent = typeof parent == "string" ? parent : FS.getPath(parent);
	      var parts = path.split("/").reverse();

	      while (parts.length) {
	        var part = parts.pop();
	        if (!part) continue;
	        var current = PATH.join2(parent, part);

	        try {
	          FS.mkdir(current);
	        } catch (e) {}

	        parent = current;
	      }

	      return current;
	    },
	    createFile: (parent, name, properties, canRead, canWrite) => {
	      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
	      var mode = FS.getMode(canRead, canWrite);
	      return FS.create(path, mode);
	    },
	    createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
	      var path = name;

	      if (parent) {
	        parent = typeof parent == "string" ? parent : FS.getPath(parent);
	        path = name ? PATH.join2(parent, name) : parent;
	      }

	      var mode = FS.getMode(canRead, canWrite);
	      var node = FS.create(path, mode);

	      if (data) {
	        if (typeof data == "string") {
	          var arr = new Array(data.length);

	          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);

	          data = arr;
	        }

	        FS.chmod(node, mode | 146);
	        var stream = FS.open(node, 577);
	        FS.write(stream, data, 0, data.length, 0, canOwn);
	        FS.close(stream);
	        FS.chmod(node, mode);
	      }

	      return node;
	    },
	    createDevice: (parent, name, input, output) => {
	      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
	      var mode = FS.getMode(!!input, !!output);
	      if (!FS.createDevice.major) FS.createDevice.major = 64;
	      var dev = FS.makedev(FS.createDevice.major++, 0);
	      FS.registerDevice(dev, {
	        open: stream => {
	          stream.seekable = false;
	        },
	        close: stream => {
	          if (output && output.buffer && output.buffer.length) {
	            output(10);
	          }
	        },
	        read: (stream, buffer, offset, length, pos) => {
	          var bytesRead = 0;

	          for (var i = 0; i < length; i++) {
	            var result;

	            try {
	              result = input();
	            } catch (e) {
	              throw new FS.ErrnoError(29);
	            }

	            if (result === undefined && bytesRead === 0) {
	              throw new FS.ErrnoError(6);
	            }

	            if (result === null || result === undefined) break;
	            bytesRead++;
	            buffer[offset + i] = result;
	          }

	          if (bytesRead) {
	            stream.node.timestamp = Date.now();
	          }

	          return bytesRead;
	        },
	        write: (stream, buffer, offset, length, pos) => {
	          for (var i = 0; i < length; i++) {
	            try {
	              output(buffer[offset + i]);
	            } catch (e) {
	              throw new FS.ErrnoError(29);
	            }
	          }

	          if (length) {
	            stream.node.timestamp = Date.now();
	          }

	          return i;
	        }
	      });
	      return FS.mkdev(path, mode, dev);
	    },
	    forceLoadFile: obj => {
	      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;

	      if (typeof XMLHttpRequest != "undefined") {
	        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
	      } else if (read_) {
	        try {
	          obj.contents = intArrayFromString(read_(obj.url), true);
	          obj.usedBytes = obj.contents.length;
	        } catch (e) {
	          throw new FS.ErrnoError(29);
	        }
	      } else {
	        throw new Error("Cannot load without read() or XMLHttpRequest.");
	      }
	    },
	    createLazyFile: (parent, name, url, canRead, canWrite) => {
	      function LazyUint8Array() {
	        this.lengthKnown = false;
	        this.chunks = [];
	      }

	      LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
	        if (idx > this.length - 1 || idx < 0) {
	          return undefined;
	        }

	        var chunkOffset = idx % this.chunkSize;
	        var chunkNum = idx / this.chunkSize | 0;
	        return this.getter(chunkNum)[chunkOffset];
	      };

	      LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
	        this.getter = getter;
	      };

	      LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
	        var xhr = new XMLHttpRequest();
	        xhr.open("HEAD", url, false);
	        xhr.send(null);
	        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
	        var datalength = Number(xhr.getResponseHeader("Content-length"));
	        var header;
	        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
	        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
	        var chunkSize = 1024 * 1024;
	        if (!hasByteServing) chunkSize = datalength;

	        var doXHR = (from, to) => {
	          if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
	          if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
	          var xhr = new XMLHttpRequest();
	          xhr.open("GET", url, false);
	          if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
	          xhr.responseType = "arraybuffer";

	          if (xhr.overrideMimeType) {
	            xhr.overrideMimeType("text/plain; charset=x-user-defined");
	          }

	          xhr.send(null);
	          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);

	          if (xhr.response !== undefined) {
	            return new Uint8Array(xhr.response || []);
	          } else {
	            return intArrayFromString(xhr.responseText || "", true);
	          }
	        };

	        var lazyArray = this;
	        lazyArray.setDataGetter(chunkNum => {
	          var start = chunkNum * chunkSize;
	          var end = (chunkNum + 1) * chunkSize - 1;
	          end = Math.min(end, datalength - 1);

	          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
	            lazyArray.chunks[chunkNum] = doXHR(start, end);
	          }

	          if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
	          return lazyArray.chunks[chunkNum];
	        });

	        if (usesGzip || !datalength) {
	          chunkSize = datalength = 1;
	          datalength = this.getter(0).length;
	          chunkSize = datalength;
	          out("LazyFiles on gzip forces download of the whole file when length is accessed");
	        }

	        this._length = datalength;
	        this._chunkSize = chunkSize;
	        this.lengthKnown = true;
	      };

	      if (typeof XMLHttpRequest != "undefined") {
	        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
	        var lazyArray = new LazyUint8Array();
	        Object.defineProperties(lazyArray, {
	          length: {
	            get: function () {
	              if (!this.lengthKnown) {
	                this.cacheLength();
	              }

	              return this._length;
	            }
	          },
	          chunkSize: {
	            get: function () {
	              if (!this.lengthKnown) {
	                this.cacheLength();
	              }

	              return this._chunkSize;
	            }
	          }
	        });
	        var properties = {
	          isDevice: false,
	          contents: lazyArray
	        };
	      } else {
	        var properties = {
	          isDevice: false,
	          url: url
	        };
	      }

	      var node = FS.createFile(parent, name, properties, canRead, canWrite);

	      if (properties.contents) {
	        node.contents = properties.contents;
	      } else if (properties.url) {
	        node.contents = null;
	        node.url = properties.url;
	      }

	      Object.defineProperties(node, {
	        usedBytes: {
	          get: function () {
	            return this.contents.length;
	          }
	        }
	      });
	      var stream_ops = {};
	      var keys = Object.keys(node.stream_ops);
	      keys.forEach(key => {
	        var fn = node.stream_ops[key];

	        stream_ops[key] = function forceLoadLazyFile() {
	          FS.forceLoadFile(node);
	          return fn.apply(null, arguments);
	        };
	      });

	      function writeChunks(stream, buffer, offset, length, position) {
	        var contents = stream.node.contents;
	        if (position >= contents.length) return 0;
	        var size = Math.min(contents.length - position, length);

	        if (contents.slice) {
	          for (var i = 0; i < size; i++) {
	            buffer[offset + i] = contents[position + i];
	          }
	        } else {
	          for (var i = 0; i < size; i++) {
	            buffer[offset + i] = contents.get(position + i);
	          }
	        }

	        return size;
	      }

	      stream_ops.read = (stream, buffer, offset, length, position) => {
	        FS.forceLoadFile(node);
	        return writeChunks(stream, buffer, offset, length, position);
	      };

	      stream_ops.mmap = (stream, length, position, prot, flags) => {
	        FS.forceLoadFile(node);
	        var ptr = mmapAlloc(length);

	        if (!ptr) {
	          throw new FS.ErrnoError(48);
	        }

	        writeChunks(stream, HEAP8, ptr, length, position);
	        return {
	          ptr: ptr,
	          allocated: true
	        };
	      };

	      node.stream_ops = stream_ops;
	      return node;
	    },
	    createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
	      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;

	      function processData(byteArray) {
	        function finish(byteArray) {
	          if (preFinish) preFinish();

	          if (!dontCreateFile) {
	            FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
	          }

	          if (onload) onload();
	          removeRunDependency();
	        }

	        if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
	          if (onerror) onerror();
	          removeRunDependency();
	        })) {
	          return;
	        }

	        finish(byteArray);
	      }

	      addRunDependency();

	      if (typeof url == "string") {
	        asyncLoad(url, byteArray => processData(byteArray), onerror);
	      } else {
	        processData(url);
	      }
	    },
	    indexedDB: () => {
	      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	    },
	    DB_NAME: () => {
	      return "EM_FS_" + window.location.pathname;
	    },
	    DB_VERSION: 20,
	    DB_STORE_NAME: "FILE_DATA",
	    saveFilesToDB: (paths, onload, onerror) => {
	      onload = onload || (() => {});

	      onerror = onerror || (() => {});

	      var indexedDB = FS.indexedDB();

	      try {
	        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
	      } catch (e) {
	        return onerror(e);
	      }

	      openRequest.onupgradeneeded = () => {
	        out("creating db");
	        var db = openRequest.result;
	        db.createObjectStore(FS.DB_STORE_NAME);
	      };

	      openRequest.onsuccess = () => {
	        var db = openRequest.result;
	        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
	        var files = transaction.objectStore(FS.DB_STORE_NAME);
	        var ok = 0,
	            fail = 0,
	            total = paths.length;

	        function finish() {
	          if (fail == 0) onload();else onerror();
	        }

	        paths.forEach(path => {
	          var putRequest = files.put(FS.analyzePath(path).object.contents, path);

	          putRequest.onsuccess = () => {
	            ok++;
	            if (ok + fail == total) finish();
	          };

	          putRequest.onerror = () => {
	            fail++;
	            if (ok + fail == total) finish();
	          };
	        });
	        transaction.onerror = onerror;
	      };

	      openRequest.onerror = onerror;
	    },
	    loadFilesFromDB: (paths, onload, onerror) => {
	      onload = onload || (() => {});

	      onerror = onerror || (() => {});

	      var indexedDB = FS.indexedDB();

	      try {
	        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
	      } catch (e) {
	        return onerror(e);
	      }

	      openRequest.onupgradeneeded = onerror;

	      openRequest.onsuccess = () => {
	        var db = openRequest.result;

	        try {
	          var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
	        } catch (e) {
	          onerror(e);
	          return;
	        }

	        var files = transaction.objectStore(FS.DB_STORE_NAME);
	        var ok = 0,
	            fail = 0,
	            total = paths.length;

	        function finish() {
	          if (fail == 0) onload();else onerror();
	        }

	        paths.forEach(path => {
	          var getRequest = files.get(path);

	          getRequest.onsuccess = () => {
	            if (FS.analyzePath(path).exists) {
	              FS.unlink(path);
	            }

	            FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
	            ok++;
	            if (ok + fail == total) finish();
	          };

	          getRequest.onerror = () => {
	            fail++;
	            if (ok + fail == total) finish();
	          };
	        });
	        transaction.onerror = onerror;
	      };

	      openRequest.onerror = onerror;
	    }
	  };
	  var SYSCALLS = {
	    DEFAULT_POLLMASK: 5,
	    calculateAt: function (dirfd, path, allowEmpty) {
	      if (PATH.isAbs(path)) {
	        return path;
	      }

	      var dir;

	      if (dirfd === -100) {
	        dir = FS.cwd();
	      } else {
	        var dirstream = FS.getStream(dirfd);
	        if (!dirstream) throw new FS.ErrnoError(8);
	        dir = dirstream.path;
	      }

	      if (path.length == 0) {
	        if (!allowEmpty) {
	          throw new FS.ErrnoError(44);
	        }

	        return dir;
	      }

	      return PATH.join2(dir, path);
	    },
	    doStat: function (func, path, buf) {
	      try {
	        var stat = func(path);
	      } catch (e) {
	        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
	          return -54;
	        }

	        throw e;
	      }

	      HEAP32[buf >> 2] = stat.dev;
	      HEAP32[buf + 4 >> 2] = 0;
	      HEAP32[buf + 8 >> 2] = stat.ino;
	      HEAP32[buf + 12 >> 2] = stat.mode;
	      HEAP32[buf + 16 >> 2] = stat.nlink;
	      HEAP32[buf + 20 >> 2] = stat.uid;
	      HEAP32[buf + 24 >> 2] = stat.gid;
	      HEAP32[buf + 28 >> 2] = stat.rdev;
	      HEAP32[buf + 32 >> 2] = 0;
	      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
	      HEAP32[buf + 48 >> 2] = 4096;
	      HEAP32[buf + 52 >> 2] = stat.blocks;
	      HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
	      HEAP32[buf + 60 >> 2] = 0;
	      HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
	      HEAP32[buf + 68 >> 2] = 0;
	      HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
	      HEAP32[buf + 76 >> 2] = 0;
	      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
	      return 0;
	    },
	    doMsync: function (addr, stream, len, flags, offset) {
	      var buffer = HEAPU8.slice(addr, addr + len);
	      FS.msync(stream, buffer, offset, len, flags);
	    },
	    varargs: undefined,
	    get: function () {
	      SYSCALLS.varargs += 4;
	      var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
	      return ret;
	    },
	    getStr: function (ptr) {
	      var ret = UTF8ToString(ptr);
	      return ret;
	    },
	    getStreamFromFD: function (fd) {
	      var stream = FS.getStream(fd);
	      if (!stream) throw new FS.ErrnoError(8);
	      return stream;
	    }
	  };

	  function ___syscall_fcntl64(fd, cmd, varargs) {
	    SYSCALLS.varargs = varargs;

	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);

	      switch (cmd) {
	        case 0:
	          {
	            var arg = SYSCALLS.get();

	            if (arg < 0) {
	              return -28;
	            }

	            var newStream;
	            newStream = FS.createStream(stream, arg);
	            return newStream.fd;
	          }

	        case 1:
	        case 2:
	          return 0;

	        case 3:
	          return stream.flags;

	        case 4:
	          {
	            var arg = SYSCALLS.get();
	            stream.flags |= arg;
	            return 0;
	          }

	        case 5:
	          {
	            var arg = SYSCALLS.get();
	            var offset = 0;
	            HEAP16[arg + offset >> 1] = 2;
	            return 0;
	          }

	        case 6:
	        case 7:
	          return 0;

	        case 16:
	        case 8:
	          return -28;

	        case 9:
	          setErrNo(28);
	          return -1;

	        default:
	          {
	            return -28;
	          }
	      }
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return -e.errno;
	    }
	  }

	  function ___syscall_openat(dirfd, path, flags, varargs) {
	    SYSCALLS.varargs = varargs;

	    try {
	      path = SYSCALLS.getStr(path);
	      path = SYSCALLS.calculateAt(dirfd, path);
	      var mode = varargs ? SYSCALLS.get() : 0;
	      return FS.open(path, flags, mode).fd;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return -e.errno;
	    }
	  }

	  function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

	  function getShiftFromSize(size) {
	    switch (size) {
	      case 1:
	        return 0;

	      case 2:
	        return 1;

	      case 4:
	        return 2;

	      case 8:
	        return 3;

	      default:
	        throw new TypeError("Unknown type size: " + size);
	    }
	  }

	  function embind_init_charCodes() {
	    var codes = new Array(256);

	    for (var i = 0; i < 256; ++i) {
	      codes[i] = String.fromCharCode(i);
	    }

	    embind_charCodes = codes;
	  }

	  var embind_charCodes = undefined;

	  function readLatin1String(ptr) {
	    var ret = "";
	    var c = ptr;

	    while (HEAPU8[c]) {
	      ret += embind_charCodes[HEAPU8[c++]];
	    }

	    return ret;
	  }

	  var awaitingDependencies = {};
	  var registeredTypes = {};
	  var typeDependencies = {};
	  var char_0 = 48;
	  var char_9 = 57;

	  function makeLegalFunctionName(name) {
	    if (undefined === name) {
	      return "_unknown";
	    }

	    name = name.replace(/[^a-zA-Z0-9_]/g, "$");
	    var f = name.charCodeAt(0);

	    if (f >= char_0 && f <= char_9) {
	      return "_" + name;
	    }

	    return name;
	  }

	  function createNamedFunction(name, body) {
	    name = makeLegalFunctionName(name);
	    return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body);
	  }

	  function extendError(baseErrorType, errorName) {
	    var errorClass = createNamedFunction(errorName, function (message) {
	      this.name = errorName;
	      this.message = message;
	      var stack = new Error(message).stack;

	      if (stack !== undefined) {
	        this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
	      }
	    });
	    errorClass.prototype = Object.create(baseErrorType.prototype);
	    errorClass.prototype.constructor = errorClass;

	    errorClass.prototype.toString = function () {
	      if (this.message === undefined) {
	        return this.name;
	      } else {
	        return this.name + ": " + this.message;
	      }
	    };

	    return errorClass;
	  }

	  var BindingError = undefined;

	  function throwBindingError(message) {
	    throw new BindingError(message);
	  }

	  var InternalError = undefined;

	  function throwInternalError(message) {
	    throw new InternalError(message);
	  }

	  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
	    myTypes.forEach(function (type) {
	      typeDependencies[type] = dependentTypes;
	    });

	    function onComplete(typeConverters) {
	      var myTypeConverters = getTypeConverters(typeConverters);

	      if (myTypeConverters.length !== myTypes.length) {
	        throwInternalError("Mismatched type converter count");
	      }

	      for (var i = 0; i < myTypes.length; ++i) {
	        registerType(myTypes[i], myTypeConverters[i]);
	      }
	    }

	    var typeConverters = new Array(dependentTypes.length);
	    var unregisteredTypes = [];
	    var registered = 0;
	    dependentTypes.forEach((dt, i) => {
	      if (registeredTypes.hasOwnProperty(dt)) {
	        typeConverters[i] = registeredTypes[dt];
	      } else {
	        unregisteredTypes.push(dt);

	        if (!awaitingDependencies.hasOwnProperty(dt)) {
	          awaitingDependencies[dt] = [];
	        }

	        awaitingDependencies[dt].push(() => {
	          typeConverters[i] = registeredTypes[dt];
	          ++registered;

	          if (registered === unregisteredTypes.length) {
	            onComplete(typeConverters);
	          }
	        });
	      }
	    });

	    if (0 === unregisteredTypes.length) {
	      onComplete(typeConverters);
	    }
	  }

	  function registerType(rawType, registeredInstance) {
	    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (!("argPackAdvance" in registeredInstance)) {
	      throw new TypeError("registerType registeredInstance requires argPackAdvance");
	    }

	    var name = registeredInstance.name;

	    if (!rawType) {
	      throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
	    }

	    if (registeredTypes.hasOwnProperty(rawType)) {
	      if (options.ignoreDuplicateRegistrations) {
	        return;
	      } else {
	        throwBindingError("Cannot register type '" + name + "' twice");
	      }
	    }

	    registeredTypes[rawType] = registeredInstance;
	    delete typeDependencies[rawType];

	    if (awaitingDependencies.hasOwnProperty(rawType)) {
	      var callbacks = awaitingDependencies[rawType];
	      delete awaitingDependencies[rawType];
	      callbacks.forEach(cb => cb());
	    }
	  }

	  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
	    var shift = getShiftFromSize(size);
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      "fromWireType": function (wt) {
	        return !!wt;
	      },
	      "toWireType": function (destructors, o) {
	        return o ? trueValue : falseValue;
	      },
	      "argPackAdvance": 8,
	      "readValueFromPointer": function (pointer) {
	        var heap;

	        if (size === 1) {
	          heap = HEAP8;
	        } else if (size === 2) {
	          heap = HEAP16;
	        } else if (size === 4) {
	          heap = HEAP32;
	        } else {
	          throw new TypeError("Unknown boolean type size: " + name);
	        }

	        return this["fromWireType"](heap[pointer >> shift]);
	      },
	      destructorFunction: null
	    });
	  }

	  function ClassHandle_isAliasOf(other) {
	    if (!(this instanceof ClassHandle)) {
	      return false;
	    }

	    if (!(other instanceof ClassHandle)) {
	      return false;
	    }

	    var leftClass = this.$$.ptrType.registeredClass;
	    var left = this.$$.ptr;
	    var rightClass = other.$$.ptrType.registeredClass;
	    var right = other.$$.ptr;

	    while (leftClass.baseClass) {
	      left = leftClass.upcast(left);
	      leftClass = leftClass.baseClass;
	    }

	    while (rightClass.baseClass) {
	      right = rightClass.upcast(right);
	      rightClass = rightClass.baseClass;
	    }

	    return leftClass === rightClass && left === right;
	  }

	  function shallowCopyInternalPointer(o) {
	    return {
	      count: o.count,
	      deleteScheduled: o.deleteScheduled,
	      preservePointerOnDelete: o.preservePointerOnDelete,
	      ptr: o.ptr,
	      ptrType: o.ptrType,
	      smartPtr: o.smartPtr,
	      smartPtrType: o.smartPtrType
	    };
	  }

	  function throwInstanceAlreadyDeleted(obj) {
	    function getInstanceTypeName(handle) {
	      return handle.$$.ptrType.registeredClass.name;
	    }

	    throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
	  }

	  var finalizationRegistry = false;

	  function detachFinalizer(handle) {}

	  function runDestructor($$) {
	    if ($$.smartPtr) {
	      $$.smartPtrType.rawDestructor($$.smartPtr);
	    } else {
	      $$.ptrType.registeredClass.rawDestructor($$.ptr);
	    }
	  }

	  function releaseClassHandle($$) {
	    $$.count.value -= 1;
	    var toDelete = 0 === $$.count.value;

	    if (toDelete) {
	      runDestructor($$);
	    }
	  }

	  function downcastPointer(ptr, ptrClass, desiredClass) {
	    if (ptrClass === desiredClass) {
	      return ptr;
	    }

	    if (undefined === desiredClass.baseClass) {
	      return null;
	    }

	    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);

	    if (rv === null) {
	      return null;
	    }

	    return desiredClass.downcast(rv);
	  }

	  var registeredPointers = {};

	  function getInheritedInstanceCount() {
	    return Object.keys(registeredInstances).length;
	  }

	  function getLiveInheritedInstances() {
	    var rv = [];

	    for (var k in registeredInstances) {
	      if (registeredInstances.hasOwnProperty(k)) {
	        rv.push(registeredInstances[k]);
	      }
	    }

	    return rv;
	  }

	  var deletionQueue = [];

	  function flushPendingDeletes() {
	    while (deletionQueue.length) {
	      var obj = deletionQueue.pop();
	      obj.$$.deleteScheduled = false;
	      obj["delete"]();
	    }
	  }

	  var delayFunction = undefined;

	  function setDelayFunction(fn) {
	    delayFunction = fn;

	    if (deletionQueue.length && delayFunction) {
	      delayFunction(flushPendingDeletes);
	    }
	  }

	  function init_embind() {
	    Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
	    Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
	    Module["flushPendingDeletes"] = flushPendingDeletes;
	    Module["setDelayFunction"] = setDelayFunction;
	  }

	  var registeredInstances = {};

	  function getBasestPointer(class_, ptr) {
	    if (ptr === undefined) {
	      throwBindingError("ptr should not be undefined");
	    }

	    while (class_.baseClass) {
	      ptr = class_.upcast(ptr);
	      class_ = class_.baseClass;
	    }

	    return ptr;
	  }

	  function getInheritedInstance(class_, ptr) {
	    ptr = getBasestPointer(class_, ptr);
	    return registeredInstances[ptr];
	  }

	  function makeClassHandle(prototype, record) {
	    if (!record.ptrType || !record.ptr) {
	      throwInternalError("makeClassHandle requires ptr and ptrType");
	    }

	    var hasSmartPtrType = !!record.smartPtrType;
	    var hasSmartPtr = !!record.smartPtr;

	    if (hasSmartPtrType !== hasSmartPtr) {
	      throwInternalError("Both smartPtrType and smartPtr must be specified");
	    }

	    record.count = {
	      value: 1
	    };
	    return attachFinalizer(Object.create(prototype, {
	      $$: {
	        value: record
	      }
	    }));
	  }

	  function RegisteredPointer_fromWireType(ptr) {
	    var rawPointer = this.getPointee(ptr);

	    if (!rawPointer) {
	      this.destructor(ptr);
	      return null;
	    }

	    var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);

	    if (undefined !== registeredInstance) {
	      if (0 === registeredInstance.$$.count.value) {
	        registeredInstance.$$.ptr = rawPointer;
	        registeredInstance.$$.smartPtr = ptr;
	        return registeredInstance["clone"]();
	      } else {
	        var rv = registeredInstance["clone"]();
	        this.destructor(ptr);
	        return rv;
	      }
	    }

	    function makeDefaultHandle() {
	      if (this.isSmartPointer) {
	        return makeClassHandle(this.registeredClass.instancePrototype, {
	          ptrType: this.pointeeType,
	          ptr: rawPointer,
	          smartPtrType: this,
	          smartPtr: ptr
	        });
	      } else {
	        return makeClassHandle(this.registeredClass.instancePrototype, {
	          ptrType: this,
	          ptr: ptr
	        });
	      }
	    }

	    var actualType = this.registeredClass.getActualType(rawPointer);
	    var registeredPointerRecord = registeredPointers[actualType];

	    if (!registeredPointerRecord) {
	      return makeDefaultHandle.call(this);
	    }

	    var toType;

	    if (this.isConst) {
	      toType = registeredPointerRecord.constPointerType;
	    } else {
	      toType = registeredPointerRecord.pointerType;
	    }

	    var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);

	    if (dp === null) {
	      return makeDefaultHandle.call(this);
	    }

	    if (this.isSmartPointer) {
	      return makeClassHandle(toType.registeredClass.instancePrototype, {
	        ptrType: toType,
	        ptr: dp,
	        smartPtrType: this,
	        smartPtr: ptr
	      });
	    } else {
	      return makeClassHandle(toType.registeredClass.instancePrototype, {
	        ptrType: toType,
	        ptr: dp
	      });
	    }
	  }

	  function attachFinalizer(handle) {
	    if ("undefined" === typeof FinalizationRegistry) {
	      attachFinalizer = handle => handle;

	      return handle;
	    }

	    finalizationRegistry = new FinalizationRegistry(info => {
	      releaseClassHandle(info.$$);
	    });

	    attachFinalizer = handle => {
	      var $$ = handle.$$;
	      var hasSmartPtr = !!$$.smartPtr;

	      if (hasSmartPtr) {
	        var info = {
	          $$: $$
	        };
	        finalizationRegistry.register(handle, info, handle);
	      }

	      return handle;
	    };

	    detachFinalizer = handle => finalizationRegistry.unregister(handle);

	    return attachFinalizer(handle);
	  }

	  function ClassHandle_clone() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.preservePointerOnDelete) {
	      this.$$.count.value += 1;
	      return this;
	    } else {
	      var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
	        $$: {
	          value: shallowCopyInternalPointer(this.$$)
	        }
	      }));
	      clone.$$.count.value += 1;
	      clone.$$.deleteScheduled = false;
	      return clone;
	    }
	  }

	  function ClassHandle_delete() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
	      throwBindingError("Object already scheduled for deletion");
	    }

	    detachFinalizer(this);
	    releaseClassHandle(this.$$);

	    if (!this.$$.preservePointerOnDelete) {
	      this.$$.smartPtr = undefined;
	      this.$$.ptr = undefined;
	    }
	  }

	  function ClassHandle_isDeleted() {
	    return !this.$$.ptr;
	  }

	  function ClassHandle_deleteLater() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
	      throwBindingError("Object already scheduled for deletion");
	    }

	    deletionQueue.push(this);

	    if (deletionQueue.length === 1 && delayFunction) {
	      delayFunction(flushPendingDeletes);
	    }

	    this.$$.deleteScheduled = true;
	    return this;
	  }

	  function init_ClassHandle() {
	    ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
	    ClassHandle.prototype["clone"] = ClassHandle_clone;
	    ClassHandle.prototype["delete"] = ClassHandle_delete;
	    ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
	    ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater;
	  }

	  function ClassHandle() {}

	  function ensureOverloadTable(proto, methodName, humanName) {
	    if (undefined === proto[methodName].overloadTable) {
	      var prevFunc = proto[methodName];

	      proto[methodName] = function () {
	        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
	          throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
	        }

	        return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
	      };

	      proto[methodName].overloadTable = [];
	      proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
	    }
	  }

	  function exposePublicSymbol(name, value, numArguments) {
	    if (Module.hasOwnProperty(name)) {
	      if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
	        throwBindingError("Cannot register public name '" + name + "' twice");
	      }

	      ensureOverloadTable(Module, name, name);

	      if (Module.hasOwnProperty(numArguments)) {
	        throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
	      }

	      Module[name].overloadTable[numArguments] = value;
	    } else {
	      Module[name] = value;

	      if (undefined !== numArguments) {
	        Module[name].numArguments = numArguments;
	      }
	    }
	  }

	  function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
	    this.name = name;
	    this.constructor = constructor;
	    this.instancePrototype = instancePrototype;
	    this.rawDestructor = rawDestructor;
	    this.baseClass = baseClass;
	    this.getActualType = getActualType;
	    this.upcast = upcast;
	    this.downcast = downcast;
	    this.pureVirtualFunctions = [];
	  }

	  function upcastPointer(ptr, ptrClass, desiredClass) {
	    while (ptrClass !== desiredClass) {
	      if (!ptrClass.upcast) {
	        throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
	      }

	      ptr = ptrClass.upcast(ptr);
	      ptrClass = ptrClass.baseClass;
	    }

	    return ptr;
	  }

	  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError("null is not a valid " + this.name);
	      }

	      return 0;
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
	    return ptr;
	  }

	  function genericPointerToWireType(destructors, handle) {
	    var ptr;

	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError("null is not a valid " + this.name);
	      }

	      if (this.isSmartPointer) {
	        ptr = this.rawConstructor();

	        if (destructors !== null) {
	          destructors.push(this.rawDestructor, ptr);
	        }

	        return ptr;
	      } else {
	        return 0;
	      }
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
	    }

	    if (!this.isConst && handle.$$.ptrType.isConst) {
	      throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

	    if (this.isSmartPointer) {
	      if (undefined === handle.$$.smartPtr) {
	        throwBindingError("Passing raw pointer to smart pointer is illegal");
	      }

	      switch (this.sharingPolicy) {
	        case 0:
	          if (handle.$$.smartPtrType === this) {
	            ptr = handle.$$.smartPtr;
	          } else {
	            throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
	          }

	          break;

	        case 1:
	          ptr = handle.$$.smartPtr;
	          break;

	        case 2:
	          if (handle.$$.smartPtrType === this) {
	            ptr = handle.$$.smartPtr;
	          } else {
	            var clonedHandle = handle["clone"]();
	            ptr = this.rawShare(ptr, Emval.toHandle(function () {
	              clonedHandle["delete"]();
	            }));

	            if (destructors !== null) {
	              destructors.push(this.rawDestructor, ptr);
	            }
	          }

	          break;

	        default:
	          throwBindingError("Unsupporting sharing policy");
	      }
	    }

	    return ptr;
	  }

	  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError("null is not a valid " + this.name);
	      }

	      return 0;
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
	    }

	    if (handle.$$.ptrType.isConst) {
	      throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
	    return ptr;
	  }

	  function simpleReadValueFromPointer(pointer) {
	    return this["fromWireType"](HEAP32[pointer >> 2]);
	  }

	  function RegisteredPointer_getPointee(ptr) {
	    if (this.rawGetPointee) {
	      ptr = this.rawGetPointee(ptr);
	    }

	    return ptr;
	  }

	  function RegisteredPointer_destructor(ptr) {
	    if (this.rawDestructor) {
	      this.rawDestructor(ptr);
	    }
	  }

	  function RegisteredPointer_deleteObject(handle) {
	    if (handle !== null) {
	      handle["delete"]();
	    }
	  }

	  function init_RegisteredPointer() {
	    RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
	    RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
	    RegisteredPointer.prototype["argPackAdvance"] = 8;
	    RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
	    RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
	    RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType;
	  }

	  function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
	    this.name = name;
	    this.registeredClass = registeredClass;
	    this.isReference = isReference;
	    this.isConst = isConst;
	    this.isSmartPointer = isSmartPointer;
	    this.pointeeType = pointeeType;
	    this.sharingPolicy = sharingPolicy;
	    this.rawGetPointee = rawGetPointee;
	    this.rawConstructor = rawConstructor;
	    this.rawShare = rawShare;
	    this.rawDestructor = rawDestructor;

	    if (!isSmartPointer && registeredClass.baseClass === undefined) {
	      if (isConst) {
	        this["toWireType"] = constNoSmartPtrRawPointerToWireType;
	        this.destructorFunction = null;
	      } else {
	        this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
	        this.destructorFunction = null;
	      }
	    } else {
	      this["toWireType"] = genericPointerToWireType;
	    }
	  }

	  function replacePublicSymbol(name, value, numArguments) {
	    if (!Module.hasOwnProperty(name)) {
	      throwInternalError("Replacing nonexistant public symbol");
	    }

	    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
	      Module[name].overloadTable[numArguments] = value;
	    } else {
	      Module[name] = value;
	      Module[name].argCount = numArguments;
	    }
	  }

	  function dynCallLegacy(sig, ptr, args) {
	    var f = Module["dynCall_" + sig];
	    return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
	  }

	  function dynCall(sig, ptr, args) {
	    if (sig.includes("j")) {
	      return dynCallLegacy(sig, ptr, args);
	    }

	    var rtn = getWasmTableEntry(ptr).apply(null, args);
	    return rtn;
	  }

	  function getDynCaller(sig, ptr) {
	    var argCache = [];
	    return function () {
	      argCache.length = 0;
	      Object.assign(argCache, arguments);
	      return dynCall(sig, ptr, argCache);
	    };
	  }

	  function embind__requireFunction(signature, rawFunction) {
	    signature = readLatin1String(signature);

	    function makeDynCaller() {
	      if (signature.includes("j")) {
	        return getDynCaller(signature, rawFunction);
	      }

	      return getWasmTableEntry(rawFunction);
	    }

	    var fp = makeDynCaller();

	    if (typeof fp != "function") {
	      throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
	    }

	    return fp;
	  }

	  var UnboundTypeError = undefined;

	  function getTypeName(type) {
	    var ptr = ___getTypeName(type);

	    var rv = readLatin1String(ptr);

	    _free(ptr);

	    return rv;
	  }

	  function throwUnboundTypeError(message, types) {
	    var unboundTypes = [];
	    var seen = {};

	    function visit(type) {
	      if (seen[type]) {
	        return;
	      }

	      if (registeredTypes[type]) {
	        return;
	      }

	      if (typeDependencies[type]) {
	        typeDependencies[type].forEach(visit);
	        return;
	      }

	      unboundTypes.push(type);
	      seen[type] = true;
	    }

	    types.forEach(visit);
	    throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
	  }

	  function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
	    name = readLatin1String(name);
	    getActualType = embind__requireFunction(getActualTypeSignature, getActualType);

	    if (upcast) {
	      upcast = embind__requireFunction(upcastSignature, upcast);
	    }

	    if (downcast) {
	      downcast = embind__requireFunction(downcastSignature, downcast);
	    }

	    rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
	    var legalFunctionName = makeLegalFunctionName(name);
	    exposePublicSymbol(legalFunctionName, function () {
	      throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType]);
	    });
	    whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function (base) {
	      base = base[0];
	      var baseClass;
	      var basePrototype;

	      if (baseClassRawType) {
	        baseClass = base.registeredClass;
	        basePrototype = baseClass.instancePrototype;
	      } else {
	        basePrototype = ClassHandle.prototype;
	      }

	      var constructor = createNamedFunction(legalFunctionName, function () {
	        if (Object.getPrototypeOf(this) !== instancePrototype) {
	          throw new BindingError("Use 'new' to construct " + name);
	        }

	        if (undefined === registeredClass.constructor_body) {
	          throw new BindingError(name + " has no accessible constructor");
	        }

	        var body = registeredClass.constructor_body[arguments.length];

	        if (undefined === body) {
	          throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
	        }

	        return body.apply(this, arguments);
	      });
	      var instancePrototype = Object.create(basePrototype, {
	        constructor: {
	          value: constructor
	        }
	      });
	      constructor.prototype = instancePrototype;
	      var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
	      var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
	      var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
	      var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
	      registeredPointers[rawType] = {
	        pointerType: pointerConverter,
	        constPointerType: constPointerConverter
	      };
	      replacePublicSymbol(legalFunctionName, constructor);
	      return [referenceConverter, pointerConverter, constPointerConverter];
	    });
	  }

	  function heap32VectorToArray(count, firstElement) {
	    var array = [];

	    for (var i = 0; i < count; i++) {
	      array.push(HEAPU32[firstElement + i * 4 >> 2]);
	    }

	    return array;
	  }

	  function runDestructors(destructors) {
	    while (destructors.length) {
	      var ptr = destructors.pop();
	      var del = destructors.pop();
	      del(ptr);
	    }
	  }

	  function new_(constructor, argumentList) {
	    if (!(constructor instanceof Function)) {
	      throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
	    }

	    var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {});
	    dummy.prototype = constructor.prototype;
	    var obj = new dummy();
	    var r = constructor.apply(obj, argumentList);
	    return r instanceof Object ? r : obj;
	  }

	  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
	    var argCount = argTypes.length;

	    if (argCount < 2) {
	      throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
	    }

	    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
	    var needsDestructorStack = false;

	    for (var i = 1; i < argTypes.length; ++i) {
	      if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
	        needsDestructorStack = true;
	        break;
	      }
	    }

	    var returns = argTypes[0].name !== "void";
	    var argsList = "";
	    var argsListWired = "";

	    for (var i = 0; i < argCount - 2; ++i) {
	      argsList += (i !== 0 ? ", " : "") + "arg" + i;
	      argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
	    }

	    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";

	    if (needsDestructorStack) {
	      invokerFnBody += "var destructors = [];\n";
	    }

	    var dtorStack = needsDestructorStack ? "destructors" : "null";
	    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
	    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];

	    if (isClassMethodFunc) {
	      invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
	    }

	    for (var i = 0; i < argCount - 2; ++i) {
	      invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
	      args1.push("argType" + i);
	      args2.push(argTypes[i + 2]);
	    }

	    if (isClassMethodFunc) {
	      argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
	    }

	    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";

	    if (needsDestructorStack) {
	      invokerFnBody += "runDestructors(destructors);\n";
	    } else {
	      for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
	        var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";

	        if (argTypes[i].destructorFunction !== null) {
	          invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
	          args1.push(paramName + "_dtor");
	          args2.push(argTypes[i].destructorFunction);
	        }
	      }
	    }

	    if (returns) {
	      invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
	    }

	    invokerFnBody += "}\n";
	    args1.push(invokerFnBody);
	    var invokerFunction = new_(Function, args1).apply(null, args2);
	    return invokerFunction;
	  }

	  function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
	    assert(argCount > 0);
	    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
	    invoker = embind__requireFunction(invokerSignature, invoker);
	    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
	      classType = classType[0];
	      var humanName = "constructor " + classType.name;

	      if (undefined === classType.registeredClass.constructor_body) {
	        classType.registeredClass.constructor_body = [];
	      }

	      if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
	        throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
	      }

	      classType.registeredClass.constructor_body[argCount - 1] = () => {
	        throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes);
	      };

	      whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
	        argTypes.splice(1, 0, null);
	        classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
	        return [];
	      });
	      return [];
	    });
	  }

	  function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
	    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
	    methodName = readLatin1String(methodName);
	    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
	    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
	      classType = classType[0];
	      var humanName = classType.name + "." + methodName;

	      if (methodName.startsWith("@@")) {
	        methodName = Symbol[methodName.substring(2)];
	      }

	      if (isPureVirtual) {
	        classType.registeredClass.pureVirtualFunctions.push(methodName);
	      }

	      function unboundTypesHandler() {
	        throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
	      }

	      var proto = classType.registeredClass.instancePrototype;
	      var method = proto[methodName];

	      if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
	        unboundTypesHandler.argCount = argCount - 2;
	        unboundTypesHandler.className = classType.name;
	        proto[methodName] = unboundTypesHandler;
	      } else {
	        ensureOverloadTable(proto, methodName, humanName);
	        proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
	      }

	      whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
	        var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);

	        if (undefined === proto[methodName].overloadTable) {
	          memberFunction.argCount = argCount - 2;
	          proto[methodName] = memberFunction;
	        } else {
	          proto[methodName].overloadTable[argCount - 2] = memberFunction;
	        }

	        return [];
	      });
	      return [];
	    });
	  }

	  var emval_free_list = [];
	  var emval_handle_array = [{}, {
	    value: undefined
	  }, {
	    value: null
	  }, {
	    value: true
	  }, {
	    value: false
	  }];

	  function __emval_decref(handle) {
	    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
	      emval_handle_array[handle] = undefined;
	      emval_free_list.push(handle);
	    }
	  }

	  function count_emval_handles() {
	    var count = 0;

	    for (var i = 5; i < emval_handle_array.length; ++i) {
	      if (emval_handle_array[i] !== undefined) {
	        ++count;
	      }
	    }

	    return count;
	  }

	  function get_first_emval() {
	    for (var i = 5; i < emval_handle_array.length; ++i) {
	      if (emval_handle_array[i] !== undefined) {
	        return emval_handle_array[i];
	      }
	    }

	    return null;
	  }

	  function init_emval() {
	    Module["count_emval_handles"] = count_emval_handles;
	    Module["get_first_emval"] = get_first_emval;
	  }

	  var Emval = {
	    toValue: handle => {
	      if (!handle) {
	        throwBindingError("Cannot use deleted val. handle = " + handle);
	      }

	      return emval_handle_array[handle].value;
	    },
	    toHandle: value => {
	      switch (value) {
	        case undefined:
	          return 1;

	        case null:
	          return 2;

	        case true:
	          return 3;

	        case false:
	          return 4;

	        default:
	          {
	            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
	            emval_handle_array[handle] = {
	              refcount: 1,
	              value: value
	            };
	            return handle;
	          }
	      }
	    }
	  };

	  function __embind_register_emval(rawType, name) {
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      "fromWireType": function (handle) {
	        var rv = Emval.toValue(handle);

	        __emval_decref(handle);

	        return rv;
	      },
	      "toWireType": function (destructors, value) {
	        return Emval.toHandle(value);
	      },
	      "argPackAdvance": 8,
	      "readValueFromPointer": simpleReadValueFromPointer,
	      destructorFunction: null
	    });
	  }

	  function embindRepr(v) {
	    if (v === null) {
	      return "null";
	    }

	    var t = typeof v;

	    if (t === "object" || t === "array" || t === "function") {
	      return v.toString();
	    } else {
	      return "" + v;
	    }
	  }

	  function floatReadValueFromPointer(name, shift) {
	    switch (shift) {
	      case 2:
	        return function (pointer) {
	          return this["fromWireType"](HEAPF32[pointer >> 2]);
	        };

	      case 3:
	        return function (pointer) {
	          return this["fromWireType"](HEAPF64[pointer >> 3]);
	        };

	      default:
	        throw new TypeError("Unknown float type: " + name);
	    }
	  }

	  function __embind_register_float(rawType, name, size) {
	    var shift = getShiftFromSize(size);
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      "fromWireType": function (value) {
	        return value;
	      },
	      "toWireType": function (destructors, value) {
	        return value;
	      },
	      "argPackAdvance": 8,
	      "readValueFromPointer": floatReadValueFromPointer(name, shift),
	      destructorFunction: null
	    });
	  }

	  function integerReadValueFromPointer(name, shift, signed) {
	    switch (shift) {
	      case 0:
	        return signed ? function readS8FromPointer(pointer) {
	          return HEAP8[pointer];
	        } : function readU8FromPointer(pointer) {
	          return HEAPU8[pointer];
	        };

	      case 1:
	        return signed ? function readS16FromPointer(pointer) {
	          return HEAP16[pointer >> 1];
	        } : function readU16FromPointer(pointer) {
	          return HEAPU16[pointer >> 1];
	        };

	      case 2:
	        return signed ? function readS32FromPointer(pointer) {
	          return HEAP32[pointer >> 2];
	        } : function readU32FromPointer(pointer) {
	          return HEAPU32[pointer >> 2];
	        };

	      default:
	        throw new TypeError("Unknown integer type: " + name);
	    }
	  }

	  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
	    name = readLatin1String(name);

	    var shift = getShiftFromSize(size);

	    var fromWireType = value => value;

	    if (minRange === 0) {
	      var bitshift = 32 - 8 * size;

	      fromWireType = value => value << bitshift >>> bitshift;
	    }

	    var isUnsignedType = name.includes("unsigned");

	    var checkAssertions = (value, toTypeName) => {};

	    var toWireType;

	    if (isUnsignedType) {
	      toWireType = function (destructors, value) {
	        checkAssertions(value, this.name);
	        return value >>> 0;
	      };
	    } else {
	      toWireType = function (destructors, value) {
	        checkAssertions(value, this.name);
	        return value;
	      };
	    }

	    registerType(primitiveType, {
	      name: name,
	      "fromWireType": fromWireType,
	      "toWireType": toWireType,
	      "argPackAdvance": 8,
	      "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
	      destructorFunction: null
	    });
	  }

	  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
	    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
	    var TA = typeMapping[dataTypeIndex];

	    function decodeMemoryView(handle) {
	      handle = handle >> 2;
	      var heap = HEAPU32;
	      var size = heap[handle];
	      var data = heap[handle + 1];
	      return new TA(buffer, data, size);
	    }

	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      "fromWireType": decodeMemoryView,
	      "argPackAdvance": 8,
	      "readValueFromPointer": decodeMemoryView
	    }, {
	      ignoreDuplicateRegistrations: true
	    });
	  }

	  function __embind_register_std_string(rawType, name) {
	    name = readLatin1String(name);
	    var stdStringIsUTF8 = name === "std::string";
	    registerType(rawType, {
	      name: name,
	      "fromWireType": function (value) {
	        var length = HEAPU32[value >> 2];
	        var payload = value + 4;
	        var str;

	        if (stdStringIsUTF8) {
	          var decodeStartPtr = payload;

	          for (var i = 0; i <= length; ++i) {
	            var currentBytePtr = payload + i;

	            if (i == length || HEAPU8[currentBytePtr] == 0) {
	              var maxRead = currentBytePtr - decodeStartPtr;
	              var stringSegment = UTF8ToString(decodeStartPtr, maxRead);

	              if (str === undefined) {
	                str = stringSegment;
	              } else {
	                str += String.fromCharCode(0);
	                str += stringSegment;
	              }

	              decodeStartPtr = currentBytePtr + 1;
	            }
	          }
	        } else {
	          var a = new Array(length);

	          for (var i = 0; i < length; ++i) {
	            a[i] = String.fromCharCode(HEAPU8[payload + i]);
	          }

	          str = a.join("");
	        }

	        _free(value);

	        return str;
	      },
	      "toWireType": function (destructors, value) {
	        if (value instanceof ArrayBuffer) {
	          value = new Uint8Array(value);
	        }

	        var length;
	        var valueIsOfTypeString = typeof value == "string";

	        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
	          throwBindingError("Cannot pass non-string to std::string");
	        }

	        if (stdStringIsUTF8 && valueIsOfTypeString) {
	          length = lengthBytesUTF8(value);
	        } else {
	          length = value.length;
	        }

	        var base = _malloc(4 + length + 1);

	        var ptr = base + 4;
	        HEAPU32[base >> 2] = length;

	        if (stdStringIsUTF8 && valueIsOfTypeString) {
	          stringToUTF8(value, ptr, length + 1);
	        } else {
	          if (valueIsOfTypeString) {
	            for (var i = 0; i < length; ++i) {
	              var charCode = value.charCodeAt(i);

	              if (charCode > 255) {
	                _free(ptr);

	                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
	              }

	              HEAPU8[ptr + i] = charCode;
	            }
	          } else {
	            for (var i = 0; i < length; ++i) {
	              HEAPU8[ptr + i] = value[i];
	            }
	          }
	        }

	        if (destructors !== null) {
	          destructors.push(_free, base);
	        }

	        return base;
	      },
	      "argPackAdvance": 8,
	      "readValueFromPointer": simpleReadValueFromPointer,
	      destructorFunction: function (ptr) {
	        _free(ptr);
	      }
	    });
	  }

	  function __embind_register_std_wstring(rawType, charSize, name) {
	    name = readLatin1String(name);
	    var decodeString, encodeString, getHeap, lengthBytesUTF, shift;

	    if (charSize === 2) {
	      decodeString = UTF16ToString;
	      encodeString = stringToUTF16;
	      lengthBytesUTF = lengthBytesUTF16;

	      getHeap = () => HEAPU16;

	      shift = 1;
	    } else if (charSize === 4) {
	      decodeString = UTF32ToString;
	      encodeString = stringToUTF32;
	      lengthBytesUTF = lengthBytesUTF32;

	      getHeap = () => HEAPU32;

	      shift = 2;
	    }

	    registerType(rawType, {
	      name: name,
	      "fromWireType": function (value) {
	        var length = HEAPU32[value >> 2];
	        var HEAP = getHeap();
	        var str;
	        var decodeStartPtr = value + 4;

	        for (var i = 0; i <= length; ++i) {
	          var currentBytePtr = value + 4 + i * charSize;

	          if (i == length || HEAP[currentBytePtr >> shift] == 0) {
	            var maxReadBytes = currentBytePtr - decodeStartPtr;
	            var stringSegment = decodeString(decodeStartPtr, maxReadBytes);

	            if (str === undefined) {
	              str = stringSegment;
	            } else {
	              str += String.fromCharCode(0);
	              str += stringSegment;
	            }

	            decodeStartPtr = currentBytePtr + charSize;
	          }
	        }

	        _free(value);

	        return str;
	      },
	      "toWireType": function (destructors, value) {
	        if (!(typeof value == "string")) {
	          throwBindingError("Cannot pass non-string to C++ string type " + name);
	        }

	        var length = lengthBytesUTF(value);

	        var ptr = _malloc(4 + length + charSize);

	        HEAPU32[ptr >> 2] = length >> shift;
	        encodeString(value, ptr + 4, length + charSize);

	        if (destructors !== null) {
	          destructors.push(_free, ptr);
	        }

	        return ptr;
	      },
	      "argPackAdvance": 8,
	      "readValueFromPointer": simpleReadValueFromPointer,
	      destructorFunction: function (ptr) {
	        _free(ptr);
	      }
	    });
	  }

	  function __embind_register_void(rawType, name) {
	    name = readLatin1String(name);
	    registerType(rawType, {
	      isVoid: true,
	      name: name,
	      "argPackAdvance": 0,
	      "fromWireType": function () {
	        return undefined;
	      },
	      "toWireType": function (destructors, o) {
	        return undefined;
	      }
	    });
	  }

	  function __emscripten_date_now() {
	    return Date.now();
	  }

	  var emval_symbols = {};

	  function getStringOrSymbol(address) {
	    var symbol = emval_symbols[address];

	    if (symbol === undefined) {
	      return readLatin1String(address);
	    }

	    return symbol;
	  }

	  var emval_methodCallers = [];

	  function __emval_call_void_method(caller, handle, methodName, args) {
	    caller = emval_methodCallers[caller];
	    handle = Emval.toValue(handle);
	    methodName = getStringOrSymbol(methodName);
	    caller(handle, methodName, null, args);
	  }

	  function emval_addMethodCaller(caller) {
	    var id = emval_methodCallers.length;
	    emval_methodCallers.push(caller);
	    return id;
	  }

	  function requireRegisteredType(rawType, humanName) {
	    var impl = registeredTypes[rawType];

	    if (undefined === impl) {
	      throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
	    }

	    return impl;
	  }

	  function emval_lookupTypes(argCount, argTypes) {
	    var a = new Array(argCount);

	    for (var i = 0; i < argCount; ++i) {
	      a[i] = requireRegisteredType(HEAPU32[argTypes + i * POINTER_SIZE >> 2], "parameter " + i);
	    }

	    return a;
	  }

	  var emval_registeredMethods = [];

	  function __emval_get_method_caller(argCount, argTypes) {
	    var types = emval_lookupTypes(argCount, argTypes);
	    var retType = types[0];
	    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) {
	      return t.name;
	    }).join("_") + "$";
	    var returnId = emval_registeredMethods[signatureName];

	    if (returnId !== undefined) {
	      return returnId;
	    }

	    var params = ["retType"];
	    var args = [retType];
	    var argsList = "";

	    for (var i = 0; i < argCount - 1; ++i) {
	      argsList += (i !== 0 ? ", " : "") + "arg" + i;
	      params.push("argType" + i);
	      args.push(types[1 + i]);
	    }

	    var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
	    var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
	    var offset = 0;

	    for (var i = 0; i < argCount - 1; ++i) {
	      functionBody += "    var arg" + i + " = argType" + i + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
	      offset += types[i + 1]["argPackAdvance"];
	    }

	    functionBody += "    var rv = handle[name](" + argsList + ");\n";

	    for (var i = 0; i < argCount - 1; ++i) {
	      if (types[i + 1]["deleteObject"]) {
	        functionBody += "    argType" + i + ".deleteObject(arg" + i + ");\n";
	      }
	    }

	    if (!retType.isVoid) {
	      functionBody += "    return retType.toWireType(destructors, rv);\n";
	    }

	    functionBody += "};\n";
	    params.push(functionBody);
	    var invokerFunction = new_(Function, params).apply(null, args);
	    returnId = emval_addMethodCaller(invokerFunction);
	    emval_registeredMethods[signatureName] = returnId;
	    return returnId;
	  }

	  function _abort() {
	    abort("");
	  }

	  function getHeapMax() {
	    return HEAPU8.length;
	  }

	  function _emscripten_get_heap_max() {
	    return getHeapMax();
	  }

	  function abortOnCannotGrowMemory(requestedSize) {
	    abort("OOM");
	  }

	  function _emscripten_resize_heap(requestedSize) {
	    HEAPU8.length;
	    abortOnCannotGrowMemory();
	  }

	  var ENV = {};

	  function getExecutableName() {
	    return thisProgram || "./this.program";
	  }

	  function getEnvStrings() {
	    if (!getEnvStrings.strings) {
	      var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
	      var env = {
	        "USER": "web_user",
	        "LOGNAME": "web_user",
	        "PATH": "/",
	        "PWD": "/",
	        "HOME": "/home/web_user",
	        "LANG": lang,
	        "_": getExecutableName()
	      };

	      for (var x in ENV) {
	        if (ENV[x] === undefined) delete env[x];else env[x] = ENV[x];
	      }

	      var strings = [];

	      for (var x in env) {
	        strings.push(x + "=" + env[x]);
	      }

	      getEnvStrings.strings = strings;
	    }

	    return getEnvStrings.strings;
	  }

	  function _environ_get(__environ, environ_buf) {
	    var bufSize = 0;
	    getEnvStrings().forEach(function (string, i) {
	      var ptr = environ_buf + bufSize;
	      HEAPU32[__environ + i * 4 >> 2] = ptr;
	      writeAsciiToMemory(string, ptr);
	      bufSize += string.length + 1;
	    });
	    return 0;
	  }

	  function _environ_sizes_get(penviron_count, penviron_buf_size) {
	    var strings = getEnvStrings();
	    HEAPU32[penviron_count >> 2] = strings.length;
	    var bufSize = 0;
	    strings.forEach(function (string) {
	      bufSize += string.length + 1;
	    });
	    HEAPU32[penviron_buf_size >> 2] = bufSize;
	    return 0;
	  }

	  function _fd_close(fd) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      FS.close(stream);
	      return 0;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function _fd_fdstat_get(fd, pbuf) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
	      HEAP8[pbuf >> 0] = type;
	      return 0;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function doReadv(stream, iov, iovcnt, offset) {
	    var ret = 0;

	    for (var i = 0; i < iovcnt; i++) {
	      var ptr = HEAPU32[iov >> 2];
	      var len = HEAPU32[iov + 4 >> 2];
	      iov += 8;
	      var curr = FS.read(stream, HEAP8, ptr, len, offset);
	      if (curr < 0) return -1;
	      ret += curr;
	      if (curr < len) break;
	    }

	    return ret;
	  }

	  function _fd_read(fd, iov, iovcnt, pnum) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      var num = doReadv(stream, iov, iovcnt);
	      HEAP32[pnum >> 2] = num;
	      return 0;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function convertI32PairToI53Checked(lo, hi) {
	    return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
	  }

	  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
	    try {
	      var offset = convertI32PairToI53Checked(offset_low, offset_high);
	      if (isNaN(offset)) return 61;
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      FS.llseek(stream, offset, whence);
	      tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
	      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
	      return 0;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function doWritev(stream, iov, iovcnt, offset) {
	    var ret = 0;

	    for (var i = 0; i < iovcnt; i++) {
	      var ptr = HEAPU32[iov >> 2];
	      var len = HEAPU32[iov + 4 >> 2];
	      iov += 8;
	      var curr = FS.write(stream, HEAP8, ptr, len, offset);
	      if (curr < 0) return -1;
	      ret += curr;
	    }

	    return ret;
	  }

	  function _fd_write(fd, iov, iovcnt, pnum) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      var num = doWritev(stream, iov, iovcnt);
	      HEAPU32[pnum >> 2] = num;
	      return 0;
	    } catch (e) {
	      if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function _setTempRet0(val) {
	  }

	  var FSNode = function (parent, name, mode, rdev) {
	    if (!parent) {
	      parent = this;
	    }

	    this.parent = parent;
	    this.mount = parent.mount;
	    this.mounted = null;
	    this.id = FS.nextInode++;
	    this.name = name;
	    this.mode = mode;
	    this.node_ops = {};
	    this.stream_ops = {};
	    this.rdev = rdev;
	  };

	  var readMode = 292 | 73;
	  var writeMode = 146;
	  Object.defineProperties(FSNode.prototype, {
	    read: {
	      get: function () {
	        return (this.mode & readMode) === readMode;
	      },
	      set: function (val) {
	        val ? this.mode |= readMode : this.mode &= ~readMode;
	      }
	    },
	    write: {
	      get: function () {
	        return (this.mode & writeMode) === writeMode;
	      },
	      set: function (val) {
	        val ? this.mode |= writeMode : this.mode &= ~writeMode;
	      }
	    },
	    isFolder: {
	      get: function () {
	        return FS.isDir(this.mode);
	      }
	    },
	    isDevice: {
	      get: function () {
	        return FS.isChrdev(this.mode);
	      }
	    }
	  });
	  FS.FSNode = FSNode;
	  FS.staticInit();
	  embind_init_charCodes();
	  BindingError = Module["BindingError"] = extendError(Error, "BindingError");
	  InternalError = Module["InternalError"] = extendError(Error, "InternalError");
	  init_ClassHandle();
	  init_embind();
	  init_RegisteredPointer();
	  UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
	  init_emval();

	  function intArrayFromString(stringy, dontAddNull, length) {
	    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
	    var u8array = new Array(len);
	    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
	    if (dontAddNull) u8array.length = numBytesWritten;
	    return u8array;
	  }

	  var asmLibraryArg = {
	    "A": ___syscall_fcntl64,
	    "v": ___syscall_openat,
	    "s": __embind_register_bigint,
	    "p": __embind_register_bool,
	    "o": __embind_register_class,
	    "j": __embind_register_class_constructor,
	    "d": __embind_register_class_function,
	    "B": __embind_register_emval,
	    "n": __embind_register_float,
	    "c": __embind_register_integer,
	    "b": __embind_register_memory_view,
	    "m": __embind_register_std_string,
	    "i": __embind_register_std_wstring,
	    "q": __embind_register_void,
	    "h": __emscripten_date_now,
	    "g": __emval_call_void_method,
	    "C": __emval_decref,
	    "e": __emval_get_method_caller,
	    "a": _abort,
	    "u": _emscripten_get_heap_max,
	    "t": _emscripten_resize_heap,
	    "x": _environ_get,
	    "y": _environ_sizes_get,
	    "l": _fd_close,
	    "w": _fd_fdstat_get,
	    "z": _fd_read,
	    "r": _fd_seek,
	    "k": _fd_write,
	    "f": _setTempRet0
	  };
	  createWasm();

	  Module["___wasm_call_ctors"] = function () {
	    return (Module["___wasm_call_ctors"] = Module["asm"]["E"]).apply(null, arguments);
	  };

	  var _free = Module["_free"] = function () {
	    return (_free = Module["_free"] = Module["asm"]["F"]).apply(null, arguments);
	  };

	  var _malloc = Module["_malloc"] = function () {
	    return (_malloc = Module["_malloc"] = Module["asm"]["G"]).apply(null, arguments);
	  };

	  var ___errno_location = Module["___errno_location"] = function () {
	    return (___errno_location = Module["___errno_location"] = Module["asm"]["I"]).apply(null, arguments);
	  };

	  var ___getTypeName = Module["___getTypeName"] = function () {
	    return (___getTypeName = Module["___getTypeName"] = Module["asm"]["J"]).apply(null, arguments);
	  };

	  Module["___embind_register_native_and_builtin_types"] = function () {
	    return (Module["___embind_register_native_and_builtin_types"] = Module["asm"]["K"]).apply(null, arguments);
	  };

	  var _emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = function () {
	    return (_emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = Module["asm"]["L"]).apply(null, arguments);
	  };

	  Module["dynCall_viiijj"] = function () {
	    return (Module["dynCall_viiijj"] = Module["asm"]["M"]).apply(null, arguments);
	  };

	  Module["dynCall_jij"] = function () {
	    return (Module["dynCall_jij"] = Module["asm"]["N"]).apply(null, arguments);
	  };

	  Module["dynCall_jii"] = function () {
	    return (Module["dynCall_jii"] = Module["asm"]["O"]).apply(null, arguments);
	  };

	  Module["dynCall_jiji"] = function () {
	    return (Module["dynCall_jiji"] = Module["asm"]["P"]).apply(null, arguments);
	  };

	  Module["_ff_h264_cabac_tables"] = 117861;

	  var calledRun;

	  function ExitStatus(status) {
	    this.name = "ExitStatus";
	    this.message = "Program terminated with exit(" + status + ")";
	    this.status = status;
	  }

	  dependenciesFulfilled = function runCaller() {
	    if (!calledRun) run();
	    if (!calledRun) dependenciesFulfilled = runCaller;
	  };

	  function run(args) {

	    if (runDependencies > 0) {
	      return;
	    }

	    preRun();

	    if (runDependencies > 0) {
	      return;
	    }

	    function doRun() {
	      if (calledRun) return;
	      calledRun = true;
	      Module["calledRun"] = true;
	      if (ABORT) return;
	      initRuntime();
	      if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
	      postRun();
	    }

	    if (Module["setStatus"]) {
	      Module["setStatus"]("Running...");
	      setTimeout(function () {
	        setTimeout(function () {
	          Module["setStatus"]("");
	        }, 1);
	        doRun();
	      }, 1);
	    } else {
	      doRun();
	    }
	  }

	  Module["run"] = run;

	  if (Module["preInit"]) {
	    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];

	    while (Module["preInit"].length > 0) {
	      Module["preInit"].pop()();
	    }
	  }

	  run();
	  module.exports = Module;
	});

	var decoder_simd = createCommonjsModule(function (module) {
	  // The Module object: Our interface to the outside world. We import
	  // and export values on it. There are various ways Module can be used:
	  // 1. Not defined. We create it here
	  // 2. A function parameter, function(Module) { ..generated code.. }
	  // 3. pre-run appended it, var Module = {}; ..generated code..
	  // 4. External script tag defines var Module.
	  // We need to check if Module already exists (e.g. case 3 above).
	  // Substitution will be replaced with actual code on later stage of the build,
	  // this way Closure Compiler will not mangle it (e.g. case 4. above).
	  // Note that if you want to run closure, and also to use Module
	  // after the generated code, you will need to define   var Module = {};
	  // before the code. Then that object will be used in the code, and you
	  // can continue to use Module afterwards as well.
	  var Module = typeof Module != 'undefined' ? Module : {}; // See https://caniuse.com/mdn-javascript_builtins_object_assign
	  // --pre-jses are emitted after the Module integration code, so that they can
	  // refer to Module (if they choose; they can also define Module)
	  // Sometimes an existing Module object exists with properties
	  // meant to overwrite the default module functionality. Here
	  // we collect those properties and reapply _after_ we configure
	  // the current environment's defaults to avoid having to be so
	  // defensive during initialization.

	  var moduleOverrides = Object.assign({}, Module);
	  var thisProgram = './this.program';
	  // setting the ENVIRONMENT setting at compile time (see settings.js).
	  // Attempt to auto-detect the environment


	  var ENVIRONMENT_IS_WEB = typeof window == 'object';
	  var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function'; // N.b. Electron.js environment is simultaneously a NODE-environment, but
	  // also a web environment.

	  var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';

	  var scriptDirectory = '';

	  function locateFile(path) {
	    if (Module['locateFile']) {
	      return Module['locateFile'](path, scriptDirectory);
	    }

	    return scriptDirectory + path;
	  } // Hooks that are implemented differently in different runtime environments.


	  var read_, readAsync, readBinary; // Normally we don't log exceptions but instead let them bubble out the top

	  var fs;
	  var nodePath;
	  var requireNodeFS;

	  if (ENVIRONMENT_IS_NODE) {
	    if (ENVIRONMENT_IS_WORKER) {
	      scriptDirectory = path__default["default"].dirname(scriptDirectory) + '/';
	    } else {
	      scriptDirectory = __dirname + '/';
	    } // include: node_shell_read.js


	    requireNodeFS = () => {
	      // Use nodePath as the indicator for these not being initialized,
	      // since in some environments a global fs may have already been
	      // created.
	      if (!nodePath) {
	        fs = fs__default["default"];
	        nodePath = path__default["default"];
	      }
	    };

	    read_ = function shell_read(filename, binary) {
	      requireNodeFS();
	      filename = nodePath['normalize'](filename);
	      return fs.readFileSync(filename, binary ? undefined : 'utf8');
	    };

	    readBinary = filename => {
	      var ret = read_(filename, true);

	      if (!ret.buffer) {
	        ret = new Uint8Array(ret);
	      }

	      return ret;
	    };

	    readAsync = (filename, onload, onerror) => {
	      requireNodeFS();
	      filename = nodePath['normalize'](filename);
	      fs.readFile(filename, function (err, data) {
	        if (err) onerror(err);else onload(data.buffer);
	      });
	    }; // end include: node_shell_read.js


	    if (process['argv'].length > 1) {
	      thisProgram = process['argv'][1].replace(/\\/g, '/');
	    }

	    process['argv'].slice(2);

	    {
	      module['exports'] = Module;
	    }

	    process['on']('uncaughtException', function (ex) {
	      // suppress ExitStatus exceptions from showing an error
	      if (!(ex instanceof ExitStatus)) {
	        throw ex;
	      }
	    }); // Without this older versions of node (< v15) will log unhandled rejections
	    // but return 0, which is not normally the desired behaviour.  This is
	    // not be needed with node v15 and about because it is now the default
	    // behaviour:
	    // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode

	    process['on']('unhandledRejection', function (reason) {
	      throw reason;
	    });

	    Module['inspect'] = function () {
	      return '[Emscripten Module object]';
	    };
	  } else // Note that this includes Node.js workers when relevant (pthreads is enabled).
	    // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
	    // ENVIRONMENT_IS_NODE.
	    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
	      if (ENVIRONMENT_IS_WORKER) {
	        // Check worker, not web, since window could be polyfilled
	        scriptDirectory = self.location.href;
	      } else if (typeof document != 'undefined' && document.currentScript) {
	        // web
	        scriptDirectory = document.currentScript.src;
	      } // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
	      // otherwise, slice off the final part of the url to find the script directory.
	      // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
	      // and scriptDirectory will correctly be replaced with an empty string.
	      // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
	      // they are removed because they could contain a slash.


	      if (scriptDirectory.indexOf('blob:') !== 0) {
	        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/') + 1);
	      } else {
	        scriptDirectory = '';
	      } // Differentiate the Web Worker from the Node Worker case, as reading must
	      // be done differently.


	      {
	        // include: web_or_worker_shell_read.js
	        read_ = url => {
	          var xhr = new XMLHttpRequest();
	          xhr.open('GET', url, false);
	          xhr.send(null);
	          return xhr.responseText;
	        };

	        if (ENVIRONMENT_IS_WORKER) {
	          readBinary = url => {
	            var xhr = new XMLHttpRequest();
	            xhr.open('GET', url, false);
	            xhr.responseType = 'arraybuffer';
	            xhr.send(null);
	            return new Uint8Array(
	            /** @type{!ArrayBuffer} */
	            xhr.response);
	          };
	        }

	        readAsync = (url, onload, onerror) => {
	          var xhr = new XMLHttpRequest();
	          xhr.open('GET', url, true);
	          xhr.responseType = 'arraybuffer';

	          xhr.onload = () => {
	            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
	              // file URLs can return 0
	              onload(xhr.response);
	              return;
	            }

	            onerror();
	          };

	          xhr.onerror = onerror;
	          xhr.send(null);
	        }; // end include: web_or_worker_shell_read.js

	      }
	    } else ;

	  var out = Module['print'] || console.log.bind(console);
	  var err = Module['printErr'] || console.warn.bind(console); // Merge back in the overrides

	  Object.assign(Module, moduleOverrides); // Free the object hierarchy contained in the overrides, this lets the GC
	  // reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.

	  moduleOverrides = null; // Emit code to handle expected values on the Module object. This applies Module.x
	  // to the proper local x. This has two benefits: first, we only emit it if it is
	  // expected to arrive, and second, by using a local everywhere else that can be
	  // minified.

	  if (Module['arguments']) Module['arguments'];
	  if (Module['thisProgram']) thisProgram = Module['thisProgram'];
	  if (Module['quit']) Module['quit']; // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
	  var POINTER_SIZE = 4;
	  // Documentation for the public APIs defined in this file must be updated in:
	  //    site/source/docs/api_reference/preamble.js.rst
	  // A prebuilt local version of the documentation is available at:
	  //    site/build/text/docs/api_reference/preamble.js.txt
	  // You can also build docs locally as HTML or other formats in site/
	  // An online HTML version (which may be of a different version of Emscripten)
	  //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html


	  var wasmBinary;
	  if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
	  Module['noExitRuntime'] || true;

	  if (typeof WebAssembly != 'object') {
	    abort('no native wasm support detected');
	  } // Wasm globals


	  var wasmMemory; //========================================
	  // Runtime essentials
	  //========================================
	  // whether we are quitting the application. no code should run after this.
	  // set in exit() and abort()

	  var ABORT = false; // set by exit() and abort().  Passed to 'onExit' handler.
	  /** @type {function(*, string=)} */

	  function assert(condition, text) {
	    if (!condition) {
	      // This build was created without ASSERTIONS defined.  `assert()` should not
	      // ever be called in this configuration but in case there are callers in
	      // the wild leave this simple abort() implemenation here for now.
	      abort(text);
	    }
	  } // Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
	  // include: runtime_strings.js
	  // runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.


	  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined; // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
	  // a copy of that string as a Javascript String object.

	  /**
	   * heapOrArray is either a regular array, or a JavaScript typed array view.
	   * @param {number} idx
	   * @param {number=} maxBytesToRead
	   * @return {string}
	   */

	  function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
	    var endIdx = idx + maxBytesToRead;
	    var endPtr = idx; // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
	    // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
	    // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)

	    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

	    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
	      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
	    } else {
	      var str = ''; // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that

	      while (idx < endPtr) {
	        // For UTF8 byte structure, see:
	        // http://en.wikipedia.org/wiki/UTF-8#Description
	        // https://www.ietf.org/rfc/rfc2279.txt
	        // https://tools.ietf.org/html/rfc3629
	        var u0 = heapOrArray[idx++];

	        if (!(u0 & 0x80)) {
	          str += String.fromCharCode(u0);
	          continue;
	        }

	        var u1 = heapOrArray[idx++] & 63;

	        if ((u0 & 0xE0) == 0xC0) {
	          str += String.fromCharCode((u0 & 31) << 6 | u1);
	          continue;
	        }

	        var u2 = heapOrArray[idx++] & 63;

	        if ((u0 & 0xF0) == 0xE0) {
	          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
	        } else {
	          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
	        }

	        if (u0 < 0x10000) {
	          str += String.fromCharCode(u0);
	        } else {
	          var ch = u0 - 0x10000;
	          str += String.fromCharCode(0xD800 | ch >> 10, 0xDC00 | ch & 0x3FF);
	        }
	      }
	    }

	    return str;
	  } // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
	  // copy of that string as a Javascript String object.
	  // maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
	  //                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
	  //                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
	  //                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
	  //                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
	  //                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
	  //                 throw JS JIT optimizations off, so it is worth to consider consistently using one
	  //                 style or the other.

	  /**
	   * @param {number} ptr
	   * @param {number=} maxBytesToRead
	   * @return {string}
	   */


	  function UTF8ToString(ptr, maxBytesToRead) {
	    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
	  } // Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
	  // encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
	  // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
	  // Parameters:
	  //   str: the Javascript string to copy.
	  //   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
	  //   outIdx: The starting offset in the array to begin the copying.
	  //   maxBytesToWrite: The maximum number of bytes this function can write to the array.
	  //                    This count should include the null terminator,
	  //                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
	  //                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
	  // Returns the number of bytes written, EXCLUDING the null terminator.


	  function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
	    if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
	      return 0;
	    var startIdx = outIdx;
	    var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.

	    for (var i = 0; i < str.length; ++i) {
	      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
	      // See http://unicode.org/faq/utf_bom.html#utf16-3
	      // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
	      var u = str.charCodeAt(i); // possibly a lead surrogate

	      if (u >= 0xD800 && u <= 0xDFFF) {
	        var u1 = str.charCodeAt(++i);
	        u = 0x10000 + ((u & 0x3FF) << 10) | u1 & 0x3FF;
	      }

	      if (u <= 0x7F) {
	        if (outIdx >= endIdx) break;
	        heap[outIdx++] = u;
	      } else if (u <= 0x7FF) {
	        if (outIdx + 1 >= endIdx) break;
	        heap[outIdx++] = 0xC0 | u >> 6;
	        heap[outIdx++] = 0x80 | u & 63;
	      } else if (u <= 0xFFFF) {
	        if (outIdx + 2 >= endIdx) break;
	        heap[outIdx++] = 0xE0 | u >> 12;
	        heap[outIdx++] = 0x80 | u >> 6 & 63;
	        heap[outIdx++] = 0x80 | u & 63;
	      } else {
	        if (outIdx + 3 >= endIdx) break;
	        heap[outIdx++] = 0xF0 | u >> 18;
	        heap[outIdx++] = 0x80 | u >> 12 & 63;
	        heap[outIdx++] = 0x80 | u >> 6 & 63;
	        heap[outIdx++] = 0x80 | u & 63;
	      }
	    } // Null-terminate the pointer to the buffer.


	    heap[outIdx] = 0;
	    return outIdx - startIdx;
	  } // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
	  // null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
	  // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
	  // Returns the number of bytes written, EXCLUDING the null terminator.


	  function stringToUTF8(str, outPtr, maxBytesToWrite) {
	    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
	  } // Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.


	  function lengthBytesUTF8(str) {
	    var len = 0;

	    for (var i = 0; i < str.length; ++i) {
	      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
	      // See http://unicode.org/faq/utf_bom.html#utf16-3
	      var u = str.charCodeAt(i); // possibly a lead surrogate

	      if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | str.charCodeAt(++i) & 0x3FF;
	      if (u <= 0x7F) ++len;else if (u <= 0x7FF) len += 2;else if (u <= 0xFFFF) len += 3;else len += 4;
	    }

	    return len;
	  } // end include: runtime_strings.js
	  // a copy of that string as a Javascript String object.


	  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;

	  function UTF16ToString(ptr, maxBytesToRead) {
	    var endPtr = ptr; // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
	    // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.

	    var idx = endPtr >> 1;
	    var maxIdx = idx + maxBytesToRead / 2; // If maxBytesToRead is not passed explicitly, it will be undefined, and this
	    // will always evaluate to true. This saves on code size.

	    while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;

	    endPtr = idx << 1;

	    if (endPtr - ptr > 32 && UTF16Decoder) {
	      return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
	    } else {
	      var str = ''; // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
	      // will always evaluate to true. The loop is then terminated on the first null char.

	      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
	        var codeUnit = HEAP16[ptr + i * 2 >> 1];
	        if (codeUnit == 0) break; // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.

	        str += String.fromCharCode(codeUnit);
	      }

	      return str;
	    }
	  } // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
	  // null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
	  // Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
	  // Parameters:
	  //   str: the Javascript string to copy.
	  //   outPtr: Byte address in Emscripten HEAP where to write the string to.
	  //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
	  //                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
	  //                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
	  // Returns the number of bytes written, EXCLUDING the null terminator.


	  function stringToUTF16(str, outPtr, maxBytesToWrite) {
	    // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
	    if (maxBytesToWrite === undefined) {
	      maxBytesToWrite = 0x7FFFFFFF;
	    }

	    if (maxBytesToWrite < 2) return 0;
	    maxBytesToWrite -= 2; // Null terminator.

	    var startPtr = outPtr;
	    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;

	    for (var i = 0; i < numCharsToWrite; ++i) {
	      // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
	      var codeUnit = str.charCodeAt(i); // possibly a lead surrogate

	      HEAP16[outPtr >> 1] = codeUnit;
	      outPtr += 2;
	    } // Null-terminate the pointer to the HEAP.


	    HEAP16[outPtr >> 1] = 0;
	    return outPtr - startPtr;
	  } // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.


	  function lengthBytesUTF16(str) {
	    return str.length * 2;
	  }

	  function UTF32ToString(ptr, maxBytesToRead) {
	    var i = 0;
	    var str = ''; // If maxBytesToRead is not passed explicitly, it will be undefined, and this
	    // will always evaluate to true. This saves on code size.

	    while (!(i >= maxBytesToRead / 4)) {
	      var utf32 = HEAP32[ptr + i * 4 >> 2];
	      if (utf32 == 0) break;
	      ++i; // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
	      // See http://unicode.org/faq/utf_bom.html#utf16-3

	      if (utf32 >= 0x10000) {
	        var ch = utf32 - 0x10000;
	        str += String.fromCharCode(0xD800 | ch >> 10, 0xDC00 | ch & 0x3FF);
	      } else {
	        str += String.fromCharCode(utf32);
	      }
	    }

	    return str;
	  } // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
	  // null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
	  // Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
	  // Parameters:
	  //   str: the Javascript string to copy.
	  //   outPtr: Byte address in Emscripten HEAP where to write the string to.
	  //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
	  //                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
	  //                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
	  // Returns the number of bytes written, EXCLUDING the null terminator.


	  function stringToUTF32(str, outPtr, maxBytesToWrite) {
	    // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
	    if (maxBytesToWrite === undefined) {
	      maxBytesToWrite = 0x7FFFFFFF;
	    }

	    if (maxBytesToWrite < 4) return 0;
	    var startPtr = outPtr;
	    var endPtr = startPtr + maxBytesToWrite - 4;

	    for (var i = 0; i < str.length; ++i) {
	      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
	      // See http://unicode.org/faq/utf_bom.html#utf16-3
	      var codeUnit = str.charCodeAt(i); // possibly a lead surrogate

	      if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
	        var trailSurrogate = str.charCodeAt(++i);
	        codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | trailSurrogate & 0x3FF;
	      }

	      HEAP32[outPtr >> 2] = codeUnit;
	      outPtr += 4;
	      if (outPtr + 4 > endPtr) break;
	    } // Null-terminate the pointer to the HEAP.


	    HEAP32[outPtr >> 2] = 0;
	    return outPtr - startPtr;
	  } // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.


	  function lengthBytesUTF32(str) {
	    var len = 0;

	    for (var i = 0; i < str.length; ++i) {
	      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
	      // See http://unicode.org/faq/utf_bom.html#utf16-3
	      var codeUnit = str.charCodeAt(i);
	      if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.

	      len += 4;
	    }

	    return len;
	  } // Allocate heap space for a JS string, and write it there.
	  // It is the responsibility of the caller to free() that memory.


	  function allocateUTF8(str) {
	    var size = lengthBytesUTF8(str) + 1;

	    var ret = _malloc(size);

	    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
	    return ret;
	  } // Allocate stack space for a JS string, and write it there.
	  /** @param {boolean=} dontAddNull */


	  function writeAsciiToMemory(str, buffer, dontAddNull) {
	    for (var i = 0; i < str.length; ++i) {
	      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
	    } // Null-terminate the pointer to the HEAP.


	    if (!dontAddNull) HEAP8[buffer >> 0] = 0;
	  } // end include: runtime_strings_extra.js
	  // Memory management


	  var /** @type {!ArrayBuffer} */
	  buffer,
	  /** @type {!Int8Array} */
	  HEAP8,
	  /** @type {!Uint8Array} */
	  HEAPU8,
	  /** @type {!Int16Array} */
	  HEAP16,
	  /** @type {!Uint16Array} */
	  HEAPU16,
	  /** @type {!Int32Array} */
	  HEAP32,
	  /** @type {!Uint32Array} */
	  HEAPU32,
	  /** @type {!Float32Array} */
	  HEAPF32,
	  /** @type {!Float64Array} */
	  HEAPF64;

	  function updateGlobalBufferAndViews(buf) {
	    buffer = buf;
	    Module['HEAP8'] = HEAP8 = new Int8Array(buf);
	    Module['HEAP16'] = HEAP16 = new Int16Array(buf);
	    Module['HEAP32'] = HEAP32 = new Int32Array(buf);
	    Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
	    Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
	    Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
	    Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
	    Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
	  }
	  Module['INITIAL_MEMORY'] || 536870912; // include: runtime_init_table.js
	  // In regular non-RELOCATABLE mode the table is exported
	  // from the wasm module and this will be assigned once
	  // the exports are available.

	  var wasmTable; // end include: runtime_init_table.js
	  // include: runtime_stack_check.js
	  // end include: runtime_stack_check.js
	  // include: runtime_assertions.js
	  // end include: runtime_assertions.js

	  var __ATPRERUN__ = []; // functions called before the runtime is initialized

	  var __ATINIT__ = []; // functions called during startup

	  var __ATPOSTRUN__ = []; // functions called after the main() is called

	  function preRun() {
	    if (Module['preRun']) {
	      if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];

	      while (Module['preRun'].length) {
	        addOnPreRun(Module['preRun'].shift());
	      }
	    }

	    callRuntimeCallbacks(__ATPRERUN__);
	  }

	  function initRuntime() {
	    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
	    FS.ignorePermissions = false;
	    callRuntimeCallbacks(__ATINIT__);
	  }

	  function postRun() {
	    if (Module['postRun']) {
	      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];

	      while (Module['postRun'].length) {
	        addOnPostRun(Module['postRun'].shift());
	      }
	    }

	    callRuntimeCallbacks(__ATPOSTRUN__);
	  }

	  function addOnPreRun(cb) {
	    __ATPRERUN__.unshift(cb);
	  }

	  function addOnInit(cb) {
	    __ATINIT__.unshift(cb);
	  }

	  function addOnPostRun(cb) {
	    __ATPOSTRUN__.unshift(cb);
	  } // include: runtime_math.js
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
	  // end include: runtime_math.js
	  // A counter of dependencies for calling run(). If we need to
	  // do asynchronous work before running, increment this and
	  // decrement it. Incrementing must happen in a place like
	  // Module.preRun (used by emcc to add file preloading).
	  // Note that you can add dependencies in preRun, even though
	  // it happens right before run - run will be postponed until
	  // the dependencies are met.


	  var runDependencies = 0;
	  var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

	  function getUniqueRunDependency(id) {
	    return id;
	  }

	  function addRunDependency(id) {
	    runDependencies++;

	    if (Module['monitorRunDependencies']) {
	      Module['monitorRunDependencies'](runDependencies);
	    }
	  }

	  function removeRunDependency(id) {
	    runDependencies--;

	    if (Module['monitorRunDependencies']) {
	      Module['monitorRunDependencies'](runDependencies);
	    }

	    if (runDependencies == 0) {

	      if (dependenciesFulfilled) {
	        var callback = dependenciesFulfilled;
	        dependenciesFulfilled = null;
	        callback(); // can add another dependenciesFulfilled
	      }
	    }
	  }
	  /** @param {string|number=} what */


	  function abort(what) {
	    {
	      if (Module['onAbort']) {
	        Module['onAbort'](what);
	      }
	    }
	    what = 'Aborted(' + what + ')'; // TODO(sbc): Should we remove printing and leave it up to whoever
	    // catches the exception?

	    err(what);
	    ABORT = true;
	    what += '. Build with -sASSERTIONS for more info.'; // Use a wasm runtime error, because a JS error might be seen as a foreign
	    // exception, which means we'd run destructors on it. We need the error to
	    // simply make the program stop.
	    // FIXME This approach does not work in Wasm EH because it currently does not assume
	    // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
	    // a trap or not based on a hidden field within the object. So at the moment
	    // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
	    // allows this in the wasm spec.
	    // Suppress closure compiler warning here. Closure compiler's builtin extern
	    // defintion for WebAssembly.RuntimeError claims it takes no arguments even
	    // though it can.
	    // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.

	    /** @suppress {checkTypes} */

	    var e = new WebAssembly.RuntimeError(what); // Throw the error whether or not MODULARIZE is set because abort is used
	    // in code paths apart from instantiation where an exception is expected
	    // to be thrown when abort is called.

	    throw e;
	  } // {{MEM_INITIALIZER}}
	  // include: memoryprofiler.js
	  // end include: memoryprofiler.js
	  // include: URIUtils.js
	  // Prefix of data URIs emitted by SINGLE_FILE and related options.


	  var dataURIPrefix = 'data:application/octet-stream;base64,'; // Indicates whether filename is a base64 data URI.

	  function isDataURI(filename) {
	    // Prefix of data URIs emitted by SINGLE_FILE and related options.
	    return filename.startsWith(dataURIPrefix);
	  } // Indicates whether filename is delivered via file protocol (as opposed to http/https)


	  function isFileURI(filename) {
	    return filename.startsWith('file://');
	  } // end include: URIUtils.js


	  var wasmBinaryFile;
	  wasmBinaryFile = 'decoder_simd.wasm';

	  if (!isDataURI(wasmBinaryFile)) {
	    wasmBinaryFile = locateFile(wasmBinaryFile);
	  }

	  function getBinary(file) {
	    try {
	      if (file == wasmBinaryFile && wasmBinary) {
	        return new Uint8Array(wasmBinary);
	      }

	      if (readBinary) {
	        return readBinary(file);
	      } else {
	        throw "both async and sync fetching of the wasm failed";
	      }
	    } catch (err) {
	      abort(err);
	    }
	  }

	  function getBinaryPromise() {
	    // If we don't have the binary yet, try to to load it asynchronously.
	    // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
	    // See https://github.com/github/fetch/pull/92#issuecomment-140665932
	    // Cordova or Electron apps are typically loaded from a file:// url.
	    // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
	    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
	      if (typeof fetch == 'function' && !isFileURI(wasmBinaryFile)) {
	        return fetch(wasmBinaryFile, {
	          credentials: 'same-origin'
	        }).then(function (response) {
	          if (!response['ok']) {
	            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
	          }

	          return response['arrayBuffer']();
	        }).catch(function () {
	          return getBinary(wasmBinaryFile);
	        });
	      } else {
	        if (readAsync) {
	          // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
	          return new Promise(function (resolve, reject) {
	            readAsync(wasmBinaryFile, function (response) {
	              resolve(new Uint8Array(
	              /** @type{!ArrayBuffer} */
	              response));
	            }, reject);
	          });
	        }
	      }
	    } // Otherwise, getBinary should be able to get it synchronously


	    return Promise.resolve().then(function () {
	      return getBinary(wasmBinaryFile);
	    });
	  } // Create the wasm instance.
	  // Receives the wasm imports, returns the exports.


	  function createWasm() {
	    // prepare imports
	    var info = {
	      'env': asmLibraryArg,
	      'wasi_snapshot_preview1': asmLibraryArg
	    }; // Load the wasm module and create an instance of using native support in the JS engine.
	    // handle a generated wasm instance, receiving its exports and
	    // performing other necessary setup

	    /** @param {WebAssembly.Module=} module*/

	    function receiveInstance(instance, module) {
	      var exports = instance.exports;
	      Module['asm'] = exports;
	      wasmMemory = Module['asm']['memory'];
	      updateGlobalBufferAndViews(wasmMemory.buffer);
	      wasmTable = Module['asm']['__indirect_function_table'];
	      addOnInit(Module['asm']['__wasm_call_ctors']);
	      removeRunDependency();
	    } // we can't run yet (except in a pthread, where we have a custom sync instantiator)


	    addRunDependency(); // Prefer streaming instantiation if available.

	    function receiveInstantiationResult(result) {
	      // 'result' is a ResultObject object which has both the module and instance.
	      // receiveInstance() will swap in the exports (to Module.asm) so they can be called
	      // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
	      // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
	      receiveInstance(result['instance']);
	    }

	    function instantiateArrayBuffer(receiver) {
	      return getBinaryPromise().then(function (binary) {
	        return WebAssembly.instantiate(binary, info);
	      }).then(function (instance) {
	        return instance;
	      }).then(receiver, function (reason) {
	        err('failed to asynchronously prepare wasm: ' + reason);
	        abort(reason);
	      });
	    }

	    function instantiateAsync() {
	      if (!wasmBinary && typeof WebAssembly.instantiateStreaming == 'function' && !isDataURI(wasmBinaryFile) && // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
	      !isFileURI(wasmBinaryFile) && // Avoid instantiateStreaming() on Node.js environment for now, as while
	      // Node.js v18.1.0 implements it, it does not have a full fetch()
	      // implementation yet.
	      //
	      // Reference:
	      //   https://github.com/emscripten-core/emscripten/pull/16917
	      !ENVIRONMENT_IS_NODE && typeof fetch == 'function') {
	        return fetch(wasmBinaryFile, {
	          credentials: 'same-origin'
	        }).then(function (response) {
	          // Suppress closure warning here since the upstream definition for
	          // instantiateStreaming only allows Promise<Repsponse> rather than
	          // an actual Response.
	          // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.

	          /** @suppress {checkTypes} */
	          var result = WebAssembly.instantiateStreaming(response, info);
	          return result.then(receiveInstantiationResult, function (reason) {
	            // We expect the most common failure cause to be a bad MIME type for the binary,
	            // in which case falling back to ArrayBuffer instantiation should work.
	            err('wasm streaming compile failed: ' + reason);
	            err('falling back to ArrayBuffer instantiation');
	            return instantiateArrayBuffer(receiveInstantiationResult);
	          });
	        });
	      } else {
	        return instantiateArrayBuffer(receiveInstantiationResult);
	      }
	    } // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
	    // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
	    // to any other async startup actions they are performing.
	    // Also pthreads and wasm workers initialize the wasm instance through this path.


	    if (Module['instantiateWasm']) {
	      try {
	        var exports = Module['instantiateWasm'](info, receiveInstance);
	        return exports;
	      } catch (e) {
	        err('Module.instantiateWasm callback failed with error: ' + e);
	        return false;
	      }
	    }

	    instantiateAsync();
	    return {}; // no exports yet; we'll fill them in later
	  } // Globals used by JS i64 conversions (see makeSetValue)


	  var tempDouble;
	  var tempI64; // === Body ===

	  function em_log(str) {
	    console.log(UTF8ToString(str));
	  }

	  function callRuntimeCallbacks(callbacks) {
	    while (callbacks.length > 0) {
	      var callback = callbacks.shift();

	      if (typeof callback == 'function') {
	        callback(Module); // Pass the module as the first argument.

	        continue;
	      }

	      var func = callback.func;

	      if (typeof func == 'number') {
	        if (callback.arg === undefined) {
	          // Run the wasm function ptr with signature 'v'. If no function
	          // with such signature was exported, this call does not need
	          // to be emitted (and would confuse Closure)
	          getWasmTableEntry(func)();
	        } else {
	          // If any function with signature 'vi' was exported, run
	          // the callback with that signature.
	          getWasmTableEntry(func)(callback.arg);
	        }
	      } else {
	        func(callback.arg === undefined ? null : callback.arg);
	      }
	    }
	  }

	  var wasmTableMirror = [];

	  function getWasmTableEntry(funcPtr) {
	    var func = wasmTableMirror[funcPtr];

	    if (!func) {
	      if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
	      wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
	    }

	    return func;
	  }

	  function ___assert_fail(condition, filename, line, func) {
	    abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
	  }

	  function setErrNo(value) {
	    HEAP32[___errno_location() >> 2] = value;
	    return value;
	  }

	  var PATH = {
	    isAbs: path => path.charAt(0) === '/',
	    splitPath: filename => {
	      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	      return splitPathRe.exec(filename).slice(1);
	    },
	    normalizeArray: (parts, allowAboveRoot) => {
	      // if the path tries to go above the root, `up` ends up > 0
	      var up = 0;

	      for (var i = parts.length - 1; i >= 0; i--) {
	        var last = parts[i];

	        if (last === '.') {
	          parts.splice(i, 1);
	        } else if (last === '..') {
	          parts.splice(i, 1);
	          up++;
	        } else if (up) {
	          parts.splice(i, 1);
	          up--;
	        }
	      } // if the path is allowed to go above the root, restore leading ..s


	      if (allowAboveRoot) {
	        for (; up; up--) {
	          parts.unshift('..');
	        }
	      }

	      return parts;
	    },
	    normalize: path => {
	      var isAbsolute = PATH.isAbs(path),
	          trailingSlash = path.substr(-1) === '/'; // Normalize the path

	      path = PATH.normalizeArray(path.split('/').filter(p => !!p), !isAbsolute).join('/');

	      if (!path && !isAbsolute) {
	        path = '.';
	      }

	      if (path && trailingSlash) {
	        path += '/';
	      }

	      return (isAbsolute ? '/' : '') + path;
	    },
	    dirname: path => {
	      var result = PATH.splitPath(path),
	          root = result[0],
	          dir = result[1];

	      if (!root && !dir) {
	        // No dirname whatsoever
	        return '.';
	      }

	      if (dir) {
	        // It has a dirname, strip trailing slash
	        dir = dir.substr(0, dir.length - 1);
	      }

	      return root + dir;
	    },
	    basename: path => {
	      // EMSCRIPTEN return '/'' for '/', not an empty string
	      if (path === '/') return '/';
	      path = PATH.normalize(path);
	      path = path.replace(/\/$/, "");
	      var lastSlash = path.lastIndexOf('/');
	      if (lastSlash === -1) return path;
	      return path.substr(lastSlash + 1);
	    },
	    join: function () {
	      var paths = Array.prototype.slice.call(arguments, 0);
	      return PATH.normalize(paths.join('/'));
	    },
	    join2: (l, r) => {
	      return PATH.normalize(l + '/' + r);
	    }
	  };

	  function getRandomDevice() {
	    if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
	      // for modern web browsers
	      var randomBuffer = new Uint8Array(1);
	      return function () {
	        crypto.getRandomValues(randomBuffer);
	        return randomBuffer[0];
	      };
	    } else if (ENVIRONMENT_IS_NODE) {
	      // for nodejs with or without crypto support included
	      try {
	        var crypto_module = crypto__default["default"]; // nodejs has crypto support

	        return function () {
	          return crypto_module['randomBytes'](1)[0];
	        };
	      } catch (e) {// nodejs doesn't have crypto support
	      }
	    } // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096


	    return function () {
	      abort("randomDevice");
	    };
	  }

	  var PATH_FS = {
	    resolve: function () {
	      var resolvedPath = '',
	          resolvedAbsolute = false;

	      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	        var path = i >= 0 ? arguments[i] : FS.cwd(); // Skip empty and invalid entries

	        if (typeof path != 'string') {
	          throw new TypeError('Arguments to path.resolve must be strings');
	        } else if (!path) {
	          return ''; // an invalid portion invalidates the whole thing
	        }

	        resolvedPath = path + '/' + resolvedPath;
	        resolvedAbsolute = PATH.isAbs(path);
	      } // At this point the path should be resolved to a full absolute path, but
	      // handle relative paths to be safe (might happen when process.cwd() fails)


	      resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(p => !!p), !resolvedAbsolute).join('/');
	      return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
	    },
	    relative: (from, to) => {
	      from = PATH_FS.resolve(from).substr(1);
	      to = PATH_FS.resolve(to).substr(1);

	      function trim(arr) {
	        var start = 0;

	        for (; start < arr.length; start++) {
	          if (arr[start] !== '') break;
	        }

	        var end = arr.length - 1;

	        for (; end >= 0; end--) {
	          if (arr[end] !== '') break;
	        }

	        if (start > end) return [];
	        return arr.slice(start, end - start + 1);
	      }

	      var fromParts = trim(from.split('/'));
	      var toParts = trim(to.split('/'));
	      var length = Math.min(fromParts.length, toParts.length);
	      var samePartsLength = length;

	      for (var i = 0; i < length; i++) {
	        if (fromParts[i] !== toParts[i]) {
	          samePartsLength = i;
	          break;
	        }
	      }

	      var outputParts = [];

	      for (var i = samePartsLength; i < fromParts.length; i++) {
	        outputParts.push('..');
	      }

	      outputParts = outputParts.concat(toParts.slice(samePartsLength));
	      return outputParts.join('/');
	    }
	  };
	  var TTY = {
	    ttys: [],
	    init: function () {// https://github.com/emscripten-core/emscripten/pull/1555
	      // if (ENVIRONMENT_IS_NODE) {
	      //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
	      //   // device, it always assumes it's a TTY device. because of this, we're forcing
	      //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
	      //   // with text files until FS.init can be refactored.
	      //   process['stdin']['setEncoding']('utf8');
	      // }
	    },
	    shutdown: function () {// https://github.com/emscripten-core/emscripten/pull/1555
	      // if (ENVIRONMENT_IS_NODE) {
	      //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
	      //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
	      //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
	      //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
	      //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
	      //   process['stdin']['pause']();
	      // }
	    },
	    register: function (dev, ops) {
	      TTY.ttys[dev] = {
	        input: [],
	        output: [],
	        ops: ops
	      };
	      FS.registerDevice(dev, TTY.stream_ops);
	    },
	    stream_ops: {
	      open: function (stream) {
	        var tty = TTY.ttys[stream.node.rdev];

	        if (!tty) {
	          throw new FS.ErrnoError(43);
	        }

	        stream.tty = tty;
	        stream.seekable = false;
	      },
	      close: function (stream) {
	        // flush any pending line data
	        stream.tty.ops.flush(stream.tty);
	      },
	      flush: function (stream) {
	        stream.tty.ops.flush(stream.tty);
	      },
	      read: function (stream, buffer, offset, length, pos
	      /* ignored */
	      ) {
	        if (!stream.tty || !stream.tty.ops.get_char) {
	          throw new FS.ErrnoError(60);
	        }

	        var bytesRead = 0;

	        for (var i = 0; i < length; i++) {
	          var result;

	          try {
	            result = stream.tty.ops.get_char(stream.tty);
	          } catch (e) {
	            throw new FS.ErrnoError(29);
	          }

	          if (result === undefined && bytesRead === 0) {
	            throw new FS.ErrnoError(6);
	          }

	          if (result === null || result === undefined) break;
	          bytesRead++;
	          buffer[offset + i] = result;
	        }

	        if (bytesRead) {
	          stream.node.timestamp = Date.now();
	        }

	        return bytesRead;
	      },
	      write: function (stream, buffer, offset, length, pos) {
	        if (!stream.tty || !stream.tty.ops.put_char) {
	          throw new FS.ErrnoError(60);
	        }

	        try {
	          for (var i = 0; i < length; i++) {
	            stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
	          }
	        } catch (e) {
	          throw new FS.ErrnoError(29);
	        }

	        if (length) {
	          stream.node.timestamp = Date.now();
	        }

	        return i;
	      }
	    },
	    default_tty_ops: {
	      get_char: function (tty) {
	        if (!tty.input.length) {
	          var result = null;

	          if (ENVIRONMENT_IS_NODE) {
	            // we will read data by chunks of BUFSIZE
	            var BUFSIZE = 256;
	            var buf = Buffer.alloc(BUFSIZE);
	            var bytesRead = 0;

	            try {
	              bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
	            } catch (e) {
	              // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
	              // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
	              if (e.toString().includes('EOF')) bytesRead = 0;else throw e;
	            }

	            if (bytesRead > 0) {
	              result = buf.slice(0, bytesRead).toString('utf-8');
	            } else {
	              result = null;
	            }
	          } else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
	            // Browser.
	            result = window.prompt('Input: '); // returns null on cancel

	            if (result !== null) {
	              result += '\n';
	            }
	          } else if (typeof readline == 'function') {
	            // Command line.
	            result = readline();

	            if (result !== null) {
	              result += '\n';
	            }
	          }

	          if (!result) {
	            return null;
	          }

	          tty.input = intArrayFromString(result, true);
	        }

	        return tty.input.shift();
	      },
	      put_char: function (tty, val) {
	        if (val === null || val === 10) {
	          out(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        } else {
	          if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
	        }
	      },
	      flush: function (tty) {
	        if (tty.output && tty.output.length > 0) {
	          out(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        }
	      }
	    },
	    default_tty1_ops: {
	      put_char: function (tty, val) {
	        if (val === null || val === 10) {
	          err(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        } else {
	          if (val != 0) tty.output.push(val);
	        }
	      },
	      flush: function (tty) {
	        if (tty.output && tty.output.length > 0) {
	          err(UTF8ArrayToString(tty.output, 0));
	          tty.output = [];
	        }
	      }
	    }
	  };

	  function zeroMemory(address, size) {
	    HEAPU8.fill(0, address, address + size);
	  }

	  function alignMemory(size, alignment) {
	    return Math.ceil(size / alignment) * alignment;
	  }

	  function mmapAlloc(size) {
	    size = alignMemory(size, 65536);

	    var ptr = _emscripten_builtin_memalign(65536, size);

	    if (!ptr) return 0;
	    zeroMemory(ptr, size);
	    return ptr;
	  }

	  var MEMFS = {
	    ops_table: null,
	    mount: function (mount) {
	      return MEMFS.createNode(null, '/', 16384 | 511
	      /* 0777 */
	      , 0);
	    },
	    createNode: function (parent, name, mode, dev) {
	      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
	        // no supported
	        throw new FS.ErrnoError(63);
	      }

	      if (!MEMFS.ops_table) {
	        MEMFS.ops_table = {
	          dir: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr,
	              lookup: MEMFS.node_ops.lookup,
	              mknod: MEMFS.node_ops.mknod,
	              rename: MEMFS.node_ops.rename,
	              unlink: MEMFS.node_ops.unlink,
	              rmdir: MEMFS.node_ops.rmdir,
	              readdir: MEMFS.node_ops.readdir,
	              symlink: MEMFS.node_ops.symlink
	            },
	            stream: {
	              llseek: MEMFS.stream_ops.llseek
	            }
	          },
	          file: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr
	            },
	            stream: {
	              llseek: MEMFS.stream_ops.llseek,
	              read: MEMFS.stream_ops.read,
	              write: MEMFS.stream_ops.write,
	              allocate: MEMFS.stream_ops.allocate,
	              mmap: MEMFS.stream_ops.mmap,
	              msync: MEMFS.stream_ops.msync
	            }
	          },
	          link: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr,
	              readlink: MEMFS.node_ops.readlink
	            },
	            stream: {}
	          },
	          chrdev: {
	            node: {
	              getattr: MEMFS.node_ops.getattr,
	              setattr: MEMFS.node_ops.setattr
	            },
	            stream: FS.chrdev_stream_ops
	          }
	        };
	      }

	      var node = FS.createNode(parent, name, mode, dev);

	      if (FS.isDir(node.mode)) {
	        node.node_ops = MEMFS.ops_table.dir.node;
	        node.stream_ops = MEMFS.ops_table.dir.stream;
	        node.contents = {};
	      } else if (FS.isFile(node.mode)) {
	        node.node_ops = MEMFS.ops_table.file.node;
	        node.stream_ops = MEMFS.ops_table.file.stream;
	        node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
	        // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
	        // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
	        // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.

	        node.contents = null;
	      } else if (FS.isLink(node.mode)) {
	        node.node_ops = MEMFS.ops_table.link.node;
	        node.stream_ops = MEMFS.ops_table.link.stream;
	      } else if (FS.isChrdev(node.mode)) {
	        node.node_ops = MEMFS.ops_table.chrdev.node;
	        node.stream_ops = MEMFS.ops_table.chrdev.stream;
	      }

	      node.timestamp = Date.now(); // add the new node to the parent

	      if (parent) {
	        parent.contents[name] = node;
	        parent.timestamp = node.timestamp;
	      }

	      return node;
	    },
	    getFileDataAsTypedArray: function (node) {
	      if (!node.contents) return new Uint8Array(0);
	      if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.

	      return new Uint8Array(node.contents);
	    },
	    expandFileStorage: function (node, newCapacity) {
	      var prevCapacity = node.contents ? node.contents.length : 0;
	      if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
	      // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
	      // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
	      // avoid overshooting the allocation cap by a very large margin.

	      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
	      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125) >>> 0);
	      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.

	      var oldContents = node.contents;
	      node.contents = new Uint8Array(newCapacity); // Allocate new storage.

	      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
	    },
	    resizeFileStorage: function (node, newSize) {
	      if (node.usedBytes == newSize) return;

	      if (newSize == 0) {
	        node.contents = null; // Fully decommit when requesting a resize to zero.

	        node.usedBytes = 0;
	      } else {
	        var oldContents = node.contents;
	        node.contents = new Uint8Array(newSize); // Allocate new storage.

	        if (oldContents) {
	          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
	        }

	        node.usedBytes = newSize;
	      }
	    },
	    node_ops: {
	      getattr: function (node) {
	        var attr = {}; // device numbers reuse inode numbers.

	        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
	        attr.ino = node.id;
	        attr.mode = node.mode;
	        attr.nlink = 1;
	        attr.uid = 0;
	        attr.gid = 0;
	        attr.rdev = node.rdev;

	        if (FS.isDir(node.mode)) {
	          attr.size = 4096;
	        } else if (FS.isFile(node.mode)) {
	          attr.size = node.usedBytes;
	        } else if (FS.isLink(node.mode)) {
	          attr.size = node.link.length;
	        } else {
	          attr.size = 0;
	        }

	        attr.atime = new Date(node.timestamp);
	        attr.mtime = new Date(node.timestamp);
	        attr.ctime = new Date(node.timestamp); // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
	        //       but this is not required by the standard.

	        attr.blksize = 4096;
	        attr.blocks = Math.ceil(attr.size / attr.blksize);
	        return attr;
	      },
	      setattr: function (node, attr) {
	        if (attr.mode !== undefined) {
	          node.mode = attr.mode;
	        }

	        if (attr.timestamp !== undefined) {
	          node.timestamp = attr.timestamp;
	        }

	        if (attr.size !== undefined) {
	          MEMFS.resizeFileStorage(node, attr.size);
	        }
	      },
	      lookup: function (parent, name) {
	        throw FS.genericErrors[44];
	      },
	      mknod: function (parent, name, mode, dev) {
	        return MEMFS.createNode(parent, name, mode, dev);
	      },
	      rename: function (old_node, new_dir, new_name) {
	        // if we're overwriting a directory at new_name, make sure it's empty.
	        if (FS.isDir(old_node.mode)) {
	          var new_node;

	          try {
	            new_node = FS.lookupNode(new_dir, new_name);
	          } catch (e) {}

	          if (new_node) {
	            for (var i in new_node.contents) {
	              throw new FS.ErrnoError(55);
	            }
	          }
	        } // do the internal rewiring


	        delete old_node.parent.contents[old_node.name];
	        old_node.parent.timestamp = Date.now();
	        old_node.name = new_name;
	        new_dir.contents[new_name] = old_node;
	        new_dir.timestamp = old_node.parent.timestamp;
	        old_node.parent = new_dir;
	      },
	      unlink: function (parent, name) {
	        delete parent.contents[name];
	        parent.timestamp = Date.now();
	      },
	      rmdir: function (parent, name) {
	        var node = FS.lookupNode(parent, name);

	        for (var i in node.contents) {
	          throw new FS.ErrnoError(55);
	        }

	        delete parent.contents[name];
	        parent.timestamp = Date.now();
	      },
	      readdir: function (node) {
	        var entries = ['.', '..'];

	        for (var key in node.contents) {
	          if (!node.contents.hasOwnProperty(key)) {
	            continue;
	          }

	          entries.push(key);
	        }

	        return entries;
	      },
	      symlink: function (parent, newname, oldpath) {
	        var node = MEMFS.createNode(parent, newname, 511
	        /* 0777 */
	        | 40960, 0);
	        node.link = oldpath;
	        return node;
	      },
	      readlink: function (node) {
	        if (!FS.isLink(node.mode)) {
	          throw new FS.ErrnoError(28);
	        }

	        return node.link;
	      }
	    },
	    stream_ops: {
	      read: function (stream, buffer, offset, length, position) {
	        var contents = stream.node.contents;
	        if (position >= stream.node.usedBytes) return 0;
	        var size = Math.min(stream.node.usedBytes - position, length);

	        if (size > 8 && contents.subarray) {
	          // non-trivial, and typed array
	          buffer.set(contents.subarray(position, position + size), offset);
	        } else {
	          for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
	        }

	        return size;
	      },
	      write: function (stream, buffer, offset, length, position, canOwn) {
	        if (!length) return 0;
	        var node = stream.node;
	        node.timestamp = Date.now();

	        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
	          // This write is from a typed array to a typed array?
	          if (canOwn) {
	            node.contents = buffer.subarray(offset, offset + length);
	            node.usedBytes = length;
	            return length;
	          } else if (node.usedBytes === 0 && position === 0) {
	            // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
	            node.contents = buffer.slice(offset, offset + length);
	            node.usedBytes = length;
	            return length;
	          } else if (position + length <= node.usedBytes) {
	            // Writing to an already allocated and used subrange of the file?
	            node.contents.set(buffer.subarray(offset, offset + length), position);
	            return length;
	          }
	        } // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.


	        MEMFS.expandFileStorage(node, position + length);

	        if (node.contents.subarray && buffer.subarray) {
	          // Use typed array write which is available.
	          node.contents.set(buffer.subarray(offset, offset + length), position);
	        } else {
	          for (var i = 0; i < length; i++) {
	            node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
	          }
	        }

	        node.usedBytes = Math.max(node.usedBytes, position + length);
	        return length;
	      },
	      llseek: function (stream, offset, whence) {
	        var position = offset;

	        if (whence === 1) {
	          position += stream.position;
	        } else if (whence === 2) {
	          if (FS.isFile(stream.node.mode)) {
	            position += stream.node.usedBytes;
	          }
	        }

	        if (position < 0) {
	          throw new FS.ErrnoError(28);
	        }

	        return position;
	      },
	      allocate: function (stream, offset, length) {
	        MEMFS.expandFileStorage(stream.node, offset + length);
	        stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
	      },
	      mmap: function (stream, length, position, prot, flags) {
	        if (!FS.isFile(stream.node.mode)) {
	          throw new FS.ErrnoError(43);
	        }

	        var ptr;
	        var allocated;
	        var contents = stream.node.contents; // Only make a new copy when MAP_PRIVATE is specified.

	        if (!(flags & 2) && contents.buffer === buffer) {
	          // We can't emulate MAP_SHARED when the file is not backed by the buffer
	          // we're mapping to (e.g. the HEAP buffer).
	          allocated = false;
	          ptr = contents.byteOffset;
	        } else {
	          // Try to avoid unnecessary slices.
	          if (position > 0 || position + length < contents.length) {
	            if (contents.subarray) {
	              contents = contents.subarray(position, position + length);
	            } else {
	              contents = Array.prototype.slice.call(contents, position, position + length);
	            }
	          }

	          allocated = true;
	          ptr = mmapAlloc(length);

	          if (!ptr) {
	            throw new FS.ErrnoError(48);
	          }

	          HEAP8.set(contents, ptr);
	        }

	        return {
	          ptr: ptr,
	          allocated: allocated
	        };
	      },
	      msync: function (stream, buffer, offset, length, mmapFlags) {
	        if (!FS.isFile(stream.node.mode)) {
	          throw new FS.ErrnoError(43);
	        }

	        if (mmapFlags & 2) {
	          // MAP_PRIVATE calls need not to be synced back to underlying fs
	          return 0;
	        }

	        MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false); // should we check if bytesWritten and length are the same?

	        return 0;
	      }
	    }
	  };
	  /** @param {boolean=} noRunDep */

	  function asyncLoad(url, onload, onerror, noRunDep) {
	    var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
	    readAsync(url, function (arrayBuffer) {
	      assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
	      onload(new Uint8Array(arrayBuffer));
	      if (dep) removeRunDependency();
	    }, function (event) {
	      if (onerror) {
	        onerror();
	      } else {
	        throw 'Loading data file "' + url + '" failed.';
	      }
	    });
	    if (dep) addRunDependency();
	  }

	  var FS = {
	    root: null,
	    mounts: [],
	    devices: {},
	    streams: [],
	    nextInode: 1,
	    nameTable: null,
	    currentPath: "/",
	    initialized: false,
	    ignorePermissions: true,
	    ErrnoError: null,
	    genericErrors: {},
	    filesystems: null,
	    syncFSRequests: 0,
	    lookupPath: function (path) {
	      let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      path = PATH_FS.resolve(FS.cwd(), path);
	      if (!path) return {
	        path: '',
	        node: null
	      };
	      var defaults = {
	        follow_mount: true,
	        recurse_count: 0
	      };
	      opts = Object.assign(defaults, opts);

	      if (opts.recurse_count > 8) {
	        // max recursive lookup of 8
	        throw new FS.ErrnoError(32);
	      } // split the path


	      var parts = PATH.normalizeArray(path.split('/').filter(p => !!p), false); // start at the root

	      var current = FS.root;
	      var current_path = '/';

	      for (var i = 0; i < parts.length; i++) {
	        var islast = i === parts.length - 1;

	        if (islast && opts.parent) {
	          // stop resolving
	          break;
	        }

	        current = FS.lookupNode(current, parts[i]);
	        current_path = PATH.join2(current_path, parts[i]); // jump to the mount's root node if this is a mountpoint

	        if (FS.isMountpoint(current)) {
	          if (!islast || islast && opts.follow_mount) {
	            current = current.mounted.root;
	          }
	        } // by default, lookupPath will not follow a symlink if it is the final path component.
	        // setting opts.follow = true will override this behavior.


	        if (!islast || opts.follow) {
	          var count = 0;

	          while (FS.isLink(current.mode)) {
	            var link = FS.readlink(current_path);
	            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
	            var lookup = FS.lookupPath(current_path, {
	              recurse_count: opts.recurse_count + 1
	            });
	            current = lookup.node;

	            if (count++ > 40) {
	              // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
	              throw new FS.ErrnoError(32);
	            }
	          }
	        }
	      }

	      return {
	        path: current_path,
	        node: current
	      };
	    },
	    getPath: node => {
	      var path;

	      while (true) {
	        if (FS.isRoot(node)) {
	          var mount = node.mount.mountpoint;
	          if (!path) return mount;
	          return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
	        }

	        path = path ? node.name + '/' + path : node.name;
	        node = node.parent;
	      }
	    },
	    hashName: (parentid, name) => {
	      var hash = 0;

	      for (var i = 0; i < name.length; i++) {
	        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
	      }

	      return (parentid + hash >>> 0) % FS.nameTable.length;
	    },
	    hashAddNode: node => {
	      var hash = FS.hashName(node.parent.id, node.name);
	      node.name_next = FS.nameTable[hash];
	      FS.nameTable[hash] = node;
	    },
	    hashRemoveNode: node => {
	      var hash = FS.hashName(node.parent.id, node.name);

	      if (FS.nameTable[hash] === node) {
	        FS.nameTable[hash] = node.name_next;
	      } else {
	        var current = FS.nameTable[hash];

	        while (current) {
	          if (current.name_next === node) {
	            current.name_next = node.name_next;
	            break;
	          }

	          current = current.name_next;
	        }
	      }
	    },
	    lookupNode: (parent, name) => {
	      var errCode = FS.mayLookup(parent);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode, parent);
	      }

	      var hash = FS.hashName(parent.id, name);

	      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
	        var nodeName = node.name;

	        if (node.parent.id === parent.id && nodeName === name) {
	          return node;
	        }
	      } // if we failed to find it in the cache, call into the VFS


	      return FS.lookup(parent, name);
	    },
	    createNode: (parent, name, mode, rdev) => {
	      var node = new FS.FSNode(parent, name, mode, rdev);
	      FS.hashAddNode(node);
	      return node;
	    },
	    destroyNode: node => {
	      FS.hashRemoveNode(node);
	    },
	    isRoot: node => {
	      return node === node.parent;
	    },
	    isMountpoint: node => {
	      return !!node.mounted;
	    },
	    isFile: mode => {
	      return (mode & 61440) === 32768;
	    },
	    isDir: mode => {
	      return (mode & 61440) === 16384;
	    },
	    isLink: mode => {
	      return (mode & 61440) === 40960;
	    },
	    isChrdev: mode => {
	      return (mode & 61440) === 8192;
	    },
	    isBlkdev: mode => {
	      return (mode & 61440) === 24576;
	    },
	    isFIFO: mode => {
	      return (mode & 61440) === 4096;
	    },
	    isSocket: mode => {
	      return (mode & 49152) === 49152;
	    },
	    flagModes: {
	      "r": 0,
	      "r+": 2,
	      "w": 577,
	      "w+": 578,
	      "a": 1089,
	      "a+": 1090
	    },
	    modeStringToFlags: str => {
	      var flags = FS.flagModes[str];

	      if (typeof flags == 'undefined') {
	        throw new Error('Unknown file open mode: ' + str);
	      }

	      return flags;
	    },
	    flagsToPermissionString: flag => {
	      var perms = ['r', 'w', 'rw'][flag & 3];

	      if (flag & 512) {
	        perms += 'w';
	      }

	      return perms;
	    },
	    nodePermissions: (node, perms) => {
	      if (FS.ignorePermissions) {
	        return 0;
	      } // return 0 if any user, group or owner bits are set.


	      if (perms.includes('r') && !(node.mode & 292)) {
	        return 2;
	      } else if (perms.includes('w') && !(node.mode & 146)) {
	        return 2;
	      } else if (perms.includes('x') && !(node.mode & 73)) {
	        return 2;
	      }

	      return 0;
	    },
	    mayLookup: dir => {
	      var errCode = FS.nodePermissions(dir, 'x');
	      if (errCode) return errCode;
	      if (!dir.node_ops.lookup) return 2;
	      return 0;
	    },
	    mayCreate: (dir, name) => {
	      try {
	        var node = FS.lookupNode(dir, name);
	        return 20;
	      } catch (e) {}

	      return FS.nodePermissions(dir, 'wx');
	    },
	    mayDelete: (dir, name, isdir) => {
	      var node;

	      try {
	        node = FS.lookupNode(dir, name);
	      } catch (e) {
	        return e.errno;
	      }

	      var errCode = FS.nodePermissions(dir, 'wx');

	      if (errCode) {
	        return errCode;
	      }

	      if (isdir) {
	        if (!FS.isDir(node.mode)) {
	          return 54;
	        }

	        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
	          return 10;
	        }
	      } else {
	        if (FS.isDir(node.mode)) {
	          return 31;
	        }
	      }

	      return 0;
	    },
	    mayOpen: (node, flags) => {
	      if (!node) {
	        return 44;
	      }

	      if (FS.isLink(node.mode)) {
	        return 32;
	      } else if (FS.isDir(node.mode)) {
	        if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
	        flags & 512) {
	          // TODO: check for O_SEARCH? (== search for dir only)
	          return 31;
	        }
	      }

	      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
	    },
	    MAX_OPEN_FDS: 4096,
	    nextfd: function () {
	      let fd_start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	      let fd_end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : FS.MAX_OPEN_FDS;

	      for (var fd = fd_start; fd <= fd_end; fd++) {
	        if (!FS.streams[fd]) {
	          return fd;
	        }
	      }

	      throw new FS.ErrnoError(33);
	    },
	    getStream: fd => FS.streams[fd],
	    createStream: (stream, fd_start, fd_end) => {
	      if (!FS.FSStream) {
	        FS.FSStream =
	        /** @constructor */
	        function () {
	          this.shared = {};
	        };

	        FS.FSStream.prototype = {};
	        Object.defineProperties(FS.FSStream.prototype, {
	          object: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return this.node;
	            },

	            /** @this {FS.FSStream} */
	            set: function (val) {
	              this.node = val;
	            }
	          },
	          isRead: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return (this.flags & 2097155) !== 1;
	            }
	          },
	          isWrite: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return (this.flags & 2097155) !== 0;
	            }
	          },
	          isAppend: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return this.flags & 1024;
	            }
	          },
	          flags: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return this.shared.flags;
	            },

	            /** @this {FS.FSStream} */
	            set: function (val) {
	              this.shared.flags = val;
	            }
	          },
	          position: {
	            /** @this {FS.FSStream} */
	            get: function () {
	              return this.shared.position;
	            },

	            /** @this {FS.FSStream} */
	            set: function (val) {
	              this.shared.position = val;
	            }
	          }
	        });
	      } // clone it, so we can return an instance of FSStream


	      stream = Object.assign(new FS.FSStream(), stream);
	      var fd = FS.nextfd(fd_start, fd_end);
	      stream.fd = fd;
	      FS.streams[fd] = stream;
	      return stream;
	    },
	    closeStream: fd => {
	      FS.streams[fd] = null;
	    },
	    chrdev_stream_ops: {
	      open: stream => {
	        var device = FS.getDevice(stream.node.rdev); // override node's stream ops with the device's

	        stream.stream_ops = device.stream_ops; // forward the open call

	        if (stream.stream_ops.open) {
	          stream.stream_ops.open(stream);
	        }
	      },
	      llseek: () => {
	        throw new FS.ErrnoError(70);
	      }
	    },
	    major: dev => dev >> 8,
	    minor: dev => dev & 0xff,
	    makedev: (ma, mi) => ma << 8 | mi,
	    registerDevice: (dev, ops) => {
	      FS.devices[dev] = {
	        stream_ops: ops
	      };
	    },
	    getDevice: dev => FS.devices[dev],
	    getMounts: mount => {
	      var mounts = [];
	      var check = [mount];

	      while (check.length) {
	        var m = check.pop();
	        mounts.push(m);
	        check.push.apply(check, m.mounts);
	      }

	      return mounts;
	    },
	    syncfs: (populate, callback) => {
	      if (typeof populate == 'function') {
	        callback = populate;
	        populate = false;
	      }

	      FS.syncFSRequests++;

	      if (FS.syncFSRequests > 1) {
	        err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
	      }

	      var mounts = FS.getMounts(FS.root.mount);
	      var completed = 0;

	      function doCallback(errCode) {
	        FS.syncFSRequests--;
	        return callback(errCode);
	      }

	      function done(errCode) {
	        if (errCode) {
	          if (!done.errored) {
	            done.errored = true;
	            return doCallback(errCode);
	          }

	          return;
	        }

	        if (++completed >= mounts.length) {
	          doCallback(null);
	        }
	      }

	      mounts.forEach(mount => {
	        if (!mount.type.syncfs) {
	          return done(null);
	        }

	        mount.type.syncfs(mount, populate, done);
	      });
	    },
	    mount: (type, opts, mountpoint) => {
	      var root = mountpoint === '/';
	      var pseudo = !mountpoint;
	      var node;

	      if (root && FS.root) {
	        throw new FS.ErrnoError(10);
	      } else if (!root && !pseudo) {
	        var lookup = FS.lookupPath(mountpoint, {
	          follow_mount: false
	        });
	        mountpoint = lookup.path; // use the absolute path

	        node = lookup.node;

	        if (FS.isMountpoint(node)) {
	          throw new FS.ErrnoError(10);
	        }

	        if (!FS.isDir(node.mode)) {
	          throw new FS.ErrnoError(54);
	        }
	      }

	      var mount = {
	        type: type,
	        opts: opts,
	        mountpoint: mountpoint,
	        mounts: []
	      }; // create a root node for the fs

	      var mountRoot = type.mount(mount);
	      mountRoot.mount = mount;
	      mount.root = mountRoot;

	      if (root) {
	        FS.root = mountRoot;
	      } else if (node) {
	        // set as a mountpoint
	        node.mounted = mount; // add the new mount to the current mount's children

	        if (node.mount) {
	          node.mount.mounts.push(mount);
	        }
	      }

	      return mountRoot;
	    },
	    unmount: mountpoint => {
	      var lookup = FS.lookupPath(mountpoint, {
	        follow_mount: false
	      });

	      if (!FS.isMountpoint(lookup.node)) {
	        throw new FS.ErrnoError(28);
	      } // destroy the nodes for this mount, and all its child mounts


	      var node = lookup.node;
	      var mount = node.mounted;
	      var mounts = FS.getMounts(mount);
	      Object.keys(FS.nameTable).forEach(hash => {
	        var current = FS.nameTable[hash];

	        while (current) {
	          var next = current.name_next;

	          if (mounts.includes(current.mount)) {
	            FS.destroyNode(current);
	          }

	          current = next;
	        }
	      }); // no longer a mountpoint

	      node.mounted = null; // remove this mount from the child mounts

	      var idx = node.mount.mounts.indexOf(mount);
	      node.mount.mounts.splice(idx, 1);
	    },
	    lookup: (parent, name) => {
	      return parent.node_ops.lookup(parent, name);
	    },
	    mknod: (path, mode, dev) => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;
	      var name = PATH.basename(path);

	      if (!name || name === '.' || name === '..') {
	        throw new FS.ErrnoError(28);
	      }

	      var errCode = FS.mayCreate(parent, name);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.mknod) {
	        throw new FS.ErrnoError(63);
	      }

	      return parent.node_ops.mknod(parent, name, mode, dev);
	    },
	    create: (path, mode) => {
	      mode = mode !== undefined ? mode : 438
	      /* 0666 */
	      ;
	      mode &= 4095;
	      mode |= 32768;
	      return FS.mknod(path, mode, 0);
	    },
	    mkdir: (path, mode) => {
	      mode = mode !== undefined ? mode : 511
	      /* 0777 */
	      ;
	      mode &= 511 | 512;
	      mode |= 16384;
	      return FS.mknod(path, mode, 0);
	    },
	    mkdirTree: (path, mode) => {
	      var dirs = path.split('/');
	      var d = '';

	      for (var i = 0; i < dirs.length; ++i) {
	        if (!dirs[i]) continue;
	        d += '/' + dirs[i];

	        try {
	          FS.mkdir(d, mode);
	        } catch (e) {
	          if (e.errno != 20) throw e;
	        }
	      }
	    },
	    mkdev: (path, mode, dev) => {
	      if (typeof dev == 'undefined') {
	        dev = mode;
	        mode = 438
	        /* 0666 */
	        ;
	      }

	      mode |= 8192;
	      return FS.mknod(path, mode, dev);
	    },
	    symlink: (oldpath, newpath) => {
	      if (!PATH_FS.resolve(oldpath)) {
	        throw new FS.ErrnoError(44);
	      }

	      var lookup = FS.lookupPath(newpath, {
	        parent: true
	      });
	      var parent = lookup.node;

	      if (!parent) {
	        throw new FS.ErrnoError(44);
	      }

	      var newname = PATH.basename(newpath);
	      var errCode = FS.mayCreate(parent, newname);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.symlink) {
	        throw new FS.ErrnoError(63);
	      }

	      return parent.node_ops.symlink(parent, newname, oldpath);
	    },
	    rename: (old_path, new_path) => {
	      var old_dirname = PATH.dirname(old_path);
	      var new_dirname = PATH.dirname(new_path);
	      var old_name = PATH.basename(old_path);
	      var new_name = PATH.basename(new_path); // parents must exist

	      var lookup, old_dir, new_dir; // let the errors from non existant directories percolate up

	      lookup = FS.lookupPath(old_path, {
	        parent: true
	      });
	      old_dir = lookup.node;
	      lookup = FS.lookupPath(new_path, {
	        parent: true
	      });
	      new_dir = lookup.node;
	      if (!old_dir || !new_dir) throw new FS.ErrnoError(44); // need to be part of the same mount

	      if (old_dir.mount !== new_dir.mount) {
	        throw new FS.ErrnoError(75);
	      } // source must exist


	      var old_node = FS.lookupNode(old_dir, old_name); // old path should not be an ancestor of the new path

	      var relative = PATH_FS.relative(old_path, new_dirname);

	      if (relative.charAt(0) !== '.') {
	        throw new FS.ErrnoError(28);
	      } // new path should not be an ancestor of the old path


	      relative = PATH_FS.relative(new_path, old_dirname);

	      if (relative.charAt(0) !== '.') {
	        throw new FS.ErrnoError(55);
	      } // see if the new path already exists


	      var new_node;

	      try {
	        new_node = FS.lookupNode(new_dir, new_name);
	      } catch (e) {// not fatal
	      } // early out if nothing needs to change


	      if (old_node === new_node) {
	        return;
	      } // we'll need to delete the old entry


	      var isdir = FS.isDir(old_node.mode);
	      var errCode = FS.mayDelete(old_dir, old_name, isdir);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      } // need delete permissions if we'll be overwriting.
	      // need create permissions if new doesn't already exist.


	      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!old_dir.node_ops.rename) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
	        throw new FS.ErrnoError(10);
	      } // if we are going to change the parent, check write permissions


	      if (new_dir !== old_dir) {
	        errCode = FS.nodePermissions(old_dir, 'w');

	        if (errCode) {
	          throw new FS.ErrnoError(errCode);
	        }
	      } // remove the node from the lookup hash


	      FS.hashRemoveNode(old_node); // do the underlying fs rename

	      try {
	        old_dir.node_ops.rename(old_node, new_dir, new_name);
	      } catch (e) {
	        throw e;
	      } finally {
	        // add the node back to the hash (in case node_ops.rename
	        // changed its name)
	        FS.hashAddNode(old_node);
	      }
	    },
	    rmdir: path => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;
	      var name = PATH.basename(path);
	      var node = FS.lookupNode(parent, name);
	      var errCode = FS.mayDelete(parent, name, true);

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.rmdir) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(node)) {
	        throw new FS.ErrnoError(10);
	      }

	      parent.node_ops.rmdir(parent, name);
	      FS.destroyNode(node);
	    },
	    readdir: path => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });
	      var node = lookup.node;

	      if (!node.node_ops.readdir) {
	        throw new FS.ErrnoError(54);
	      }

	      return node.node_ops.readdir(node);
	    },
	    unlink: path => {
	      var lookup = FS.lookupPath(path, {
	        parent: true
	      });
	      var parent = lookup.node;

	      if (!parent) {
	        throw new FS.ErrnoError(44);
	      }

	      var name = PATH.basename(path);
	      var node = FS.lookupNode(parent, name);
	      var errCode = FS.mayDelete(parent, name, false);

	      if (errCode) {
	        // According to POSIX, we should map EISDIR to EPERM, but
	        // we instead do what Linux does (and we must, as we use
	        // the musl linux libc).
	        throw new FS.ErrnoError(errCode);
	      }

	      if (!parent.node_ops.unlink) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isMountpoint(node)) {
	        throw new FS.ErrnoError(10);
	      }

	      parent.node_ops.unlink(parent, name);
	      FS.destroyNode(node);
	    },
	    readlink: path => {
	      var lookup = FS.lookupPath(path);
	      var link = lookup.node;

	      if (!link) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!link.node_ops.readlink) {
	        throw new FS.ErrnoError(28);
	      }

	      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
	    },
	    stat: (path, dontFollow) => {
	      var lookup = FS.lookupPath(path, {
	        follow: !dontFollow
	      });
	      var node = lookup.node;

	      if (!node) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!node.node_ops.getattr) {
	        throw new FS.ErrnoError(63);
	      }

	      return node.node_ops.getattr(node);
	    },
	    lstat: path => {
	      return FS.stat(path, true);
	    },
	    chmod: (path, mode, dontFollow) => {
	      var node;

	      if (typeof path == 'string') {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontFollow
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      node.node_ops.setattr(node, {
	        mode: mode & 4095 | node.mode & ~4095,
	        timestamp: Date.now()
	      });
	    },
	    lchmod: (path, mode) => {
	      FS.chmod(path, mode, true);
	    },
	    fchmod: (fd, mode) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      FS.chmod(stream.node, mode);
	    },
	    chown: (path, uid, gid, dontFollow) => {
	      var node;

	      if (typeof path == 'string') {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontFollow
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      node.node_ops.setattr(node, {
	        timestamp: Date.now() // we ignore the uid / gid for now

	      });
	    },
	    lchown: (path, uid, gid) => {
	      FS.chown(path, uid, gid, true);
	    },
	    fchown: (fd, uid, gid) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      FS.chown(stream.node, uid, gid);
	    },
	    truncate: (path, len) => {
	      if (len < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      var node;

	      if (typeof path == 'string') {
	        var lookup = FS.lookupPath(path, {
	          follow: true
	        });
	        node = lookup.node;
	      } else {
	        node = path;
	      }

	      if (!node.node_ops.setattr) {
	        throw new FS.ErrnoError(63);
	      }

	      if (FS.isDir(node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!FS.isFile(node.mode)) {
	        throw new FS.ErrnoError(28);
	      }

	      var errCode = FS.nodePermissions(node, 'w');

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      node.node_ops.setattr(node, {
	        size: len,
	        timestamp: Date.now()
	      });
	    },
	    ftruncate: (fd, len) => {
	      var stream = FS.getStream(fd);

	      if (!stream) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(28);
	      }

	      FS.truncate(stream.node, len);
	    },
	    utime: (path, atime, mtime) => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });
	      var node = lookup.node;
	      node.node_ops.setattr(node, {
	        timestamp: Math.max(atime, mtime)
	      });
	    },
	    open: (path, flags, mode) => {
	      if (path === "") {
	        throw new FS.ErrnoError(44);
	      }

	      flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
	      mode = typeof mode == 'undefined' ? 438
	      /* 0666 */
	      : mode;

	      if (flags & 64) {
	        mode = mode & 4095 | 32768;
	      } else {
	        mode = 0;
	      }

	      var node;

	      if (typeof path == 'object') {
	        node = path;
	      } else {
	        path = PATH.normalize(path);

	        try {
	          var lookup = FS.lookupPath(path, {
	            follow: !(flags & 131072)
	          });
	          node = lookup.node;
	        } catch (e) {// ignore
	        }
	      } // perhaps we need to create the node


	      var created = false;

	      if (flags & 64) {
	        if (node) {
	          // if O_CREAT and O_EXCL are set, error out if the node already exists
	          if (flags & 128) {
	            throw new FS.ErrnoError(20);
	          }
	        } else {
	          // node doesn't exist, try to create it
	          node = FS.mknod(path, mode, 0);
	          created = true;
	        }
	      }

	      if (!node) {
	        throw new FS.ErrnoError(44);
	      } // can't truncate a device


	      if (FS.isChrdev(node.mode)) {
	        flags &= ~512;
	      } // if asked only for a directory, then this must be one


	      if (flags & 65536 && !FS.isDir(node.mode)) {
	        throw new FS.ErrnoError(54);
	      } // check permissions, if this is not a file we just created now (it is ok to
	      // create and write to a file with read-only permissions; it is read-only
	      // for later use)


	      if (!created) {
	        var errCode = FS.mayOpen(node, flags);

	        if (errCode) {
	          throw new FS.ErrnoError(errCode);
	        }
	      } // do truncation if necessary


	      if (flags & 512 && !created) {
	        FS.truncate(node, 0);
	      } // we've already handled these, don't pass down to the underlying vfs


	      flags &= ~(128 | 512 | 131072); // register the stream with the filesystem

	      var stream = FS.createStream({
	        node: node,
	        path: FS.getPath(node),
	        // we want the absolute path to the node
	        flags: flags,
	        seekable: true,
	        position: 0,
	        stream_ops: node.stream_ops,
	        // used by the file family libc calls (fopen, fwrite, ferror, etc.)
	        ungotten: [],
	        error: false
	      }); // call the new stream's open function

	      if (stream.stream_ops.open) {
	        stream.stream_ops.open(stream);
	      }

	      if (Module['logReadFiles'] && !(flags & 1)) {
	        if (!FS.readFiles) FS.readFiles = {};

	        if (!(path in FS.readFiles)) {
	          FS.readFiles[path] = 1;
	        }
	      }

	      return stream;
	    },
	    close: stream => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (stream.getdents) stream.getdents = null; // free readdir state

	      try {
	        if (stream.stream_ops.close) {
	          stream.stream_ops.close(stream);
	        }
	      } catch (e) {
	        throw e;
	      } finally {
	        FS.closeStream(stream.fd);
	      }

	      stream.fd = null;
	    },
	    isClosed: stream => {
	      return stream.fd === null;
	    },
	    llseek: (stream, offset, whence) => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (!stream.seekable || !stream.stream_ops.llseek) {
	        throw new FS.ErrnoError(70);
	      }

	      if (whence != 0 && whence != 1 && whence != 2) {
	        throw new FS.ErrnoError(28);
	      }

	      stream.position = stream.stream_ops.llseek(stream, offset, whence);
	      stream.ungotten = [];
	      return stream.position;
	    },
	    read: (stream, buffer, offset, length, position) => {
	      if (length < 0 || position < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 1) {
	        throw new FS.ErrnoError(8);
	      }

	      if (FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!stream.stream_ops.read) {
	        throw new FS.ErrnoError(28);
	      }

	      var seeking = typeof position != 'undefined';

	      if (!seeking) {
	        position = stream.position;
	      } else if (!stream.seekable) {
	        throw new FS.ErrnoError(70);
	      }

	      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
	      if (!seeking) stream.position += bytesRead;
	      return bytesRead;
	    },
	    write: (stream, buffer, offset, length, position, canOwn) => {
	      if (length < 0 || position < 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(8);
	      }

	      if (FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(31);
	      }

	      if (!stream.stream_ops.write) {
	        throw new FS.ErrnoError(28);
	      }

	      if (stream.seekable && stream.flags & 1024) {
	        // seek to the end before writing in append mode
	        FS.llseek(stream, 0, 2);
	      }

	      var seeking = typeof position != 'undefined';

	      if (!seeking) {
	        position = stream.position;
	      } else if (!stream.seekable) {
	        throw new FS.ErrnoError(70);
	      }

	      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
	      if (!seeking) stream.position += bytesWritten;
	      return bytesWritten;
	    },
	    allocate: (stream, offset, length) => {
	      if (FS.isClosed(stream)) {
	        throw new FS.ErrnoError(8);
	      }

	      if (offset < 0 || length <= 0) {
	        throw new FS.ErrnoError(28);
	      }

	      if ((stream.flags & 2097155) === 0) {
	        throw new FS.ErrnoError(8);
	      }

	      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
	        throw new FS.ErrnoError(43);
	      }

	      if (!stream.stream_ops.allocate) {
	        throw new FS.ErrnoError(138);
	      }

	      stream.stream_ops.allocate(stream, offset, length);
	    },
	    mmap: (stream, length, position, prot, flags) => {
	      // User requests writing to file (prot & PROT_WRITE != 0).
	      // Checking if we have permissions to write to the file unless
	      // MAP_PRIVATE flag is set. According to POSIX spec it is possible
	      // to write to file opened in read-only mode with MAP_PRIVATE flag,
	      // as all modifications will be visible only in the memory of
	      // the current process.
	      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
	        throw new FS.ErrnoError(2);
	      }

	      if ((stream.flags & 2097155) === 1) {
	        throw new FS.ErrnoError(2);
	      }

	      if (!stream.stream_ops.mmap) {
	        throw new FS.ErrnoError(43);
	      }

	      return stream.stream_ops.mmap(stream, length, position, prot, flags);
	    },
	    msync: (stream, buffer, offset, length, mmapFlags) => {
	      if (!stream || !stream.stream_ops.msync) {
	        return 0;
	      }

	      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
	    },
	    munmap: stream => 0,
	    ioctl: (stream, cmd, arg) => {
	      if (!stream.stream_ops.ioctl) {
	        throw new FS.ErrnoError(59);
	      }

	      return stream.stream_ops.ioctl(stream, cmd, arg);
	    },
	    readFile: function (path) {
	      let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      opts.flags = opts.flags || 0;
	      opts.encoding = opts.encoding || 'binary';

	      if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
	        throw new Error('Invalid encoding type "' + opts.encoding + '"');
	      }

	      var ret;
	      var stream = FS.open(path, opts.flags);
	      var stat = FS.stat(path);
	      var length = stat.size;
	      var buf = new Uint8Array(length);
	      FS.read(stream, buf, 0, length, 0);

	      if (opts.encoding === 'utf8') {
	        ret = UTF8ArrayToString(buf, 0);
	      } else if (opts.encoding === 'binary') {
	        ret = buf;
	      }

	      FS.close(stream);
	      return ret;
	    },
	    writeFile: function (path, data) {
	      let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      opts.flags = opts.flags || 577;
	      var stream = FS.open(path, opts.flags, opts.mode);

	      if (typeof data == 'string') {
	        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
	        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
	        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
	      } else if (ArrayBuffer.isView(data)) {
	        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
	      } else {
	        throw new Error('Unsupported data type');
	      }

	      FS.close(stream);
	    },
	    cwd: () => FS.currentPath,
	    chdir: path => {
	      var lookup = FS.lookupPath(path, {
	        follow: true
	      });

	      if (lookup.node === null) {
	        throw new FS.ErrnoError(44);
	      }

	      if (!FS.isDir(lookup.node.mode)) {
	        throw new FS.ErrnoError(54);
	      }

	      var errCode = FS.nodePermissions(lookup.node, 'x');

	      if (errCode) {
	        throw new FS.ErrnoError(errCode);
	      }

	      FS.currentPath = lookup.path;
	    },
	    createDefaultDirectories: () => {
	      FS.mkdir('/tmp');
	      FS.mkdir('/home');
	      FS.mkdir('/home/web_user');
	    },
	    createDefaultDevices: () => {
	      // create /dev
	      FS.mkdir('/dev'); // setup /dev/null

	      FS.registerDevice(FS.makedev(1, 3), {
	        read: () => 0,
	        write: (stream, buffer, offset, length, pos) => length
	      });
	      FS.mkdev('/dev/null', FS.makedev(1, 3)); // setup /dev/tty and /dev/tty1
	      // stderr needs to print output using err() rather than out()
	      // so we register a second tty just for it.

	      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
	      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
	      FS.mkdev('/dev/tty', FS.makedev(5, 0));
	      FS.mkdev('/dev/tty1', FS.makedev(6, 0)); // setup /dev/[u]random

	      var random_device = getRandomDevice();
	      FS.createDevice('/dev', 'random', random_device);
	      FS.createDevice('/dev', 'urandom', random_device); // we're not going to emulate the actual shm device,
	      // just create the tmp dirs that reside in it commonly

	      FS.mkdir('/dev/shm');
	      FS.mkdir('/dev/shm/tmp');
	    },
	    createSpecialDirectories: () => {
	      // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
	      // name of the stream for fd 6 (see test_unistd_ttyname)
	      FS.mkdir('/proc');
	      var proc_self = FS.mkdir('/proc/self');
	      FS.mkdir('/proc/self/fd');
	      FS.mount({
	        mount: () => {
	          var node = FS.createNode(proc_self, 'fd', 16384 | 511
	          /* 0777 */
	          , 73);
	          node.node_ops = {
	            lookup: (parent, name) => {
	              var fd = +name;
	              var stream = FS.getStream(fd);
	              if (!stream) throw new FS.ErrnoError(8);
	              var ret = {
	                parent: null,
	                mount: {
	                  mountpoint: 'fake'
	                },
	                node_ops: {
	                  readlink: () => stream.path
	                }
	              };
	              ret.parent = ret; // make it look like a simple root node

	              return ret;
	            }
	          };
	          return node;
	        }
	      }, {}, '/proc/self/fd');
	    },
	    createStandardStreams: () => {
	      // TODO deprecate the old functionality of a single
	      // input / output callback and that utilizes FS.createDevice
	      // and instead require a unique set of stream ops
	      // by default, we symlink the standard streams to the
	      // default tty devices. however, if the standard streams
	      // have been overwritten we create a unique device for
	      // them instead.
	      if (Module['stdin']) {
	        FS.createDevice('/dev', 'stdin', Module['stdin']);
	      } else {
	        FS.symlink('/dev/tty', '/dev/stdin');
	      }

	      if (Module['stdout']) {
	        FS.createDevice('/dev', 'stdout', null, Module['stdout']);
	      } else {
	        FS.symlink('/dev/tty', '/dev/stdout');
	      }

	      if (Module['stderr']) {
	        FS.createDevice('/dev', 'stderr', null, Module['stderr']);
	      } else {
	        FS.symlink('/dev/tty1', '/dev/stderr');
	      } // open default streams for the stdin, stdout and stderr devices


	      FS.open('/dev/stdin', 0);
	      FS.open('/dev/stdout', 1);
	      FS.open('/dev/stderr', 1);
	    },
	    ensureErrnoError: () => {
	      if (FS.ErrnoError) return;

	      FS.ErrnoError =
	      /** @this{Object} */
	      function ErrnoError(errno, node) {
	        this.node = node;

	        this.setErrno =
	        /** @this{Object} */
	        function (errno) {
	          this.errno = errno;
	        };

	        this.setErrno(errno);
	        this.message = 'FS error';
	      };

	      FS.ErrnoError.prototype = new Error();
	      FS.ErrnoError.prototype.constructor = FS.ErrnoError; // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)

	      [44].forEach(code => {
	        FS.genericErrors[code] = new FS.ErrnoError(code);
	        FS.genericErrors[code].stack = '<generic error, no stack>';
	      });
	    },
	    staticInit: () => {
	      FS.ensureErrnoError();
	      FS.nameTable = new Array(4096);
	      FS.mount(MEMFS, {}, '/');
	      FS.createDefaultDirectories();
	      FS.createDefaultDevices();
	      FS.createSpecialDirectories();
	      FS.filesystems = {
	        'MEMFS': MEMFS
	      };
	    },
	    init: (input, output, error) => {
	      FS.init.initialized = true;
	      FS.ensureErrnoError(); // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here

	      Module['stdin'] = input || Module['stdin'];
	      Module['stdout'] = output || Module['stdout'];
	      Module['stderr'] = error || Module['stderr'];
	      FS.createStandardStreams();
	    },
	    quit: () => {
	      FS.init.initialized = false; // force-flush all streams, so we get musl std streams printed out
	      // close all of our streams

	      for (var i = 0; i < FS.streams.length; i++) {
	        var stream = FS.streams[i];

	        if (!stream) {
	          continue;
	        }

	        FS.close(stream);
	      }
	    },
	    getMode: (canRead, canWrite) => {
	      var mode = 0;
	      if (canRead) mode |= 292 | 73;
	      if (canWrite) mode |= 146;
	      return mode;
	    },
	    findObject: (path, dontResolveLastLink) => {
	      var ret = FS.analyzePath(path, dontResolveLastLink);

	      if (ret.exists) {
	        return ret.object;
	      } else {
	        return null;
	      }
	    },
	    analyzePath: (path, dontResolveLastLink) => {
	      // operate from within the context of the symlink's target
	      try {
	        var lookup = FS.lookupPath(path, {
	          follow: !dontResolveLastLink
	        });
	        path = lookup.path;
	      } catch (e) {}

	      var ret = {
	        isRoot: false,
	        exists: false,
	        error: 0,
	        name: null,
	        path: null,
	        object: null,
	        parentExists: false,
	        parentPath: null,
	        parentObject: null
	      };

	      try {
	        var lookup = FS.lookupPath(path, {
	          parent: true
	        });
	        ret.parentExists = true;
	        ret.parentPath = lookup.path;
	        ret.parentObject = lookup.node;
	        ret.name = PATH.basename(path);
	        lookup = FS.lookupPath(path, {
	          follow: !dontResolveLastLink
	        });
	        ret.exists = true;
	        ret.path = lookup.path;
	        ret.object = lookup.node;
	        ret.name = lookup.node.name;
	        ret.isRoot = lookup.path === '/';
	      } catch (e) {
	        ret.error = e.errno;
	      }
	      return ret;
	    },
	    createPath: (parent, path, canRead, canWrite) => {
	      parent = typeof parent == 'string' ? parent : FS.getPath(parent);
	      var parts = path.split('/').reverse();

	      while (parts.length) {
	        var part = parts.pop();
	        if (!part) continue;
	        var current = PATH.join2(parent, part);

	        try {
	          FS.mkdir(current);
	        } catch (e) {// ignore EEXIST
	        }

	        parent = current;
	      }

	      return current;
	    },
	    createFile: (parent, name, properties, canRead, canWrite) => {
	      var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
	      var mode = FS.getMode(canRead, canWrite);
	      return FS.create(path, mode);
	    },
	    createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
	      var path = name;

	      if (parent) {
	        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
	        path = name ? PATH.join2(parent, name) : parent;
	      }

	      var mode = FS.getMode(canRead, canWrite);
	      var node = FS.create(path, mode);

	      if (data) {
	        if (typeof data == 'string') {
	          var arr = new Array(data.length);

	          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);

	          data = arr;
	        } // make sure we can write to the file


	        FS.chmod(node, mode | 146);
	        var stream = FS.open(node, 577);
	        FS.write(stream, data, 0, data.length, 0, canOwn);
	        FS.close(stream);
	        FS.chmod(node, mode);
	      }

	      return node;
	    },
	    createDevice: (parent, name, input, output) => {
	      var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
	      var mode = FS.getMode(!!input, !!output);
	      if (!FS.createDevice.major) FS.createDevice.major = 64;
	      var dev = FS.makedev(FS.createDevice.major++, 0); // Create a fake device that a set of stream ops to emulate
	      // the old behavior.

	      FS.registerDevice(dev, {
	        open: stream => {
	          stream.seekable = false;
	        },
	        close: stream => {
	          // flush any pending line data
	          if (output && output.buffer && output.buffer.length) {
	            output(10);
	          }
	        },
	        read: (stream, buffer, offset, length, pos
	        /* ignored */
	        ) => {
	          var bytesRead = 0;

	          for (var i = 0; i < length; i++) {
	            var result;

	            try {
	              result = input();
	            } catch (e) {
	              throw new FS.ErrnoError(29);
	            }

	            if (result === undefined && bytesRead === 0) {
	              throw new FS.ErrnoError(6);
	            }

	            if (result === null || result === undefined) break;
	            bytesRead++;
	            buffer[offset + i] = result;
	          }

	          if (bytesRead) {
	            stream.node.timestamp = Date.now();
	          }

	          return bytesRead;
	        },
	        write: (stream, buffer, offset, length, pos) => {
	          for (var i = 0; i < length; i++) {
	            try {
	              output(buffer[offset + i]);
	            } catch (e) {
	              throw new FS.ErrnoError(29);
	            }
	          }

	          if (length) {
	            stream.node.timestamp = Date.now();
	          }

	          return i;
	        }
	      });
	      return FS.mkdev(path, mode, dev);
	    },
	    forceLoadFile: obj => {
	      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;

	      if (typeof XMLHttpRequest != 'undefined') {
	        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
	      } else if (read_) {
	        // Command-line.
	        try {
	          // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
	          //          read() will try to parse UTF8.
	          obj.contents = intArrayFromString(read_(obj.url), true);
	          obj.usedBytes = obj.contents.length;
	        } catch (e) {
	          throw new FS.ErrnoError(29);
	        }
	      } else {
	        throw new Error('Cannot load without read() or XMLHttpRequest.');
	      }
	    },
	    createLazyFile: (parent, name, url, canRead, canWrite) => {
	      // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.

	      /** @constructor */
	      function LazyUint8Array() {
	        this.lengthKnown = false;
	        this.chunks = []; // Loaded chunks. Index is the chunk number
	      }

	      LazyUint8Array.prototype.get =
	      /** @this{Object} */
	      function LazyUint8Array_get(idx) {
	        if (idx > this.length - 1 || idx < 0) {
	          return undefined;
	        }

	        var chunkOffset = idx % this.chunkSize;
	        var chunkNum = idx / this.chunkSize | 0;
	        return this.getter(chunkNum)[chunkOffset];
	      };

	      LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
	        this.getter = getter;
	      };

	      LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
	        // Find length
	        var xhr = new XMLHttpRequest();
	        xhr.open('HEAD', url, false);
	        xhr.send(null);
	        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
	        var datalength = Number(xhr.getResponseHeader("Content-length"));
	        var header;
	        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
	        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
	        var chunkSize = 1024 * 1024; // Chunk size in bytes

	        if (!hasByteServing) chunkSize = datalength; // Function to get a range from the remote URL.

	        var doXHR = (from, to) => {
	          if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
	          if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!"); // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.

	          var xhr = new XMLHttpRequest();
	          xhr.open('GET', url, false);
	          if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to); // Some hints to the browser that we want binary data.

	          xhr.responseType = 'arraybuffer';

	          if (xhr.overrideMimeType) {
	            xhr.overrideMimeType('text/plain; charset=x-user-defined');
	          }

	          xhr.send(null);
	          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);

	          if (xhr.response !== undefined) {
	            return new Uint8Array(
	            /** @type{Array<number>} */
	            xhr.response || []);
	          } else {
	            return intArrayFromString(xhr.responseText || '', true);
	          }
	        };

	        var lazyArray = this;
	        lazyArray.setDataGetter(chunkNum => {
	          var start = chunkNum * chunkSize;
	          var end = (chunkNum + 1) * chunkSize - 1; // including this byte

	          end = Math.min(end, datalength - 1); // if datalength-1 is selected, this is the last block

	          if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
	            lazyArray.chunks[chunkNum] = doXHR(start, end);
	          }

	          if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
	          return lazyArray.chunks[chunkNum];
	        });

	        if (usesGzip || !datalength) {
	          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
	          chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file

	          datalength = this.getter(0).length;
	          chunkSize = datalength;
	          out("LazyFiles on gzip forces download of the whole file when length is accessed");
	        }

	        this._length = datalength;
	        this._chunkSize = chunkSize;
	        this.lengthKnown = true;
	      };

	      if (typeof XMLHttpRequest != 'undefined') {
	        if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
	        var lazyArray = new LazyUint8Array();
	        Object.defineProperties(lazyArray, {
	          length: {
	            get:
	            /** @this{Object} */
	            function () {
	              if (!this.lengthKnown) {
	                this.cacheLength();
	              }

	              return this._length;
	            }
	          },
	          chunkSize: {
	            get:
	            /** @this{Object} */
	            function () {
	              if (!this.lengthKnown) {
	                this.cacheLength();
	              }

	              return this._chunkSize;
	            }
	          }
	        });
	        var properties = {
	          isDevice: false,
	          contents: lazyArray
	        };
	      } else {
	        var properties = {
	          isDevice: false,
	          url: url
	        };
	      }

	      var node = FS.createFile(parent, name, properties, canRead, canWrite); // This is a total hack, but I want to get this lazy file code out of the
	      // core of MEMFS. If we want to keep this lazy file concept I feel it should
	      // be its own thin LAZYFS proxying calls to MEMFS.

	      if (properties.contents) {
	        node.contents = properties.contents;
	      } else if (properties.url) {
	        node.contents = null;
	        node.url = properties.url;
	      } // Add a function that defers querying the file size until it is asked the first time.


	      Object.defineProperties(node, {
	        usedBytes: {
	          get:
	          /** @this {FSNode} */
	          function () {
	            return this.contents.length;
	          }
	        }
	      }); // override each stream op with one that tries to force load the lazy file first

	      var stream_ops = {};
	      var keys = Object.keys(node.stream_ops);
	      keys.forEach(key => {
	        var fn = node.stream_ops[key];

	        stream_ops[key] = function forceLoadLazyFile() {
	          FS.forceLoadFile(node);
	          return fn.apply(null, arguments);
	        };
	      });

	      function writeChunks(stream, buffer, offset, length, position) {
	        var contents = stream.node.contents;
	        if (position >= contents.length) return 0;
	        var size = Math.min(contents.length - position, length);

	        if (contents.slice) {
	          // normal array
	          for (var i = 0; i < size; i++) {
	            buffer[offset + i] = contents[position + i];
	          }
	        } else {
	          for (var i = 0; i < size; i++) {
	            // LazyUint8Array from sync binary XHR
	            buffer[offset + i] = contents.get(position + i);
	          }
	        }

	        return size;
	      } // use a custom read function


	      stream_ops.read = (stream, buffer, offset, length, position) => {
	        FS.forceLoadFile(node);
	        return writeChunks(stream, buffer, offset, length, position);
	      }; // use a custom mmap function


	      stream_ops.mmap = (stream, length, position, prot, flags) => {
	        FS.forceLoadFile(node);
	        var ptr = mmapAlloc(length);

	        if (!ptr) {
	          throw new FS.ErrnoError(48);
	        }

	        writeChunks(stream, HEAP8, ptr, length, position);
	        return {
	          ptr: ptr,
	          allocated: true
	        };
	      };

	      node.stream_ops = stream_ops;
	      return node;
	    },
	    createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
	      // TODO we should allow people to just pass in a complete filename instead
	      // of parent and name being that we just join them anyways
	      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;

	      function processData(byteArray) {
	        function finish(byteArray) {
	          if (preFinish) preFinish();

	          if (!dontCreateFile) {
	            FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
	          }

	          if (onload) onload();
	          removeRunDependency();
	        }

	        if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
	          if (onerror) onerror();
	          removeRunDependency();
	        })) {
	          return;
	        }

	        finish(byteArray);
	      }

	      addRunDependency();

	      if (typeof url == 'string') {
	        asyncLoad(url, byteArray => processData(byteArray), onerror);
	      } else {
	        processData(url);
	      }
	    },
	    indexedDB: () => {
	      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	    },
	    DB_NAME: () => {
	      return 'EM_FS_' + window.location.pathname;
	    },
	    DB_VERSION: 20,
	    DB_STORE_NAME: "FILE_DATA",
	    saveFilesToDB: (paths, onload, onerror) => {
	      onload = onload || (() => {});

	      onerror = onerror || (() => {});

	      var indexedDB = FS.indexedDB();

	      try {
	        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
	      } catch (e) {
	        return onerror(e);
	      }

	      openRequest.onupgradeneeded = () => {
	        out('creating db');
	        var db = openRequest.result;
	        db.createObjectStore(FS.DB_STORE_NAME);
	      };

	      openRequest.onsuccess = () => {
	        var db = openRequest.result;
	        var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
	        var files = transaction.objectStore(FS.DB_STORE_NAME);
	        var ok = 0,
	            fail = 0,
	            total = paths.length;

	        function finish() {
	          if (fail == 0) onload();else onerror();
	        }

	        paths.forEach(path => {
	          var putRequest = files.put(FS.analyzePath(path).object.contents, path);

	          putRequest.onsuccess = () => {
	            ok++;
	            if (ok + fail == total) finish();
	          };

	          putRequest.onerror = () => {
	            fail++;
	            if (ok + fail == total) finish();
	          };
	        });
	        transaction.onerror = onerror;
	      };

	      openRequest.onerror = onerror;
	    },
	    loadFilesFromDB: (paths, onload, onerror) => {
	      onload = onload || (() => {});

	      onerror = onerror || (() => {});

	      var indexedDB = FS.indexedDB();

	      try {
	        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
	      } catch (e) {
	        return onerror(e);
	      }

	      openRequest.onupgradeneeded = onerror; // no database to load from

	      openRequest.onsuccess = () => {
	        var db = openRequest.result;

	        try {
	          var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
	        } catch (e) {
	          onerror(e);
	          return;
	        }

	        var files = transaction.objectStore(FS.DB_STORE_NAME);
	        var ok = 0,
	            fail = 0,
	            total = paths.length;

	        function finish() {
	          if (fail == 0) onload();else onerror();
	        }

	        paths.forEach(path => {
	          var getRequest = files.get(path);

	          getRequest.onsuccess = () => {
	            if (FS.analyzePath(path).exists) {
	              FS.unlink(path);
	            }

	            FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
	            ok++;
	            if (ok + fail == total) finish();
	          };

	          getRequest.onerror = () => {
	            fail++;
	            if (ok + fail == total) finish();
	          };
	        });
	        transaction.onerror = onerror;
	      };

	      openRequest.onerror = onerror;
	    }
	  };
	  var SYSCALLS = {
	    DEFAULT_POLLMASK: 5,
	    calculateAt: function (dirfd, path, allowEmpty) {
	      if (PATH.isAbs(path)) {
	        return path;
	      } // relative path


	      var dir;

	      if (dirfd === -100) {
	        dir = FS.cwd();
	      } else {
	        var dirstream = FS.getStream(dirfd);
	        if (!dirstream) throw new FS.ErrnoError(8);
	        dir = dirstream.path;
	      }

	      if (path.length == 0) {
	        if (!allowEmpty) {
	          throw new FS.ErrnoError(44);
	        }

	        return dir;
	      }

	      return PATH.join2(dir, path);
	    },
	    doStat: function (func, path, buf) {
	      try {
	        var stat = func(path);
	      } catch (e) {
	        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
	          // an error occurred while trying to look up the path; we should just report ENOTDIR
	          return -54;
	        }

	        throw e;
	      }

	      HEAP32[buf >> 2] = stat.dev;
	      HEAP32[buf + 4 >> 2] = 0;
	      HEAP32[buf + 8 >> 2] = stat.ino;
	      HEAP32[buf + 12 >> 2] = stat.mode;
	      HEAP32[buf + 16 >> 2] = stat.nlink;
	      HEAP32[buf + 20 >> 2] = stat.uid;
	      HEAP32[buf + 24 >> 2] = stat.gid;
	      HEAP32[buf + 28 >> 2] = stat.rdev;
	      HEAP32[buf + 32 >> 2] = 0;
	      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
	      HEAP32[buf + 48 >> 2] = 4096;
	      HEAP32[buf + 52 >> 2] = stat.blocks;
	      HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1000 | 0;
	      HEAP32[buf + 60 >> 2] = 0;
	      HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1000 | 0;
	      HEAP32[buf + 68 >> 2] = 0;
	      HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1000 | 0;
	      HEAP32[buf + 76 >> 2] = 0;
	      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
	      return 0;
	    },
	    doMsync: function (addr, stream, len, flags, offset) {
	      var buffer = HEAPU8.slice(addr, addr + len);
	      FS.msync(stream, buffer, offset, len, flags);
	    },
	    varargs: undefined,
	    get: function () {
	      SYSCALLS.varargs += 4;
	      var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
	      return ret;
	    },
	    getStr: function (ptr) {
	      var ret = UTF8ToString(ptr);
	      return ret;
	    },
	    getStreamFromFD: function (fd) {
	      var stream = FS.getStream(fd);
	      if (!stream) throw new FS.ErrnoError(8);
	      return stream;
	    }
	  };

	  function ___syscall_fcntl64(fd, cmd, varargs) {
	    SYSCALLS.varargs = varargs;

	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);

	      switch (cmd) {
	        case 0:
	          {
	            var arg = SYSCALLS.get();

	            if (arg < 0) {
	              return -28;
	            }

	            var newStream;
	            newStream = FS.createStream(stream, arg);
	            return newStream.fd;
	          }

	        case 1:
	        case 2:
	          return 0;
	        // FD_CLOEXEC makes no sense for a single process.

	        case 3:
	          return stream.flags;

	        case 4:
	          {
	            var arg = SYSCALLS.get();
	            stream.flags |= arg;
	            return 0;
	          }

	        case 5:
	          /* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
	          {
	            var arg = SYSCALLS.get();
	            var offset = 0; // We're always unlocked.

	            HEAP16[arg + offset >> 1] = 2;
	            return 0;
	          }

	        case 6:
	        case 7:
	          /* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */

	          /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
	          return 0;
	        // Pretend that the locking is successful.

	        case 16:
	        case 8:
	          return -28;
	        // These are for sockets. We don't have them fully implemented yet.

	        case 9:
	          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fcntl() returns that, and we set errno ourselves.
	          setErrNo(28);
	          return -1;

	        default:
	          {
	            return -28;
	          }
	      }
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return -e.errno;
	    }
	  }

	  function ___syscall_openat(dirfd, path, flags, varargs) {
	    SYSCALLS.varargs = varargs;

	    try {
	      path = SYSCALLS.getStr(path);
	      path = SYSCALLS.calculateAt(dirfd, path);
	      var mode = varargs ? SYSCALLS.get() : 0;
	      return FS.open(path, flags, mode).fd;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return -e.errno;
	    }
	  }

	  function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

	  function getShiftFromSize(size) {
	    switch (size) {
	      case 1:
	        return 0;

	      case 2:
	        return 1;

	      case 4:
	        return 2;

	      case 8:
	        return 3;

	      default:
	        throw new TypeError('Unknown type size: ' + size);
	    }
	  }

	  function embind_init_charCodes() {
	    var codes = new Array(256);

	    for (var i = 0; i < 256; ++i) {
	      codes[i] = String.fromCharCode(i);
	    }

	    embind_charCodes = codes;
	  }

	  var embind_charCodes = undefined;

	  function readLatin1String(ptr) {
	    var ret = "";
	    var c = ptr;

	    while (HEAPU8[c]) {
	      ret += embind_charCodes[HEAPU8[c++]];
	    }

	    return ret;
	  }

	  var awaitingDependencies = {};
	  var registeredTypes = {};
	  var typeDependencies = {};
	  var char_0 = 48;
	  var char_9 = 57;

	  function makeLegalFunctionName(name) {
	    if (undefined === name) {
	      return '_unknown';
	    }

	    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
	    var f = name.charCodeAt(0);

	    if (f >= char_0 && f <= char_9) {
	      return '_' + name;
	    }

	    return name;
	  }

	  function createNamedFunction(name, body) {
	    name = makeLegalFunctionName(name);
	    /*jshint evil:true*/

	    return new Function("body", "return function " + name + "() {\n" + "    \"use strict\";" + "    return body.apply(this, arguments);\n" + "};\n")(body);
	  }

	  function extendError(baseErrorType, errorName) {
	    var errorClass = createNamedFunction(errorName, function (message) {
	      this.name = errorName;
	      this.message = message;
	      var stack = new Error(message).stack;

	      if (stack !== undefined) {
	        this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
	      }
	    });
	    errorClass.prototype = Object.create(baseErrorType.prototype);
	    errorClass.prototype.constructor = errorClass;

	    errorClass.prototype.toString = function () {
	      if (this.message === undefined) {
	        return this.name;
	      } else {
	        return this.name + ': ' + this.message;
	      }
	    };

	    return errorClass;
	  }

	  var BindingError = undefined;

	  function throwBindingError(message) {
	    throw new BindingError(message);
	  }

	  var InternalError = undefined;

	  function throwInternalError(message) {
	    throw new InternalError(message);
	  }

	  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
	    myTypes.forEach(function (type) {
	      typeDependencies[type] = dependentTypes;
	    });

	    function onComplete(typeConverters) {
	      var myTypeConverters = getTypeConverters(typeConverters);

	      if (myTypeConverters.length !== myTypes.length) {
	        throwInternalError('Mismatched type converter count');
	      }

	      for (var i = 0; i < myTypes.length; ++i) {
	        registerType(myTypes[i], myTypeConverters[i]);
	      }
	    }

	    var typeConverters = new Array(dependentTypes.length);
	    var unregisteredTypes = [];
	    var registered = 0;
	    dependentTypes.forEach((dt, i) => {
	      if (registeredTypes.hasOwnProperty(dt)) {
	        typeConverters[i] = registeredTypes[dt];
	      } else {
	        unregisteredTypes.push(dt);

	        if (!awaitingDependencies.hasOwnProperty(dt)) {
	          awaitingDependencies[dt] = [];
	        }

	        awaitingDependencies[dt].push(() => {
	          typeConverters[i] = registeredTypes[dt];
	          ++registered;

	          if (registered === unregisteredTypes.length) {
	            onComplete(typeConverters);
	          }
	        });
	      }
	    });

	    if (0 === unregisteredTypes.length) {
	      onComplete(typeConverters);
	    }
	  }
	  /** @param {Object=} options */


	  function registerType(rawType, registeredInstance) {
	    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    if (!('argPackAdvance' in registeredInstance)) {
	      throw new TypeError('registerType registeredInstance requires argPackAdvance');
	    }

	    var name = registeredInstance.name;

	    if (!rawType) {
	      throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
	    }

	    if (registeredTypes.hasOwnProperty(rawType)) {
	      if (options.ignoreDuplicateRegistrations) {
	        return;
	      } else {
	        throwBindingError("Cannot register type '" + name + "' twice");
	      }
	    }

	    registeredTypes[rawType] = registeredInstance;
	    delete typeDependencies[rawType];

	    if (awaitingDependencies.hasOwnProperty(rawType)) {
	      var callbacks = awaitingDependencies[rawType];
	      delete awaitingDependencies[rawType];
	      callbacks.forEach(cb => cb());
	    }
	  }

	  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
	    var shift = getShiftFromSize(size);
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      'fromWireType': function (wt) {
	        // ambiguous emscripten ABI: sometimes return values are
	        // true or false, and sometimes integers (0 or 1)
	        return !!wt;
	      },
	      'toWireType': function (destructors, o) {
	        return o ? trueValue : falseValue;
	      },
	      'argPackAdvance': 8,
	      'readValueFromPointer': function (pointer) {
	        // TODO: if heap is fixed (like in asm.js) this could be executed outside
	        var heap;

	        if (size === 1) {
	          heap = HEAP8;
	        } else if (size === 2) {
	          heap = HEAP16;
	        } else if (size === 4) {
	          heap = HEAP32;
	        } else {
	          throw new TypeError("Unknown boolean type size: " + name);
	        }

	        return this['fromWireType'](heap[pointer >> shift]);
	      },
	      destructorFunction: null // This type does not need a destructor

	    });
	  }

	  function ClassHandle_isAliasOf(other) {
	    if (!(this instanceof ClassHandle)) {
	      return false;
	    }

	    if (!(other instanceof ClassHandle)) {
	      return false;
	    }

	    var leftClass = this.$$.ptrType.registeredClass;
	    var left = this.$$.ptr;
	    var rightClass = other.$$.ptrType.registeredClass;
	    var right = other.$$.ptr;

	    while (leftClass.baseClass) {
	      left = leftClass.upcast(left);
	      leftClass = leftClass.baseClass;
	    }

	    while (rightClass.baseClass) {
	      right = rightClass.upcast(right);
	      rightClass = rightClass.baseClass;
	    }

	    return leftClass === rightClass && left === right;
	  }

	  function shallowCopyInternalPointer(o) {
	    return {
	      count: o.count,
	      deleteScheduled: o.deleteScheduled,
	      preservePointerOnDelete: o.preservePointerOnDelete,
	      ptr: o.ptr,
	      ptrType: o.ptrType,
	      smartPtr: o.smartPtr,
	      smartPtrType: o.smartPtrType
	    };
	  }

	  function throwInstanceAlreadyDeleted(obj) {
	    function getInstanceTypeName(handle) {
	      return handle.$$.ptrType.registeredClass.name;
	    }

	    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
	  }

	  var finalizationRegistry = false;

	  function detachFinalizer(handle) {}

	  function runDestructor($$) {
	    if ($$.smartPtr) {
	      $$.smartPtrType.rawDestructor($$.smartPtr);
	    } else {
	      $$.ptrType.registeredClass.rawDestructor($$.ptr);
	    }
	  }

	  function releaseClassHandle($$) {
	    $$.count.value -= 1;
	    var toDelete = 0 === $$.count.value;

	    if (toDelete) {
	      runDestructor($$);
	    }
	  }

	  function downcastPointer(ptr, ptrClass, desiredClass) {
	    if (ptrClass === desiredClass) {
	      return ptr;
	    }

	    if (undefined === desiredClass.baseClass) {
	      return null; // no conversion
	    }

	    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);

	    if (rv === null) {
	      return null;
	    }

	    return desiredClass.downcast(rv);
	  }

	  var registeredPointers = {};

	  function getInheritedInstanceCount() {
	    return Object.keys(registeredInstances).length;
	  }

	  function getLiveInheritedInstances() {
	    var rv = [];

	    for (var k in registeredInstances) {
	      if (registeredInstances.hasOwnProperty(k)) {
	        rv.push(registeredInstances[k]);
	      }
	    }

	    return rv;
	  }

	  var deletionQueue = [];

	  function flushPendingDeletes() {
	    while (deletionQueue.length) {
	      var obj = deletionQueue.pop();
	      obj.$$.deleteScheduled = false;
	      obj['delete']();
	    }
	  }

	  var delayFunction = undefined;

	  function setDelayFunction(fn) {
	    delayFunction = fn;

	    if (deletionQueue.length && delayFunction) {
	      delayFunction(flushPendingDeletes);
	    }
	  }

	  function init_embind() {
	    Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
	    Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
	    Module['flushPendingDeletes'] = flushPendingDeletes;
	    Module['setDelayFunction'] = setDelayFunction;
	  }

	  var registeredInstances = {};

	  function getBasestPointer(class_, ptr) {
	    if (ptr === undefined) {
	      throwBindingError('ptr should not be undefined');
	    }

	    while (class_.baseClass) {
	      ptr = class_.upcast(ptr);
	      class_ = class_.baseClass;
	    }

	    return ptr;
	  }

	  function getInheritedInstance(class_, ptr) {
	    ptr = getBasestPointer(class_, ptr);
	    return registeredInstances[ptr];
	  }

	  function makeClassHandle(prototype, record) {
	    if (!record.ptrType || !record.ptr) {
	      throwInternalError('makeClassHandle requires ptr and ptrType');
	    }

	    var hasSmartPtrType = !!record.smartPtrType;
	    var hasSmartPtr = !!record.smartPtr;

	    if (hasSmartPtrType !== hasSmartPtr) {
	      throwInternalError('Both smartPtrType and smartPtr must be specified');
	    }

	    record.count = {
	      value: 1
	    };
	    return attachFinalizer(Object.create(prototype, {
	      $$: {
	        value: record
	      }
	    }));
	  }

	  function RegisteredPointer_fromWireType(ptr) {
	    // ptr is a raw pointer (or a raw smartpointer)
	    // rawPointer is a maybe-null raw pointer
	    var rawPointer = this.getPointee(ptr);

	    if (!rawPointer) {
	      this.destructor(ptr);
	      return null;
	    }

	    var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);

	    if (undefined !== registeredInstance) {
	      // JS object has been neutered, time to repopulate it
	      if (0 === registeredInstance.$$.count.value) {
	        registeredInstance.$$.ptr = rawPointer;
	        registeredInstance.$$.smartPtr = ptr;
	        return registeredInstance['clone']();
	      } else {
	        // else, just increment reference count on existing object
	        // it already has a reference to the smart pointer
	        var rv = registeredInstance['clone']();
	        this.destructor(ptr);
	        return rv;
	      }
	    }

	    function makeDefaultHandle() {
	      if (this.isSmartPointer) {
	        return makeClassHandle(this.registeredClass.instancePrototype, {
	          ptrType: this.pointeeType,
	          ptr: rawPointer,
	          smartPtrType: this,
	          smartPtr: ptr
	        });
	      } else {
	        return makeClassHandle(this.registeredClass.instancePrototype, {
	          ptrType: this,
	          ptr: ptr
	        });
	      }
	    }

	    var actualType = this.registeredClass.getActualType(rawPointer);
	    var registeredPointerRecord = registeredPointers[actualType];

	    if (!registeredPointerRecord) {
	      return makeDefaultHandle.call(this);
	    }

	    var toType;

	    if (this.isConst) {
	      toType = registeredPointerRecord.constPointerType;
	    } else {
	      toType = registeredPointerRecord.pointerType;
	    }

	    var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);

	    if (dp === null) {
	      return makeDefaultHandle.call(this);
	    }

	    if (this.isSmartPointer) {
	      return makeClassHandle(toType.registeredClass.instancePrototype, {
	        ptrType: toType,
	        ptr: dp,
	        smartPtrType: this,
	        smartPtr: ptr
	      });
	    } else {
	      return makeClassHandle(toType.registeredClass.instancePrototype, {
	        ptrType: toType,
	        ptr: dp
	      });
	    }
	  }

	  function attachFinalizer(handle) {
	    if ('undefined' === typeof FinalizationRegistry) {
	      attachFinalizer = handle => handle;

	      return handle;
	    } // If the running environment has a FinalizationRegistry (see
	    // https://github.com/tc39/proposal-weakrefs), then attach finalizers
	    // for class handles.  We check for the presence of FinalizationRegistry
	    // at run-time, not build-time.


	    finalizationRegistry = new FinalizationRegistry(info => {
	      releaseClassHandle(info.$$);
	    });

	    attachFinalizer = handle => {
	      var $$ = handle.$$;
	      var hasSmartPtr = !!$$.smartPtr;

	      if (hasSmartPtr) {
	        // We should not call the destructor on raw pointers in case other code expects the pointee to live
	        var info = {
	          $$: $$
	        };
	        finalizationRegistry.register(handle, info, handle);
	      }

	      return handle;
	    };

	    detachFinalizer = handle => finalizationRegistry.unregister(handle);

	    return attachFinalizer(handle);
	  }

	  function ClassHandle_clone() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.preservePointerOnDelete) {
	      this.$$.count.value += 1;
	      return this;
	    } else {
	      var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
	        $$: {
	          value: shallowCopyInternalPointer(this.$$)
	        }
	      }));
	      clone.$$.count.value += 1;
	      clone.$$.deleteScheduled = false;
	      return clone;
	    }
	  }

	  function ClassHandle_delete() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
	      throwBindingError('Object already scheduled for deletion');
	    }

	    detachFinalizer(this);
	    releaseClassHandle(this.$$);

	    if (!this.$$.preservePointerOnDelete) {
	      this.$$.smartPtr = undefined;
	      this.$$.ptr = undefined;
	    }
	  }

	  function ClassHandle_isDeleted() {
	    return !this.$$.ptr;
	  }

	  function ClassHandle_deleteLater() {
	    if (!this.$$.ptr) {
	      throwInstanceAlreadyDeleted(this);
	    }

	    if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
	      throwBindingError('Object already scheduled for deletion');
	    }

	    deletionQueue.push(this);

	    if (deletionQueue.length === 1 && delayFunction) {
	      delayFunction(flushPendingDeletes);
	    }

	    this.$$.deleteScheduled = true;
	    return this;
	  }

	  function init_ClassHandle() {
	    ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
	    ClassHandle.prototype['clone'] = ClassHandle_clone;
	    ClassHandle.prototype['delete'] = ClassHandle_delete;
	    ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
	    ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
	  }

	  function ClassHandle() {}

	  function ensureOverloadTable(proto, methodName, humanName) {
	    if (undefined === proto[methodName].overloadTable) {
	      var prevFunc = proto[methodName]; // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.

	      proto[methodName] = function () {
	        // TODO This check can be removed in -O3 level "unsafe" optimizations.
	        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
	          throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
	        }

	        return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
	      }; // Move the previous function into the overload table.


	      proto[methodName].overloadTable = [];
	      proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
	    }
	  }
	  /** @param {number=} numArguments */


	  function exposePublicSymbol(name, value, numArguments) {
	    if (Module.hasOwnProperty(name)) {
	      if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
	        throwBindingError("Cannot register public name '" + name + "' twice");
	      } // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
	      // that routes between the two.


	      ensureOverloadTable(Module, name, name);

	      if (Module.hasOwnProperty(numArguments)) {
	        throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
	      } // Add the new function into the overload table.


	      Module[name].overloadTable[numArguments] = value;
	    } else {
	      Module[name] = value;

	      if (undefined !== numArguments) {
	        Module[name].numArguments = numArguments;
	      }
	    }
	  }
	  /** @constructor */


	  function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
	    this.name = name;
	    this.constructor = constructor;
	    this.instancePrototype = instancePrototype;
	    this.rawDestructor = rawDestructor;
	    this.baseClass = baseClass;
	    this.getActualType = getActualType;
	    this.upcast = upcast;
	    this.downcast = downcast;
	    this.pureVirtualFunctions = [];
	  }

	  function upcastPointer(ptr, ptrClass, desiredClass) {
	    while (ptrClass !== desiredClass) {
	      if (!ptrClass.upcast) {
	        throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
	      }

	      ptr = ptrClass.upcast(ptr);
	      ptrClass = ptrClass.baseClass;
	    }

	    return ptr;
	  }

	  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError('null is not a valid ' + this.name);
	      }

	      return 0;
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
	    return ptr;
	  }

	  function genericPointerToWireType(destructors, handle) {
	    var ptr;

	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError('null is not a valid ' + this.name);
	      }

	      if (this.isSmartPointer) {
	        ptr = this.rawConstructor();

	        if (destructors !== null) {
	          destructors.push(this.rawDestructor, ptr);
	        }

	        return ptr;
	      } else {
	        return 0;
	      }
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
	    }

	    if (!this.isConst && handle.$$.ptrType.isConst) {
	      throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

	    if (this.isSmartPointer) {
	      // TODO: this is not strictly true
	      // We could support BY_EMVAL conversions from raw pointers to smart pointers
	      // because the smart pointer can hold a reference to the handle
	      if (undefined === handle.$$.smartPtr) {
	        throwBindingError('Passing raw pointer to smart pointer is illegal');
	      }

	      switch (this.sharingPolicy) {
	        case 0:
	          // NONE
	          // no upcasting
	          if (handle.$$.smartPtrType === this) {
	            ptr = handle.$$.smartPtr;
	          } else {
	            throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
	          }

	          break;

	        case 1:
	          // INTRUSIVE
	          ptr = handle.$$.smartPtr;
	          break;

	        case 2:
	          // BY_EMVAL
	          if (handle.$$.smartPtrType === this) {
	            ptr = handle.$$.smartPtr;
	          } else {
	            var clonedHandle = handle['clone']();
	            ptr = this.rawShare(ptr, Emval.toHandle(function () {
	              clonedHandle['delete']();
	            }));

	            if (destructors !== null) {
	              destructors.push(this.rawDestructor, ptr);
	            }
	          }

	          break;

	        default:
	          throwBindingError('Unsupporting sharing policy');
	      }
	    }

	    return ptr;
	  }

	  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
	    if (handle === null) {
	      if (this.isReference) {
	        throwBindingError('null is not a valid ' + this.name);
	      }

	      return 0;
	    }

	    if (!handle.$$) {
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
	    }

	    if (!handle.$$.ptr) {
	      throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
	    }

	    if (handle.$$.ptrType.isConst) {
	      throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
	    }

	    var handleClass = handle.$$.ptrType.registeredClass;
	    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
	    return ptr;
	  }

	  function simpleReadValueFromPointer(pointer) {
	    return this['fromWireType'](HEAPU32[pointer >> 2]);
	  }

	  function RegisteredPointer_getPointee(ptr) {
	    if (this.rawGetPointee) {
	      ptr = this.rawGetPointee(ptr);
	    }

	    return ptr;
	  }

	  function RegisteredPointer_destructor(ptr) {
	    if (this.rawDestructor) {
	      this.rawDestructor(ptr);
	    }
	  }

	  function RegisteredPointer_deleteObject(handle) {
	    if (handle !== null) {
	      handle['delete']();
	    }
	  }

	  function init_RegisteredPointer() {
	    RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
	    RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
	    RegisteredPointer.prototype['argPackAdvance'] = 8;
	    RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
	    RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
	    RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
	  }
	  /** @constructor
	      @param {*=} pointeeType,
	      @param {*=} sharingPolicy,
	      @param {*=} rawGetPointee,
	      @param {*=} rawConstructor,
	      @param {*=} rawShare,
	      @param {*=} rawDestructor,
	       */


	  function RegisteredPointer(name, registeredClass, isReference, isConst, // smart pointer properties
	  isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
	    this.name = name;
	    this.registeredClass = registeredClass;
	    this.isReference = isReference;
	    this.isConst = isConst; // smart pointer properties

	    this.isSmartPointer = isSmartPointer;
	    this.pointeeType = pointeeType;
	    this.sharingPolicy = sharingPolicy;
	    this.rawGetPointee = rawGetPointee;
	    this.rawConstructor = rawConstructor;
	    this.rawShare = rawShare;
	    this.rawDestructor = rawDestructor;

	    if (!isSmartPointer && registeredClass.baseClass === undefined) {
	      if (isConst) {
	        this['toWireType'] = constNoSmartPtrRawPointerToWireType;
	        this.destructorFunction = null;
	      } else {
	        this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
	        this.destructorFunction = null;
	      }
	    } else {
	      this['toWireType'] = genericPointerToWireType; // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
	      // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
	      // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
	      //       craftInvokerFunction altogether.
	    }
	  }
	  /** @param {number=} numArguments */


	  function replacePublicSymbol(name, value, numArguments) {
	    if (!Module.hasOwnProperty(name)) {
	      throwInternalError('Replacing nonexistant public symbol');
	    } // If there's an overload table for this symbol, replace the symbol in the overload table instead.


	    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
	      Module[name].overloadTable[numArguments] = value;
	    } else {
	      Module[name] = value;
	      Module[name].argCount = numArguments;
	    }
	  }

	  function dynCallLegacy(sig, ptr, args) {
	    var f = Module["dynCall_" + sig];
	    return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
	  }
	  /** @param {Object=} args */


	  function dynCall(sig, ptr, args) {
	    // Without WASM_BIGINT support we cannot directly call function with i64 as
	    // part of thier signature, so we rely the dynCall functions generated by
	    // wasm-emscripten-finalize
	    if (sig.includes('j')) {
	      return dynCallLegacy(sig, ptr, args);
	    }

	    return getWasmTableEntry(ptr).apply(null, args);
	  }

	  function getDynCaller(sig, ptr) {
	    var argCache = [];
	    return function () {
	      argCache.length = 0;
	      Object.assign(argCache, arguments);
	      return dynCall(sig, ptr, argCache);
	    };
	  }

	  function embind__requireFunction(signature, rawFunction) {
	    signature = readLatin1String(signature);

	    function makeDynCaller() {
	      if (signature.includes('j')) {
	        return getDynCaller(signature, rawFunction);
	      }

	      return getWasmTableEntry(rawFunction);
	    }

	    var fp = makeDynCaller();

	    if (typeof fp != "function") {
	      throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
	    }

	    return fp;
	  }

	  var UnboundTypeError = undefined;

	  function getTypeName(type) {
	    var ptr = ___getTypeName(type);

	    var rv = readLatin1String(ptr);

	    _free(ptr);

	    return rv;
	  }

	  function throwUnboundTypeError(message, types) {
	    var unboundTypes = [];
	    var seen = {};

	    function visit(type) {
	      if (seen[type]) {
	        return;
	      }

	      if (registeredTypes[type]) {
	        return;
	      }

	      if (typeDependencies[type]) {
	        typeDependencies[type].forEach(visit);
	        return;
	      }

	      unboundTypes.push(type);
	      seen[type] = true;
	    }

	    types.forEach(visit);
	    throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
	  }

	  function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
	    name = readLatin1String(name);
	    getActualType = embind__requireFunction(getActualTypeSignature, getActualType);

	    if (upcast) {
	      upcast = embind__requireFunction(upcastSignature, upcast);
	    }

	    if (downcast) {
	      downcast = embind__requireFunction(downcastSignature, downcast);
	    }

	    rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
	    var legalFunctionName = makeLegalFunctionName(name);
	    exposePublicSymbol(legalFunctionName, function () {
	      // this code cannot run if baseClassRawType is zero
	      throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
	    });
	    whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function (base) {
	      base = base[0];
	      var baseClass;
	      var basePrototype;

	      if (baseClassRawType) {
	        baseClass = base.registeredClass;
	        basePrototype = baseClass.instancePrototype;
	      } else {
	        basePrototype = ClassHandle.prototype;
	      }

	      var constructor = createNamedFunction(legalFunctionName, function () {
	        if (Object.getPrototypeOf(this) !== instancePrototype) {
	          throw new BindingError("Use 'new' to construct " + name);
	        }

	        if (undefined === registeredClass.constructor_body) {
	          throw new BindingError(name + " has no accessible constructor");
	        }

	        var body = registeredClass.constructor_body[arguments.length];

	        if (undefined === body) {
	          throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
	        }

	        return body.apply(this, arguments);
	      });
	      var instancePrototype = Object.create(basePrototype, {
	        constructor: {
	          value: constructor
	        }
	      });
	      constructor.prototype = instancePrototype;
	      var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
	      var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
	      var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
	      var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
	      registeredPointers[rawType] = {
	        pointerType: pointerConverter,
	        constPointerType: constPointerConverter
	      };
	      replacePublicSymbol(legalFunctionName, constructor);
	      return [referenceConverter, pointerConverter, constPointerConverter];
	    });
	  }

	  function heap32VectorToArray(count, firstElement) {
	    var array = [];

	    for (var i = 0; i < count; i++) {
	      array.push(HEAP32[(firstElement >> 2) + i]);
	    }

	    return array;
	  }

	  function runDestructors(destructors) {
	    while (destructors.length) {
	      var ptr = destructors.pop();
	      var del = destructors.pop();
	      del(ptr);
	    }
	  }

	  function new_(constructor, argumentList) {
	    if (!(constructor instanceof Function)) {
	      throw new TypeError('new_ called with constructor type ' + typeof constructor + " which is not a function");
	    }
	    /*
	     * Previously, the following line was just:
	     *   function dummy() {};
	     * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
	     * though at creation, the 'dummy' has the correct constructor name.  Thus,
	     * objects created with IMVU.new would show up in the debugger as 'dummy',
	     * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
	     * issue.  Doublely-unfortunately, there's no way to write a test for this
	     * behavior.  -NRD 2013.02.22
	     */


	    var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
	    dummy.prototype = constructor.prototype;
	    var obj = new dummy();
	    var r = constructor.apply(obj, argumentList);
	    return r instanceof Object ? r : obj;
	  }

	  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
	    // humanName: a human-readable string name for the function to be generated.
	    // argTypes: An array that contains the embind type objects for all types in the function signature.
	    //    argTypes[0] is the type object for the function return value.
	    //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
	    //    argTypes[2...] are the actual function parameters.
	    // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
	    // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
	    // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
	    var argCount = argTypes.length;

	    if (argCount < 2) {
	      throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
	    }

	    var isClassMethodFunc = argTypes[1] !== null && classType !== null; // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
	    // TODO: This omits argument count check - enable only at -O3 or similar.
	    //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
	    //       return FUNCTION_TABLE[fn];
	    //    }
	    // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
	    // TODO: Remove this completely once all function invokers are being dynamically generated.

	    var needsDestructorStack = false;

	    for (var i = 1; i < argTypes.length; ++i) {
	      // Skip return value at index 0 - it's not deleted here.
	      if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
	        // The type does not define a destructor function - must use dynamic stack
	        needsDestructorStack = true;
	        break;
	      }
	    }

	    var returns = argTypes[0].name !== "void";
	    var argsList = "";
	    var argsListWired = "";

	    for (var i = 0; i < argCount - 2; ++i) {
	      argsList += (i !== 0 ? ", " : "") + "arg" + i;
	      argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
	    }

	    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";

	    if (needsDestructorStack) {
	      invokerFnBody += "var destructors = [];\n";
	    }

	    var dtorStack = needsDestructorStack ? "destructors" : "null";
	    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
	    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];

	    if (isClassMethodFunc) {
	      invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
	    }

	    for (var i = 0; i < argCount - 2; ++i) {
	      invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
	      args1.push("argType" + i);
	      args2.push(argTypes[i + 2]);
	    }

	    if (isClassMethodFunc) {
	      argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
	    }

	    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";

	    if (needsDestructorStack) {
	      invokerFnBody += "runDestructors(destructors);\n";
	    } else {
	      for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
	        // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
	        var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";

	        if (argTypes[i].destructorFunction !== null) {
	          invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
	          args1.push(paramName + "_dtor");
	          args2.push(argTypes[i].destructorFunction);
	        }
	      }
	    }

	    if (returns) {
	      invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
	    }

	    invokerFnBody += "}\n";
	    args1.push(invokerFnBody);
	    var invokerFunction = new_(Function, args1).apply(null, args2);
	    return invokerFunction;
	  }

	  function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
	    assert(argCount > 0);
	    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
	    invoker = embind__requireFunction(invokerSignature, invoker);
	    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
	      classType = classType[0];
	      var humanName = 'constructor ' + classType.name;

	      if (undefined === classType.registeredClass.constructor_body) {
	        classType.registeredClass.constructor_body = [];
	      }

	      if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
	        throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
	      }

	      classType.registeredClass.constructor_body[argCount - 1] = () => {
	        throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
	      };

	      whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
	        // Insert empty slot for context type (argTypes[1]).
	        argTypes.splice(1, 0, null);
	        classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
	        return [];
	      });
	      return [];
	    });
	  }

	  function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, // [ReturnType, ThisType, Args...]
	  invokerSignature, rawInvoker, context, isPureVirtual) {
	    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
	    methodName = readLatin1String(methodName);
	    rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
	    whenDependentTypesAreResolved([], [rawClassType], function (classType) {
	      classType = classType[0];
	      var humanName = classType.name + '.' + methodName;

	      if (methodName.startsWith("@@")) {
	        methodName = Symbol[methodName.substring(2)];
	      }

	      if (isPureVirtual) {
	        classType.registeredClass.pureVirtualFunctions.push(methodName);
	      }

	      function unboundTypesHandler() {
	        throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
	      }

	      var proto = classType.registeredClass.instancePrototype;
	      var method = proto[methodName];

	      if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
	        // This is the first overload to be registered, OR we are replacing a
	        // function in the base class with a function in the derived class.
	        unboundTypesHandler.argCount = argCount - 2;
	        unboundTypesHandler.className = classType.name;
	        proto[methodName] = unboundTypesHandler;
	      } else {
	        // There was an existing function with the same name registered. Set up
	        // a function overload routing table.
	        ensureOverloadTable(proto, methodName, humanName);
	        proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
	      }

	      whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
	        var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context); // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
	        // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.

	        if (undefined === proto[methodName].overloadTable) {
	          // Set argCount in case an overload is registered later
	          memberFunction.argCount = argCount - 2;
	          proto[methodName] = memberFunction;
	        } else {
	          proto[methodName].overloadTable[argCount - 2] = memberFunction;
	        }

	        return [];
	      });
	      return [];
	    });
	  }

	  var emval_free_list = [];
	  var emval_handle_array = [{}, {
	    value: undefined
	  }, {
	    value: null
	  }, {
	    value: true
	  }, {
	    value: false
	  }];

	  function __emval_decref(handle) {
	    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
	      emval_handle_array[handle] = undefined;
	      emval_free_list.push(handle);
	    }
	  }

	  function count_emval_handles() {
	    var count = 0;

	    for (var i = 5; i < emval_handle_array.length; ++i) {
	      if (emval_handle_array[i] !== undefined) {
	        ++count;
	      }
	    }

	    return count;
	  }

	  function get_first_emval() {
	    for (var i = 5; i < emval_handle_array.length; ++i) {
	      if (emval_handle_array[i] !== undefined) {
	        return emval_handle_array[i];
	      }
	    }

	    return null;
	  }

	  function init_emval() {
	    Module['count_emval_handles'] = count_emval_handles;
	    Module['get_first_emval'] = get_first_emval;
	  }

	  var Emval = {
	    toValue: handle => {
	      if (!handle) {
	        throwBindingError('Cannot use deleted val. handle = ' + handle);
	      }

	      return emval_handle_array[handle].value;
	    },
	    toHandle: value => {
	      switch (value) {
	        case undefined:
	          return 1;

	        case null:
	          return 2;

	        case true:
	          return 3;

	        case false:
	          return 4;

	        default:
	          {
	            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
	            emval_handle_array[handle] = {
	              refcount: 1,
	              value: value
	            };
	            return handle;
	          }
	      }
	    }
	  };

	  function __embind_register_emval(rawType, name) {
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      'fromWireType': function (handle) {
	        var rv = Emval.toValue(handle);

	        __emval_decref(handle);

	        return rv;
	      },
	      'toWireType': function (destructors, value) {
	        return Emval.toHandle(value);
	      },
	      'argPackAdvance': 8,
	      'readValueFromPointer': simpleReadValueFromPointer,
	      destructorFunction: null // This type does not need a destructor
	      // TODO: do we need a deleteObject here?  write a test where
	      // emval is passed into JS via an interface

	    });
	  }

	  function _embind_repr(v) {
	    if (v === null) {
	      return 'null';
	    }

	    var t = typeof v;

	    if (t === 'object' || t === 'array' || t === 'function') {
	      return v.toString();
	    } else {
	      return '' + v;
	    }
	  }

	  function floatReadValueFromPointer(name, shift) {
	    switch (shift) {
	      case 2:
	        return function (pointer) {
	          return this['fromWireType'](HEAPF32[pointer >> 2]);
	        };

	      case 3:
	        return function (pointer) {
	          return this['fromWireType'](HEAPF64[pointer >> 3]);
	        };

	      default:
	        throw new TypeError("Unknown float type: " + name);
	    }
	  }

	  function __embind_register_float(rawType, name, size) {
	    var shift = getShiftFromSize(size);
	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      'fromWireType': function (value) {
	        return value;
	      },
	      'toWireType': function (destructors, value) {
	        // The VM will perform JS to Wasm value conversion, according to the spec:
	        // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
	        return value;
	      },
	      'argPackAdvance': 8,
	      'readValueFromPointer': floatReadValueFromPointer(name, shift),
	      destructorFunction: null // This type does not need a destructor

	    });
	  }

	  function integerReadValueFromPointer(name, shift, signed) {
	    // integers are quite common, so generate very specialized functions
	    switch (shift) {
	      case 0:
	        return signed ? function readS8FromPointer(pointer) {
	          return HEAP8[pointer];
	        } : function readU8FromPointer(pointer) {
	          return HEAPU8[pointer];
	        };

	      case 1:
	        return signed ? function readS16FromPointer(pointer) {
	          return HEAP16[pointer >> 1];
	        } : function readU16FromPointer(pointer) {
	          return HEAPU16[pointer >> 1];
	        };

	      case 2:
	        return signed ? function readS32FromPointer(pointer) {
	          return HEAP32[pointer >> 2];
	        } : function readU32FromPointer(pointer) {
	          return HEAPU32[pointer >> 2];
	        };

	      default:
	        throw new TypeError("Unknown integer type: " + name);
	    }
	  }

	  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
	    name = readLatin1String(name); // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come

	    var shift = getShiftFromSize(size);

	    var fromWireType = value => value;

	    if (minRange === 0) {
	      var bitshift = 32 - 8 * size;

	      fromWireType = value => value << bitshift >>> bitshift;
	    }

	    var isUnsignedType = name.includes('unsigned');

	    var checkAssertions = (value, toTypeName) => {};

	    var toWireType;

	    if (isUnsignedType) {
	      toWireType = function (destructors, value) {
	        checkAssertions(value, this.name);
	        return value >>> 0;
	      };
	    } else {
	      toWireType = function (destructors, value) {
	        checkAssertions(value, this.name); // The VM will perform JS to Wasm value conversion, according to the spec:
	        // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue

	        return value;
	      };
	    }

	    registerType(primitiveType, {
	      name: name,
	      'fromWireType': fromWireType,
	      'toWireType': toWireType,
	      'argPackAdvance': 8,
	      'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
	      destructorFunction: null // This type does not need a destructor

	    });
	  }

	  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
	    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
	    var TA = typeMapping[dataTypeIndex];

	    function decodeMemoryView(handle) {
	      handle = handle >> 2;
	      var heap = HEAPU32;
	      var size = heap[handle]; // in elements

	      var data = heap[handle + 1]; // byte offset into emscripten heap

	      return new TA(buffer, data, size);
	    }

	    name = readLatin1String(name);
	    registerType(rawType, {
	      name: name,
	      'fromWireType': decodeMemoryView,
	      'argPackAdvance': 8,
	      'readValueFromPointer': decodeMemoryView
	    }, {
	      ignoreDuplicateRegistrations: true
	    });
	  }

	  function __embind_register_std_string(rawType, name) {
	    name = readLatin1String(name);
	    var stdStringIsUTF8 //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
	    = name === "std::string";
	    registerType(rawType, {
	      name: name,
	      'fromWireType': function (value) {
	        var length = HEAPU32[value >> 2];
	        var str;

	        if (stdStringIsUTF8) {
	          var decodeStartPtr = value + 4; // Looping here to support possible embedded '0' bytes

	          for (var i = 0; i <= length; ++i) {
	            var currentBytePtr = value + 4 + i;

	            if (i == length || HEAPU8[currentBytePtr] == 0) {
	              var maxRead = currentBytePtr - decodeStartPtr;
	              var stringSegment = UTF8ToString(decodeStartPtr, maxRead);

	              if (str === undefined) {
	                str = stringSegment;
	              } else {
	                str += String.fromCharCode(0);
	                str += stringSegment;
	              }

	              decodeStartPtr = currentBytePtr + 1;
	            }
	          }
	        } else {
	          var a = new Array(length);

	          for (var i = 0; i < length; ++i) {
	            a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
	          }

	          str = a.join('');
	        }

	        _free(value);

	        return str;
	      },
	      'toWireType': function (destructors, value) {
	        if (value instanceof ArrayBuffer) {
	          value = new Uint8Array(value);
	        }

	        var getLength;
	        var valueIsOfTypeString = typeof value == 'string';

	        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
	          throwBindingError('Cannot pass non-string to std::string');
	        }

	        if (stdStringIsUTF8 && valueIsOfTypeString) {
	          getLength = () => lengthBytesUTF8(value);
	        } else {
	          getLength = () => value.length;
	        } // assumes 4-byte alignment


	        var length = getLength();

	        var ptr = _malloc(4 + length + 1);

	        HEAPU32[ptr >> 2] = length;

	        if (stdStringIsUTF8 && valueIsOfTypeString) {
	          stringToUTF8(value, ptr + 4, length + 1);
	        } else {
	          if (valueIsOfTypeString) {
	            for (var i = 0; i < length; ++i) {
	              var charCode = value.charCodeAt(i);

	              if (charCode > 255) {
	                _free(ptr);

	                throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
	              }

	              HEAPU8[ptr + 4 + i] = charCode;
	            }
	          } else {
	            for (var i = 0; i < length; ++i) {
	              HEAPU8[ptr + 4 + i] = value[i];
	            }
	          }
	        }

	        if (destructors !== null) {
	          destructors.push(_free, ptr);
	        }

	        return ptr;
	      },
	      'argPackAdvance': 8,
	      'readValueFromPointer': simpleReadValueFromPointer,
	      destructorFunction: function (ptr) {
	        _free(ptr);
	      }
	    });
	  }

	  function __embind_register_std_wstring(rawType, charSize, name) {
	    name = readLatin1String(name);
	    var decodeString, encodeString, getHeap, lengthBytesUTF, shift;

	    if (charSize === 2) {
	      decodeString = UTF16ToString;
	      encodeString = stringToUTF16;
	      lengthBytesUTF = lengthBytesUTF16;

	      getHeap = () => HEAPU16;

	      shift = 1;
	    } else if (charSize === 4) {
	      decodeString = UTF32ToString;
	      encodeString = stringToUTF32;
	      lengthBytesUTF = lengthBytesUTF32;

	      getHeap = () => HEAPU32;

	      shift = 2;
	    }

	    registerType(rawType, {
	      name: name,
	      'fromWireType': function (value) {
	        // Code mostly taken from _embind_register_std_string fromWireType
	        var length = HEAPU32[value >> 2];
	        var HEAP = getHeap();
	        var str;
	        var decodeStartPtr = value + 4; // Looping here to support possible embedded '0' bytes

	        for (var i = 0; i <= length; ++i) {
	          var currentBytePtr = value + 4 + i * charSize;

	          if (i == length || HEAP[currentBytePtr >> shift] == 0) {
	            var maxReadBytes = currentBytePtr - decodeStartPtr;
	            var stringSegment = decodeString(decodeStartPtr, maxReadBytes);

	            if (str === undefined) {
	              str = stringSegment;
	            } else {
	              str += String.fromCharCode(0);
	              str += stringSegment;
	            }

	            decodeStartPtr = currentBytePtr + charSize;
	          }
	        }

	        _free(value);

	        return str;
	      },
	      'toWireType': function (destructors, value) {
	        if (!(typeof value == 'string')) {
	          throwBindingError('Cannot pass non-string to C++ string type ' + name);
	        } // assumes 4-byte alignment


	        var length = lengthBytesUTF(value);

	        var ptr = _malloc(4 + length + charSize);

	        HEAPU32[ptr >> 2] = length >> shift;
	        encodeString(value, ptr + 4, length + charSize);

	        if (destructors !== null) {
	          destructors.push(_free, ptr);
	        }

	        return ptr;
	      },
	      'argPackAdvance': 8,
	      'readValueFromPointer': simpleReadValueFromPointer,
	      destructorFunction: function (ptr) {
	        _free(ptr);
	      }
	    });
	  }

	  function __embind_register_void(rawType, name) {
	    name = readLatin1String(name);
	    registerType(rawType, {
	      isVoid: true,
	      // void return values can be optimized out sometimes
	      name: name,
	      'argPackAdvance': 0,
	      'fromWireType': function () {
	        return undefined;
	      },
	      'toWireType': function (destructors, o) {
	        // TODO: assert if anything else is given?
	        return undefined;
	      }
	    });
	  }

	  function __emscripten_date_now() {
	    return Date.now();
	  }

	  var emval_symbols = {};

	  function getStringOrSymbol(address) {
	    var symbol = emval_symbols[address];

	    if (symbol === undefined) {
	      return readLatin1String(address);
	    }

	    return symbol;
	  }

	  var emval_methodCallers = [];

	  function __emval_call_void_method(caller, handle, methodName, args) {
	    caller = emval_methodCallers[caller];
	    handle = Emval.toValue(handle);
	    methodName = getStringOrSymbol(methodName);
	    caller(handle, methodName, null, args);
	  }

	  function emval_addMethodCaller(caller) {
	    var id = emval_methodCallers.length;
	    emval_methodCallers.push(caller);
	    return id;
	  }

	  function requireRegisteredType(rawType, humanName) {
	    var impl = registeredTypes[rawType];

	    if (undefined === impl) {
	      throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
	    }

	    return impl;
	  }

	  function emval_lookupTypes(argCount, argTypes) {
	    var a = new Array(argCount);

	    for (var i = 0; i < argCount; ++i) {
	      a[i] = requireRegisteredType(HEAPU32[argTypes + i * POINTER_SIZE >> 2], "parameter " + i);
	    }

	    return a;
	  }

	  var emval_registeredMethods = [];

	  function __emval_get_method_caller(argCount, argTypes) {
	    var types = emval_lookupTypes(argCount, argTypes);
	    var retType = types[0];
	    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) {
	      return t.name;
	    }).join("_") + "$";
	    var returnId = emval_registeredMethods[signatureName];

	    if (returnId !== undefined) {
	      return returnId;
	    }

	    var params = ["retType"];
	    var args = [retType];
	    var argsList = ""; // 'arg0, arg1, arg2, ... , argN'

	    for (var i = 0; i < argCount - 1; ++i) {
	      argsList += (i !== 0 ? ", " : "") + "arg" + i;
	      params.push("argType" + i);
	      args.push(types[1 + i]);
	    }

	    var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
	    var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
	    var offset = 0;

	    for (var i = 0; i < argCount - 1; ++i) {
	      functionBody += "    var arg" + i + " = argType" + i + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
	      offset += types[i + 1]['argPackAdvance'];
	    }

	    functionBody += "    var rv = handle[name](" + argsList + ");\n";

	    for (var i = 0; i < argCount - 1; ++i) {
	      if (types[i + 1]['deleteObject']) {
	        functionBody += "    argType" + i + ".deleteObject(arg" + i + ");\n";
	      }
	    }

	    if (!retType.isVoid) {
	      functionBody += "    return retType.toWireType(destructors, rv);\n";
	    }

	    functionBody += "};\n";
	    params.push(functionBody);
	    var invokerFunction = new_(Function, params).apply(null, args);
	    returnId = emval_addMethodCaller(invokerFunction);
	    emval_registeredMethods[signatureName] = returnId;
	    return returnId;
	  }

	  function __gmtime_js(time, tmPtr) {
	    var date = new Date(HEAP32[time >> 2] * 1000);
	    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
	    HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
	    HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
	    HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
	    HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
	    HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
	    HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
	    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
	    var yday = (date.getTime() - start) / (1000 * 60 * 60 * 24) | 0;
	    HEAP32[tmPtr + 28 >> 2] = yday;
	  }

	  function __localtime_js(time, tmPtr) {
	    var date = new Date(HEAP32[time >> 2] * 1000);
	    HEAP32[tmPtr >> 2] = date.getSeconds();
	    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
	    HEAP32[tmPtr + 8 >> 2] = date.getHours();
	    HEAP32[tmPtr + 12 >> 2] = date.getDate();
	    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
	    HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
	    HEAP32[tmPtr + 24 >> 2] = date.getDay();
	    var start = new Date(date.getFullYear(), 0, 1);
	    var yday = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) | 0;
	    HEAP32[tmPtr + 28 >> 2] = yday;
	    HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60); // Attention: DST is in December in South, and some regions don't have DST at all.

	    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
	    var winterOffset = start.getTimezoneOffset();
	    var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
	    HEAP32[tmPtr + 32 >> 2] = dst;
	  }

	  function __mktime_js(tmPtr) {
	    var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0); // There's an ambiguous hour when the time goes back; the tm_isdst field is
	    // used to disambiguate it.  Date() basically guesses, so we fix it up if it
	    // guessed wrong, or fill in tm_isdst with the guess if it's -1.

	    var dst = HEAP32[tmPtr + 32 >> 2];
	    var guessedOffset = date.getTimezoneOffset();
	    var start = new Date(date.getFullYear(), 0, 1);
	    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
	    var winterOffset = start.getTimezoneOffset();
	    var dstOffset = Math.min(winterOffset, summerOffset); // DST is in December in South

	    if (dst < 0) {
	      // Attention: some regions don't have DST at all.
	      HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
	    } else if (dst > 0 != (dstOffset == guessedOffset)) {
	      var nonDstOffset = Math.max(winterOffset, summerOffset);
	      var trueOffset = dst > 0 ? dstOffset : nonDstOffset; // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.

	      date.setTime(date.getTime() + (trueOffset - guessedOffset) * 60000);
	    }

	    HEAP32[tmPtr + 24 >> 2] = date.getDay();
	    var yday = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) | 0;
	    HEAP32[tmPtr + 28 >> 2] = yday; // To match expected behavior, update fields from date

	    HEAP32[tmPtr >> 2] = date.getSeconds();
	    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
	    HEAP32[tmPtr + 8 >> 2] = date.getHours();
	    HEAP32[tmPtr + 12 >> 2] = date.getDate();
	    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
	    return date.getTime() / 1000 | 0;
	  }

	  function _tzset_impl(timezone, daylight, tzname) {
	    var currentYear = new Date().getFullYear();
	    var winter = new Date(currentYear, 0, 1);
	    var summer = new Date(currentYear, 6, 1);
	    var winterOffset = winter.getTimezoneOffset();
	    var summerOffset = summer.getTimezoneOffset(); // Local standard timezone offset. Local standard time is not adjusted for daylight savings.
	    // This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST).
	    // Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).

	    var stdTimezoneOffset = Math.max(winterOffset, summerOffset); // timezone is specified as seconds west of UTC ("The external variable
	    // `timezone` shall be set to the difference, in seconds, between
	    // Coordinated Universal Time (UTC) and local standard time."), the same
	    // as returned by stdTimezoneOffset.
	    // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html

	    HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
	    HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

	    function extractZone(date) {
	      var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
	      return match ? match[1] : "GMT";
	    }
	    var winterName = extractZone(winter);
	    var summerName = extractZone(summer);
	    var winterNamePtr = allocateUTF8(winterName);
	    var summerNamePtr = allocateUTF8(summerName);

	    if (summerOffset < winterOffset) {
	      // Northern hemisphere
	      HEAPU32[tzname >> 2] = winterNamePtr;
	      HEAPU32[tzname + 4 >> 2] = summerNamePtr;
	    } else {
	      HEAPU32[tzname >> 2] = summerNamePtr;
	      HEAPU32[tzname + 4 >> 2] = winterNamePtr;
	    }
	  }

	  function __tzset_js(timezone, daylight, tzname) {
	    // TODO: Use (malleable) environment variables instead of system settings.
	    if (__tzset_js.called) return;
	    __tzset_js.called = true;

	    _tzset_impl(timezone, daylight, tzname);
	  }

	  function _abort() {
	    abort('');
	  }

	  function getHeapMax() {
	    return HEAPU8.length;
	  }

	  function _emscripten_get_heap_max() {
	    return getHeapMax();
	  }

	  function _emscripten_memcpy_big(dest, src, num) {
	    HEAPU8.copyWithin(dest, src, src + num);
	  }

	  function abortOnCannotGrowMemory(requestedSize) {
	    abort('OOM');
	  }

	  function _emscripten_resize_heap(requestedSize) {
	    HEAPU8.length;
	    abortOnCannotGrowMemory();
	  }

	  var ENV = {};

	  function getExecutableName() {
	    return thisProgram || './this.program';
	  }

	  function getEnvStrings() {
	    if (!getEnvStrings.strings) {
	      // Default values.
	      // Browser language detection #8751
	      var lang = (typeof navigator == 'object' && navigator.languages && navigator.languages[0] || 'C').replace('-', '_') + '.UTF-8';
	      var env = {
	        'USER': 'web_user',
	        'LOGNAME': 'web_user',
	        'PATH': '/',
	        'PWD': '/',
	        'HOME': '/home/web_user',
	        'LANG': lang,
	        '_': getExecutableName()
	      }; // Apply the user-provided values, if any.

	      for (var x in ENV) {
	        // x is a key in ENV; if ENV[x] is undefined, that means it was
	        // explicitly set to be so. We allow user code to do that to
	        // force variables with default values to remain unset.
	        if (ENV[x] === undefined) delete env[x];else env[x] = ENV[x];
	      }

	      var strings = [];

	      for (var x in env) {
	        strings.push(x + '=' + env[x]);
	      }

	      getEnvStrings.strings = strings;
	    }

	    return getEnvStrings.strings;
	  }

	  function _environ_get(__environ, environ_buf) {
	    var bufSize = 0;
	    getEnvStrings().forEach(function (string, i) {
	      var ptr = environ_buf + bufSize;
	      HEAPU32[__environ + i * 4 >> 2] = ptr;
	      writeAsciiToMemory(string, ptr);
	      bufSize += string.length + 1;
	    });
	    return 0;
	  }

	  function _environ_sizes_get(penviron_count, penviron_buf_size) {
	    var strings = getEnvStrings();
	    HEAPU32[penviron_count >> 2] = strings.length;
	    var bufSize = 0;
	    strings.forEach(function (string) {
	      bufSize += string.length + 1;
	    });
	    HEAPU32[penviron_buf_size >> 2] = bufSize;
	    return 0;
	  }

	  function _fd_close(fd) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      FS.close(stream);
	      return 0;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function _fd_fdstat_get(fd, pbuf) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd); // All character devices are terminals (other things a Linux system would
	      // assume is a character device, like the mouse, we have special APIs for).

	      var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
	      HEAP8[pbuf >> 0] = type; // TODO HEAP16[(((pbuf)+(2))>>1)] = ?;
	      // TODO (tempI64 = [?>>>0,(tempDouble=?,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((pbuf)+(8))>>2)] = tempI64[0],HEAP32[(((pbuf)+(12))>>2)] = tempI64[1]);
	      // TODO (tempI64 = [?>>>0,(tempDouble=?,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((pbuf)+(16))>>2)] = tempI64[0],HEAP32[(((pbuf)+(20))>>2)] = tempI64[1]);

	      return 0;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }
	  /** @param {number=} offset */


	  function doReadv(stream, iov, iovcnt, offset) {
	    var ret = 0;

	    for (var i = 0; i < iovcnt; i++) {
	      var ptr = HEAPU32[iov >> 2];
	      var len = HEAPU32[iov + 4 >> 2];
	      iov += 8;
	      var curr = FS.read(stream, HEAP8, ptr, len, offset);
	      if (curr < 0) return -1;
	      ret += curr;
	      if (curr < len) break; // nothing more to read
	    }

	    return ret;
	  }

	  function _fd_read(fd, iov, iovcnt, pnum) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      var num = doReadv(stream, iov, iovcnt);
	      HEAP32[pnum >> 2] = num;
	      return 0;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function convertI32PairToI53Checked(lo, hi) {
	    return hi + 0x200000 >>> 0 < 0x400001 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
	  }

	  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
	    try {
	      var offset = convertI32PairToI53Checked(offset_low, offset_high);
	      if (isNaN(offset)) return 61;
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      FS.llseek(stream, offset, whence);
	      tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
	      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state

	      return 0;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }
	  /** @param {number=} offset */


	  function doWritev(stream, iov, iovcnt, offset) {
	    var ret = 0;

	    for (var i = 0; i < iovcnt; i++) {
	      var ptr = HEAPU32[iov >> 2];
	      var len = HEAPU32[iov + 4 >> 2];
	      iov += 8;
	      var curr = FS.write(stream, HEAP8, ptr, len, offset);
	      if (curr < 0) return -1;
	      ret += curr;
	    }

	    return ret;
	  }

	  function _fd_write(fd, iov, iovcnt, pnum) {
	    try {
	      var stream = SYSCALLS.getStreamFromFD(fd);
	      var num = doWritev(stream, iov, iovcnt);
	      HEAPU32[pnum >> 2] = num;
	      return 0;
	    } catch (e) {
	      if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
	      return e.errno;
	    }
	  }

	  function _setTempRet0(val) {
	  }

	  var FSNode =
	  /** @constructor */
	  function (parent, name, mode, rdev) {
	    if (!parent) {
	      parent = this; // root node sets parent to itself
	    }

	    this.parent = parent;
	    this.mount = parent.mount;
	    this.mounted = null;
	    this.id = FS.nextInode++;
	    this.name = name;
	    this.mode = mode;
	    this.node_ops = {};
	    this.stream_ops = {};
	    this.rdev = rdev;
	  };

	  var readMode = 292
	  /*292*/
	  | 73
	  /*73*/
	  ;
	  var writeMode = 146
	  /*146*/
	  ;
	  Object.defineProperties(FSNode.prototype, {
	    read: {
	      get:
	      /** @this{FSNode} */
	      function () {
	        return (this.mode & readMode) === readMode;
	      },
	      set:
	      /** @this{FSNode} */
	      function (val) {
	        val ? this.mode |= readMode : this.mode &= ~readMode;
	      }
	    },
	    write: {
	      get:
	      /** @this{FSNode} */
	      function () {
	        return (this.mode & writeMode) === writeMode;
	      },
	      set:
	      /** @this{FSNode} */
	      function (val) {
	        val ? this.mode |= writeMode : this.mode &= ~writeMode;
	      }
	    },
	    isFolder: {
	      get:
	      /** @this{FSNode} */
	      function () {
	        return FS.isDir(this.mode);
	      }
	    },
	    isDevice: {
	      get:
	      /** @this{FSNode} */
	      function () {
	        return FS.isChrdev(this.mode);
	      }
	    }
	  });
	  FS.FSNode = FSNode;
	  FS.staticInit();
	  embind_init_charCodes();
	  BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
	  InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
	  init_ClassHandle();
	  init_embind();
	  init_RegisteredPointer();
	  UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
	  init_emval();
	  /** @type {function(string, boolean=, number=)} */

	  function intArrayFromString(stringy, dontAddNull, length) {
	    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
	    var u8array = new Array(len);
	    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
	    if (dontAddNull) u8array.length = numBytesWritten;
	    return u8array;
	  }

	  var asmLibraryArg = {
	    "__assert_fail": ___assert_fail,
	    "__syscall_fcntl64": ___syscall_fcntl64,
	    "__syscall_openat": ___syscall_openat,
	    "_embind_register_bigint": __embind_register_bigint,
	    "_embind_register_bool": __embind_register_bool,
	    "_embind_register_class": __embind_register_class,
	    "_embind_register_class_constructor": __embind_register_class_constructor,
	    "_embind_register_class_function": __embind_register_class_function,
	    "_embind_register_emval": __embind_register_emval,
	    "_embind_register_float": __embind_register_float,
	    "_embind_register_integer": __embind_register_integer,
	    "_embind_register_memory_view": __embind_register_memory_view,
	    "_embind_register_std_string": __embind_register_std_string,
	    "_embind_register_std_wstring": __embind_register_std_wstring,
	    "_embind_register_void": __embind_register_void,
	    "_emscripten_date_now": __emscripten_date_now,
	    "_emval_call_void_method": __emval_call_void_method,
	    "_emval_decref": __emval_decref,
	    "_emval_get_method_caller": __emval_get_method_caller,
	    "_gmtime_js": __gmtime_js,
	    "_localtime_js": __localtime_js,
	    "_mktime_js": __mktime_js,
	    "_tzset_js": __tzset_js,
	    "abort": _abort,
	    "em_log": em_log,
	    "emscripten_get_heap_max": _emscripten_get_heap_max,
	    "emscripten_memcpy_big": _emscripten_memcpy_big,
	    "emscripten_resize_heap": _emscripten_resize_heap,
	    "environ_get": _environ_get,
	    "environ_sizes_get": _environ_sizes_get,
	    "fd_close": _fd_close,
	    "fd_fdstat_get": _fd_fdstat_get,
	    "fd_read": _fd_read,
	    "fd_seek": _fd_seek,
	    "fd_write": _fd_write,
	    "setTempRet0": _setTempRet0
	  };
	  createWasm();
	  /** @type {function(...*):?} */

	  Module["___wasm_call_ctors"] = function () {
	    return (Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  var _free = Module["_free"] = function () {
	    return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  var _malloc = Module["_malloc"] = function () {
	    return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  var ___errno_location = Module["___errno_location"] = function () {
	    return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  var ___getTypeName = Module["___getTypeName"] = function () {
	    return (___getTypeName = Module["___getTypeName"] = Module["asm"]["__getTypeName"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["___embind_register_native_and_builtin_types"] = function () {
	    return (Module["___embind_register_native_and_builtin_types"] = Module["asm"]["__embind_register_native_and_builtin_types"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  var _emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = function () {
	    return (_emscripten_builtin_memalign = Module["_emscripten_builtin_memalign"] = Module["asm"]["emscripten_builtin_memalign"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["stackSave"] = function () {
	    return (Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["stackRestore"] = function () {
	    return (Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["stackAlloc"] = function () {
	    return (Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["dynCall_viiijj"] = function () {
	    return (Module["dynCall_viiijj"] = Module["asm"]["dynCall_viiijj"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["dynCall_jij"] = function () {
	    return (Module["dynCall_jij"] = Module["asm"]["dynCall_jij"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["dynCall_jii"] = function () {
	    return (Module["dynCall_jii"] = Module["asm"]["dynCall_jii"]).apply(null, arguments);
	  };
	  /** @type {function(...*):?} */


	  Module["dynCall_jiji"] = function () {
	    return (Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
	  };

	  Module['_ff_h264_cabac_tables'] = 267045; // === Auto-generated postamble setup entry stuff ===


	  var calledRun;
	  /**
	   * @constructor
	   * @this {ExitStatus}
	   */

	  function ExitStatus(status) {
	    this.name = "ExitStatus";
	    this.message = "Program terminated with exit(" + status + ")";
	    this.status = status;
	  }

	  dependenciesFulfilled = function runCaller() {
	    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
	    if (!calledRun) run();
	    if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
	  };
	  /** @type {function(Array=)} */


	  function run(args) {

	    if (runDependencies > 0) {
	      return;
	    }

	    preRun(); // a preRun added a dependency, run will be called later

	    if (runDependencies > 0) {
	      return;
	    }

	    function doRun() {
	      // run may have just been called through dependencies being fulfilled just in this very frame,
	      // or while the async setStatus time below was happening
	      if (calledRun) return;
	      calledRun = true;
	      Module['calledRun'] = true;
	      if (ABORT) return;
	      initRuntime();
	      if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
	      postRun();
	    }

	    if (Module['setStatus']) {
	      Module['setStatus']('Running...');
	      setTimeout(function () {
	        setTimeout(function () {
	          Module['setStatus']('');
	        }, 1);
	        doRun();
	      }, 1);
	    } else {
	      doRun();
	    }
	  }

	  Module['run'] = run;

	  if (Module['preInit']) {
	    if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];

	    while (Module['preInit'].length > 0) {
	      Module['preInit'].pop()();
	    }
	  }

	  run();
	  module.exports = Module;
	});

	const AVType = {
	  Video: 0x1,
	  Audio: 0x2
	};
	const VideoType = {
	  H264: 0x1,
	  H265: 0x2
	};
	const AudioType = {
	  PCM: 0x1,
	  PCMA: 0x2,
	  PCMU: 0x4,
	  AAC: 0x8
	};
	const WORKER_SEND_TYPE = {
	  init: 'init',
	  setVideoCodec: 'setVideoCodec',
	  decodeVideo: 'decodeVideo',
	  setAudioCodec: 'setAudioCodec',
	  decodeAudio: 'decodeAudio',
	  reset: 'reset',
	  destroy: 'destroy'
	};
	const WORKER_EVENT_TYPE = {
	  created: 'created',
	  inited: 'inited',
	  reseted: 'reseted',
	  destroyed: 'destroyed',
	  videoInfo: 'videoInfo',
	  yuvData: 'yuvData',
	  audioInfo: 'audioInfo',
	  pcmData: 'pcmData'
	};

	class AVPacket {
	  payload;
	  avtype;
	  timestamp;
	  nals;
	  iskeyframe;
	}

	class VideoInfo {
	  vtype;
	  width;
	  height;
	  extradata;
	}

	class AudioInfo {
	  atype;
	  sample;
	  channels;
	  depth;
	  profile;
	  extradata;
	}

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
	    this._samplesList.push({
	      buffers,
	      pts
	    });

	    this._curSamples += buffers[0].length;
	  }

	  spliteOnce(f) {
	    if (this._curSamples < this._samplesPerPacket) {
	      return;
	    }

	    let newbuffers = [];
	    let pts = undefined;

	    for (let i = 0; i < this._channels; i++) {
	      newbuffers.push(new Float32Array(this._samplesPerPacket));
	    }

	    let needSamples = this._samplesPerPacket;
	    let copySamples = 0;

	    while (true) {
	      if (needSamples === 0) {
	        break;
	      }

	      let first = this._samplesList[0];

	      if (!pts) {
	        pts = first.pts;
	      }

	      if (needSamples >= first.buffers[0].length) {
	        newbuffers[0].set(first.buffers[0], copySamples);

	        if (this._channels > 1) {
	          newbuffers[1].set(first.buffers[1], copySamples);
	        }

	        needSamples -= first.buffers[0].length;
	        copySamples += first.buffers[0].length;

	        this._samplesList.shift();
	      } else {
	        newbuffers[0].set(first.buffers[0].slice(0, needSamples), copySamples);
	        first.buffers[0] = first.buffers[0].slice(needSamples);

	        if (this._channels > 1) {
	          newbuffers[1].set(first.buffers[1].slice(0, needSamples), copySamples);
	          first.buffers[1] = first.buffers[1].slice(needSamples);
	        }

	        first.pts += Math.floor(needSamples * 1000 / this._sampleRate);
	        copySamples += needSamples;
	        needSamples = 0;
	      }
	    }

	    this._curSamples -= this._samplesPerPacket;
	    f(newbuffers, pts);
	  }

	  splite(f) {
	    while (this._curSamples >= this._samplesPerPacket) {
	      this.spliteOnce(f);
	    }
	  }

	}

	function caculateSamplesPerPacket(sampleRate) {
	  if (sampleRate >= 44100) {
	    return 1024;
	  } else if (sampleRate >= 22050) {
	    return 512;
	  } else {
	    return 256;
	  }
	}

	class Logger {
	  _logEnable = false;

	  constructor() {}

	  setLogEnable(logEnable) {
	    this._logEnable = logEnable;
	  }

	  info(module) {
	    if (this._logEnable) {
	      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      console.log(`AVPlayer: [${module}]`, ...args);
	    }
	  }

	  warn(module) {
	    if (this._logEnable) {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      console.warn(`AVPlayer: [${module}]`, ...args);
	    }
	  }

	  error(module) {
	    if (this._logEnable) {
	      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	        args[_key3 - 1] = arguments[_key3];
	      }

	      console.error(`AVPlayer: [${module}]`, ...args);
	    }
	  }

	}

	class EventEmitter {
	  on(name, fn, ctx) {
	    const e = this.e || (this.e = {});
	    (e[name] || (e[name] = [])).push({
	      fn,
	      ctx
	    });
	    return this;
	  }

	  once(name, fn, ctx) {
	    const self = this;

	    function listener() {
	      self.off(name, listener);

	      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      fn.apply(ctx, args);
	    }

	    listener._ = fn;
	    return this.on(name, listener, ctx);
	  }

	  emit(name) {
	    const evtArr = ((this.e || (this.e = {}))[name] || []).slice();

	    for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	      data[_key2 - 1] = arguments[_key2];
	    }

	    for (let i = 0; i < evtArr.length; i += 1) {
	      evtArr[i].fn.apply(evtArr[i].ctx, data);
	    }

	    return this;
	  }

	  off(name, callback) {
	    const e = this.e || (this.e = {});

	    if (!name) {
	      Object.keys(e).forEach(key => {
	        delete e[key];
	      });
	      delete this.e;
	      return;
	    }

	    const evts = e[name];
	    const liveEvents = [];

	    if (evts && callback) {
	      for (let i = 0, len = evts.length; i < len; i += 1) {
	        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
	      }
	    }

	    if (liveEvents.length) {
	      e[name] = liveEvents;
	    } else {
	      delete e[name];
	    }

	    return this;
	  }

	}

	class Bitop {
	  constructor(buffer) {
	    this.buffer = buffer;
	    this.buflen = buffer.length;
	    this.bufpos = 0;
	    this.bufoff = 0;
	    this.iserro = false;
	  }

	  read(n) {
	    let v = 0;
	    let d = 0;

	    while (n) {
	      if (n < 0 || this.bufpos >= this.buflen) {
	        this.iserro = true;
	        return 0;
	      }

	      this.iserro = false;
	      d = this.bufoff + n > 8 ? 8 - this.bufoff : n;
	      v <<= d;
	      v += this.buffer[this.bufpos] >> 8 - this.bufoff - d & 0xff >> 8 - d;
	      this.bufoff += d;
	      n -= d;

	      if (this.bufoff == 8) {
	        this.bufpos++;
	        this.bufoff = 0;
	      }
	    }

	    return v;
	  }

	  look(n) {
	    let p = this.bufpos;
	    let o = this.bufoff;
	    let v = this.read(n);
	    this.bufpos = p;
	    this.bufoff = o;
	    return v;
	  }

	  read_golomb() {
	    let n;

	    for (n = 0; this.read(1) == 0 && !this.iserro; n++);

	    return (1 << n) + this.read(n) - 1;
	  }

	}

	//
	const AAC_SAMPLE_RATE = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350, 0, 0, 0];
	const AAC_CHANNELS = [0, 1, 2, 3, 4, 5, 6, 8];

	function getObjectType(bitop) {
	  let audioObjectType = bitop.read(5);

	  if (audioObjectType === 31) {
	    audioObjectType = bitop.read(6) + 32;
	  }

	  return audioObjectType;
	}

	function getSampleRate(bitop, info) {
	  info.sampling_index = bitop.read(4);
	  return info.sampling_index == 0x0f ? bitop.read(24) : AAC_SAMPLE_RATE[info.sampling_index];
	}

	function readAACSpecificConfig(aacSequenceHeader) {
	  let info = {};
	  let bitop = new Bitop(aacSequenceHeader);
	  bitop.read(16);
	  info.object_type = getObjectType(bitop);
	  info.sample_rate = getSampleRate(bitop, info);
	  info.chan_config = bitop.read(4);

	  if (info.chan_config < AAC_CHANNELS.length) {
	    info.channels = AAC_CHANNELS[info.chan_config];
	  }

	  info.sbr = -1;
	  info.ps = -1;

	  if (info.object_type == 5 || info.object_type == 29) {
	    if (info.object_type == 29) {
	      info.ps = 1;
	    }

	    info.ext_object_type = 5;
	    info.sbr = 1;
	    info.sample_rate = getSampleRate(bitop, info);
	    info.object_type = getObjectType(bitop);
	  }

	  return info;
	}

	function readH264SpecificConfig(avcSequenceHeader) {
	  let info = {};
	  let profile_idc, width, height, crop_left, crop_right, crop_top, crop_bottom, frame_mbs_only, n, cf_idc, num_ref_frames;
	  let bitop = new Bitop(avcSequenceHeader);
	  bitop.read(48);
	  info.width = 0;
	  info.height = 0;

	  do {
	    info.profile = bitop.read(8);
	    info.compat = bitop.read(8);
	    info.level = bitop.read(8);
	    info.nalu = (bitop.read(8) & 0x03) + 1;
	    info.nb_sps = bitop.read(8) & 0x1F;

	    if (info.nb_sps == 0) {
	      break;
	    }
	    /* nal size */


	    bitop.read(16);
	    /* nal type */

	    if (bitop.read(8) != 0x67) {
	      break;
	    }
	    /* SPS */


	    profile_idc = bitop.read(8);
	    /* flags */

	    bitop.read(8);
	    /* level idc */

	    bitop.read(8);
	    /* SPS id */

	    bitop.read_golomb();

	    if (profile_idc == 100 || profile_idc == 110 || profile_idc == 122 || profile_idc == 244 || profile_idc == 44 || profile_idc == 83 || profile_idc == 86 || profile_idc == 118) {
	      /* chroma format idc */
	      cf_idc = bitop.read_golomb();

	      if (cf_idc == 3) {
	        /* separate color plane */
	        bitop.read(1);
	      }
	      /* bit depth luma - 8 */


	      bitop.read_golomb();
	      /* bit depth chroma - 8 */

	      bitop.read_golomb();
	      /* qpprime y zero transform bypass */

	      bitop.read(1);
	      /* seq scaling matrix present */

	      if (bitop.read(1)) {
	        for (n = 0; n < (cf_idc != 3 ? 8 : 12); n++) {
	          /* seq scaling list present */
	          if (bitop.read(1)) ;
	        }
	      }
	    }
	    /* log2 max frame num */


	    bitop.read_golomb();
	    /* pic order cnt type */

	    switch (bitop.read_golomb()) {
	      case 0:
	        /* max pic order cnt */
	        bitop.read_golomb();
	        break;

	      case 1:
	        /* delta pic order alwys zero */
	        bitop.read(1);
	        /* offset for non-ref pic */

	        bitop.read_golomb();
	        /* offset for top to bottom field */

	        bitop.read_golomb();
	        /* num ref frames in pic order */

	        num_ref_frames = bitop.read_golomb();

	        for (n = 0; n < num_ref_frames; n++) {
	          /* offset for ref frame */
	          bitop.read_golomb();
	        }

	    }
	    /* num ref frames */


	    info.avc_ref_frames = bitop.read_golomb();
	    /* gaps in frame num allowed */

	    bitop.read(1);
	    /* pic width in mbs - 1 */

	    width = bitop.read_golomb();
	    /* pic height in map units - 1 */

	    height = bitop.read_golomb();
	    /* frame mbs only flag */

	    frame_mbs_only = bitop.read(1);

	    if (!frame_mbs_only) {
	      /* mbs adaprive frame field */
	      bitop.read(1);
	    }
	    /* direct 8x8 inference flag */


	    bitop.read(1);
	    /* frame cropping */

	    if (bitop.read(1)) {
	      crop_left = bitop.read_golomb();
	      crop_right = bitop.read_golomb();
	      crop_top = bitop.read_golomb();
	      crop_bottom = bitop.read_golomb();
	    } else {
	      crop_left = 0;
	      crop_right = 0;
	      crop_top = 0;
	      crop_bottom = 0;
	    }

	    info.level = info.level / 10.0;
	    info.width = (width + 1) * 16 - (crop_left + crop_right) * 2;
	    info.height = (2 - frame_mbs_only) * (height + 1) * 16 - (crop_top + crop_bottom) * 2;
	  } while (0);

	  return info;
	}

	function HEVCParsePtl(bitop, hevc, max_sub_layers_minus1) {
	  let general_ptl = {};
	  general_ptl.profile_space = bitop.read(2);
	  general_ptl.tier_flag = bitop.read(1);
	  general_ptl.profile_idc = bitop.read(5);
	  general_ptl.profile_compatibility_flags = bitop.read(32);
	  general_ptl.general_progressive_source_flag = bitop.read(1);
	  general_ptl.general_interlaced_source_flag = bitop.read(1);
	  general_ptl.general_non_packed_constraint_flag = bitop.read(1);
	  general_ptl.general_frame_only_constraint_flag = bitop.read(1);
	  bitop.read(32);
	  bitop.read(12);
	  general_ptl.level_idc = bitop.read(8);
	  general_ptl.sub_layer_profile_present_flag = [];
	  general_ptl.sub_layer_level_present_flag = [];

	  for (let i = 0; i < max_sub_layers_minus1; i++) {
	    general_ptl.sub_layer_profile_present_flag[i] = bitop.read(1);
	    general_ptl.sub_layer_level_present_flag[i] = bitop.read(1);
	  }

	  if (max_sub_layers_minus1 > 0) {
	    for (let i = max_sub_layers_minus1; i < 8; i++) {
	      bitop.read(2);
	    }
	  }

	  general_ptl.sub_layer_profile_space = [];
	  general_ptl.sub_layer_tier_flag = [];
	  general_ptl.sub_layer_profile_idc = [];
	  general_ptl.sub_layer_profile_compatibility_flag = [];
	  general_ptl.sub_layer_progressive_source_flag = [];
	  general_ptl.sub_layer_interlaced_source_flag = [];
	  general_ptl.sub_layer_non_packed_constraint_flag = [];
	  general_ptl.sub_layer_frame_only_constraint_flag = [];
	  general_ptl.sub_layer_level_idc = [];

	  for (let i = 0; i < max_sub_layers_minus1; i++) {
	    if (general_ptl.sub_layer_profile_present_flag[i]) {
	      general_ptl.sub_layer_profile_space[i] = bitop.read(2);
	      general_ptl.sub_layer_tier_flag[i] = bitop.read(1);
	      general_ptl.sub_layer_profile_idc[i] = bitop.read(5);
	      general_ptl.sub_layer_profile_compatibility_flag[i] = bitop.read(32);
	      general_ptl.sub_layer_progressive_source_flag[i] = bitop.read(1);
	      general_ptl.sub_layer_interlaced_source_flag[i] = bitop.read(1);
	      general_ptl.sub_layer_non_packed_constraint_flag[i] = bitop.read(1);
	      general_ptl.sub_layer_frame_only_constraint_flag[i] = bitop.read(1);
	      bitop.read(32);
	      bitop.read(12);
	    }

	    if (general_ptl.sub_layer_level_present_flag[i]) {
	      general_ptl.sub_layer_level_idc[i] = bitop.read(8);
	    } else {
	      general_ptl.sub_layer_level_idc[i] = 1;
	    }
	  }

	  return general_ptl;
	}

	function HEVCParseSPS(SPS, hevc) {
	  let psps = {};
	  let NumBytesInNALunit = SPS.length;
	  let rbsp_array = [];
	  let bitop = new Bitop(SPS);
	  bitop.read(1); //forbidden_zero_bit

	  bitop.read(6); //nal_unit_type

	  bitop.read(6); //nuh_reserved_zero_6bits

	  bitop.read(3); //nuh_temporal_id_plus1

	  for (let i = 2; i < NumBytesInNALunit; i++) {
	    if (i + 2 < NumBytesInNALunit && bitop.look(24) == 0x000003) {
	      rbsp_array.push(bitop.read(8));
	      rbsp_array.push(bitop.read(8));
	      i += 2;
	      bitop.read(8);
	      /* equal to 0x03 */
	    } else {
	      rbsp_array.push(bitop.read(8));
	    }
	  }

	  let rbsp = new Uint8Array(rbsp_array);
	  let rbspBitop = new Bitop(rbsp);
	  psps.sps_video_parameter_set_id = rbspBitop.read(4);
	  psps.sps_max_sub_layers_minus1 = rbspBitop.read(3);
	  psps.sps_temporal_id_nesting_flag = rbspBitop.read(1);
	  psps.profile_tier_level = HEVCParsePtl(rbspBitop, hevc, psps.sps_max_sub_layers_minus1);
	  psps.sps_seq_parameter_set_id = rbspBitop.read_golomb();
	  psps.chroma_format_idc = rbspBitop.read_golomb();

	  if (psps.chroma_format_idc == 3) {
	    psps.separate_colour_plane_flag = rbspBitop.read(1);
	  } else {
	    psps.separate_colour_plane_flag = 0;
	  }

	  psps.pic_width_in_luma_samples = rbspBitop.read_golomb();
	  psps.pic_height_in_luma_samples = rbspBitop.read_golomb();
	  psps.conformance_window_flag = rbspBitop.read(1);

	  if (psps.conformance_window_flag) {
	    let vert_mult = 1 + (psps.chroma_format_idc < 2);
	    let horiz_mult = 1 + (psps.chroma_format_idc < 3);
	    psps.conf_win_left_offset = rbspBitop.read_golomb() * horiz_mult;
	    psps.conf_win_right_offset = rbspBitop.read_golomb() * horiz_mult;
	    psps.conf_win_top_offset = rbspBitop.read_golomb() * vert_mult;
	    psps.conf_win_bottom_offset = rbspBitop.read_golomb() * vert_mult;
	  } // Logger.debug(psps);


	  return psps;
	}

	function readHEVCSpecificConfig(hevcSequenceHeader) {
	  let info = {};
	  info.width = 0;
	  info.height = 0;
	  info.profile = 0;
	  info.level = 0; // let bitop = new Bitop(hevcSequenceHeader);
	  // bitop.read(48);

	  hevcSequenceHeader = hevcSequenceHeader.slice(5);

	  do {
	    let hevc = {};

	    if (hevcSequenceHeader.length < 23) {
	      break;
	    }

	    hevc.configurationVersion = hevcSequenceHeader[0];

	    if (hevc.configurationVersion != 1) {
	      break;
	    }

	    hevc.general_profile_space = hevcSequenceHeader[1] >> 6 & 0x03;
	    hevc.general_tier_flag = hevcSequenceHeader[1] >> 5 & 0x01;
	    hevc.general_profile_idc = hevcSequenceHeader[1] & 0x1F;
	    hevc.general_profile_compatibility_flags = hevcSequenceHeader[2] << 24 | hevcSequenceHeader[3] << 16 | hevcSequenceHeader[4] << 8 | hevcSequenceHeader[5];
	    hevc.general_constraint_indicator_flags = hevcSequenceHeader[6] << 24 | hevcSequenceHeader[7] << 16 | hevcSequenceHeader[8] << 8 | hevcSequenceHeader[9];
	    hevc.general_constraint_indicator_flags = hevc.general_constraint_indicator_flags << 16 | hevcSequenceHeader[10] << 8 | hevcSequenceHeader[11];
	    hevc.general_level_idc = hevcSequenceHeader[12];
	    hevc.min_spatial_segmentation_idc = (hevcSequenceHeader[13] & 0x0F) << 8 | hevcSequenceHeader[14];
	    hevc.parallelismType = hevcSequenceHeader[15] & 0x03;
	    hevc.chromaFormat = hevcSequenceHeader[16] & 0x03;
	    hevc.bitDepthLumaMinus8 = hevcSequenceHeader[17] & 0x07;
	    hevc.bitDepthChromaMinus8 = hevcSequenceHeader[18] & 0x07;
	    hevc.avgFrameRate = hevcSequenceHeader[19] << 8 | hevcSequenceHeader[20];
	    hevc.constantFrameRate = hevcSequenceHeader[21] >> 6 & 0x03;
	    hevc.numTemporalLayers = hevcSequenceHeader[21] >> 3 & 0x07;
	    hevc.temporalIdNested = hevcSequenceHeader[21] >> 2 & 0x01;
	    hevc.lengthSizeMinusOne = hevcSequenceHeader[21] & 0x03;
	    let numOfArrays = hevcSequenceHeader[22];
	    let p = hevcSequenceHeader.slice(23);

	    for (let i = 0; i < numOfArrays; i++) {
	      if (p.length < 3) {
	        brak;
	      }

	      let nalutype = p[0];
	      let n = p[1] << 8 | p[2]; // Logger.debug(nalutype, n);

	      p = p.slice(3);

	      for (let j = 0; j < n; j++) {
	        if (p.length < 2) {
	          break;
	        }

	        let k = p[0] << 8 | p[1]; // Logger.debug('k', k);

	        if (p.length < 2 + k) {
	          break;
	        }

	        p = p.slice(2);

	        if (nalutype == 33) {
	          //SPS
	          let sps = new Uint8Array(k);
	          sps.set(p.slice(0, k), 0); // Logger.debug(sps, sps.length);

	          hevc.psps = HEVCParseSPS(sps, hevc);
	          info.profile = hevc.general_profile_idc;
	          info.level = hevc.general_level_idc / 30.0;
	          info.width = hevc.psps.pic_width_in_luma_samples - (hevc.psps.conf_win_left_offset + hevc.psps.conf_win_right_offset);
	          info.height = hevc.psps.pic_height_in_luma_samples - (hevc.psps.conf_win_top_offset + hevc.psps.conf_win_bottom_offset);
	        }

	        p = p.slice(k);
	      }
	    }
	  } while (0);

	  return info;
	}

	function readAVCSpecificConfig(avcSequenceHeader) {
	  let codec_id = avcSequenceHeader[0] & 0x0f;

	  if (codec_id == 7) {
	    return readH264SpecificConfig(avcSequenceHeader);
	  } else if (codec_id == 12) {
	    return readHEVCSpecificConfig(avcSequenceHeader);
	  }
	}

	const FLV_MEDIA_TYPE = {
	  Audio: 8,
	  Video: 9,
	  Script: 18
	};
	const CodecID = {
	  AVC: 7,
	  //h264
	  HEVC: 12 //h265

	};
	const FrameType = {
	  KeyFrame: 1,
	  InterFrame: 2
	};
	const AVCPacketType = {
	  AVCSequenceHeader: 0,
	  AVCNalu: 1
	};
	const SoundFormat = {
	  G711A: 7,
	  G711U: 8,
	  AAC: 10
	};
	const AACPackettype = {
	  AACSequenceHeader: 0,
	  AACRaw: 1
	};
	const FLV_Parse_State = {
	  Init: 0,
	  TagCommerHeader: 1,
	  TagPayload: 2
	};

	class FLVDemuxer extends EventEmitter {
	  _buffer = undefined;
	  _needlen = 0;
	  _state = 0;
	  _tagtype = 0;
	  _dts = 0;
	  _pts = 0;
	  _videoinfo;
	  _audioinfo;

	  constructor(player) {
	    super();
	    this._player = player;
	    this.reset();
	  }

	  reset() {
	    this._videoinfo = new VideoInfo();
	    this._audioinfo = new AudioInfo();
	    this._state = FLV_Parse_State.Init;
	    this._needlen = 9;
	    this._buffer = undefined;
	  }

	  dispatch(data) {
	    let remain = data;

	    if (this._buffer) {
	      let newbuffer = new Uint8Array(this._buffer.length + data.length);
	      newbuffer.set(this._buffer, 0);
	      newbuffer.set(data, this._buffer.length);
	      remain = newbuffer;
	      this._buffer = undefined;
	    }

	    const tmp = new ArrayBuffer(4);
	    const dv = new DataView(tmp);

	    while (true) {
	      if (remain.length < this._needlen) {
	        break;
	      }

	      if (this._state === FLV_Parse_State.Init) {
	        remain.slice(0, this._needlen);
	        remain = remain.slice(this._needlen);
	        this._needlen = 15;
	        this._state = FLV_Parse_State.TagCommerHeader;
	      } else if (this._state === FLV_Parse_State.TagCommerHeader) {
	        this._tagtype = remain[4] & 0x1F; // 5bit代表类型,8:audio 9:video 18:script other:其他

	        dv.setUint8(0, remain[7]);
	        dv.setUint8(1, remain[6]);
	        dv.setUint8(2, remain[5]);
	        dv.setUint8(3, 0);
	        let payloadlen = dv.getUint32(0, true); //Tag 中除通用头外的长度，即 Header + Data 字段的长度 (等于 Tag 总长度 – 11)

	        dv.setUint8(0, remain[10]);
	        dv.setUint8(1, remain[9]);
	        dv.setUint8(2, remain[8]);
	        dv.setUint8(3, remain[11]);
	        this._dts = dv.getUint32(0, true);
	        remain.slice(0, this._needlen);
	        remain = remain.slice(this._needlen);
	        this._needlen = payloadlen;
	        this._state = FLV_Parse_State.TagPayload;
	      } else {
	        if (this._tagtype === FLV_MEDIA_TYPE.Video) {
	          let frametype = remain[0] >> 4 & 0x0F;
	          let codecid = remain[0] & 0x0F;

	          if (codecid === CodecID.AVC || codecid === CodecID.HEVC) {
	            let avcpackettype = remain[1];
	            dv.setUint8(0, remain[4]);
	            dv.setUint8(1, remain[3]);
	            dv.setUint8(2, remain[2]);
	            dv.setUint8(3, 0);
	            let compositiontime = dv.getUint32(0, true);
	            this._pts = this._dts + compositiontime;

	            if (frametype === FrameType.KeyFrame) {
	              if (avcpackettype === AVCPacketType.AVCSequenceHeader) {
	                //avcseq
	                let info = readAVCSpecificConfig(remain.slice(0, this._needlen));
	                this._videoinfo.vtype = codecid === CodecID.AVC ? VideoType.H264 : VideoType.H265;
	                this._videoinfo.width = info.width;
	                this._videoinfo.height = info.height;
	                this._videoinfo.extradata = remain.slice(5, this._needlen);
	                this.emit('videoinfo', this._videoinfo);
	              } else if (avcpackettype === AVCPacketType.AVCNalu) {
	                //I Frame
	                let vframe = remain.slice(5, this._needlen);
	                let packet = new AVPacket();
	                packet.payload = vframe; //convertAVCCtoAnnexB(vframe);

	                packet.iskeyframe = true;
	                packet.timestamp = this._pts;
	                packet.avtype = AVType.Video; // packet.nals = SplitBufferToNals(vframe);

	                this.emit('videodata', packet);
	              } else ;
	            } else if (frametype === FrameType.InterFrame) {
	              if (avcpackettype === AVCPacketType.AVCNalu) {
	                //P Frame
	                let vframe = remain.slice(5, this._needlen);
	                let packet = new AVPacket();
	                packet.payload = vframe; //convertAVCCtoAnnexB(vframe);

	                packet.iskeyframe = false;
	                packet.timestamp = this._pts;
	                packet.avtype = AVType.Video; // packet.nals = SplitBufferToNals(vframe);

	                this.emit('videodata', packet);
	              }
	            } else ;
	          }
	        } else if (this._tagtype === FLV_MEDIA_TYPE.Audio) {
	          let soundformat = remain[0] >> 4 & 0x0F;
	          remain[0] >> 2 & 0x02;
	          let soundsize = remain[0] >> 1 & 0x01;
	          remain[0] & 0x0F;

	          if (soundformat === SoundFormat.AAC) {
	            let aacpackettype = remain[1];

	            if (aacpackettype === AACPackettype.AACSequenceHeader) {
	              let aacinfo = readAACSpecificConfig(remain.slice(0, this._needlen));
	              this._audioinfo.atype = AudioType.AAC;
	              this._audioinfo.profile = aacinfo.object_type;
	              this._audioinfo.sample = aacinfo.sample_rate;
	              this._audioinfo.channels = aacinfo.chan_config;
	              this._audioinfo.depth = soundsize ? 16 : 8;
	              this._audioinfo.extradata = remain.slice(2, this._needlen);
	              this.emit('audioinfo', this._audioinfo);
	            } else {
	              let aacraw = remain.slice(2, this._needlen);
	              let packet = new AVPacket();
	              packet.payload = aacraw;
	              packet.iskeyframe = false;
	              packet.timestamp = this._dts;
	              packet.avtype = AVType.Audio;
	              this.emit('audiodata', packet);
	            }
	          } else {
	            if (!this._pcminfosend) {
	              this._audioinfo.atype = soundformat === SoundFormat.G711A ? AudioType.PCMA : AudioType.PCMU;
	              this._audioinfo.profile = 0;
	              this._audioinfo.sample = 8000;
	              this._audioinfo.channels = 1;
	              this._audioinfo.depth = 16;
	              this._audioinfo.extradata = new Uint8Array(0);
	              this.emit('audioinfo', this._audioinfo);
	              this._pcminfosend = true;
	            }

	            let audioraw = remain.slice(1, this._needlen);
	            let packet = new AVPacket();
	            packet.payload = audioraw;
	            packet.iskeyframe = false;
	            packet.timestamp = this._dts;
	            packet.avtype = AVType.Audio;
	            this.emit('audiodata', packet);
	          }
	        } else if (this._tagtype === FLV_MEDIA_TYPE.Script) ; else ;

	        remain = remain.slice(this._needlen);
	        this._needlen = 15;
	        this._state = FLV_Parse_State.TagCommerHeader;
	      }
	    }

	    this._buffer = remain;
	  }

	  destroy() {
	    this.off();

	    this._player._logger.info('FLVDemuxer', 'FLVDemuxer destroy');
	  }

	}

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

	    fetch(this._player._options.url, {
	      signal: this._abort.signal
	    }).then(res => {
	      const reader = res.body.getReader();

	      let fetchNext = async () => {
	        let {
	          done,
	          value
	        } = await reader.read();

	        if (done) {
	          this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} done, Cnt ${this._retryCnt}`);

	          this.retry();
	        } else {
	          this.emit('data', value);
	          fetchNext();
	        }
	      };

	      fetchNext();
	    }).catch(e => {
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
	    }, this._player._options.retryDelay * 1000);
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

	let Module = undefined;
	console.log(`WorkName ${self.name}`);

	if (self.name === 'simd') {
	  Module = decoder_simd;
	} else {
	  Module = decoder;
	}

	class MediaCenterInternal {
	  _vDecoder = undefined;
	  _aDecoder = undefined;
	  _width = 0;
	  _height = 0;
	  _sampleRate = 0;
	  _channels = 0;
	  _samplesPerPacket = 0;
	  _options = undefined;
	  _gop = [];
	  _timer = undefined;
	  _statistic = undefined;
	  _useSpliteBuffer = false;
	  _spliteBuffer = undefined;
	  _logger = undefined;
	  _demuxer = undefined;
	  _stream = undefined;
	  _vframerate = 0;
	  _vbitrate = 0;
	  _aframerate = 0;
	  _abitrate = 0;
	  _yuvframerate = 0;
	  _yuvbitrate = 0;
	  _pcmframerate = 0;
	  _pcmbitrate = 0;
	  _statsec = 2;
	  _lastts = 0;

	  constructor(options) {
	    this._vDecoder = new Module.VideoDecoder(this);
	    this._aDecoder = new Module.AudioDecoder(this);
	    this._options = options;
	    this._logger = new Logger();

	    this._logger.setLogEnable(true);

	    this._demuxer = new FLVDemuxer(this); // demux stream to h264/h265 aac/pcmu/pcma

	    this._stream = new FetchStream(this); //get strem from remote

	    this.registerEvents();

	    this._stream.start();

	    this._timer = setInterval(() => {
	      let cnt = Math.min(20, this._gop.length);

	      while (cnt > 0) {
	        this.handleTicket();
	        cnt--;
	      }
	    }, 10);
	    this._stattimer = setInterval(() => {
	      this._logger.info('MCSTAT', `------ MCSTAT ---------
        video gen framerate:${this._vframerate / this._statsec} bitrate:${this._vbitrate * 8 / this._statsec}
        audio gen framerate:${this._aframerate / this._statsec} bitrate:${this._abitrate * 8 / this._statsec}
        yuv   gen framerate:${this._yuvframerate / this._statsec} bitrate:${this._yuvbitrate * 8 / this._statsec}
        pcm   gen framerate:${this._pcmframerate / this._statsec} bitrate:${this._pcmbitrate * 8 / this._statsec}
        packet buffer left count ${this._gop.length}
        `);

	      this._vframerate = 0;
	      this._vbitrate = 0;
	      this._aframerate = 0;
	      this._abitrate = 0;
	      this._yuvframerate = 0;
	      this._yuvbitrate = 0;
	      this._pcmframerate = 0;
	      this._pcmbitrate = 0;
	    }, this._statsec * 1000);
	  }

	  registerEvents() {
	    this._logger.info('MediaCenterInternal', `now play ${this._options.url}`);

	    this._stream.on('finish', () => {});

	    this._stream.on('retry', () => {
	      this.reset();
	      postMessage({
	        cmd: WORKER_EVENT_TYPE.reseted
	      });
	    });

	    this._stream.on('data', data => {
	      this._demuxer.dispatch(data);
	    });

	    this._demuxer.on('videoinfo', videoinfo => {
	      this._logger.info('MediaCenterInternal', `demux video info vtype:${videoinfo.vtype} width:${videoinfo.width} hight:${videoinfo.height}`);

	      this._vDecoder.setCodec(videoinfo.vtype, videoinfo.extradata);
	    });

	    this._demuxer.on('audioinfo', audioinfo => {
	      this._logger.info('MediaCenterInternal', `demux audio info atype:${audioinfo.atype} sample:${audioinfo.sample} channels:${audioinfo.channels} depth:${audioinfo.depth} aacprofile:${audioinfo.profile}`);

	      this._aDecoder.setCodec(audioinfo.atype, audioinfo.extradata);
	    });

	    this._demuxer.on('videodata', packet => {
	      this._vframerate++;
	      this._vbitrate += packet.payload.length;
	      this.decodeVideo(packet.payload, packet.timestamp, packet.iskeyframe);
	    });

	    this._demuxer.on('audiodata', packet => {
	      this._aframerate++;
	      this._abitrate += packet.payload.length;
	      this.decodeAudio(packet.payload, packet.timestamp);
	    });
	  }

	  destroy() {
	    this.reset();

	    this._aDecoder.clear();

	    this._vDecoder.clear();

	    this._aDecoder = undefined;
	    this._vDecoder = undefined;
	    clearInterval(this._timer);
	    clearInterval(this._statistic);

	    this._stream.destroy();

	    this._demuxer.destroy();

	    clearInterval(this._stattimer);

	    this._logger.info('MediaCenterInternal', `MediaCenterInternal destroy`);
	  }

	  reset() {
	    this._logger.info('MediaCenterInternal', `work thiread reset, clear gop buffer & reset all Params`);

	    this._gop = [];
	    this._lastts = 0;
	    this._useSpliteBuffer = false;
	    this._spliteBuffer = undefined;
	    this._width = 0;
	    this._height = 0;
	    this._sampleRate = 0;
	    this._channels = 0;
	    this.samplesPerPacket = 0;

	    this._demuxer.reset();
	  }

	  handleTicket() {
	    if (this._gop.length < 1) {
	      return;
	    }

	    let avpacket = this._gop.shift();

	    if (avpacket.avtype === AVType.Video) {
	      this._vDecoder.decode(avpacket.payload, avpacket.iskeyframe ? 1 : 0, avpacket.timestamp);
	    } else {
	      this._aDecoder.decode(avpacket.payload, avpacket.timestamp);
	    }
	  }

	  setVideoCodec(vtype, extradata) {
	    this._vDecoder.setCodec(vtype, extradata);
	  }

	  decodeVideo(videodata, timestamp, keyframe) {
	    let avpacket = new AVPacket();
	    avpacket.avtype = AVType.Video;
	    avpacket.payload = videodata;
	    avpacket.timestamp = timestamp, avpacket.iskeyframe = keyframe;

	    if (keyframe && this._gop.length > 100000) {
	      let bf = false;
	      let i = 0;

	      for (; i < this._gop.length; i++) {
	        let avpacket = this._gop[i];

	        if (avpacket.avtype === AVType.Video && avpacket.iskeyframe) {
	          bf = true;
	          break;
	        }
	      }

	      if (bf) {
	        this._logger.warn('MediaCenterInternal', `packet buffer cache too much, drop ${this._gop.length - i} packet`);

	        this._gop = this._gop.slice(0, i - 1);
	      }
	    }

	    this._gop.push(avpacket);
	  }

	  setAudioCodec(atype, extradata) {
	    this._aDecoder.setCodec(atype, extradata);
	  }

	  decodeAudio(audiodata, timestamp) {
	    let avpacket = new AVPacket();
	    avpacket.avtype = AVType.Audio;
	    avpacket.payload = audiodata;
	    avpacket.timestamp = timestamp, this._gop.push(avpacket);
	  } //callback


	  videoInfo(vtype, width, height) {
	    this._width = width;
	    this._height = height;
	    postMessage({
	      cmd: WORKER_EVENT_TYPE.videoInfo,
	      vtype,
	      width,
	      height
	    });
	  }

	  yuvData(yuv, timestamp) {
	    if (timestamp - this._lastts > 10000000) {
	      this._logger.info('MediaCenterInternal', `yuvdata timestamp error ${timestamp} last ${this._lastts}`);

	      return;
	    }

	    this._lastts = timestamp;
	    let size = this._width * this._height * 3 / 2;
	    let out = Module.HEAPU8.subarray(yuv, yuv + size);
	    let data = Uint8Array.from(out);
	    this._yuvframerate++;
	    this._yuvbitrate += data.length;
	    postMessage({
	      cmd: WORKER_EVENT_TYPE.yuvData,
	      data,
	      width: this._width,
	      height: this._height,
	      timestamp
	    }, [data.buffer]);
	  }

	  audioInfo(atype, sampleRate, channels) {
	    this._sampleRate = sampleRate;
	    this._channels = channels;
	    this._samplesPerPacket = caculateSamplesPerPacket(sampleRate);
	    postMessage({
	      cmd: WORKER_EVENT_TYPE.audioInfo,
	      atype,
	      sampleRate,
	      channels,
	      samplesPerPacket: this._samplesPerPacket
	    });
	  }

	  pcmData(pcmDataArray, samples, timestamp) {
	    if (timestamp - this._lastts > 10000000) {
	      this._logger.info('MediaCenterInternal', `pcmData timestamp error ${timestamp} last ${this._lastts}`);

	      return;
	    }

	    this._lastts = timestamp;
	    let datas = [];
	    this._pcmframerate++;

	    for (let i = 0; i < this._channels; i++) {
	      var fp = Module.HEAPU32[(pcmDataArray >> 2) + i] >> 2;
	      datas.push(Float32Array.of(...Module.HEAPF32.subarray(fp, fp + samples)));
	      this._yuvbitrate += datas[i].length * 4;
	    }

	    if (!this._useSpliteBuffer) {
	      if (samples === this._samplesPerPacket) {
	        postMessage({
	          cmd: WORKER_EVENT_TYPE.pcmData,
	          datas,
	          timestamp
	        }, datas.map(x => x.buffer));
	        return;
	      }

	      this._spliteBuffer = new SpliteBuffer(this._sampleRate, this._channels, this._samplesPerPacket);
	      this._useSpliteBuffer = true;
	    }

	    this._spliteBuffer.addBuffer(datas, timestamp);

	    this._spliteBuffer.splite((buffers, ts) => {
	      postMessage({
	        cmd: WORKER_EVENT_TYPE.pcmData,
	        datas: buffers,
	        timestamp: ts
	      }, buffers.map(x => x.buffer));
	    });
	  }

	}

	Module.print = function (text) {
	  console.log(`wasm print msg: ${text}`);
	};

	Module.printErr = function (text) {
	  console.log(`wasm print error msg: ${text}`);
	};

	Module.postRun = function () {
	  console.log('avplayer: mediacenter worker start');
	  let mcinternal = undefined; //recv msg from main thread

	  self.onmessage = function (event) {
	    var msg = event.data;

	    switch (msg.cmd) {
	      case WORKER_SEND_TYPE.init:
	        {
	          mcinternal = new MediaCenterInternal(JSON.parse(msg.options));
	          postMessage({
	            cmd: WORKER_EVENT_TYPE.inited
	          });
	          break;
	        }

	      case WORKER_SEND_TYPE.destroy:
	        {
	          mcinternal.destroy();
	          mcinternal = undefined;
	          postMessage({
	            cmd: WORKER_EVENT_TYPE.destroyed
	          });
	          break;
	        }
	    }
	  }; // notify main thread after worker thread  init completely


	  postMessage({
	    cmd: WORKER_EVENT_TYPE.created
	  });
	};

}));
//# sourceMappingURL=worker.js.map
