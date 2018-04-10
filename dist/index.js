(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Weixin"] = factory();
	else
		root["Weixin"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.wxInvoke = exports.wxInject = exports.isWeixin = undefined;

var _jweixin = __webpack_require__(1);

var _jweixin2 = _interopRequireDefault(_jweixin);

__webpack_require__(2);

var _tfStore = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------微信-------------------------
var wxSignExpireName = "ISWXSIGNATUREEXPIRE";
var wxSignExpireTime = 6500 * 1000; // 过期时间，貌似不是7200秒

var wxSignPreventRepeatName = "WXSIGNPREVENTREPEAT";
var wxSignPreventRepeatTime = 10 * 1000;

var wxRequestSignCount = "WXREQUESTSIGNCOUNT"; // 记录请求sign的次数
var wxGSIGNPACKAGE = "WXGSIGNPACKAGE"; // 保存sign等信息

function weixin() {
    var wx = {
        isWeixin: false,
        version: -1
    },
        reg = /MicroMessenger\/([\d.]+)/i,
        match = navigator.userAgent.match(reg);

    if (match) {
        wx.isWeixin = true;
        wx.version = match[1];
    }

    return wx;
}

var isWeixin = weixin().isWeixin;
// export { isWeixin };

// 请求sign等信息
function wxRequestSign(url, signCfg) {
    var count = parseInt(_tfStore.localS.getItem(wxRequestSignCount) || 0, 10);
    _tfStore.localS.setItem(wxRequestSignCount, ++count);
    console.log("\u8BF7\u6C42\u4E86\u5FAE\u4FE1sign\u63A5\u53E3\uFF1A" + count + " \u6B21");

    return fetch(url, {
        body: Object.assign({
            appId: "xxxxxxx",
            secret: "yyyyyy",
            url: location.href.split("#")[0]
        }, signCfg)
    }).then(function (data) {
        if (data && data.data) {
            _tfStore.localS.setItem(wxSignExpireName, +new Date());
            _tfStore.localS.setItem(wxGSIGNPACKAGE, data.data);
            _jweixin2.default.init(data.data);
        }
    });
}

/**
 * 注入微信相关sign信息
 * @param  {String} url       请求后台接口地址
 * @param  {Object} signCfg   sign配置项，主要是appId，secret
 */
function wxInject(url, signCfg) {
    var curTime = +new Date(),
        lastTime = parseInt(_tfStore.localS.getItem(wxSignExpireName) || 0, 10),
        // 上一次请求sign成功的时间
    isExpire = curTime - lastTime > wxSignExpireTime,
        // 是否到了wxSignExpireTime的过期时间
    repeatTime = parseInt(_tfStore.localS.getItem(wxSignPreventRepeatName) || 0, 10),
        // 上一次请求的时间，防止在触发的连续多次请求
    isNotRepeat = curTime - repeatTime > wxSignPreventRepeatTime;

    if (isExpire && isNotRepeat) {
        // console.log('wxInject 注入');

        _tfStore.localS.setItem(wxSignPreventRepeatName, curTime);
        wxRequestSign(url, signCfg);
    }
}

/**
 * 调用微信接口
 * @param  {String} name   接口名称
 * @param  {Object} config 配置项，一般用Promise回调，不用该参数
 * @return {Promise}       Promise回调
 */
function wxInvoke(name) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _jweixin2.default.G_SIGN_PACKAGE = _jweixin2.default.G_SIGN_PACKAGE || _tfStore.localS.getItem(wxGSIGNPACKAGE);

    // console.log(Jweixin.G_SIGN_PACKAGE)

    var count = 0,
        _success = config.success;
    delete config.success;
    delete config.fail;

    var fun = function fun() {
        return new Promise(function (resolve, reject) {
            _jweixin2.default.invoke(name, Object.assign({
                success: function success(res) {
                    _success && _success.call(this, res);
                    resolve(res);
                },
                fail: function fail(e) {
                    // throw new Error(e.errMsg)
                    // 防止失效
                    if (count === 0) {
                        count++;
                        wxRequestSign().then(function () {
                            return fun();
                        });
                    } else {
                        reject(e);
                    }
                }
            }, config));
        });
    };

    // 防止失败
    if (!_jweixin2.default.G_SIGN_PACKAGE) {
        return wxRequestSign().then(function () {
            return fun();
        });
    }

    return fun();
}

exports.isWeixin = isWeixin;
exports.wxInject = wxInject;
exports.wxInvoke = wxInvoke;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    G_SIGN_PACKAGE: null, //微信JSSDK接口的签名信息

    init: function init(sign, callback, errorCallback) {
        if (typeof sign === 'function') {
            callback = sign;
            sign = null;
        } else {
            this.G_SIGN_PACKAGE = sign;
        }

        var allApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode',

        //微信设备相关接口
        'getWXDeviceInfos', 'openWXDeviceLib', 'onScanWXDeviceResult', 'onReceiveDataFromWXDevice', 'onWXDeviceBluetoothStateChange', 'onWXDeviceBindStateChange', 'onWXDeviceStateChange', 'sendDataToWXDevice', 'startScanWXDevice', 'stopScanWXDevice', 'getWXDeviceTicket', 'connectWXDevice', 'disconnectWXDevice'];

        //通过config接口注入权限验证配置
        wx.config({
            debug: false, //调试模式
            appId: this.G_SIGN_PACKAGE["appId"],
            timestamp: this.G_SIGN_PACKAGE["timestamp"],
            nonceStr: this.G_SIGN_PACKAGE["nonceStr"],
            signature: this.G_SIGN_PACKAGE["signature"],
            jsApiList: allApiList
        });

        //config信息验证失败会执行error函数
        wx.error(function (res) {
            errorCallback ? errorCallback(res) : alert("微信JSAPI验证失败：" + res.errMsg);
        });

        var _this = this;
        wx.ready(function () {
            callback && callback(_this);
        });
        return this;
    },
    //检测api是否可用
    checkJsApi: function checkJsApi(api_name, config) {
        wx.checkJsApi({
            jsApiList: [api_name],
            success: function success(res) {
                //以键值对的形式返回，可用的api值true，不可用为false
                //如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                if (res.errMsg = "checkJsApi:ok") {
                    var chkResult = res.checkResult;
                    if (chkResult[api_name] === true) {
                        config.success && config.success();
                    } else {
                        alert("接口" + api_name + "不支持，请检查接口名称或升级微信到最新版本");
                    }
                } else {
                    alert(res.errMsg);
                }
            },
            fail: config.fail
        });
    },
    /**
     * 调用微信js api
     * @param string api_name api名称
     * @param object config 微信接口的配置对象
     * @returns {undefined}
     */
    invoke: function invoke(api_name, config) {
        this.checkJsApi(api_name, {
            success: function success() {
                config = config || {};
                config.title = config.title || document.title;
                config.fail = config.fail || function (res) {
                    alert("调用微信接口失败：" + JSON.stringify(res));
                };
                wx[api_name](config);
            },
            fail: config.fail
        });
    },
    //分享接口
    share: function share(config) {
        if (!this.G_SIGN_PACKAGE) return;
        this.invoke('showOptionMenu');
        config.imgUrl = this._getShareImgUrl(config);

        //分享到朋友圈
        this.invoke("onMenuShareTimeline", {
            title: config.title,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function success() {
                config.success && config.success('onMenuShareTimeline');
            },
            cancel: function cancel() {
                config.cancel && config.cancel('onMenuShareTimeline');
            },
            fail: config.fail
        });

        //分享给朋友
        this.invoke("onMenuShareAppMessage", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function success() {
                config.success && config.success('onMenuShareAppMessage');
            },
            cancel: function cancel() {
                config.cancel && config.cancel('onMenuShareAppMessage');
            },
            fail: config.fail
        });

        //分享到QQ
        this.invoke("onMenuShareQQ", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function success() {
                config.success && config.success('onMenuShareQQ');
            },
            cancel: function cancel() {
                config.cancel && config.cancel('onMenuShareQQ');
            },
            fail: config.fail
        });

        //分享到腾讯微博
        this.invoke("onMenuShareWeibo", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function success() {
                config.success && config.success('onMenuShareWeibo');
            },
            cancel: function cancel() {
                config.cancel && config.cancel('onMenuShareWeibo');
            },
            fail: config.fail
        });
    },
    _getShareImgUrl: function _getShareImgUrl(config) {
        var shareImg = '';

        if (config.imgUrl) {
            shareImg = config.imgUrl;
        } else {
            shareImg = document.getElementsByTagName('img')[0].src;
            if (!shareImg) return '';
        }

        if (shareImg.match("http\\:") == null) {
            if (shareImg.match("\\.\\.") != null) {
                shareImg = shareImg.replace("..", location.origin + "/");
            } else {
                shareImg = location.origin + "/" + shareImg;
            }
        }

        return shareImg;
    }
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Store=t():e.Store=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";function r(e){if(!e||"string"!=typeof e)return e;e=e.trim();try{e=JSON.parse(e)}catch(t){e=new Function("return "+e)()}return e}Object.defineProperty(t,"__esModule",{value:!0}),t.cookieS=t.sessionS=t.nameS=t.localS=t.checkStorage=t.isLocalAble=t.isSessionAble=void 0;var o,i,u=n(1),s=n(2),c=function(e){return e&&e.__esModule?e:{default:e}}(s),l=function(e){var t,n="CHECK_STOARGE_TEST";try{return e.setItem(n,1),t=e.getItem(n),e.removeItem(n),1==t}catch(e){return!1}};try{t.isSessionAble=o=l(sessionStorage),t.isLocalAble=i=l(localStorage)}catch(e){t.isSessionAble=o=!1,t.isLocalAble=i=!1}var a={_flush:function(e){e&&(window.name=JSON.stringify(e))},getAll:function(){try{return this.data=r(window.name||"{}")}catch(e){return this.data={}}},setItem:function(e,t){var n=this.data||this.getAll();(0,u.isObject)(n)||(n={}),n[e]=t,this._flush(n)},getItem:function(e){var t=this.data||this.getAll();if((0,u.isObject)(t))return t[e]},removeItem:function(e){var t=this.data||this.getAll();(0,u.isObject)(t)&&(delete t[e],this._flush(t))}},f=function(e,t){e=e||"session",t=t||"STORAGE_NAMESPACE";var n,s,l,f=0,d={local:function(e){return i?[r(localStorage.getItem(e)||"{}"),localStorage]:[r(c.default.getItem(e)||"{}"),c.default]},session:function(e){return o?[r(sessionStorage.getItem(e)||"{}"),sessionStorage]:this.name(e)},name:function(e){return[r(a.getItem(e)||"{}"),a]},storage:function(e){return i?[r(localStorage.getItem(e)||"{}"),localStorage]:this.session(e)},cookie:function(e){return[r(c.default.getItem(e)||"{}"),c.default]}};n=d[e](t),l=n[0],s=n[1];var m=function(e,t){f=40,l[e]={v:t,t:+new Date},y()},p=function(e){var t=l[e],n=t&&t.v;return(0,u.isObject)(n)?Object.assign({},n):(0,u.isArray)(n)?Object.assign([],n):n},g=function(e){f=40,delete l[e],y()},b=function(e){e=e||[];var t,n={};(0,u.isString)(e)&&(e=e.split(",")),e.forEach(function(e){(t=l[e])&&(n[e]=t)}),l=n,y()},h=function(e){return e?Object.assign({},l):l},y=function e(){var n;try{n=JSON.stringify(l)}catch(e){throw console.log("JSON.stringify转化出错",l),new Error(e.message)}try{s.setItem(t,n)}catch(t){if(!(--f>=0))throw new Error("写入存储报错");S(),e()}},S=function(){var e,t,n,r=+new Date;for(var o in l)if(n=l[o],e){if(r-e.t>=864e5)return!1;e.t>n.t&&(e=n,t=o)}else e=n,t=o;e&&delete l[t]};return{clear:b,getAll:h,setItem:m,getItem:p,removeItem:g}},d=f("local"),m=f("cookie"),p=f("name"),g=f("session");t.isSessionAble=o,t.isLocalAble=i,t.checkStorage=l,t.localS=d,t.nameS=p,t.sessionS=g,t.cookieS=m},function(e,t,n){!function(t,n){e.exports=n()}("undefined"!=typeof self&&self,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";function r(e){return function(t){return Object.prototype.toString.call(t)==="[object "+e+"]"}}Object.defineProperty(t,"__esModule",{value:!0});var o=r("Object"),i=r("String"),u=Array.isArray||r("Array"),s=r("Function"),c=r("Number"),l=r("RegExp"),a=r("Date"),f=r("HTMLBodyElement"),d=r("Boolean");t.isType=r,t.isObject=o,t.isString=i,t.isArray=u,t.isFunction=s,t.isNumber=c,t.isRegExp=l,t.isDate=a,t.isElement=f,t.isBoolean=d}])})},function(e,t,n){!function(t,n){e.exports=n()}("undefined"!=typeof self&&self,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={setItem:function(e,t){var n=arguments[2],r=arguments[3],o=new Date;n?o.setTime(o.getTime()+1e3*n):o.setTime(o.getTime()+36e5),null==r&&(r=document.domain),e=e+"="+(null===t?"; ":encodeURIComponent(t)+"; "),document.cookie=e+"expires="+o.toUTCString()+"; path=/; domain="+r},getItem:function(e){if(0===document.cookie.length)return e?null:{};for(var t,n={},r=document.cookie.split("; "),o=0;o<r.length;o++){if(t=r[o].split("="),e&&t[0]==e)return decodeURIComponent(t[1]);n[t[0]]=decodeURIComponent(t[1])}return e?null:n},getAll:function(){return this.getItem()},removeItem:function(e){this.setItem(e,null,-1,arguments[1])},clear:function(){if(0!==document.cookie.length)for(var e,t=document.cookie.split("; "),n=0;n<t.length;n++)e=t[n].split("="),this.setItem(e[0],null,-1,arguments[0])}}}])})}])});

/***/ })
/******/ ]);
});