const express = require('express');
const bcrypt = require('bcrypt')
const db = require('./db.js');
const jwt = require('jsonwebtoken');
const util = require('util');

const asyncSign = util.promisify(jwt.sign)
const asyncVerify = util.promisify(jwt.verify)

require('dotenv').config()

const app = express()
app.use(express.json())

app.post('/register', async (req, res)=>{
    const username = req.body.username
    const password = req.body.password
    
    if(!username || !password){
        res.status(400).send('username and passwod are required')
    }

    try
    {
        const [usernameExist] = await db.promise().execute('SELECT * FROM users WHERE username = ?',[username])
        if (usernameExist.length>0){
            return res.status(400).send('user already exist')
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password) VALUES (?,?)"
        await db.promise().execute(query, [username, hashedPassword])

        res.status(201).send('user registered successfully')
        console.log("user ", username, " registered successfully")
    }
    catch(err)
    {
        console.log('Error registering user :', err)
        res.status(500).send('Internal server error')
    }
})

app.post('/login',async (req, res)=>{
    const username = req.body.username

    try
    {
        const [hash] = await db.promise().execute('SELECT password FROM users WHERE username = ?',[username])
        //checking password
        const isLogin = await bcrypt.compare(req.body.password, hash[0].password)
        if(!isLogin){
            console.error("Connexion Failed")
        }
        else
        {
            const [iduser] = await db.promise().execute('SELECT idusers FROM users WHERE username = ?',[username]) 
            const token = await asyncSign({iduser : iduser[0].idusers, username : username}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            res.json({accessToken : token})
            console.log("Connected")
        }
    }
    catch(err)          
    {
        console.log('Error logging user :', err)
        res.status(500).send('Internal server error')
    }
})

async function authentificateToken(req, res, next){
    try
    {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if(token == null) return res.sendStatus(401)
        const verifyToken = await asyncVerify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = verifyToken
        next()
    }
    catch(err)
    {
        console.log(err)
        res.status(500).send('Internal server error')
    }
}

app.get('/profileData', authentificateToken, async (req, res, next)=>{
    try
    {
        const [posts] = await db.promise().execute('SELECT message FROM posts WHERE iduser = ?', [req.user.iduser])
        res.json(posts)
    }
    catch(err)
    {
        console.log(err)
        res.status(500).send('Internal server error')
    }
})

app.listen(3000)