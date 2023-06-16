from flask import *
from flask_socketio import SocketIO, emit
import mysql.connector
import sessionCheck
import json
import time
import os

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    password = "",
    database = "wy"
)

cursor = db.cursor()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'WithYouCo'
socketio = SocketIO(app)

def seenCondition(messageCondition, otherUser):
    seen, seenForUser = messageCondition[:1], messageCondition[2:]
    if (int(seen) == 0) & (seenForUser == session['user_id']):
        # Not Seen By The Logined User
        return 0
    elif (int(seen) == 1)  & (seenForUser == session['user_id']):
        # Seen By The Logined User
        return 1
    elif (int(seen) == 0) & (seenForUser == otherUser):
        # Not Seen By The Other User
        return 2
    else:
        # Seen By The Other User
        return 3

def updateList(key, otherUserId):
    if otherUserId in key:
        key.remove(otherUserId)
        key.insert(0, otherUserId)
        return json.dumps(key)
    else:
        key.insert(0, otherUserId)
        return json.dumps(key)

@app.route("/")
def index():
    loginData = sessionCheck.checkInfo()
    if loginData == True:
        user_id = session['user_id']
        password = session['password']
        cursor.execute("SELECT * FROM users WHERE user_id = '" + user_id + "' AND password = '" + password + "'")
        result = cursor.fetchone()
        name = result[1]
        img = result[2]
        username = result[6]

        if img != None:
            resp = make_response(render_template('index.html', name = name, img = img, username = username))
            resp.set_cookie('liveDataRespondTo', expires=0)
            resp.set_cookie('latestRequestedData', expires=0)
            return resp
        else:
            imgNull = "null/null.png"
            resp = make_response(render_template('index.html', name = name, img = imgNull, username = username))
            resp.set_cookie('liveDataRespondTo', expires=0)
            resp.set_cookie('latestRequestedData', expires=0)
            return resp
    else:
        session.clear()
        return render_template('login.html')

@socketio.on('userChatData')
def handle_info(w):
    if session.get('newUserForChat') == None:
        session['newUserForChat'] = 0
    while True:
        if session['newUserForChat'] != 0:
            providingInfo = []
            cursor.execute("SELECT message, deleted, time, chat_info, status, sno FROM chat WHERE chat_info IN ('" + session['user_id'] + "-" + session['newUserForChat'] + "', '" + session['newUserForChat'] + "-" + session['user_id'] + "') ORDER BY sno DESC")
            messages = cursor.fetchall()
            if len(messages) != 0:
                for i in range(len(messages)):
                    editedMessage = list(messages[i])
                    senderDefination = session['user_id'] + "-" + session['newUserForChat']
                    if editedMessage[3] == senderDefination:
                        # LOGGEDIN  ARE SENDER
                        editedMessage[3] = 0
                    else:
                        # WE ARE RECEIVER
                        if editedMessage[4] == "0#" + session['user_id']:
                            cursor.execute("UPDATE chat SET status = '1#" + session['user_id'] + "' WHERE sno = '" + str(editedMessage[5]) + "'")
                            db.commit()
                        editedMessage[3] = 1
                    providingInfo.append(editedMessage)
                chattingList = [providingInfo, session['newUserForChat']]
            else:
                chattingList = [1, session['newUserForChat']]
        else:
            chattingList = [0]

        cursor.execute("SELECT chat_with FROM users WHERE user_id = '" + session['user_id'] + "'")
        key = json.loads(cursor.fetchone()[0])
        dic_for_return = {}

        for i in range(len(key)):
            cursor.execute("SELECT name, img FROM users WHERE user_id = '" + key[i] + "'")
            resulted_name = cursor.fetchone()
            cursor.execute("SELECT status, deleted FROM chat WHERE chat_info IN ('" + session['user_id'] + "-" + key[i] + "', '" + key[i] + "-" + session['user_id'] + "')  AND sno = (SELECT MAX(sno) FROM chat WHERE chat_info IN ('" + session['user_id'] + "-" + key[i] + "', '" + key[i] + "-" + session['user_id'] + "'))")
            a = cursor.fetchone()
            if a != None:
                if a[1] == 0:
                    resultOfMessage = seenCondition(list(a)[0], key[i])
                else:
                    resultOfMessage = 3
            else:
                resultOfMessage = 3


            if resulted_name[1] == None:
                img = "null/null.png"
            else:
                img = resulted_name[1]
            dic_for_return[i] = [key[i], resulted_name[0], img] + [resultOfMessage]

        latestRequestedData = session.get("latestRequestedData")
        if latestRequestedData != str([dic_for_return, chattingList]):
            session['latestRequestedData'] = str([dic_for_return, chattingList])
            emit("dataForUser", [dic_for_return, chattingList])
        time.sleep(3)

