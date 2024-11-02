const express = require('express')
const sqlite3 = require('sqlite3')

const app = express()
const port = 8080

const db = sqlite3.Database("database.sqlite")

app.get("/api/makesession", (req, res) => {
    db.run("INSERT INTO sessions VALUES (0,0,0);", [], function (err) {
        if (err != null) {
            res.sendStatus(500).send(err.message)
        } else {
            res.setStatus(200).json({"session_id": this.lastID})
        }
    })
    res.json()
})

app.listen(port, () => {
    console.log("Now you're cooking with gas")
})