let pastUser;
let socket = io.connect('http://127.0.0.1:5000');
socket.emit('userChatData', [0]);

socket.on('dataForUser', function(info) {
    let data = info[0];
    // FOR LEFT SIDE OF THE USER CHAT SECTION
    if (Object.keys(data).length != 0) {
        document.querySelector(".chatHolderInSec1").style.display = "block";
        document.querySelector(".noMessage").style.display = "none";
        for (let i = 0; i < Object.keys(data).length; i++) {
            let parent = document.getElementById('individualChatSectionInnerPart');
            let children = parent.querySelectorAll('.perChatHolderDiv');
            if (children.length >= i+1) {
                if (children[i].id == "U" + data[i][0]) {
                    seenStatusInChatHolder(data[i][3], children[i])
                }
                else {
                    children[i].querySelector(".nameOfOtherUser").innerHTML = data[i][1];
                    children[i].querySelector(".imgOfOtherUser").src = "static/profile_img/" + data[i][2];
                    children[i].id = "U" + data[i][0];
                    seenStatusInChatHolder(data[i][3], children[i])
                }
            }
            else {
                var perChatHolderDiv = document.createElement('div');
                perChatHolderDiv.className = 'perChatHolderDiv flex alignItemsCenter';
                perChatHolderDiv.id = 'U' + data[i][0];
                perChatHolderDiv.setAttribute("onclick", "openChat(this)");
                document.querySelector('#individualChatSectionInnerPart').appendChild(perChatHolderDiv);
                var photoHolderOfOtherUser = document.createElement('div');
                photoHolderOfOtherUser.className = 'photoHolderOfOtherUser';
                perChatHolderDiv.appendChild(photoHolderOfOtherUser);
                var imgOfOtherUser = document.createElement('img');
                photoHolderOfOtherUser.appendChild(imgOfOtherUser);
                imgOfOtherUser.className = "imgOfOtherUser borderRadius50";
                imgOfOtherUser.src = "static/profile_img/" + data[i][2];
                
                var nameAndChatOfOtherUser = document.createElement('div');
                nameAndChatOfOtherUser.className = 'nameAndChatOfOtherUser flex flexGrow1 poppinsFont';
                perChatHolderDiv.appendChild(nameAndChatOfOtherUser);
        
                var nameOfOtherUser = document.createElement('div');
                nameOfOtherUser.className = 'nameOfOtherUser flexGrow1';
                nameOfOtherUser.innerHTML = data[i][1];
                nameAndChatOfOtherUser.appendChild(nameOfOtherUser);

                if (data[i][3] == 0) {
                    perChatHolderDiv.classList.add("unseenMessageInSec1");
                }
            }
        }
    }
    else {
        document.querySelector(".chatHolderInSec1").style.display = "none";
        document.querySelector(".noMessage").style.display = "flex";
    }
    // FOR RIGHT SIDE OF CHAT SECTION
    if (info[1][0] != 0) {
        let chatData = info[1]
        let chatOnPageSection = document.querySelector(".chatOnPageSection");
        if (pastUser == chatData[1]) {
            let columnOfMessageFirst = document.querySelectorAll('.columnOfMessage')[0];
            let columnOfMessageFirstID;

            if (columnOfMessageFirst == null) {
                // IF IT IS NULL THEN WE NEED TO CREATE ALL THE NEW MESSAGE
                let numberOfNewMessage = chatData[0].length;
                for (let i = 0; i < numberOfNewMessage; i++) {
                    let columnOfMessage = document.createElement('div');
                    if (i == 0) {
                        chatOnPageSection.appendChild(columnOfMessage);
                    }
                    else {
                        chatOnPageSection.insertBefore(columnOfMessage, document.querySelectorAll('.columnOfMessage')[0]);
                    }
                    creatingMessageDiv(chatData[0][i], columnOfMessage, chatData[1]);
                    setTimeout(() => {
                        columnOfMessage.style.maxHeight = "100%";
                    }, 500);
                }
            }
            else {
                // ELSE WE NEED TO COUNT THE NEW MESSAGE
                columnOfMessageFirstID = columnOfMessageFirst.id;
                if ("D" + chatData[0][0][5] != columnOfMessageFirstID) {
                    let lengthOfTotalColumn = document.querySelectorAll('.columnOfMessage').length;

                    if (chatData[0][chatData[0].length - lengthOfTotalColumn][5] == parseInt(columnOfMessageFirstID.slice(1))) {
                        let numberOfNewMessage = chatData[0].length - lengthOfTotalColumn;

                        for (let i = 0; i < numberOfNewMessage; i++) {
                            let columnOfMessage = document.createElement('div');
                            chatOnPageSection.insertBefore(columnOfMessage, columnOfMessageFirst);
                            creatingMessageDiv(chatData[0][i], columnOfMessage, chatData[1]);
                            setTimeout(() => {
                                columnOfMessage.style.maxHeight = "100%";
                            }, 500);
                        }

                    }
                    else {
                        location.reload();
                    }
                }
                else {
                    // IF NO NEW CHAT IS ARRIVED BUT MESSAGE HAS BEEN DELETED (MAINLY OF THE OTHER)
                    if ("D" + chatData[0][0][5] == columnOfMessageFirstID) {
                        for (let i = 0; i < chatData[0].length; i++) {
                            if (chatData[0][i][1] == 1) {
                                if (!document.querySelector("#D" + chatData[0][i][5]).classList.contains("deleted")) {
                                    document.querySelector("#D" + chatData[0][i][5]).classList.add("deleted");
                                    document.querySelector("#D" + chatData[0][i][5]).style.maxHeight = "0%";
                                    setTimeout(() => {
                                        document.querySelector("#D" + chatData[0][i][5]).querySelector(".messageDiv").remove();
                                    }, 2200);
                                }
                            }
                        }
                    }
                    else {
                        location.reload();
                    }
                }
            }
        }
        else {
            // IF PAST USER IS NOT SAME NEW DATA WILL SHOW
            chatOnPageSection.style.opacity = 0;
            setTimeout(() => {
                chatOnPageSection.innerHTML = null;
                for (let i = 0; i < chatData[0].length; i++) {
                    let columnOfMessage = document.createElement('div');
                    chatOnPageSection.appendChild(columnOfMessage);

                    creatingMessageDiv(chatData[0][i], columnOfMessage, chatData[1]);
                }
                setTimeout(() => {
                    chatOnPageSection.style.opacity = 1;
                }, 100);
            }, 120);
            pastUser = chatData[1]
        }
    }
});

