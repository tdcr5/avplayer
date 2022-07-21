(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('path'), require('fs')) :
	typeof define === 'function' && define.amd ? define(['path', 'fs'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.path, global.fs));
})(this, (function (path, fs) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
	var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var decoder_android_simd = createCommonjsModule(function (module) {
	  var Module = typeof Module != "undefined" ? Module : {};
	  var moduleOverrides = Object.assign({}, Module);

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
	      process["argv"][1].replace(/\\/g, "/");
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
	  if (Module["arguments"]) ;
	  if (Module["thisProgram"]) ;
	  if (Module["quit"]) ;
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
	  wasmBinaryFile = "decoder_android_simd.wasm";

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
	      wasmMemory = Module["asm"]["v"];
	      updateGlobalBufferAndViews(wasmMemory.buffer);
	      wasmTable = Module["asm"]["x"];
	      addOnInit(Module["asm"]["w"]);
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

	  function callRuntimeCallbacks(callbacks) {
	    while (callbacks.length > 0) {
	      var callback = callbacks.shift();

	      if (typeof callback == "function") {
	        callback(Module);
	        continue;
	      }

	      var func = callback.func;

	      if (typeof func == "number") {
	        if (callback.arg === undefined) {
	          getWasmTableEntry(func)();
	        } else {
	          getWasmTableEntry(func)(callback.arg);
	        }
	      } else {
	        func(callback.arg === undefined ? null : callback.arg);
	      }
	    }
	  }

	  function getWasmTableEntry(funcPtr) {
	    return wasmTable.get(funcPtr);
	  }

	  function ___assert_fail(condition, filename, line, func) {
	    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
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
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
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
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
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
	      throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
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
	    return this["fromWireType"](HEAPU32[pointer >> 2]);
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

	  function _embind_repr(v) {
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
	        var str;

	        if (stdStringIsUTF8) {
	          var decodeStartPtr = value + 4;

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

	          str = a.join("");
	        }

	        _free(value);

	        return str;
	      },
	      "toWireType": function (destructors, value) {
	        if (value instanceof ArrayBuffer) {
	          value = new Uint8Array(value);
	        }

	        var getLength;
	        var valueIsOfTypeString = typeof value == "string";

	        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
	          throwBindingError("Cannot pass non-string to std::string");
	        }

	        if (stdStringIsUTF8 && valueIsOfTypeString) {
	          getLength = () => lengthBytesUTF8(value);
	        } else {
	          getLength = () => value.length;
	        }

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

	                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
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

	  function abortOnCannotGrowMemory(requestedSize) {
	    abort("OOM");
	  }

	  function _emscripten_resize_heap(requestedSize) {
	    HEAPU8.length;
	    abortOnCannotGrowMemory();
	  }

	  var printCharBuffers = [null, [], []];

	  function printChar(stream, curr) {
	    var buffer = printCharBuffers[stream];

	    if (curr === 0 || curr === 10) {
	      (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
	      buffer.length = 0;
	    } else {
	      buffer.push(curr);
	    }
	  }

	  function _fd_write(fd, iov, iovcnt, pnum) {
	    var num = 0;

	    for (var i = 0; i < iovcnt; i++) {
	      var ptr = HEAPU32[iov >> 2];
	      var len = HEAPU32[iov + 4 >> 2];
	      iov += 8;

	      for (var j = 0; j < len; j++) {
	        printChar(fd, HEAPU8[ptr + j]);
	      }

	      num += len;
	    }

	    HEAPU32[pnum >> 2] = num;
	    return 0;
	  }

	  function _setTempRet0(val) {
	  }

	  embind_init_charCodes();
	  BindingError = Module["BindingError"] = extendError(Error, "BindingError");
	  InternalError = Module["InternalError"] = extendError(Error, "InternalError");
	  init_ClassHandle();
	  init_embind();
	  init_RegisteredPointer();
	  UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
	  init_emval();
	  var asmLibraryArg = {
	    "a": ___assert_fail,
	    "p": __embind_register_bigint,
	    "n": __embind_register_bool,
	    "m": __embind_register_class,
	    "g": __embind_register_class_constructor,
	    "d": __embind_register_class_function,
	    "t": __embind_register_emval,
	    "l": __embind_register_float,
	    "c": __embind_register_integer,
	    "b": __embind_register_memory_view,
	    "k": __embind_register_std_string,
	    "f": __embind_register_std_wstring,
	    "o": __embind_register_void,
	    "s": __emscripten_date_now,
	    "i": __emval_call_void_method,
	    "u": __emval_decref,
	    "h": __emval_get_method_caller,
	    "e": _abort,
	    "r": _emscripten_resize_heap,
	    "j": _fd_write,
	    "q": _setTempRet0
	  };
	  createWasm();

	  Module["___wasm_call_ctors"] = function () {
	    return (Module["___wasm_call_ctors"] = Module["asm"]["w"]).apply(null, arguments);
	  };

	  var _free = Module["_free"] = function () {
	    return (_free = Module["_free"] = Module["asm"]["y"]).apply(null, arguments);
	  };

	  var ___getTypeName = Module["___getTypeName"] = function () {
	    return (___getTypeName = Module["___getTypeName"] = Module["asm"]["z"]).apply(null, arguments);
	  };

	  Module["___embind_register_native_and_builtin_types"] = function () {
	    return (Module["___embind_register_native_and_builtin_types"] = Module["asm"]["A"]).apply(null, arguments);
	  };

	  var _malloc = Module["_malloc"] = function () {
	    return (_malloc = Module["_malloc"] = Module["asm"]["B"]).apply(null, arguments);
	  };

	  Module["dynCall_jiji"] = function () {
	    return (Module["dynCall_jiji"] = Module["asm"]["C"]).apply(null, arguments);
	  };

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
	                let obj = ParseSPSAndPPS(remain.slice(0, this._needlen));
	                this._sps = obj.sps;
	                this._pps = obj.pps;

	                this._player._logger.info('FlvDemux', `parse sps:${this._sps[0] & 0x1F} pps:${this._pps[0] & 0x1F}`); //avcseq


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
	                packet.payload = convertAVCCtoAnnexB(vframe);
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
	                packet.payload = convertAVCCtoAnnexB(vframe);
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

	function convertAVCCtoAnnexB(buffer) {
	  let offset = 0;
	  const tmp = new ArrayBuffer(4);
	  const dv = new DataView(tmp);

	  while (offset < buffer.length) {
	    dv.setUint8(0, buffer[offset + 3]);
	    dv.setUint8(1, buffer[offset + 2]);
	    dv.setUint8(2, buffer[offset + 1]);
	    dv.setUint8(3, buffer[offset]);
	    let nallen = dv.getUint32(0, true);
	    buffer[offset] = 0;
	    buffer[offset + 1] = 0;
	    buffer[offset + 2] = 0;
	    buffer[offset + 3] = 1;
	    offset += 4;
	    buffer[offset] & 0x1F; // console.log(`nal len ${nallen} type:${naltype}`)

	    offset += nallen;
	  }

	  if (offset != buffer.length) {
	    console.error(`parse nal error, offset:${offset} buflen:${buffer.length}`);
	  }

	  return buffer;
	}

	function ParseSPSAndPPS(videData) {
	  let avcSequenceHeader = new Uint8Array(videData.length - 5);
	  avcSequenceHeader.set(videData.slice(5));
	  const tmp = new ArrayBuffer(2);
	  const dv = new DataView(tmp);
	  let offset = 5;
	  avcSequenceHeader[offset] & 0x1F;
	  offset += 1;
	  dv.setInt8(0, avcSequenceHeader[offset + 1]);
	  dv.setInt8(1, avcSequenceHeader[offset]);
	  let spslen = dv.getUint16(0, true);
	  offset += 2;
	  let sps = avcSequenceHeader.slice(offset, offset + spslen);
	  offset += spslen;
	  avcSequenceHeader[offset];
	  offset += 1;
	  dv.setInt8(0, avcSequenceHeader[offset + 1]);
	  dv.setInt8(1, avcSequenceHeader[offset]);
	  let ppslen = dv.getUint16(0, true);
	  offset += 2;
	  let pps = avcSequenceHeader.slice(offset, offset + ppslen);
	  return {
	    sps,
	    pps
	  };
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

	    if (this._player._options._retryCnt >= 0 && this._retryCnt > this.this._player._options._retryCnt) {
	      this._player._logger.warn('FetchStream', `fetch url ${this._player._options.url} finish because reach retryCnt, Cnt ${this._retryCnt} optionsCnt ${this._player._options._retryCnt}`);

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

	//import Module from './decoder/decoder_ffmpeg'

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
	    this._vDecoder = new decoder_android_simd.VideoDecoder(this);
	    this._aDecoder = new decoder_android_simd.AudioDecoder(this);
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
	      return;
	    });

	    this._demuxer.on('videodata', packet => {
	      this._vframerate++;
	      this._vbitrate += packet.payload.length;
	      this.decodeVideo(packet.payload, packet.timestamp, packet.iskeyframe);
	    });

	    this._demuxer.on('audiodata', packet => {
	      return;
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
	      this._vDecoder.decode(avpacket.payload, avpacket.timestamp);
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

	    if (keyframe && this._gop.length > 80) {
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
	    let out = decoder_android_simd.HEAPU8.subarray(yuv, yuv + size);
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
	      var fp = decoder_android_simd.HEAPU32[(pcmDataArray >> 2) + i] >> 2;
	      datas.push(Float32Array.of(...decoder_android_simd.HEAPF32.subarray(fp, fp + samples)));
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

	decoder_android_simd.print = function (text) {
	  console.log(`wasm print msg: ${text}`);
	};

	decoder_android_simd.printErr = function (text) {
	  console.log(`wasm print error msg: ${text}`);
	};

	decoder_android_simd.postRun = function () {
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
//# sourceMappingURL=decoder.js.map
