/*
 * https://github.com/netnr/workers
 *
 * 2019-10-12 - 2022-05-05
 * netnr
 *
 * https://github.com/Rongronggg9/rsstt-img-relay
 *
 * 2021-09-13 - 2022-05-29
 * modified by Rongronggg9
 * 
 * 2023-4-21 
 * modified by papersman
 */

export default {
    async fetch(request, _env) {
        return await handleRequest(request);
    }
}

/**
 * Configurations
 */
const yourDomain = 'your.workers.dev';
const config = {
    // 是否丢弃请求中的 Referer，在目标网站应用防盗链时有用
    dropReferer: true,
};

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
    //请求头部、返回对象
    let reqHeaders = new Headers(request.headers),
        outBody, outStatus = 200, outStatusText = 'OK', outCt = null, outHeaders = new Headers({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": reqHeaders.get('Access-Control-Allow-Headers') || "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With, Token, x-access-token"
        });

    try {
        //取域名第一个斜杠后的所有信息为代理链接
        let url = request.url.substr(8);
        url = decodeURIComponent(url.substr(url.indexOf('/') + 1));

        //需要忽略的代理
        if (request.method == "OPTIONS" || url.length < 3 || url.indexOf('.') == -1 || url == "favicon.ico" || url == "robots.txt") {
            //输出提示
            const invalid = !(request.method == "OPTIONS" || url.length === 0)
            outBody = JSON.stringify({
                code: invalid ? 400 : 0,
                usage: 'https://'+yourDomain+'/https://mikanani.me/...',
                source: '将 your.workers.dev 换成自己的workers的地址.使用的时候, RSS地址位置填入 '+'https://'+yourDomain+'/https://mikanani.me/RSS/...'
            });
            outCt = "application/json";
            outStatus = invalid ? 400 : 200;
        } else {
            url = fixUrl(url);

            //构建 fetch 参数
            let fp = {
                method: request.method,
                headers: {}
            }
            // 发起 fetch
            let fr = (await fetch(url, fp));
            outCt = fr.headers.get('content-type');

            //保留头部其它信息
            const dropHeaders = ['content-length', 'content-type', 'host'];
            if (config.dropReferer) dropHeaders.push('referer');
            let he = reqHeaders.entries();
            for (let h of he) {
                const key = h[0], value = h[1];
                if (!dropHeaders.includes(key)) {
                    fp.headers[key] = value;
                }
            }
            if (config.dropReferer && url.includes('.sinaimg.cn/')) fp.headers['referer'] = 'https://weibo.com/';

            // 当访问mikanani.me/RSS的时候，将返回的xml中的mikanani.me替换
            if (url.includes('mikanani.me/RSS')) {
                const response = await fetch(url, fp);
                const text = await response.text();
                outBody = text.replace(/mikanani.me\/Download\//g, yourDomain+'/https://mikanani.me/Download/');
                outCt = response.headers.get('content-type');
                outStatus = response.status;
                outStatusText = response.statusText;
            } else if (url.includes('acg.rip/.xml')) {  //当访问acg.rip/.xml的时候，将返回的xml中的acg.rip/t/替换
                const response = await fetch(url, fp);
                const text = await response.text();
                outBody = text.replace(/acg.rip\/t\//g, yourDomain+'/https://acg.rip/t/');
                outCt = response.headers.get('content-type');
                outStatus = response.status;
                outStatusText = response.statusText;
            } else if (url.includes('bangumi.moe/rss')) {  //当访问bangumi.moe/rss的时候，将返回的xml中的bangumi.moe/download替换
                const response = await fetch(url, fp);
                const text = await response.text();
                outBody = text.replace(/bangumi.moe\/download\//g, yourDomain+'/https://bangumi.moe/download/');
                outCt = response.headers.get('content-type');
                outStatus = response.status;
                outStatusText = response.statusText;
            } else {
                outBody = fr.body;
                outStatus = fr.status;
                outStatusText = fr.statusText;
            };

            if (["POST", "PUT", "PATCH", "DELETE"].indexOf(request.method) >= 0) {
                const ct = (reqHeaders.get('content-type') || "").toLowerCase();
                fp.headers['content-type'] = ct
                if (ct.includes('application/json')) {
                    fp.body = JSON.stringify(await request.json());
                } else if (ct.includes('application/text') || ct.includes('text/html')) {
                    fp.body = await request.text();
                } else if (ct.includes('form')) {
                    fp.body = await request.formData();
                } else {
                    fp.body = await request.blob();
                }
            };
        }
    } catch (err) {
        outBody = err.stack;
        outCt = "text/plain;charset=UTF-8";
        outStatus = 500;
        outStatusText = "Internal Server Error";
    }

    //设置类型
    if (outCt && outCt != "") {
        outHeaders.set("content-type", outCt);
    }
    
    let response = new Response(outBody, {
        status: outStatus,
        statusText: outStatusText,
        headers: outHeaders
    })

    return response;
}

/**
 * Fix URL
 * @param {string} url 
 */
function fixUrl(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    } else {
        return 'https://' + url;
    }
}
