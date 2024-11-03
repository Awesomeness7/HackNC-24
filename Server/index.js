const express = require('express')
const sqlite3 = require('sqlite3')
const path = require('path')
const fs = require('fs')


const app = express()
const port = 8080

const db = new sqlite3.Database("database.sqlite")

// Static stuff
app.use("/js", express.static(path.join(__dirname, "..", "web", "js")))
app.use("/css", express.static(path.join(__dirname, "..", "web", "css")))
app.use("/images", express.static(path.join(__dirname, "..", "web", "images")))

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "web", "index.html"))
})
app.get("/game.html", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "web", "game.html"))
})
app.get("/instructions.html", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "web", "instructions.html"))
})
app.get("/results.html", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "web", "results.html"))
})

app.get("/api/makesession", (req, res) => {
    db.run("INSERT INTO sessions VALUES (0,0,\"[]\",0);", [], function (err) {
        if (err != null) {
            res.status(500).send(err.message)
        } else {
            res.status(200).json({"session_id": this.lastID})
        }
    })
})

let updateRound = db.prepare("UPDATE sessions SET image_id = ?, round = round + 1, previous_images_json = json_insert(previous_images_json,'$[#]', ?) WHERE rowid=?;")

app.get("/api/nextimage", (req, res) => {
    if (!("session_id" in req.query)) {res.status(400).send("No session_id"); return;}
    let id = Number(req.query.session_id)
    if (id === NaN) {res.status(400).send("No id is not a number"); return;}
    db.get("SELECT rowid, json(previous_images_jsonb) AS previous FROM sessions WHERE rowid=?;", [id], function (err, row) {
        if (err != null) {
            res.status(500).send(err.message);
        } else if (row == undefined){
            res.status(400).send("Not a real session")
        } else {
            let previous = row["previous"]
            db.get(`SELECT rowid FROM images WHERE NOT rowid in (${previous.substr(1, previous.length - 2)}) ORDER BY RANDOM() LIMIT 1;`, [], function (err, row) {
                if (err != null) {
                    res.status(500).send(err.message);
                } else if (row == undefined){
                    res.status(400).send("I have no clue")
                } else {
                    res.status(200).json({"img_id": row["rowid"]})
                    updateRound.run([row["rowid"], row["rowid"],  id], function (err) {
                        if (err != null) {
                            console.log(err)
                        }
                    })
                }
            })
        }
    })
})

app.get("/api/images/:id", (req, res) => {
    db.get("SELECT image FROM images WHERE rowid=?;", [req.params.id], function (err, row) {
        if (err != null) {
            res.status(500).send(err.message);
        } else if (row == undefined){
            res.status(400).send("I have no clue")
        } else {
            res.status(200).set("Content-Type", "image/jpeg").send(row["image"])
        }
    })
})

app.get("/api/getscore", (req, res) => {
    if (!("session_id" in req.query)) {res.status(400).send("No session_id"); return;}
    if (!("lat" in req.query)) {res.status(400).send("No lat"); return;}
    if (!("long" in req.query)) {res.status(400).send("No long"); return;}
    //if (!("time" in req.query)) {res.status(400).send("No time"); return;}
    if (!("img_id" in req.query)) {res.status(400).send("No img_id"); return;}
    let session_id = Number(req.query.session_id)
    if (session_id === NaN) {res.status(400).send("session_id is not a number"); return;}
    let lat = Number(req.query.lat)
    if (lat === NaN) {res.status(400).send("lat is not a number"); return;}
    let long = Number(req.query.long)
    if (long === NaN) {res.status(400).send("long is not a number"); return;}
    //let time = Number(req.query.time)
    //if (time === NaN) {res.status(400).send("time is not a number"); return;}
    let img_id = Number(req.query.img_id)
    if (img_id === NaN) {res.status(400).send("img_id is not a number"); return;}
    db.get("SELECT rowid FROM sessions WHERE rowid=?;", [session_id], function (err, row) {
        if (err != null) {
            res.status(500).send(err.message);
        } else if (row == undefined){
            res.status(400).send("Not a real session")
        } else {
            db.get("SELECT rowid FROM images WHERE rowid=?;", [img_id], function (err, row) {
                if (err != null) {
                    res.status(500).send(err.message);
                } else if (row == undefined){
                    res.status(400).send("Not a real image")
                } else {
                    let longitude, latitude;
                    db.get("SELECT latitude, longitude FROM images WHERE rowid=?;", [img_id], function (err, row) {
                        if (err != null) {
                            res.status(500).send(err.message)
                        } else if (row == undefined) {
                            res.status(400).send("Not a real image??")
                        } else {
                            longitude = row["longitude"]
                            latitude = row["latitude"]
                            let mapWidth = 0.0125446442755
                            let distance = Math.sqrt(Math.pow(longitude - long, 2) + Math.pow(latitude - lat, 2))
                            let score = Math.floor(Math.pow(10000, -0.5*Math.pow(distance/mapWidth, 2)) * 10000)
                            db.run("UPDATE sessions SET score = score + ? WHERE rowid=?;", [score, session_id], function (err, row) {
                                if (err != null) {
                                    res.status(500).send(err.message)
                                } else {
                                    res.status(200).json({"score": score, "location": {"lat": latitude, "long": longitude}})
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

app.get("/api/endsession", (req, res) => {
    if (!("session_id" in req.query)) {res.status(400).send("No session_id"); return;}
    let session_id = Number(req.query.session_id)
    if (session_id === NaN) {res.status(400).send("session_id is not a number"); return;}
    db.get("SELECT rowid, score FROM sessions WHERE rowid=?;", [session_id], function (err, row) {
        if (err != null) {
            res.status(500).send(err.message);
            err = true;
        } else if (row == undefined){
            res.status(400).send("Not a real session")
            err = true;
        } else {
            res.status(200).json({"score": row["score"]})
        }
    })
})

app.listen(port, () => {
    console.log("Now you're cooking with gas")
})
