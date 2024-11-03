const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("database.sqlite")
const images = require('./images/images.json')
const fs = require('fs')
const path = require('path')

db.exec(fs.readFileSync(path.join(__dirname, "schema.sql")).toString(), function (err) {
	for (const i in images) {
		let img = images[i]
		db.run("INSERT INTO images VALUES (?,?,?);", [fs.readFileSync(path.join(__dirname, "images", img["file"])), img["lon"], img["lat"]])
	}
})

