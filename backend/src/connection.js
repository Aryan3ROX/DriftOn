import mysql from "mysql2";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({
    path: "./.env"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initializeDatabase() {
    const tempConn = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        multipleStatements: true
    });
    
    tempConn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB_NAME}`, (err) => {
        if (err) {
            console.error("Error creating database:", err);
            return;
        }
        tempConn.end();
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB_NAME,
            multipleStatements: true
        });
        
        connection.connect(function(err) {
            if (err) {
                console.error("Error connecting: " + err.stack);
                return;
            }
            
            console.log("Successfully Connected to Database!");
            
            connection.query("SHOW TABLES", (err, results) => {
                if (err) {
                    console.error("Error checking tables:", err);
                    return;
                }
                
                if (results.length === 0) {
                    console.log("No tables found. Initializing database from SQL script...");
                    
                    const sqlPath = path.join(__dirname, "..", "initDB.sql");
                    const sqlScript = fs.readFileSync(sqlPath, "utf8");
                    
                    connection.query(sqlScript, (err) => {
                        if (err) {
                            console.error("Error initializing database:", err);
                        } else {
                            console.log("Database initialized successfully!");
                        }
                    });
                } else {
                    console.log(`Database already contains ${results.length} tables. Initialization skipped.`);
                }
            });
        });
    });
}

initializeDatabase();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME
});

connection.connect(function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }
});

export default connection;