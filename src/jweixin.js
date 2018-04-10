export default {
    G_SIGN_PACKAGE: null, //微信JSSDK接口的签名信息

    init: function (sign, callback, errorCallback) {
        if (typeof sign === 'function') {
            callback = sign;
            sign = null;
        } else {
            this.G_SIGN_PACKAGE = sign;
        }

        var allApiList = [
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'showMenuItems',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',

            //微信设备相关接口
            'getWXDeviceInfos',
            'openWXDeviceLib',
            'onScanWXDeviceResult',
            'onReceiveDataFromWXDevice',
            'onWXDeviceBluetoothStateChange',
            'onWXDeviceBindStateChange',
            'onWXDeviceStateChange',
            'sendDataToWXDevice',
            'startScanWXDevice',
            'stopScanWXDevice',
            'getWXDeviceTicket',
            'connectWXDevice',
            'disconnectWXDevice'
        ];

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
            errorCallback ? errorCallback(res) :
                alert("微信JSAPI验证失败：" + res.errMsg);
        });

        var _this = this;
        wx.ready(function () {
            callback && callback(_this);
        })
        return this;
    },
    //检测api是否可用
    checkJsApi: function (api_name, config) {
        wx.checkJsApi({
            jsApiList: [api_name],
            success: function (res) {
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
    invoke: function (api_name, config) {
        this.checkJsApi(api_name, {
            success: function () {
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
    share: function (config) {
        if (!this.G_SIGN_PACKAGE) return;
        this.invoke('showOptionMenu');
        config.imgUrl = this._getShareImgUrl(config);

        //分享到朋友圈
        this.invoke("onMenuShareTimeline", {
            title: config.title,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function () {
                config.success && config.success('onMenuShareTimeline');
            },
            cancel: function () {
                config.cancel && config.cancel('onMenuShareTimeline');
            },
            fail: config.fail
        })

        //分享给朋友
        this.invoke("onMenuShareAppMessage", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                config.success && config.success('onMenuShareAppMessage');
            },
            cancel: function () {
                config.cancel && config.cancel('onMenuShareAppMessage');
            },
            fail: config.fail
        })

        //分享到QQ
        this.invoke("onMenuShareQQ", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function () {
                config.success && config.success('onMenuShareQQ');
            },
            cancel: function () {
                config.cancel && config.cancel('onMenuShareQQ');
            },
            fail: config.fail
        })

        //分享到腾讯微博
        this.invoke("onMenuShareWeibo", {
            title: config.title,
            desc: config.desc,
            link: config.link,
            imgUrl: config.imgUrl,
            success: function () {
                config.success && config.success('onMenuShareWeibo');
            },
            cancel: function () {
                config.cancel && config.cancel('onMenuShareWeibo');
            },
            fail: config.fail
        })
    },
    _getShareImgUrl: function (config) {
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
}