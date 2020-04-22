import URL2AID from './decode.js'
import Main from './main.js'

let name = "YOUR_ACCOUNT";
let pw = "YOUR_PASSWORD";

let board_AID = URL2AID(window.location.toString());

if (board_AID.length == 2) {
    let main = new Main(board_AID,name,pw);
    main.go();
    main.response();
} else {
    console.log("now !at ptt!!!");
}

