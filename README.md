### 使用workers反代bangumi等动画rss站

将 your.workers.dev 换成自己的workers的地址.使用的时候，RSS地址位置填入 [https://your.workers.dev/https://mikanani.me/RSS/](https://your.workers.dev/https://mikanani.me/RSS/)…

部署教程参考：[https://blog.instartlove.com/archives/cf-workers](https://blog.instartlove.com/archives/cf-workers)


需要一个反向代理用于家里的一些服务，又苦于国内服务器需要备案，国外服务器价格、延迟感人，所以白嫖一波cloudflare。
延迟能接受，可以反代带端口的地址。

### 先上效果

![image-1670144941914](./image-1670144941914.png)

### 教程如下：

#### 打开workers点击创建服务

![image-1670145077013](./image-1670145077013.png)
![image-1670145157403](./image-1670145157403.png)

#### 点击快速编辑

![image-1670145209616](./image-1670145209616.png)

#### 编写入以下代码

```js
// 需要反代的地址const hostname = "http://xxxxxxx.xxx:xxx"function handleRequest(request) {    let url = new URL(request.url);    return fetch(new Request(hostname + url.pathname,request));}addEventListener("fetch", event => {  event.respondWith(handleRequest(event.request));})
```

#### 点击预览查看效果，没问题就点击`保存并部署`

![image-1670145417737](./image-1670145417737.png)

#### 返回服务面板点击`Custom Domains - 查看`

![image-1670145538078](./image-1670145538078.png)

#### 点击添加路由

![image-1670145592311](./image-1670145592311.png)

#### 按照提示填写，使用自己的域名访问

![image-1670145637780](./image-1670145637780.png)

#### 解析生效后即可使用域名访问