@socketio.on('changeThePerson')
def changeThePerson(user):
    session['newUserForChat'] = user[0]

@app.route('/loginInfo', methods=['GET'])
def loginCheck():
    email = request.args.get("e")
    password = request.args.get("p")
    loginData = sessionCheck.checkInfo()

    if loginData == False:
        cursor.execute("SELECT COUNT(*), user_id, username FROM users WHERE email_id = '" + email + "' AND password = '" + password + "'")
        result = cursor.fetchone()
        if result[0] == 1:
            userIdLen = 11 - len(str(result[1]))
            userId = "0"*userIdLen + str(result[1])
            session['user_id'] = userId
            session['user_name'] = str(result[2])
            session['password'] = password
            return "1"
        else:
            return "0"
    else:
        return redirect("/")

@socketio.on('completeSignUp')
def completeSignUp(userData):
    loginData = sessionCheck.checkInfo()
    if loginData == False:
        cursor.execute("SELECT COUNT(*) FROM users WHERE email_id = '" + userData[0] + "' OR username = '" + userData[2] + "'")
        result = cursor.fetchone()
        if result[0] == 0:
            if userData[4] == 0:
                cursor.execute("INSERT INTO users (name, email_id, password, chat_with, username) VALUES ('" + userData[3] + "', '" + userData[0] + "', '" + userData[1] + "', '[]', '" + userData[2] + "')")
                db.commit()
                cursor.execute("SELECT user_id FROM users WHERE email_id = '" + userData[0] + "' AND username = '" + userData[2] + "'")
                result = cursor.fetchone()
                userIdLen = 11 - len(str(result[0]))
                userId = "0"*userIdLen + str(result[0])
                session['user_id'] = userId
                session['user_name'] = userData[2]
                session['password'] = userData[1]
                emit("signupProcedure", [1])
            else:
                cursor.execute("INSERT INTO users (name, img, email_id, password, chat_with, username) VALUES ('" + userData[3] + "', '" + userData[4] + "', '" + userData[0] + "', '" + userData[1] + "', '[]', '" + userData[2] + "')")
                db.commit()
                cursor.execute("SELECT user_id FROM users WHERE email_id = '" + userData[0] + "' AND username = '" + userData[2] + "'")
                result = cursor.fetchone()
                userIdLen = 11 - len(str(result[0]))
                userId = "0"*userIdLen + str(result[0])
                session['user_id'] = userId
                session['user_name'] = userData[2]
                session['password'] = userData[1]
                emit("signupProcedure", [1])
        else:
            emit("signupProcedure", [0])
    else:
        return redirect("/")