socket.on('searchResult', function(result) {

    if (result == "0") {
        showError("No result found.")
    }
    else if (result == "1") {
        showError("Its you bro.")
    }
    else if (result == "2") {
        addUserIDCancel();
    }
    else {
        let changeTheUserUsingSearch = document.querySelectorAll("#U" + result);
        if (changeTheUserUsingSearch.length == 1) {
            openChat(changeTheUserUsingSearch[0]);
        }
        addUserIDCancel();
    }
});

setInterval(() => {
    let differDiv = document.querySelectorAll(".DOCOD");
    for (let i = 0; i < differDiv.length; i++) {
        differDiv[i].style.width = document.querySelector(".innerIndividualChatSection").clientWidth + "px";
    }
}, 1);

function openChat(div) {
    let photoHolderOfMessage = document.querySelector(".photoHolderOfMessage");
    let innerIndividualChatSection = document.querySelector(".innerIndividualChatSection");
    let DOCOD = document.querySelectorAll(".DOCOD");
    socket.emit('changeThePerson', [div.id.slice(1)]);
    document.cookie = "liveDataRespondTo=" + div.id.slice(1) + ";";

    setInterval(() => {
        checkTheSelected();
    }, 100);

    document.querySelector(".nameOfOtherUserInChatSection").innerHTML = div.querySelector(".nameOfOtherUser").innerHTML;

    if (photoHolderOfMessage.style.display != "none") {
        photoHolderOfMessage.style.opacity = "0";
        setTimeout(() => {
            photoHolderOfMessage.style.display = "none";
            innerIndividualChatSection.style.display = "flex";
            innerIndividualChatSection.style.opacity = "1";
            setTimeout(() => {
                DOCOD[0].style.top = "0%";
                setTimeout(() => {
                    DOCOD[1].style.bottom = "0%";
                }, 200);
            }, 200);
        }, 700);    
    }
}

function creatingMessageDiv(conditionChatMessage, columnOfMessage, user) {
    columnOfMessage.className = 'columnOfMessage flex';
    columnOfMessage.id = 'D' + conditionChatMessage[5];
    if (conditionChatMessage[1] == 0) {
        let messageDiv = document.createElement('div');

        if (conditionChatMessage[3] == 0) {
            columnOfMessage.classList.add("sender");
            setTimeout(() => {
                columnOfMessage.style.maxHeight = "100%";
            }, 100);

            messageDiv.className = "messageDiv sendingMessage";
            let deleteBox = document.createElement('div');
            deleteBox.className = "deleteBox flex alignItemsCenter";
            deleteBox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon link deleteSVG iconOnMode"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
            columnOfMessage.appendChild(deleteBox);

            deleteBox.addEventListener('click', function deletingMessage() {
                columnOfMessage.classList.add("deleted");
                columnOfMessage.style.maxHeight = "0%";
                deleteBox.remove();
                setTimeout(() => {
                    columnOfMessage.style.overflow = "hidden";
                    messageDiv.remove();
                }, 900);
                // LOOK AT THIS 
                socket.emit('deletingMessage', [user, conditionChatMessage[5]]);
            });
        }
        else {
            columnOfMessage.classList.add("receiver");
            columnOfMessage.style.maxHeight = "100%";
            messageDiv.className = "messageDiv receivingMessage";
        }
        messageDiv.innerHTML = conditionChatMessage[0];
        columnOfMessage.appendChild(messageDiv);
    }
    else {
        columnOfMessage.classList.add("deleted");
    }
}

