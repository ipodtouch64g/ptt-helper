import "../css/contentScript.css";
import EventEmitter from "eventemitter3";
import config from './config'

class Comment extends EventEmitter {
    constructor(states) {
        super();
        this.typing_state = 0;
        this.res = {
            "mode": 1,
            "text": ""
        };
        this.states = states;
    }

    clear() {
        this.ores.style.display = "";
        this.tres.style.display = "none";
        this.sres.style.display = "none";
        let t = document.getElementById("t");
        if(t) t.value = "";
        this.res = {
            "mode": 1,
            "text": ""
        };
        this.typing_state = 0;
    }

    setSendingResponse() {
        this.ores.style.display = "none";
        this.tres.style.display = "none";
        this.sres.style.display = "";
    }

    // called by bot when loggedin
    setupResponse() {
       
        var mc = document.getElementById("main-container");
        var body = document.body;

        // init
        this.ores = this.originalResponse();
        this.tres = this.typingResponse();
        this.sres = this.sendingResponse();
       
        this.clear();

        mc.appendChild(this.ores);
        mc.appendChild(this.tres);
        mc.appendChild(this.sres);

        body.addEventListener("keydown", e => {
            console.log(e.key);
            switch (this.typing_state) {
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
                        console.log(config);
                        document.getElementById("name").textContent = this.states.username + ": ";
                        this.typing_state = Number(e.key);
                        this.tres.style.display = "";
                        document.getElementById("t").focus();
                        this.ores.style.display = "none";
                    }
                    break;
                case 1:
                case 2:
                case 3:
                    if (e.keyCode == 13) {
                        this.res.text = document.getElementById("t").value;
                        this.res.mode = "" + this.typing_state;
                        console.log(`enter:${this.res}`);
                        if (this.res.text.length > 0) {
                            console.log('sendComment send by comment')
                            this.emit("sendComment",Object.assign({},this.res));
                        }
                        break;
                    } else if (e.keyCode == 27) {
                        this.clear();
                        console.log("escape!");
                        break;
                    }
                    default:
                        break;
            }
            console.log(this.typing_state);
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

    sendingResponse() {
        var d = document.createElement("span");
        d.textContent = "回應發送中...";
        d.style.color = "yellow";
        return d;
    }
}

export default Comment;