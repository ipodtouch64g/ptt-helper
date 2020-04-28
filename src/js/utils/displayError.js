// Display error at the bottom.
export default function displayError(err) {
    var mc = document.getElementById("main-container");
    var res = document.createElement("div");
    res.style.color = "red";
    res.textContent = err;
    mc.appendChild(res);
}