function logout() {
    let logoutBigDiv = document.querySelector(".logoutBigDiv");
    logoutBigDiv.style.display = "flex";
    setTimeout(() => {
        logoutBigDiv.style.opacity = "1";
    }, 100);
}

function addUserDiv() {
    let addUserDiv = document.querySelector(".addUserDiv");
    addUserDiv.style.display = "flex";
    setTimeout(() => {
        addUserDiv.style.opacity = "1";
    }, 100);
}

function logoutCancel() {
    let logoutBigDiv = document.querySelector(".logoutBigDiv");
    logoutBigDiv.style.opacity = "0";
    setTimeout(() => {
        logoutBigDiv.style.display = "none";
    }, 400);
}

function addUserIDCancel() {
    let errorDiv = document.querySelector(".errorDiv");
    let errorSvg = document.querySelector(".errorSvg");
    let addUserDiv = document.querySelector(".addUserDiv");
    addUserDiv.style.opacity = "0";
    setTimeout(() => {
        document.getElementById("userIdOfOtherPerson").value = null;
        addUserDiv.style.display = "none";
        errorSvg.style.stroke = "#002855";
        errorDiv.style.maxHeight = "0px";
    }, 400);
}

function checkTheSelected() {
    let selectedChat = document.querySelectorAll(".selectedChat");
    if (!document.getElementById("U" + getCookieValue("liveDataRespondTo")).classList.contains("selectedChat")) {
        document.getElementById("U" + getCookieValue("liveDataRespondTo")).classList.add("selectedChat");
        for (let i = 0; i < selectedChat.length; i++) {
            selectedChat[i].classList.remove("selectedChat");
        }
    }
}

function getCookieValue(cookieName) {
    const cookies = document.cookie.split(";");
  
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
  
      // Check if the cookie name matches the one we're looking for
      if (cookie.startsWith(`${cookieName}=`)) {
        // Return the cookie value
        return cookie.substring(cookieName.length + 1);
      }
    }
  
    // If the cookie is not found, return null
    return null;
  }

function seenStatusInChatHolder(data, children) {
    if (data == 0) {
        if (!children.classList.contains("unseenMessageInSec1")) {   
            children.classList.add("unseenMessageInSec1")
        }
    }
    else if (data == 1) {
        if (children.classList.contains("unseenMessageInSec1")) {
            children.classList.remove("unseenMessageInSec1")
        }
    }
}

function dropMessage() {
    let message = document.getElementById("inputMessage").value;
    if (message != '') {
        if (getCookieValue("liveDataRespondTo") != null) {
            socket.emit('dropMessage', [getCookieValue('liveDataRespondTo'), message]);
            document.getElementById("inputMessage").value = null;
        }
    }
}

function checkEnterButton() {
    if(window.event.key === 'Enter') {
        dropMessage();
    }
}

function searchTheUser() {
    let userId = document.getElementById("userIdOfOtherPerson").value;
    if (userId != '') {
        socket.emit('searchUserId', userId);
    }
}

function checkEnterButtonForUserId() {
    if(window.event.key === 'Enter') {
        searchTheUser();
    }
}

function modeShift() {
    if (localStorage.mode == "light") {
        localStorage.mode = "dark";
        modeOn();
    }
    else if (localStorage.mode == "dark") {
        localStorage.mode = "light";
        modeOn();
    }
    else {
        localStorage.mode = "light";
        modeOn();
    }
}

function modeOn() {
    let svg = document.querySelector(".modeSvg");
    let leftBar = document.querySelector(".leftBar");
    svg.classList.remove("rotate");
    if (localStorage.mode == "light") {
        setTimeout(function () {
            svg.classList.add("rotate");
            svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon iconOnMode link"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        }, 100);
        leftBar.style.background = "#24292e";
        document.documentElement.style.setProperty('--white', '#ffffffcc');
        document.documentElement.style.setProperty('--whiteSmoke', '#f5f5f5');
        document.documentElement.style.setProperty('--WYColor', '#002855');
        document.documentElement.style.setProperty('--borderColor', 'rgba(0,0,0,0.1)');
        document.documentElement.style.setProperty('--icon', '#002855');
        document.documentElement.style.setProperty('--lightSmoke', '#f0f2f5');
        document.documentElement.style.setProperty('--black', '#000');
    }
    else {
        setTimeout(() => {
            svg.classList.add("rotate");
            svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon iconOnMode link"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        }, 100);
        leftBar.style.background = "#090909";
        document.documentElement.style.setProperty('--white', '#151515cc');
        document.documentElement.style.setProperty('--whiteSmoke', '#202020');
        document.documentElement.style.setProperty('--WYColor', '#ffffff');
        document.documentElement.style.setProperty('--borderColor', 'rgb(35,35,35)');
        document.documentElement.style.setProperty('--icon', '#ffffff');
        document.documentElement.style.setProperty('--lightSmoke', '#646464');
        document.documentElement.style.setProperty('--black', '#fff');
    }
}

function copy() {
    let copyText = document.getElementById("copyText");
    navigator.clipboard.writeText(copyText.innerHTML);
}
