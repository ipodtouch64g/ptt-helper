function getAccountInfo() {
    return new Promise((resolve,reject)=>{
        chrome.storage.sync.get("acc", function (i) {
            console.log(i);
            return Object.keys(i).length === 0 ? reject('你尚未輸入帳號資訊') : resolve(i);
        })
    }) 
}

export {
    getAccountInfo
};