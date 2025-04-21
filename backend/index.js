const express = require('express');
const bcrypt = require('bcrypt')
const db = require('./db.js')

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
        const hash = await db.promise().execute('SELECT password FROM users WHERE username = ?',[username])
        //checking passsword
        const isLogin = await bcrypt.compare(req.body.password, hash[0][0].password)
        console.log(isLogin)
        !isLogin ? console.error("Connexion Failed") : console.log("Connected")
    }
    catch(err)          
    {
        console.log('Error logging user :', err)
        res.status(500).send('Internal server error')
    }

})

app.listen(3000)