import EventEmitter from "eventemitter3";
import sleep from "sleep-promise";
import config from "./config";
import Terminal from "terminal.js";
import Socket from "./socket";
import {
	decode
} from "./utils/decode"
import encode from "./utils/encode";
import key from "./utils/keymap";
import {
	getWidth,
	indexOfWidth,
	substrWidth
} from "./utils/char";
import Article from "./model/article";
import displayError from "./utils/displayError"

class Bot extends EventEmitter {

	constructor(states, comment) {
		super();
		this.states = states;
		this.config = config;
		this.comment = comment;
		this.forwardEvents = ["message", "error"];
		this.init();
	}

	get line() {
		const lines = [];
		for (let i = 0; i < this.term.state.rows; i++) {
			const {
				str,
				attr
			} = this.term.state.getLine(i);
			lines.push({
				str,
				attr: Object.assign({}, attr)
			});
		}
		return lines;
	}

	get screen() {
		return this.line.map(line => line.str).join("\n");
	}

	async init() {
		this.term = new Terminal(config.terminal);
		this.term.state.setMode("stringWidth", "dbcs");
		this.currentCharset = "big5";

		switch (config.protocol.toLowerCase()) {
			case "websocket":
			case "ws":
			case "wss":
				break;
			case "telnet":
			case "ssh":
			default:
				throw new Error(`Invalid protocol: ${config.protocol}`);
		}

		const socket = new Socket(config);
		socket.connect();

		// wow wtf.
		this.forwardEvents.forEach(e => {
			socket.on(e, this.emit.bind(this, e));
		});

		socket
			.on("connect", (...args) => {
				this.states.connect = true;
				// 這個 this 是 bot
				this.emit("connect", ...args);
			})
			.on("disconnect", (closeEvent, ...args) => {
				this.states.connect = false;
				this.emit("disconnect", closeEvent, ...args);
			})
			.on("message", data => {
				if (
					this.currentCharset !== this.config.charset &&
					!this.states.login &&
					decode(data, "utf8").includes("登入中，請稍候...")
				) {
					this.currentCharset = this.config.charset;
				}
				const msg = decode(data, this.currentCharset);
				this.term.write(msg);
				this.emit("redraw", this.term.toString());
			})
			.on("error", (err) => {
				console.log(err);
			});

		this.socket = socket;

		// When comment wants to send comment, tell bot to sent by emitting "sendComment". 
		this.comment.on("sendComment", (res) => {
			this.comment.setSendingResponse();
			this.sendComment(res).then((r) => {
				console.log('comment sent')
			}).catch((err)=>{
				console.log(err);
				displayError(err);
			})
		})
	}

	async getContent() {
		const lines = [];

		lines.push(this.line[0]);

		let sentPgDown = false;
		while (
			!this.line[23].str.includes("100%") &&
			!this.line[23].str.includes("此文章無內容")
		) {
			for (let i = 1; i < 23; i++) {
				lines.push(this.line[i]);
			}
			await this.send(key.PgDown);
			sentPgDown = true;
		}

		const lastLine = lines[lines.length - 1];
		for (let i = 0; i < 23; i++) {
			if (this.line[i].str === lastLine.str) {
				for (let j = i + 1; j < 23; j++) {
					lines.push(this.line[j]);
				}
				break;
			}
		}

		while (lines.length > 0 && lines[lines.length - 1].str === "") {
			lines.pop();
		}

		// go back to article top.
		if (sentPgDown) {
			await this.send(key.Home);
		}
		return lines;
	}

	send(msg) {
		if (this.config.preventIdleTimeout) {
			this.preventIdle(this.config.preventIdleTimeout);
		}
		return new Promise((resolve, reject) => {
			let autoResolveHandler;
			const cb = (message) => {
				clearTimeout(autoResolveHandler);
				resolve(true);
			};
			if (this.states.connect) {
				if (msg.length > 0) {
					this.socket.send(encode(msg, this.currentCharset));
					this.once("message", cb);
					autoResolveHandler = setTimeout(() => {
						this.removeListener("message", cb);
						resolve(false);
					}, this.config.timeout * 10);
				} else {
					console.info(`Sending message with 0-length. Skipped.`);
					resolve(true);
				}
			} else {
				reject();
			}
		});
	}

	preventIdle(timeout) {
		clearTimeout(this.preventIdleHandler);
		if (this.states.login) {
			this.preventIdleHandler = setTimeout(async () => {
				await this.send(key.CtrlU);
				await this.send(key.ArrowLeft);
			}, timeout * 1000);
		}
	}

	async login() {
		if (this.states.login) {
			return;
		}
		this.states.username = this.states.username.replace(/,/g, "");
		if (this.config.charset === "utf8") {
			this.states.username += ",";
		}
		await this.send(`${this.states.username}${key.Enter}${this.states.password}${key.Enter}`);

		let ret = await this.checkLogin(true);
		if (ret) {
			this.states.login = true;
			this.states.currentPage = "index";
			console.log(this.screen);
		}
		return ret;
	}

	async logout() {
		if (!this.states.login) {
			return;
		}
		await this.send(`G${key.Enter}Y${key.Enter}`);
		this.states.login = false;
		this.emit("loggedout");
		this.send(key.Enter);
		console.log(this.screen);
		return true;
	}

