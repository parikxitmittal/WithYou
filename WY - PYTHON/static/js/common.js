function showError(message, number=null) {
    let errorDiv = document.querySelector(".errorDiv");
    if (number == null) {
        let errorSvg = document.querySelectorAll(".errorSvg");
        for (let i = 0; i < errorSvg.length; i++) {
            errorSvg[i].style.stroke = "rgb(255,0,0)";
        }
    }
    else {
        let errorSvg = document.querySelectorAll(".errorSvg");
        for (let i = 0; i < errorSvg.length; i++) {
            if (i == number) {
                errorSvg[i].style.stroke = "rgb(255,0,0)";
            }
            else {
                errorSvg[i].style.stroke = "#002855";
            }
        }
    }
    errorDiv.style.maxHeight = "50px";
    errorDiv.querySelector(".errorDivMessage").innerHTML = message;
}
