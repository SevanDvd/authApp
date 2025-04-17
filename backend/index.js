const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('./db')


const app = express()

app.use(express.json())
const posts = [
    {
        username: "jacques",
        title: "Post 1"
    },
    {
        username: "benoit",
        title: "Post 2"
    }
]

app.get('/posts', (req, res) => {
    res.json(posts)
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(username, password)

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error registering user')
        } else {
            res.status(201).send('User registered successfully')
            console.log(result)
        }
    })
})


app.listen(3000)