@app.route("/signupForm", methods=["POST"])
def signupForm():
    email = request.form.get("su_email")
    username = request.form.get("su_username")
    password = request.form.get("su_password")
    name = request.form.get("su_name")
    img = request.files['su_img']

    loginData = sessionCheck.checkInfo()
    if loginData == False:
        cursor.execute("SELECT COUNT(*) FROM users WHERE email_id = '" + email + "' OR username = '" + username + "'")
        result = cursor.fetchone()

        if result[0] == 0:
            cursor.execute("INSERT INTO users (name, email_id, password, chat_with, username) VALUES ('" + name + "', '" + email + "', '" + password + "', '[]', '" + username + "')")
            db.commit()
            cursor.execute("SELECT user_id FROM users WHERE email_id = '" + email + "' AND username = '" + username + "'")
            UserIdByResult = cursor.fetchone()[0]
            userIdLen = 11 - len(str(UserIdByResult))
            userId = "0"*userIdLen + str(UserIdByResult)
            userId_Image = userId + ".jpg"
            img.save(os.path.join('static/profile_img/', userId_Image))
            cursor.execute("UPDATE users SET img = '" + userId_Image + "' WHERE email_id = '" + email + "'")
            db.commit()
            session['user_id'] = userId
            session['user_name'] = username
            session['password'] = password
            return redirect("/")
        else:
            return redirect("/signup?err=1")
    else:
        return redirect("/")


@app.route('/logout')
def logout():
    if session.get('user_id') != None and session.get("password") != None:
        session.clear()
    return redirect("/")

@app.route('/signup')
def signup():
    loginData = sessionCheck.checkInfo()
    if loginData == False:
        return render_template('signup.html')
    else:
        return redirect("/")

@socketio.on('dropMessage')
def dropMessage(details):
    otherUserId = str(details[0])
    message = details[1]
    cursor.execute("INSERT INTO chat (chat_info, message, status, deleted, time) VALUES ('" + session['user_id'] + "-" + otherUserId + "', '" + message + "', '0#" + otherUserId + "', 0, '1')")
    db.commit()
    user0, user1 = int(session['user_id']), int(otherUserId)
    cursor.execute('SELECT chat_with FROM users WHERE user_id IN ("' + session['user_id'] + '", ' + otherUserId + ') ORDER BY user_id DESC')
    keys = cursor.fetchall()
    if user0 > user1:
        key_for_user0, key_for_user1 = json.loads(keys[0][0]), json.loads(keys[1][0])
    else:
        key_for_user0, key_for_user1 = json.loads(keys[1][0]), json.loads(keys[0][0])
    if len(key_for_user0) == 0:
        countForUser0 = 0
    else:
        countForUser0 = key_for_user0[0]

    if len(key_for_user1) == 0:
        countForUser1 = 0
    else:
        countForUser1 = key_for_user1[0]

    if otherUserId != countForUser0:
        newList = updateList(key_for_user0, otherUserId)
        cursor.execute("UPDATE users SET chat_with = '" + newList + "' WHERE user_id = '" + session['user_id'] + "'")
        db.commit()

    if session['user_id'] != countForUser1:
        otherUserNewList = updateList(key_for_user1, session['user_id'])
        cursor.execute("UPDATE users SET chat_with = '" + otherUserNewList + "' WHERE user_id = '" + otherUserId + "'")
        db.commit()

@socketio.on('searchUserId')
def searchUserId(userId):
    if session['user_name'] != userId:
        cursor.execute("SELECT COUNT(*), user_id FROM users WHERE username = '" + userId + "'")
        userExistOrNot = cursor.fetchone()
        if userExistOrNot[0] == 0:
            emit('searchResult', "0")
        else:
            cursor.execute("SELECT chat_with FROM users WHERE user_id = '" + session['user_id'] + "'")
            key = json.loads(cursor.fetchone()[0])
            userIdLen = 11 - len(str(userExistOrNot[1]))
            searchedUserId = "0"*userIdLen + str(userExistOrNot[1])
            if searchedUserId in key:
                emit('searchResult', searchedUserId)
            else:
                newList = updateList(key, searchedUserId)
                cursor.execute("UPDATE users SET chat_with = '" + newList + "' WHERE user_id = '" + session['user_id'] + "'")
                db.commit()
                emit('searchResult', "2")
    else:
        emit('searchResult', "1")

@socketio.on('deletingMessage')
def deletingMessage(details):
    user = details[0]
    message = str(details[1])
    cursor.execute("UPDATE chat SET deleted = '1' WHERE chat_info = '" + session['user_id'] + "-" + user + "' AND sno = '" + message + "'")
    db.commit()

if __name__ == '__main__':
    socketio.run(app, debug=True)
