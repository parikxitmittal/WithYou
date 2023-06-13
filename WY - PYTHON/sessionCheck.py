from flask import session
import mysql.connector

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    password = "",
    database = "wy"
)

cursor = db.cursor()

def checkInfo():
    if session.get('user_id') != None and session.get("password") != None:
        print(0)
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_id = '" + session['user_id'] + "' AND password = '" + session['password'] + "'")
        result = cursor.fetchone()[0] # Result is in tuple format
        if result == 1:
            return True
        else:
            return False
    else:
        print(1)
        return False