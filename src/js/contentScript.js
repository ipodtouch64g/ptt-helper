import {
    URL2AID
} from './utils/decode'
import Comment from './comment.js'
import Bot from './bot.js';
import {
    getAccountInfo
} from './utils/localStorage';
import displayError from './utils/displayError';

// Todo : Put globalState in a seperate js file.
let states = {
    "login": false,
    "currentPage": null,
    "board_AID": null,
    "username": "",
    "password": ""
};

states.board_AID = URL2AID(window.location.toString());

Main(states);

async function Main(states) {
    if (states.board_AID.length == 2) {
        try {
            let res = await getAccountInfo();
            states.username = res.acc.name;
            states.password = res.acc.pw;

            let comment = new Comment(states);
            let ptt = new Bot(states, comment);

            ptt.once('connect', async () => {
                // How do I do error handling correctly???
                try {
                    await ptt.login();
                    await ptt.displayArticleByAID(...states.board_AID);
                    ptt.comment.setupResponse();
                } catch (err) {
                    console.log(err)
                    displayError(err);
                }
            });
        } catch (err) {
            console.log(err)
            displayError(err);
        }
    } else {
        console.log("now !at ptt!!!");
        return;
    }
}