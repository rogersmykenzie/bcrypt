require('dotenv').config();
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2
    }
}))

massive(process.env.CONNECTION_STRING).then(dbInstance => {
    app.set('db', dbInstance);
    console.log('Database Connected :)');
})


app.post('/auth/register', function(req, res) {
    //connect to the database - DONE
    //check to see that the username is not already taken - DONE
    //hash the password
    //put them in the database
    //send back a response
    const {username, password} = req.body;
    const db = req.app.get('db');
    db.checkForUser(username).then(async numUsers => {
        console.log(numUsers);
        if(numUsers[0].count == 0) {
            const hash = await bcrypt.hash(password, 10);
            // bcrypt.hash(password, 10).then(hash => {
                
            // })
            await db.registerUser(username, hash);
            res.sendStatus(200);
        } else {
            res.status(500).json("Username Taken. Please pick another one.");
        }
    })
})

app.post('/auth/login', async function(req, res) {
    const {username, password}  = req.body;
    const db = req.app.get('db');
    const hash = await db.getPasswordForUser(username);
    const isEqual = await bcrypt.compare(password, hash[0].password);
    if(isEqual === true) {
        req.session.user = {
            username
        }
        res.sendStatus(200);
    } else {
        res.status(401).json("Incorrect Username or Password")
    }
})


app.listen(process.env.SERVER_PORT, () => console.log('Server Listening'));