## 微信接口封装

```javascript
// 引入
import { wxInject, isWeixin, wxInvoke } from "tf-weixin";

// 判断是否微信
alert(isWeixin);

// 一般在刚进入页面的时候，注入微信相关sign信息
wxInject("url", { appId: "xxxx", secret: "yyyy" });

// 一般在点击某个按钮，调用微信相关接口
document.body.addEventListener("click", function() {
    wxInvoke("scanQRCode")
        .then(data => {
            console.log(data);
        })
        .catch(e => {
            console.log(e);
        });
});
```