	async checkLogin(kick) {

		if (this.line[21].str.includes("密碼不對或無此帳號")) {
			this.emit("login.failed");
			return Promise.reject("密碼不對或無此帳號");
		} else if (this.line[23].str.includes("請稍後再試")) {
			this.emit("login.failed");
			return Promise.reject("請稍後再試");
		} else {
			let state = 0;
			while (true) {
				await sleep(400);
				const lines = this.line;
				if (lines[22].str.includes("登入中，請稍候...")) {
					/* no-op */
				} else if (
					lines[22].str.includes("您想刪除其他重複登入的連線嗎")
				) {
					if (state === 1) continue;
					await this.send(`${kick ? "y" : "n"}${key.Enter}`);
					state = 1;
					continue;
				} else if (
					lines[23].str.includes("請勿頻繁登入以免造成系統過度負荷")
				) {
					if (state === 2) continue;
					await this.send(`${key.Enter}`);
					state = 2;
				} else if (
					lines[23].str.includes("您要刪除以上錯誤嘗試的記錄嗎")
				) {
					if (state === 3) continue;
					await this.send(`y${key.Enter}`);
					state = 3;
				} else if (lines[23].str.includes("按任意鍵繼續")) {
					await this.send(`${key.Enter}`);
				} else if (
					(lines[22].str + lines[23].str)
					.toLowerCase()
					.includes("y/n")
				) {
					console.info(`Unknown login state: \n${this.screen}`);
					await this.send(`y${key.Enter}`);
				} else if (lines[23].str.includes("我是")) {
					break;
				} else {
					console.info(`Unknown login state: \n${this.screen}`);
				}
			}
			return true;
		}
	}
	get currentBoardname() {
		const boardRe = /【(?!看板列表).*】.*《(?<boardname>.*)》/;
		const match = boardRe.exec(this.line[0].str);
		if (match) {
			return match.groups.boardname;
		} else {
			return void 0;
		}
	}

	async enterBoardByName(boardname) {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}
		await this.send(`s${boardname}${key.Enter} ${key.Home}${key.End}`);
		console.log(this.screen);
		if (this.currentBoardname.toLowerCase() === boardname.toLowerCase()) {
			this.states.currentPage = "board";
			return true;
		} else {
			// await this.enterIndex();
			return Promise.reject('cannot enter board');
		}
	}

	// From board enter article with AID
	async enterArticleByAIDFromBoard(AID) {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}
		const query = `#${AID}${key.Enter}`
		const res = await this.send(query);
		if (!res) {
			await this.send(`${key.Enter}`);
			return Promise.reject(`cannot find article of AID : ${AID}`)
		};
		await this.send(`${key.ArrowRight}`);
		this.states.currentPage = "article";
		console.log(this.screen);
		return true;
	}

	// Enter board and enter article with AID
	async enterArticleByAID(boardname, AID) {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}
		try {
			await this.enterBoardByName(boardname);
			await this.enterArticleByAIDFromBoard(AID);
			this.states.currentPage = "article";
			this.article = new Article(this);
			return true;
		} catch (err) {
			return Promise.reject(err);
		}
	}

	// display article content by AID
	async displayArticleByAID(boardname, AID) {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}
		try {
			let enterArticle = await this.enterArticleByAID(boardname, AID);
			return true;
		} catch(err) {
			return Promise.reject(err);
		}		
	}

	async enterIndex() {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}
		await this.send(`${key.ArrowLeft.repeat(10)}`);
		this.states.currentPage = "index";
		return true;
	}

	// send comment in article
	//  res = {
	// 		"mode" : "1" or "2" or "3"
	//  	"text" : "hello!"
	// }
	// Todo : add a lot of checking...
	async sendComment(res) {
		if (!this.states.login) {
			return Promise.reject('you have not logged in');
		}

		if (!this.states.currentPage === "article") {
			return Promise.reject('you are not at article');
		}

		if (!res || !res.text.length) {
			return Promise.reject('no response indicated');
		}
		console.log('X!')
		await this.send("X");

		// If this is your article, you can only comment in mode 3(->).
		// Also if you send too many in short period of time, system will force you to use mode 3.
		if (!this.line[22].str.includes("使用 → 加註方式")) {
			console.log(`mode ${res.mode}`)
			await this.send(`${res.mode}`);
		}

		console.log(`${res.text}`)
		await this.send(`${res.text}${key.Enter}y${key.Enter}`);

		// go back to article again.
		await this.enterIndex();
		await this.displayArticleByAID(...this.states.board_AID);
		this.comment.clear();
		// this.states.currentPage = "board";
		return true;
	}

	// async enterByOffset(offsets) {
	// 	let result = true;
	// 	offsets.forEach(async offset => {
	// 		if (offset === 0) {
	// 			result = false;
	// 		}
	// 		if (offset < 0) {
	// 			for (let i = 22; i >= 3; i--) {
	// 				let lastOffset = substrWidth(
	// 					"dbcs",
	// 					this.line[i].str,
	// 					3,
	// 					4
	// 				).trim();
	// 				if (lastOffset.length > 0) {
	// 					offset += +lastOffset + 1;
	// 					break;
	// 				}
	// 				lastOffset = substrWidth(
	// 					"dbcs",
	// 					this.line[i].str,
	// 					15,
	// 					2
	// 				).trim();
	// 				if (lastOffset.length > 0) {
	// 					offset += +lastOffset + 1;
	// 					break;
	// 				}
	// 			}
	// 		}
	// 		if (offset < 0) {
	// 			result = false;
	// 		}
	// 		if (!result) {
	// 			return;
	// 		}
	// 		await this.send(
	// 			`${offset}${key.Enter.repeat(2)} ${key.Home}${key.End}`
	// 		);
	// 	});

	// 	if (result) {
	// 		this._state.position.boardname = this.currentBoardname;
	// 		this.emit("stateChange", this.state);
	// 		await this.send(key.Home);
	// 		return true;
	// 	} else {
	// 		await this.enterIndex();
	// 		return false;
	// 	}
	// }


	// async enterBoardByOffset(offsets) {
	// 	await this.send(`C${key.Enter}`);
	// 	return await this.enterByOffset(offsets);
	// }
}

export default Bot;