import Jweixin from "./jweixin";
import "whatwg-fetch";
import { localS } from "tf-store";

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
    var count = parseInt(localS.getItem(wxRequestSignCount) || 0, 10);
    localS.setItem(wxRequestSignCount, ++count);
    console.log(`请求了微信sign接口：${count} 次`);

    return fetch(url, {
        body: Object.assign(
            {
                appId: "xxxxxxx",
                secret: "yyyyyy",
                url: location.href.split("#")[0]
            },
            signCfg
        )
    }).then(data => {
        if (data && data.data) {
            localS.setItem(wxSignExpireName, +new Date());
            localS.setItem(wxGSIGNPACKAGE, data.data);
            Jweixin.init(data.data);
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
        lastTime = parseInt(localS.getItem(wxSignExpireName) || 0, 10), // 上一次请求sign成功的时间
        isExpire = curTime - lastTime > wxSignExpireTime, // 是否到了wxSignExpireTime的过期时间
        repeatTime = parseInt(localS.getItem(wxSignPreventRepeatName) || 0, 10), // 上一次请求的时间，防止在触发的连续多次请求
        isNotRepeat = curTime - repeatTime > wxSignPreventRepeatTime;

    if (isExpire && isNotRepeat) {
        // console.log('wxInject 注入');

        localS.setItem(wxSignPreventRepeatName, curTime);
        wxRequestSign(url, signCfg);
    }
}

/**
 * 调用微信接口
 * @param  {String} name   接口名称
 * @param  {Object} config 配置项，一般用Promise回调，不用该参数
 * @return {Promise}       Promise回调
 */
function wxInvoke(name, config = {}) {
    Jweixin.G_SIGN_PACKAGE =
        Jweixin.G_SIGN_PACKAGE || localS.getItem(wxGSIGNPACKAGE);

    // console.log(Jweixin.G_SIGN_PACKAGE)

    var count = 0,
        success = config.success;
    delete config.success;
    delete config.fail;

    var fun = function() {
        return new Promise((resolve, reject) => {
            Jweixin.invoke(
                name,
                Object.assign(
                    {
                        success: function(res) {
                            success && success.call(this, res);
                            resolve(res);
                        },
                        fail: function(e) {
                            // throw new Error(e.errMsg)
                            // 防止失效
                            if (count === 0) {
                                count++;
                                wxRequestSign().then(() => fun());
                            } else {
                                reject(e);
                            }
                        }
                    },
                    config
                )
            );
        });
    };

    // 防止失败
    if (!Jweixin.G_SIGN_PACKAGE) {
        return wxRequestSign().then(() => fun());
    }

    return fun();
}

export { isWeixin, wxInject, wxInvoke };
