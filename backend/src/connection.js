import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME
})

connection.connect(function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack)
        return
    }
    else console.log("Successfully Connected to Database!")
})

export default connection