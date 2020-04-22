import encode from "./encode.js";
import "../css/contentScript.css";

class Main {
    constructor(board_AID, name, pw) {
        this.socket = new WebSocket("wss://ws.ptt.cc/bbs");
        this.board_AID = board_AID;
        this.name = name;
        this.pw = pw;
    }
    socketReopen() {
        this.socket = new WebSocket("wss://ws.ptt.cc/bbs");
        this.go();
    }
    go() {
        let sk = this.socket;
        let n = this.name;
        let p = this.pw;
        let bid = this.board_AID;
        // Execute the step based on data from WSS.
        this.socket.onopen = function (e) {
            console.log("[open] Connection established");
        };
        this.socket.onmessage = function (event) {
            console.log(`[message] Data received from server: ${event.data}`);
            let myReader = new FileReader();
            myReader.onload = function (e) {
                console.log(e.target.result);
                var text = e.target.result;
                // 1. login
                if (text.includes("請輸入代號，或以 guest 參觀，或以 new 註冊:")) {
                    let t = `${n}\r${p}\r`;
                    sk.send(encode(t, "big5"));
                }
                // 2. press anykey to continue
                else if (text.includes("請按任意鍵繼續")) {
                    let t = `\r`;
                    sk.send(encode(t, "big5"));
                }
                // 2.5. deal with repetitive connection
                else if (text.includes("您想刪除其他重複登入的連線嗎？")) {
                    let t = `y\r`;
                    sk.send(encode(t, "big5"));
                }
                // 3. search board
                else if (text.includes("【 分組討論區 】")) {
                    sk.send(encode(`s`, "big5"));
                    sk.send(encode(bid[0], "big5"));
                    sk.send(encode(`\r`, "big5"));
                }
                // 4. search article
                else if (text.includes("文章選讀")) {
                    sk.send(encode(`#`, "utf8"));
                }
                // 5. search article input aid
                else if (text.includes("搜尋文章代碼(AID):")) {
                    sk.send(encode(bid[1], "big5"));
                    sk.send(encode(`\r`, "big5"));
                    sk.send(encode(`\x1b[C`, "big5"));
                }
            };
            myReader.readAsText(event.data, "big5");
        };
        this.socket.onclose = function (event) {
            if (event.wasClean) {
                console.log(
                    `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
                );
            } else {
                console.log("[close] Connection died");
            }
        };
        this.socket.onerror = function (error) {
            console.log(`[error] ${error.message}`);
        };
    }

    response() {
        function clear() {
            ores.style.display = "";
            tres.style.display = "none";
            document.getElementById("t").value = "";
            res = "";
            state = 0;
        }
        var mc = document.getElementById("main-container");
        var body = document.body;

        let state = 0;
        let res = "";

        // init
        let ores = this.originalResponse();
        let tres = this.typingResponse();
        tres.style.display = "none";

        mc.appendChild(ores);
        mc.appendChild(tres);

        body.addEventListener("keydown", e => {
            console.log(e.key);
            switch (state) {
                case 0:
                    if (e.key == 1 || e.key == 2 || e.key == 3) {
                        e.preventDefault();
                        let symbol = e.key == 1 ? "推" : e.key == 2 ? "噓" : "→";
                        document.getElementById("sym").textContent = symbol;
                        let attribute =
                            e.key == 1 ?
                            "hl push-tag" :
                            e.key == 2 ?
                            "f1 hl push-tag" :
                            "f1 hl push-tag";
                        sym.setAttribute("class", attribute);
                        document.getElementById("name").textContent = this.name + ": ";
                        state = Number(e.key);
                        tres.style.display = "";
                        document.getElementById("t").focus();
                        ores.style.display = "none";
                    }
                    break;
                case 1:
                case 2:
                case 3:
                    if (e.keyCode == 13) {
                        res = document.getElementById("t").value;
                        console.log(`enter:${res}`);
                        if (res.length > 0) {
                            // check if disconnected
                            while (this.socket.readyState != 1) {
                                console.log("reopen socket...");
                                this.socketReopen();
                            }
                            this.socket.send(encode("X", "big5"));
                            this.socket.send(encode(res, "big5"));
                            this.socket.send(encode("\r", "big5"));
                            this.socket.send(encode("y\r", "big5"));
                        }
                        clear();
                    } else if (e.keyCode == 27) {
                        clear();
                        console.log("escape!");
                    } else {
                        console.log("input morez");
                    }
                    break;
            }
            console.log(state);
        });
    }

    typingResponse() {
        var d = document.createElement("span");
        var sym = document.createElement("span");
        var name = document.createElement("span");
        var t = document.createElement("TEXTAREA");
        sym.setAttribute("id", "sym");
        name.setAttribute("class", "push-userid f3 hl");
        name.setAttribute("id", "name");
        t.setAttribute("class", "res_content");
        t.setAttribute("id", "t");
        d.appendChild(sym);
        d.appendChild(name);
        d.appendChild(t);
        return d;
    }

    originalResponse() {
        var res = document.createElement("div");
        var c1 = document.createTextNode("您覺得這篇文章 ");
        var c2 = document.createTextNode("1.值得推薦 ");
        var c3 = document.createTextNode("2.給它噓聲 ");
        var c4 = document.createTextNode("3.只加→註解 ");
        var s0 = document.createElement("span");
        s0.setAttribute("class", "f7 hl");
        var s1 = document.createElement("span");
        s1.setAttribute("class", "b0");
        s1.appendChild(c1);
        var s2 = document.createElement("span");
        s2.setAttribute("class", "f3 hl");
        s2.appendChild(c2);
        var s3 = document.createElement("span");
        s3.setAttribute("class", "f1 hl");
        s3.appendChild(c3);
        var s4 = document.createElement("span");
        s4.setAttribute("class", "b0");
        s4.appendChild(c4);
        s0.appendChild(s1);
        s0.appendChild(s2);
        s0.appendChild(s3);
        s0.appendChild(s4);
        res.appendChild(s0);
        return res;
    }
}

export default Main;