import URL2AID from './decode.js'
import Main from './main.js'
require('dotenv').config();

let name = process.env.name;
let pw = process.env.pw;

let board_AID = URL2AID(window.location.toString());

if (board_AID.length == 2) {
    let main = new Main(board_AID,name,pw);
    main.go();
    main.response();
} else {
    console.log("now !at ptt!!!");
}

