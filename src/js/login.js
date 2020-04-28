import '../css/login.css'
import {
    getAccountInfo
} from "./utils/localStorage"

const form = document.getElementById('myform');
const logout = document.getElementById('logout');

// entry point
window.onload = function () {
    getAccountInfo().then((res)=>{
        disableForm(res.acc.name);
    }).catch((err)=>{
        enableForm();
    })
}

function disableForm(name) {
    document.getElementById("loggedin").style.display = '';
    document.getElementById("logout").style.display = '';
    document.getElementById("myform").style.display = 'none';
    document.getElementById("yourname").textContent = name;
}

function enableForm() {
    document.getElementById("loggedin").style.display = 'none';
    document.getElementById("logout").style.display = 'none';
    document.getElementById("myform").style.display = '';
}



form.addEventListener('submit', (e) => {
    e.preventDefault();
    var name = form.username.value;
    var pw = form.password.value;
    var np = {
        'name': name,
        'pw': pw
    };
    console.log(name + ' ' + pw);

    chrome.storage.sync.set({
        "acc": np
    }, function () {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
            return;
        }
        disableForm(name);
    });
    return false;
});

// Just simply clean the storage.
logout.addEventListener('click', (e) => {
    chrome.storage.sync.clear((res) => {
        console.log(res);
        enableForm();
    })
});