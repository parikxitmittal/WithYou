let socket = io.connect('http://127.0.0.1:5000/');
function loggedInButtonFunction() {
    let email = document.getElementById("li_email");
    let password = document.getElementById("li_password");
    if (email.value != '' && password.value != '') {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/loginInfo?e='+email.value+'&p='+password.value);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                let data = xhr.responseText;
                if (data == "1") {
                    window.location.replace("http://127.0.0.1:5000/");
                }
                else {
                    showError("Email address or passsword is incorrect. Please re-check them.");
                }
            }
            else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }
}

function signupProcess() {
    let name = document.getElementById("su_name");
    let username = document.getElementById("su_username");
    let email = document.getElementById("su_email");
    let password = document.getElementById("su_password");
    let fileImg = document.getElementById("su_img");
    let selectedImg = document.querySelector(".selectedImg");
    let img;

    if (name.value != '' && username.value != '' && email.value != '' && password.value != '') {  
        if (selectedImg != null) {
            img = selectedImg.src.slice(41);
            sendSocketData([email.value, password.value, username.value, name.value, img]);
        }
        else if (fileImg.value != "") {    
           	img = fileImg.value;
            document.getElementById("signupForm").submit();
        }
        else {
            img = 0;
            sendSocketData([email.value, password.value, username.value, name.value, img]);
        }
    }
}

if (window.location.pathname == "/") {
    setInterval(() => {
        let email = document.getElementById("li_email");
        let password = document.getElementById("li_password");
        let button = document.querySelector(".button_com_lisu");
        if (email.value != '' && password.value != '') {
            button.style.opacity = "1";
            button.setAttribute("onclick", "loggedInButtonFunction()");
        }
        else {
            button.style.opacity = "0.8";
            button.removeAttribute("onclick");
        }
    }, 10);
}

if (window.location.pathname == "/signup") {   
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const err = searchParams.get('err');
    setTimeout(() => {        
        if (err == "1") {
            showError("Email address or username already in use. Please re-check them.");
        }
    }, 100);
    setInterval(() => {
        let name = document.getElementById("su_name");
        let username = document.getElementById("su_username");
        let email = document.getElementById("su_email");
        let password = document.getElementById("su_password");
        let button = document.getElementById("signup_btn");
        let totalImg = document.querySelectorAll(".optionSuImg");
        let fileImg = document.getElementById("su_img");
        let addImg = document.querySelector(".addImg");
        if (fileImg.value != "") {
            if (addImg.style.background != "#002855" && addImg.innerHTML != '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon innerAddImgSvg"><polyline points="20 6 9 17 4 12"></polyline></svg>') {
                addImg.style.background = "#002855";
                addImg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon innerAddImgSvg"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }
            for (let i = 0; i < totalImg.length; i++) {
                totalImg[i].classList.remove("selectedImg");
            }
        }
        else {
            if (addImg.style.background != "#151515cc" && addImg.innerHTML != '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon innerAddImgSvg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>') {
                addImg.style.background = "#151515cc";
                addImg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon innerAddImgSvg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            }
        }

        if (name.value != '' && username.value != '' && email.value != '' && password.value != '') {
            button.style.opacity = "1";
            button.setAttribute("onclick", "signupProcess()");
        }
        else {
            button.style.opacity = "0.8";
            button.removeAttribute("onclick");
        }

    }, 10);
}

function openDialog() {
    document.getElementById('su_img').click();
}

function selectedPhoto(img) {
    let fileImg = document.getElementById("su_img");
    let totalImg = document.querySelectorAll(".optionSuImg");
    for (let i = 0; i < totalImg.length; i++) {
        if (totalImg[i].src != img.src) {
            if (totalImg[i].classList.contains("selectedImg")) {
                totalImg[i].classList.remove("selectedImg");
            }
        }
    }
    if (fileImg.value != "") {
        fileImg.value = "";
    }
    img.classList.add("selectedImg");
}

function sendSocketData(data) {
    socket.emit('completeSignUp', data);
    socket.on('signupProcedure', function(info) {
        if (info[0] == 0) {
            showError("Email address or username already in use. Please re-check them.");
        }
        else if (info[0] == 1) {
            window.location.href = "/";
        }
    });
}