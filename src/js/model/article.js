import { keymap as key } from "../utils/keymap";
import { substrWidth } from "../utils/char";

export class Article {

	get content(){
		return this._content;
	}

	set content(content) {
		this._content = content.slice();
	}

	get data(){
		return this._content.map(content => content.str);
	}

	// Bot will new an article when the screen is at an article.
	constructor(bot) {
		this.bot = bot;
		// debug print content
		this.parseArticle().then((res)=>{
			console.log(this);
		})
		
	}

	static fromLine(line) {
		const article = new Article();
		const { str } = line;
		article.id = +substrWidth("dbcs", str, 1, 7).trim();
		article.push = substrWidth("dbcs", str, 9, 2).trim();
		article.date = substrWidth("dbcs", str, 11, 5).trim();
		article.author = substrWidth("dbcs", str, 17, 12).trim();
		article.status = substrWidth("dbcs", str, 30, 2).trim();
		article.title = substrWidth("dbcs", str, 32).trim();
		article.fixed = substrWidth("dbcs", str, 1, 7)
			.trim()
			.includes("★");
		return article;
	}

	hasHeader(){
		if (this.content.length === 0) {
			return false;
		}
		const authorArea = substrWidth(
			"dbcs",
			this.content[0].str,
			0,
			6
		).trim();
		return authorArea === "作者";
	}

	async parseArticle(){
		this.content = await this.bot.getContent();

		if (this.hasHeader()) {
			this.author = substrWidth(
				"dbcs",
				this.bot.line[0].str,
				7,
				50
			).trim();
			this.title = substrWidth("dbcs", this.bot.line[1].str, 7).trim();
			this.timestamp = substrWidth(
				"dbcs",
				this.bot.line[2].str,
				7
			).trim();
			this.authorNoNickname = this.author.split("(")[0].trim();
		}

		return true;
	}


}





// export class ArticleSelectQueryBuilder extends SelectQueryBuilder<Article> {
// 	private bot;
// 	private boardname = "";
// 	private wheres: ObjectLiteral[] = [];
// 	private id = 0;

// 	constructor(bot) {
// 		super();
// 		this.bot = bot;
// 	}

// 	where(type: WhereType, condition: any): this {
// 		switch (type) {
// 			case WhereType.Boardname:
// 				if (this.boardname !== "") {
// 					console.warn(
// 						`Cannot call where with type "${type}" multiple times`
// 					);
// 				} else {
// 					this.boardname = condition;
// 				}
// 				break;
// 			case WhereType.Id:
// 				this.id = +condition;
// 				break;
// 			case WhereType.Push:
// 				this.wheres.push({ type: "Z", condition });
// 				break;
// 			case WhereType.Author:
// 				this.wheres.push({ type: "a", condition });
// 				break;
// 			case WhereType.Title:
// 				this.wheres.push({ type: "/", condition });
// 				break;
// 			case WhereType.AId:
// 				this.wheres.push({ type: "#", condition });
// 				break;
// 			default:
// 				throw new Error(`Invalid type: ${type}`);
// 		}
// 		return this;
// 	}

// 	getQuery(): string {
// 		return this.wheres
// 			.map(({ type, condition }) => `${type}${condition}${key.Enter}`)
// 			.join();
// 	}

	

// 	async getOne(): Promise<Article | undefined> {
// 		await this.bot.enterBoardByName(this.boardname);
// 		const found = await this.bot.send(this.getQuery());
// 		if (!found) {
// 			return void 0;
// 		}
// 		/* TODO: validate id */
// 		await this.bot.send(`${this.id}${key.Enter}${key.Enter}`);

// 		const article = new Article();
// 		article.id = this.id;
// 		article.boardname = this.boardname;
// 		article.content = await this.bot.getContent();

// 		if (article.hasHeader()) {
// 			article.author = substrWidth(
// 				"dbcs",
// 				this.bot.line[0].str,
// 				7,
// 				50
// 			).trim();
// 			article.title = substrWidth("dbcs", this.bot.line[1].str, 7).trim();
// 			article.timestamp = substrWidth(
// 				"dbcs",
// 				this.bot.line[2].str,
// 				7
// 			).trim();
// 		}

// 		await this.bot.enterIndex();
// 		return article;
// 	}
// }

export default Article;
