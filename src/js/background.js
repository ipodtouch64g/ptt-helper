// Pass through PTT's wall!
var origin = "app://pcman";
chrome.webRequest.onBeforeSendHeaders.addListener(
    details => {
        const headers = details.requestHeaders;
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].name === "Origin") {
                headers[i].value = origin;
            }
        }
        return {
            requestHeaders: headers
        };
    }, {
        urls: ["wss://ws.ptt.cc/*"],
        types: ["xmlhttprequest", "websocket"]
    },
    ["requestHeaders", "blocking", "extraHeaders"]
);

// set account on first install
chrome.runtime.onInstalled.addListener(function (object) {
    if (chrome.runtime.OnInstalledReason.INSTALL === object.reason) {
        chrome.tabs.create({url:chrome.extension.getURL("login.html")});
    }
});