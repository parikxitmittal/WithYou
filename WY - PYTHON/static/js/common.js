function showError(message) {
    let errorDiv = document.querySelector(".errorDiv");
    let errorSvg = document.querySelectorAll(".errorSvg");
    errorDiv.style.maxHeight = "50px";
    for (let i = 0; i < errorSvg.length; i++) {
        errorSvg[i].style.stroke = "rgb(255,0,0)";
    }
    errorDiv.querySelector(".errorDivMessage").innerHTML = message;
}